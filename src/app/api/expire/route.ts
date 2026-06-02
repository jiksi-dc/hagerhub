import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

// Called daily by Vercel Cron (vercel.json) or manually
// Handles: 1) sending expiry reminder emails, 2) auto-expiring stale listings

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Expiry windows by category (days)
const EXPIRY_DAYS: Record<string, number> = {
  Properties: 60,
  Vehicles: 45,
  Machinery: 30,
  Classifieds: 30,
  Jobs: 30,
  'Discover Ethiopia': 0, // handled by event_date
}

const REMINDER_DAYS_BEFORE = 5

function getExpiryDate(category: string, createdAt: string): Date {
  const days = EXPIRY_DAYS[category] ?? 30
  const d = new Date(createdAt)
  d.setDate(d.getDate() + days)
  return d
}

async function sendReminderEmail(email: string, name: string, listing: any, daysLeft: number, baseUrl: string) {
  const categoryDays = EXPIRY_DAYS[listing.category] ?? 30
  const body = `
Hi ${name || 'there'},

Your listing on HagerHub is expiring in ${daysLeft} day${daysLeft === 1 ? '' : 's'}:

"${listing.title}" — ${listing.price_label}
Posted in: ${listing.city}

Your ad runs for ${categoryDays} days and will be removed on ${new Date(listing.expires_at).toLocaleDateString('en-ET', {year:'numeric',month:'long',day:'numeric'})}.

Still selling? Renew your listing to keep it active:
${baseUrl}/${listing.locale || 'en'}/listing/${listing.id}

Or mark it as sold from the listing page if your item has been sold.

— The HagerHub Team
Ethiopia's #1 Marketplace
`;

  // Use Supabase's built-in email or a simple fetch to an email service
  // For now we log — replace with Resend/SendGrid/Nodemailer in production
  console.log('REMINDER EMAIL to:', email, body)
  return true
}

export async function GET(req: NextRequest) {
  // Security: verify secret header from Vercel Cron
  const authHeader = req.headers.get('authorization')
  const secret = process.env.CRON_SECRET
  if (secret && authHeader !== `Bearer ${secret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const reminderDate = new Date(now)
  reminderDate.setDate(reminderDate.getDate() + REMINDER_DAYS_BEFORE)

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://hagerhub.vercel.app'

  let expired = 0
  let reminded = 0
  let eventExpired = 0
  const errors: string[] = []

  try {
    // 1. Auto-expire old listings by category
    for (const [category, days] of Object.entries(EXPIRY_DAYS)) {
      if (days === 0) continue // skip Discover (handled by event_date)
      const cutoff = new Date(now)
      cutoff.setDate(cutoff.getDate() - days)

      const { data: toExpire } = await supabase
        .from('listings')
        .select('id, title')
        .eq('category', category)
        .eq('status', 'active')
        .lt('created_at', cutoff.toISOString())

      if (toExpire?.length) {
        const ids = toExpire.map(l => l.id)
        await supabase.from('listings').update({ status: 'expired' }).in('id', ids)
        expired += toExpire.length
      }
    }

    // 2. Auto-expire Discover listings where event_date has passed
    const { data: pastEvents } = await supabase
      .from('listings')
      .select('id')
      .eq('category', 'Discover Ethiopia')
      .eq('status', 'active')
      .not('event_date', 'is', null)
      .lt('event_date', now.toISOString().split('T')[0])

    if (pastEvents?.length) {
      await supabase.from('listings').update({ status: 'expired' }).in('id', pastEvents.map(l => l.id))
      eventExpired += pastEvents.length
    }

    // 3. Send reminder emails for listings expiring in ~5 days
    for (const [category, days] of Object.entries(EXPIRY_DAYS)) {
      if (days === 0) continue
      const reminderCutoffFrom = new Date(now)
      reminderCutoffFrom.setDate(reminderCutoffFrom.getDate() - (days - REMINDER_DAYS_BEFORE - 1))
      const reminderCutoffTo = new Date(now)
      reminderCutoffTo.setDate(reminderCutoffTo.getDate() - (days - REMINDER_DAYS_BEFORE))

      const { data: expiringSoon } = await supabase
        .from('listings')
        .select('id, title, price_label, city, category, created_at, user_id')
        .eq('category', category)
        .eq('status', 'active')
        .gte('created_at', reminderCutoffFrom.toISOString())
        .lt('created_at', reminderCutoffTo.toISOString())

      if (!expiringSoon?.length) continue

      for (const listing of expiringSoon) {
        const expiresAt = getExpiryDate(category, listing.created_at)
        const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

        // Get user profile + email
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', listing.user_id)
          .single()

        if (profile?.email) {
          await sendReminderEmail(
            profile.email,
            profile.full_name,
            { ...listing, expires_at: expiresAt },
            daysLeft,
            baseUrl
          )
          reminded++
        }
      }
    }

    return Response.json({
      success: true,
      expired,
      eventExpired,
      reminded,
      timestamp: now.toISOString()
    })
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
