import { NextRequest, NextResponse } from 'next/server'
import createMiddleware from 'next-intl/middleware'

const intlMiddleware = createMiddleware({
  locales: ['en', 'am', 'ar', 'fr'],
  defaultLocale: 'en',
  localePrefix: 'as-needed'
})

export function middleware(req: NextRequest) {
  const basicAuth = req.headers.get('authorization')
  const url = req.nextUrl

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

  return intlMiddleware(req)
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
}
