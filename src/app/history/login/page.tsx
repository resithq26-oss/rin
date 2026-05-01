'use client'

import { Suspense, useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function LoginContent() {
  const [pin,    setPin]    = useState(['', '', '', ''])
  const [error,  setError]  = useState(false)
  const [loading, setLoading] = useState(false)
  const inputs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)]
  const router = useRouter()
  const params = useSearchParams()

  function handleChange(i: number, v: string) {
    if (!/^\d?$/.test(v)) return
    const next = [...pin]
    next[i] = v
    setPin(next)
    setError(false)
    if (v && i < 3) inputs[i + 1].current?.focus()
    if (next.every(d => d !== '')) submit(next.join(''))
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !pin[i] && i > 0) {
      inputs[i - 1].current?.focus()
    }
  }

  async function submit(code: string) {
    setLoading(true)
    const res = await fetch('/api/history/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: code }),
    })
    setLoading(false)
    if (res.ok) {
      router.push(params.get('next') ?? '/history')
    } else {
      setError(true)
      setPin(['', '', '', ''])
      inputs[0].current?.focus()
    }
  }

  return (
    <div className="history-login-wrap">
      <div className="history-login-card">
        <div className="history-login-icon">🛍️</div>
        <h1 className="history-login-title">ショッピングヒストリー</h1>
        <p className="history-login-sub">PIN を入力してね</p>

        <div className="history-pin-row">
          {pin.map((d, i) => (
            <input
              key={i}
              ref={inputs[i]}
              className={`history-pin-input${error ? ' error' : ''}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              autoFocus={i === 0}
            />
          ))}
        </div>

        {error && <p className="history-pin-error">PINが違うよ</p>}
        {loading && <p className="history-pin-loading">確認中…</p>}
      </div>
    </div>
  )
}

export default function HistoryLogin() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  )
}
