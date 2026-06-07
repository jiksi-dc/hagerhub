import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'
import Stripe from 'stripe'

// Stripe SDK requires the Node.js runtime (not Edge)
export const runtime = 'nodejs'

// POST /api/boost — creates a Stripe Checkout session for boosting a listing
export async function POST(req: NextRequest) {
  const { listing_id, tier, locale } = await req.json()

  if (!listing_id || !tier) {
    return Response.json({ error: 'listing_id and tier required' }, { status: 400 })
  }

  const TIERS: Record<string, { name: string; price: number; days: number }> = {
    featured: { name: 'Featured Listing — 1 Week', price: 200, days: 7 },
    featured_month: { name: 'Featured Listing — 1 Month', price: 700, days: 30 },
    top: { name: 'Top Ad — 1 Week', price: 500, days: 7 },
    top_month: { name: 'Top Ad — 1 Month', price: 1800, days: 30 },
  }

  const selected = TIERS[tier]
  if (!selected) return Response.json({ error: 'Invalid tier' }, { status: 400 })

  if (!process.env.STRIPE_SECRET_KEY) {
    return Response.json({ error: 'Payment not configured yet. Contact support.' }, { status: 503 })
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' })
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://hagerhub.vercel.app'

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: selected.name,
          description: `Boost your listing on HagerHub for ${selected.days} days`,
        },
        unit_amount: selected.price,
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: `${baseUrl}/${locale}/boost/success?listing_id=${listing_id}&tier=${tier}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/${locale}/boost?listing_id=${listing_id}&cancelled=1`,
    metadata: { listing_id, tier, days: String(selected.days) },
  })

  return Response.json({ url: session.url })
}
