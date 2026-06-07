import { NextRequest } from 'next/server'

export const runtime = 'nodejs'

const TIERS: Record<string, { label: string; amount: number }> = {
  featured: { label: 'Featured Listing — 1 Week', amount: 10000 },
  featured_month: { label: 'Featured Listing — 1 Month', amount: 30000 },
  top: { label: 'Top Ad — 1 Week', amount: 10000 },
  top_month: { label: 'Top Ad — 1 Month', amount: 30000 },
}

export async function POST(req: NextRequest) {
  const { listing_id, tier, email, first_name, last_name } = await req.json()
  if (!listing_id || !tier) {
    return Response.json({ error: 'listing_id and tier required' }, { status: 400 })
  }
  const selected = TIERS[tier]
  if (!selected) return Response.json({ error: 'Invalid tier' }, { status: 400 })
  if (!process.env.CHAPA_SECRET_KEY) {
    return Response.json({ error: 'Local payment not configured yet.' }, { status: 503 })
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://hagerhub.vercel.app'
  const tx_ref = `hagerhub-${listing_id}-${tier}-${Date.now()}`

  const res = await fetch('https://api.chapa.co/v1/transaction/initialize', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: String(selected.amount),
      currency: 'ETB',
      email: email || 'noreply@hagerhub.app',
      first_name: first_name || 'HagerHub',
      last_name: last_name || 'User',
      tx_ref,
      callback_url: `${baseUrl}/api/boost/chapa/verify?tx_ref=${tx_ref}&listing_id=${listing_id}&tier=${tier}`,
      return_url: `${baseUrl}/boost/success?listing_id=${listing_id}&tier=${tier}`,
    }),
  })

  const data = await res.json()
  if (data.status !== 'success') {
    return Response.json({ error: data.message || 'Chapa init failed' }, { status: 502 })
  }
  return Response.json({ url: data.data.checkout_url })
}
