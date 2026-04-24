'use client'
import { useState, useEffect } from 'react'

export type Theme = 'rin' | 'night' | 'aoi'

const CYCLE: Theme[] = ['rin', 'night', 'aoi']

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('rin')

  useEffect(() => {
    const saved = (localStorage.getItem('rin-theme') as Theme) || 'rin'
    setTheme(saved)
    document.documentElement.setAttribute('data-theme', saved)
  }, [])

  function toggle() {
    setTheme(prev => {
      const next = CYCLE[(CYCLE.indexOf(prev) + 1) % CYCLE.length]
      document.documentElement.setAttribute('data-theme', next)
      localStorage.setItem('rin-theme', next)
      return next
    })
  }

  return { theme, toggle }
}
