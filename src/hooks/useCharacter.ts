'use client'
import { useState, useEffect } from 'react'

export function useCharacter() {
  const [charVisible, setCharVisibleState] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('rin-char')
    const visible = saved === null ? true : saved === 'true'
    setCharVisibleState(visible)
    document.documentElement.setAttribute('data-char', String(visible))
  }, [])

  function setCharVisible(v: boolean) {
    document.documentElement.setAttribute('data-char', String(v))
    localStorage.setItem('rin-char', String(v))
    setCharVisibleState(v)
  }

  return { charVisible, setCharVisible }
}
