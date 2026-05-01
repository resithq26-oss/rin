import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

async function makeToken(pin: string): Promise<string> {
  const data = new TextEncoder().encode(pin + 'rin-history-salt-2026')
  const hash = await crypto.subtle.digest('SHA-256', data)
  return btoa(String.fromCharCode(...new Uint8Array(hash)))
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/history') && !pathname.startsWith('/history/login')) {
    const cookie = request.cookies.get('rh')?.value
    const expected = await makeToken(process.env.HISTORY_PIN ?? '')
    if (cookie !== expected) {
      const loginUrl = new URL('/history/login', request.url)
      loginUrl.searchParams.set('next', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/history/:path*'],
}
