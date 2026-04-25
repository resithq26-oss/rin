'use client'
import { useState, useEffect } from 'react'

export type Theme = 'rin' | 'night'

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('rin')

  useEffect(() => {
    const saved = (localStorage.getItem('rin-theme') as Theme) || 'rin'
    setThemeState(saved)
    document.documentElement.setAttribute('data-theme', saved)
  }, [])

  function setTheme(next: Theme) {
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('rin-theme', next)
    setThemeState(next)
  }

  return { theme, setTheme }
}
