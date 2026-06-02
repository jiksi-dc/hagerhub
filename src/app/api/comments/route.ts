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
    .select('id, body, created_at, is_seller_reply, user_id, profiles(full_name)')
    .eq('listing_id', listing_id)
    .order('created_at', { ascending: true })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ comments: data || [] })
}

// POST /api/comments
export async function POST(req: NextRequest) {
  const { listing_id, body, user_id, is_seller_reply } = await req.json()
  if (!listing_id || !body || !user_id) {
    return Response.json({ error: 'listing_id, body, user_id required' }, { status: 400 })
  }
  if (body.length > 500) {
    return Response.json({ error: 'Comment too long (max 500 chars)' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('listing_comments')
    .insert({ listing_id, body: body.trim(), user_id, is_seller_reply: !!is_seller_reply })
    .select('id, body, created_at, is_seller_reply, user_id, profiles(full_name)')
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ comment: data })
}
