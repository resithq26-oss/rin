'use client'

import { useState, useEffect } from 'react'

export const MOODS = [
  { id: 'genki',   label: '元気',    emoji: '⚡', color: '#f472b6', colorD: '#ec4899' },
  { id: 'nonbiri', label: 'のんびり', emoji: '🌿', color: '#34d399', colorD: '#10b981' },
  { id: 'shuchu',  label: '集中',    emoji: '🎯', color: '#4fc3f7', colorD: '#0ea5e9' },
  { id: 'shindoi', label: 'しんどい', emoji: '🌧', color: '#94a3b8', colorD: '#64748b' },
  { id: 'ureshii', label: 'うれしい', emoji: '🌸', color: '#fbbf24', colorD: '#f59e0b' },
  { id: 'futsuu',  label: 'ふつう',  emoji: '✦',  color: '#c4b5fd', colorD: '#a78bfa' },
] as const

export type MoodId = typeof MOODS[number]['id']

export function applyMood(id: MoodId | null) {
  if (id) {
    document.documentElement.setAttribute('data-mood', id)
  } else {
    document.documentElement.removeAttribute('data-mood')
  }
  localStorage.setItem('rin-mood', id ?? '')
}

export function initMood() {
  const saved = localStorage.getItem('rin-mood') as MoodId | null
  if (saved && MOODS.some(m => m.id === saved)) {
    document.documentElement.setAttribute('data-mood', saved)
    return saved
  }
  return null
}

export function MoodRibbon() {
  const [mood, setMood] = useState<MoodId | null>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('rin-mood') as MoodId | null
    if (saved && MOODS.some(m => m.id === saved)) {
      setMood(saved)
      document.documentElement.setAttribute('data-mood', saved)
    }
  }, [])

  function select(id: MoodId) {
    setMood(id)
    applyMood(id)
    setOpen(false)
  }

  const current = MOODS.find(m => m.id === mood)

  return (
    <div className="mood-ribbon-wrap">
      <button
        className={`mood-ribbon-btn ${mood ? 'has-mood' : ''}`}
        style={current ? { borderColor: current.color, color: current.color } as React.CSSProperties : {}}
        onClick={() => setOpen(o => !o)}
      >
        <span className="mood-ribbon-bow">🎀</span>
        <span className="mood-ribbon-text">
          {current ? `${current.emoji} ${current.label}モード` : '今日の気分は？'}
        </span>
        <span className="mood-ribbon-arrow">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="mood-picker">
          {MOODS.map(m => (
            <button
              key={m.id}
              className={`mood-option ${mood === m.id ? 'active' : ''}`}
              style={{ '--mood-color': m.color } as React.CSSProperties}
              onClick={() => select(m.id)}
            >
              <span className="mood-option-emoji">{m.emoji}</span>
              <span className="mood-option-label">{m.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
