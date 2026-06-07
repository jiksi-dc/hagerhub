import { NextRequest } from 'next/server'
import { activateBoost } from '../../../_lib/activateBoost'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const tx_ref = req.nextUrl.searchParams.get('tx_ref')
  const listing_id = req.nextUrl.searchParams.get('listing_id')
  const tier = req.nextUrl.searchParams.get('tier')
  if (!tx_ref || !listing_id || !tier) {
    return Response.json({ error: 'missing params' }, { status: 400 })
  }
  if (!process.env.CHAPA_SECRET_KEY) {
    return Response.json({ error: 'not configured' }, { status: 503 })
  }

  const res = await fetch(`https://api.chapa.co/v1/transaction/verify/${tx_ref}`, {
    headers: { Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}` },
  })
  const data = await res.json()
  if (data.status !== 'success' || data.data?.status !== 'success') {
    return Response.json({ error: 'payment not verified' }, { status: 400 })
  }

  await activateBoost({
    listing_id, tier, provider: 'chapa',
    reference: tx_ref,
    amount: Number(data.data.amount) || 0,
    currency: 'ETB',
  })
  return Response.json({ received: true })
}
