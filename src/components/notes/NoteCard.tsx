'use client'

import { useState } from 'react'
import type { Note } from '@/types'

const COLOR_MAP: Record<string, string> = {
  default: 'note-color-default',
  red:    'note-color-red',
  orange: 'note-color-orange',
  yellow: 'note-color-yellow',
  green:  'note-color-green',
  teal:   'note-color-teal',
  blue:   'note-color-blue',
  purple: 'note-color-purple',
  pink:   'note-color-pink',
}

interface NoteCardProps {
  note: Note
  onClick: () => void
  onDismiss?: () => void
}

export default function NoteCard({ note, onClick, onDismiss }: NoteCardProps) {
  const [peeling, setPeeling] = useState(false)
  const colorClass = COLOR_MAP[note.color] ?? 'note-color-default'
  const checkedCount = note.items.filter(i => i.checked).length
  const total = note.items.length

  function handleDismiss(e: React.MouseEvent) {
    e.stopPropagation()
    setPeeling(true)
    setTimeout(() => onDismiss?.(), 260)
  }

  return (
    <div className={`note-card-wrap${peeling ? ' peeling' : ''}`}>
      {onDismiss && (
        <button className="note-dismiss-btn" onClick={handleDismiss} title="アーカイブ">✕</button>
      )}
      <button className={`note-card ${colorClass}`} onClick={onClick}>
        {note.pinned && <div className="note-pin">📌</div>}
        {note.category && <div className="note-category">🏷 {note.category}</div>}
        {note.title && <div className="note-title">{note.title}</div>}
        {note.type === 'text' && note.content && (
          <div className="note-content">{note.content}</div>
        )}
        {note.type === 'checklist' && total > 0 && (
          <>
            <div className="note-check-preview">
              {note.items.slice(0, 5).map(item => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: item.checked ? .5 : 1 }}>
                  <span style={{ fontSize: 12 }}>{item.checked ? '✓' : '○'}</span>
                  <span style={{ textDecoration: item.checked ? 'line-through' : 'none' }}>{item.text}</span>
                </div>
              ))}
              {total > 5 && <div style={{ opacity: .5, fontSize: 11 }}>…他 {total - 5} 件</div>}
            </div>
            {total > 0 && (
              <div className="note-progress-bar" style={{ marginTop: 8 }}>
                <div className="note-progress-fill" style={{ width: `${(checkedCount / total) * 100}%` }} />
              </div>
            )}
          </>
        )}
      </button>
    </div>
  )
}
