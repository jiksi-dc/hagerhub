import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'
import Stripe from 'stripe'

// Stripe sends this webhook when a payment is completed
// This activates the boost on the listing in Supabase
export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return Response.json({ error: 'Stripe not configured' }, { status: 503 })
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' })
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

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
    const { listing_id, tier, days } = session.metadata || {}

    if (!listing_id || !tier) {
      console.error('Missing metadata in webhook', session.metadata)
      return Response.json({ error: 'Missing metadata' }, { status: 400 })
    }

    const boostDays = Number(days) || 7
    const boostExpiry = new Date()
    boostExpiry.setDate(boostExpiry.getDate() + boostDays)

    const isTop = tier.startsWith('top')

    await supabase.from('boost_payments').insert({
      listing_id,
      tier,
      amount_usd: (session.amount_total || 0) / 100,
      stripe_session_id: session.id,
      boost_expires_at: boostExpiry.toISOString(),
    })

    const { error } = await supabase
      .from('listings')
      .update({
        is_featured: true,
        is_top: isTop,
        boost_expires_at: boostExpiry.toISOString(),
      })
      .eq('id', listing_id)

    if (error) {
      console.error('Failed to activate boost:', error)
      return Response.json({ error: error.message }, { status: 500 })
    }

    console.log(`Boost activated for listing ${listing_id}: ${tier} until ${boostExpiry}`)
  }

  return Response.json({ received: true })
}

// App Router handlers don't pre-parse the body (we read req.text() above for
// Stripe signature verification). Force the Node.js runtime — the Stripe SDK
// does not run on the Edge runtime.
export const runtime = 'nodejs'
