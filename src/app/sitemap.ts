import { createClient } from '@/lib/supabase'
import { MetadataRoute } from 'next'

const BASE = 'https://hagerhub.vercel.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient()
  const { data: listings } = await supabase
    .from('listings')
    .select('id, updated_at')
    .eq('status', 'active')
    .order('updated_at', { ascending: false })
    .limit(1000)

  const listingUrls = (listings || []).map(l => ({
    url: `${BASE}/en/listing/${l.id}`,
    lastModified: new Date(l.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/en`,          lastModified: new Date(), changeFrequency: 'daily',   priority: 1.0 },
    { url: `${BASE}/en/post`,     lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/en/boost`,    lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/en/discover`, lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
  ]

  return [...staticRoutes, ...listingUrls]
}
