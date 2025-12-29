import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const referer = request.headers.get('referer')
  const host = request.headers.get('host')
  const hasSession = request.cookies.has('auth_session')

  // 1. Exclude static resources and public paths
  if (
    pathname.startsWith('/_next') || 
    pathname === '/auth' || 
    pathname.startsWith('/api') ||
    pathname.includes('.') // file extensions like .ico, .png
  ) {
    return NextResponse.next()
  }

  // 2. Detect External Re-entry
  // If referer exists and does not contain our host, it's an external entry.
  // We force re-authentication for security.
  const isExternalEntry = referer && host && !referer.includes(host)

  if (isExternalEntry && hasSession) {
    // console.log('[Security] External entry detected: invalidating session.')
    const response = NextResponse.redirect(new URL('/auth', request.url))
    response.cookies.delete('auth_session')
    return response
  }

  // 3. Protected Route Guard
  if (!hasSession) {
    return NextResponse.redirect(new URL('/auth', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
