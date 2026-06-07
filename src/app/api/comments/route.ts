import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// GET /api/comments?listing_id=xxx
export async function GET(req: NextRequest) {
  const listing_id = req.nextUrl.searchParams.get('listing_id')
  if (!listing_id) return Response.json({ error: 'listing_id required' }, { status: 400 })

  const { data, error } = await supabase
    .from('listing_comments')
    .select('id, body, rating, created_at, is_seller_reply, user_id')
    .eq('listing_id', listing_id)
    .order('created_at', { ascending: true })

  if (error) return Response.json({ error: error.message }, { status: 500 })

  const comments = data || []
  const userIds = [...new Set(comments.map(c => c.user_id).filter(Boolean))]
  let nameById: Record<string, string> = {}
  if (userIds.length) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', userIds)
    nameById = Object.fromEntries((profiles || []).map(p => [p.id, p.full_name]))
  }
  const withNames = comments.map(c => ({ ...c, profiles: { full_name: nameById[c.user_id] || null } }))

  return Response.json({ comments: withNames })
}

// POST /api/comments
export async function POST(req: NextRequest) {
  const { listing_id, body, user_id, is_seller_reply, rating } = await req.json()
  if (!listing_id || !user_id) {
    return Response.json({ error: 'listing_id and user_id required' }, { status: 400 })
  }
  if (body && body.length > 500) {
    return Response.json({ error: 'Comment too long (max 500 chars)' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('listing_comments')
    .insert({ listing_id, body: body?.trim()||'', user_id, is_seller_reply: !!is_seller_reply, rating: rating||null })
    .select('id, body, rating, created_at, is_seller_reply, user_id')
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user_id)
    .single()

  return Response.json({ comment: { ...data, profiles: { full_name: profile?.full_name || null } } })
}
