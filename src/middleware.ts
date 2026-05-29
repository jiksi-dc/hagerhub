import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import createMiddleware from 'next-intl/middleware'

const intlMiddleware = createMiddleware({
  locales: ['en', 'am', 'ar', 'fr'],
  defaultLocale: 'en',
  localePrefix: 'as-needed'
})

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

  if (user !== 'hagerhub' || pwd !== 'jtech2025') {
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
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
}