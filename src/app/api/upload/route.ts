import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const MAX_BYTES = 8 * 1024 * 1024 // 8MB per image

// Detect real image type from magic bytes — never trust the filename or client-sent type
function sniffImage(buf: Buffer): { ok: boolean; ext: string; mime: string } {
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return { ok: true, ext: 'jpg', mime: 'image/jpeg' }
  if (buf.length > 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return { ok: true, ext: 'png', mime: 'image/png' }
  if (buf.length > 12 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') return { ok: true, ext: 'webp', mime: 'image/webp' }
  if (buf.length > 6 && buf.toString('ascii', 0, 3) === 'GIF') return { ok: true, ext: 'gif', mime: 'image/gif' }
  if (buf.length > 12 && buf.toString('ascii', 4, 8) === 'ftyp') {
    const brand = buf.toString('ascii', 8, 12)
    if (['heic', 'heix', 'hevc', 'mif1', 'msf1', 'heim', 'heis'].includes(brand)) return { ok: true, ext: 'heic', mime: 'image/heic' }
  }
  return { ok: false, ext: '', mime: '' }
}

// Claude vision check — images must pass the same bar as listing text
async function moderateImage(base64: string, mime: string): Promise<{ approved: boolean; reason: string }> {
  const visionMime = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(mime) ? mime : null
  if (!visionMime) return { approved: true, reason: 'Format not supported for vision check' }
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 300,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: visionMime, data: base64 } },
            {
              type: 'text',
              text: `You are an image moderator for Ethiofy, Ethiopia's marketplace. Decide if this image may be published on a listing.

Reject if the image contains ANY of:
1. Nudity, sexual or suggestive content
2. Weapons, firearms, ammunition
3. Drugs, narcotics, drug paraphernalia
4. Graphic violence, gore, injury or death
5. Hate symbols or extremist content
6. Protected wildlife, ivory, or illegal animal trade
7. Counterfeit branded goods presented as genuine
8. Identity documents, bank cards, or other sensitive personal data
9. Child imagery in any sexual, exploitative or unsafe context

Approve ordinary marketplace photos: property, vehicles, machinery, goods, job/company imagery, events, people fully clothed in normal settings.

Respond ONLY with JSON, no preamble, no markdown:
{"approved": true/false, "reason": "brief explanation"}`
            }
          ]
        }]
      })
    })
    if (!res.ok) return { approved: true, reason: 'Vision service unavailable' }
    const data = await res.json()
    const text = data?.content?.[0]?.text || ''
    const parsed = JSON.parse(text.replace(/```json|```/g, '').trim())
    return { approved: parsed.approved !== false, reason: parsed.reason || '' }
  } catch {
    return { approved: true, reason: 'Vision check failed open' }
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Require a signed-in user — this route holds the service-role key and must never be open
    const cookieStore = await cookies()
    const auth = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll() { return cookieStore.getAll() }, setAll() {} } }
    )
    const { data: { user } } = await auth.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Sign in required to upload images' }, { status: 401 })

    const formData = await request.formData()
    const file = formData.get('file') as File
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

    // 2. Size cap
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'Image too large. Maximum size is 8MB.' }, { status: 413 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    // 3. Real image check from magic bytes (filename/type are attacker-controlled)
    const sniff = sniffImage(buffer)
    if (!sniff.ok) {
      return NextResponse.json({ error: 'That file is not a valid image.' }, { status: 400 })
    }

    // 4. Claude vision moderation
    const verdict = await moderateImage(buffer.toString('base64'), sniff.mime)
    if (!verdict.approved) {
      return NextResponse.json(
        { error: `Image rejected: ${verdict.reason || 'does not meet marketplace guidelines'}` },
        { status: 422 }
      )
    }

    // 5. Store under a user-scoped path with a safe generated name
    const ext = sniff.ext === 'heic' ? 'jpg' : sniff.ext
    const contentType = sniff.ext === 'heic' ? 'image/jpeg' : sniff.mime
    const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { error } = await supabase.storage.from('listings').upload(fileName, buffer, { contentType, upsert: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const { data: urlData } = supabase.storage.from('listings').getPublicUrl(fileName)
    return NextResponse.json({ url: urlData.publicUrl })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Upload failed' }, { status: 500 })
  }
}
