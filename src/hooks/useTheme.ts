'use client'
import { useState, useEffect } from 'react'

export type Theme = 'rin' | 'night'

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('rin')

  useEffect(() => {
    const saved = (localStorage.getItem('rin-theme') as Theme) || 'rin'
    setTheme(saved)
    document.documentElement.setAttribute('data-theme', saved)
  }, [])

  function toggle() {
    setTheme(prev => {
      const next: Theme = prev === 'rin' ? 'night' : 'rin'
      document.documentElement.setAttribute('data-theme', next)
      localStorage.setItem('rin-theme', next)
      return next
    })
  }

  return { theme, toggle }
}
