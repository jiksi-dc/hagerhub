import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import createMiddleware from 'next-intl/middleware'

const intlMiddleware = createMiddleware({
  locales: ['en', 'am', 'ar', 'fr'],
  defaultLocale: 'en',
  localePrefix: 'as-needed'
})

// Fallback credentials — used only if the site_settings lookup fails,
// so a database hiccup can never lock everyone out of the site.
const FALLBACK_USER = 'hagerhub'
const FALLBACK_PWD = 'jtech2025'

async function getGateCredentials(): Promise<{ user: string; pwd: string }> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) return { user: FALLBACK_USER, pwd: FALLBACK_PWD }
    const res = await fetch(`${url}/rest/v1/site_settings?select=gate_user,gate_pwd&id=eq.1`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      cache: 'no-store',
    })
    if (!res.ok) return { user: FALLBACK_USER, pwd: FALLBACK_PWD }
    const rows = await res.json()
    const row = Array.isArray(rows) ? rows[0] : null
    if (row && row.gate_user && row.gate_pwd) {
      return { user: row.gate_user, pwd: row.gate_pwd }
    }
    return { user: FALLBACK_USER, pwd: FALLBACK_PWD }
  } catch {
    return { user: FALLBACK_USER, pwd: FALLBACK_PWD }
  }
}

export async function middleware(req: NextRequest) {
  const basicAuth = req.headers.get('authorization')

  if (!basicAuth) {
    return new NextResponse('Authentication required', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="HagerHub"' }
    })
  }

  const auth = basicAuth.split(' ')[1]
  const [user, pwd] = atob(auth).split(':')

  const creds = await getGateCredentials()

  if (user !== creds.user || pwd !== creds.pwd) {
    return new NextResponse('Invalid credentials', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="HagerHub"' }
    })
  }

  let supabaseResponse = NextResponse.next({ request: req })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return req.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request: req })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options))
        },
      },
    }
  )

  await supabase.auth.getUser()

  return intlMiddleware(req)
}

export const config = {
  matcher: ['/((?!api|auth|_next|_vercel|.*\\..*).*)']
}
