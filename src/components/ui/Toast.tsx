'use client'

import { useState, useCallback } from 'react'

export function useToast() {
  const [msg, setMsg] = useState('')
  const show = useCallback((text: string) => {
    setMsg(text)
    setTimeout(() => setMsg(''), 2200)
  }, [])
  return { msg, show }
}

export function Toast({ msg }: { msg: string }) {
  if (!msg) return null
  return <div className="toast">{msg}</div>
}
