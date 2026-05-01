import { NextRequest, NextResponse } from 'next/server'

async function makeToken(pin: string): Promise<string> {
  const data = new TextEncoder().encode(pin + 'rin-history-salt-2026')
  const hash = await crypto.subtle.digest('SHA-256', data)
  return btoa(String.fromCharCode(...new Uint8Array(hash)))
}

export async function POST(req: NextRequest) {
  const { pin } = await req.json()
  if (!pin || pin !== (process.env.HISTORY_PIN ?? '').trim()) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }
  const token = await makeToken(pin)
  const res = NextResponse.json({ ok: true })
  res.cookies.set('rh', token, {
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  })
  return res
}
