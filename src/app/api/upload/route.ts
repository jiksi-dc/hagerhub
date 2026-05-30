import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })
    const originalName = file.name.toLowerCase()
    let ext = originalName.split('.').pop() || 'jpg'
    if (ext === 'heic' || ext === 'heif') ext = 'jpg'
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    let contentType = file.type || 'image/jpeg'
    if (contentType === 'image/heic' || contentType === 'image/heif') contentType = 'image/jpeg'
    if (!contentType.startsWith('image/')) contentType = 'image/jpeg'
    const { error } = await supabase.storage.from('listings').upload(fileName, buffer, { contentType, upsert: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    const { data: urlData } = supabase.storage.from('listings').getPublicUrl(fileName)
    return NextResponse.json({ url: urlData.publicUrl })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Upload failed' }, { status: 500 })
  }
}
