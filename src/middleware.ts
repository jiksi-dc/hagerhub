import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const basicAuth = request.headers.get('authorization')
  const url = request.nextUrl

  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1]
    const [user, pwd] = atob(authValue).split(':')
    if (user === 'hagerhub' && pwd === 'jtech2025') {
      return NextResponse.next()
    }
  }

  return new NextResponse('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="HagerHub Dev - Restricted Access"',
    },
  })
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|lion.jpg).*)'],
}
