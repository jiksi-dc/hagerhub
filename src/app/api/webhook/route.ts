import { NextRequest } from 'next/server'
import Stripe from 'stripe'
import { activateBoost } from '../_lib/activateBoost'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return Response.json({ error: 'Stripe not configured' }, { status: 503 })
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' })
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return Response.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const { listing_id, tier } = session.metadata || {}
    if (!listing_id || !tier) {
      return Response.json({ error: 'Missing metadata' }, { status: 400 })
    }
    try {
      await activateBoost({
        listing_id, tier, provider: 'stripe',
        reference: session.id,
        amount: (session.amount_total || 0) / 100,
        currency: 'usd',
      })
    } catch (e: any) {
      return Response.json({ error: e.message }, { status: 500 })
    }
  }

  return Response.json({ received: true })
}
