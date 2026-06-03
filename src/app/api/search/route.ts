import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim()
  const category = searchParams.get('category')
  const city = searchParams.get('city')
  const limit = Number(searchParams.get('limit') || 20)

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] })
  }

  let query = supabase
    .from('listings')
    .select('id, title, price_label, city, neighbourhood, category, subcategory, image_urls, created_at')
    .eq('status', 'active')
    .textSearch('search_vector', q, { type: 'websearch', config: 'english' })
    .order('created_at', { ascending: false })
    .limit(limit)

  if (category && category !== 'All') query = query.eq('category', category)
  if (city) query = query.eq('city', city)

  const { data, error } = await query

  if (error) {
    console.error('Search error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ results: data || [] })
}
