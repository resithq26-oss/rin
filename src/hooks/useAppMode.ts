'use client'
import { useState, useEffect } from 'react'

export type AppMode = 'standard' | 'companion'

export function useAppMode() {
  const [mode, setModeState] = useState<AppMode>('standard')

  useEffect(() => {
    const saved = (localStorage.getItem('rin-app-mode') as AppMode) || 'standard'
    setModeState(saved)
    document.documentElement.setAttribute('data-mode', saved)
  }, [])

  function setMode(next: AppMode) {
    document.documentElement.setAttribute('data-mode', next)
    localStorage.setItem('rin-app-mode', next)
    setModeState(next)
  }

  return { mode, setMode }
}
