import { createClient } from '@supabase/supabase-js'

export async function activateBoost(p: {
  listing_id: string; tier: string; provider: string;
  reference: string; amount: number; currency: string;
}) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const days = p.tier.endsWith('month') ? 30 : 7
  const expiry = new Date()
  expiry.setDate(expiry.getDate() + days)
  const isTop = p.tier.startsWith('top')

  await supabase.from('boost_payments').insert({
    listing_id: p.listing_id, tier: p.tier, provider: p.provider,
    reference: p.reference, amount: p.amount, currency: p.currency,
    boost_expires_at: expiry.toISOString(),
  })
  const { error } = await supabase.from('listings').update({
    is_featured: true, is_top: isTop, boost_expires_at: expiry.toISOString(),
  }).eq('id', p.listing_id)
  if (error) throw new Error(error.message)
  return expiry
}
