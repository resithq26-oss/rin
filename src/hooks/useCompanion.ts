'use client'
import { useState, useEffect } from 'react'

export type CompanionId = 'aoi'

export interface CompanionDef {
  id: CompanionId
  name: string
  baseTheme: 'rin' | 'night' | 'aoi'
  color: string
  img: string
  comingSoon?: boolean
}

export const COMPANIONS: CompanionDef[] = [
  { id: 'aoi', name: '碧', baseTheme: 'aoi', color: '#4fc3f7', img: '/rin/companion-aoi.png' },
]

export function useCompanion() {
  const [companion, setCompanionState] = useState<CompanionId>('aoi')

  useEffect(() => {
    const saved = (localStorage.getItem('rin-companion') as CompanionId) || 'aoi'
    // data-companion だけ設定。data-theme には触らない（useTheme が管理する）
    document.documentElement.setAttribute('data-companion', saved)
    setCompanionState(saved)
  }, [])

  function setCompanion(next: CompanionId) {
    document.documentElement.setAttribute('data-companion', next)
    localStorage.setItem('rin-companion', next)
    setCompanionState(next)
  }

  return { companion, setCompanion }
}
