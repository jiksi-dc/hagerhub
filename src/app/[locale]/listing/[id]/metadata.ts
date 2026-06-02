import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase'

export async function generateMetadata({ params }: { params: Promise<{id: string}> }): Promise<Metadata> {
  const { id } = await params
  const supabase = createClient()
  const { data } = await supabase.from('listings').select('title,description,price_label,city,category,image_urls').eq('id', id).single()
  if (!data) return { title: 'Listing | HagerHub' }
  const img = data.image_urls?.[0]
  return {
    title: `${data.title} — ${data.price_label}`,
    description: data.description?.slice(0, 155) || `${data.category} listing in ${data.city}, Ethiopia. ${data.price_label}.`,
    openGraph: {
      title: `${data.title} — ${data.price_label}`,
      description: data.description?.slice(0, 155) || `${data.category} in ${data.city}`,
      images: img ? [{ url: img, width: 800, height: 600 }] : [],
      type: 'article',
    },
    twitter: { card: 'summary_large_image', title: data.title, description: data.price_label },
  }
}
