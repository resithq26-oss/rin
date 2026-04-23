'use client'

import { useState, useRef } from 'react'
import { uid, NOTE_COLOR_SWATCHES } from '@/lib/utils'
import type { Note, NoteColor } from '@/types'

const COLOR_BG: Record<NoteColor, string> = {
  default: '#ffffff', red: '#fff5f5', orange: '#fff8f0',
  yellow: '#fffdf0', green: '#f0fff4', teal: '#f0fdfd',
  blue: '#eff6ff', purple: '#f5f3ff', pink: '#fff0f6',
}

interface InlineNoteInputProps {
  onSave: (fields: Omit<Note, 'id' | 'created_at' | 'updated_at'>) => void
}

export default function InlineNoteInput({ onSave }: InlineNoteInputProps) {
  const [expanded, setExpanded] = useState(false)
  const [title,   setTitle]   = useState('')
  const [content, setContent] = useState('')
  const [color,   setColor]   = useState<NoteColor>('default')
  const titleRef = useRef<HTMLInputElement>(null)

  function handlePlaceholderClick() {
    setExpanded(true)
    setTimeout(() => titleRef.current?.focus(), 50)
  }

  function handleClose() {
    if (title.trim() || content.trim()) {
      onSave({ title: title.trim(), content: content.trim(), category: '', type: 'text', color, pinned: false, items: [] })
    }
    setTitle(''); setContent(''); setColor('default'); setExpanded(false)
  }

  function handleCancel() {
    setTitle(''); setContent(''); setColor('default'); setExpanded(false)
  }

  return (
    <div className={`inline-note-card ${expanded ? 'expanded' : ''}`}
      style={{ background: COLOR_BG[color] }}>
      {!expanded ? (
        <div className="inline-note-placeholder" onClick={handlePlaceholderClick}>
          メモを書く…
        </div>
      ) : (
        <>
          <input
            ref={titleRef}
            className="inline-note-title"
            style={{ background: COLOR_BG[color] }}
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="タイトル"
            onKeyDown={e => e.key === 'Enter' && e.currentTarget.blur()}
          />
          <textarea
            className="inline-note-body"
            style={{ background: COLOR_BG[color] }}
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="メモの内容…"
            rows={3}
          />
          <div className="inline-note-footer">
            {NOTE_COLOR_SWATCHES.map(({ color: c, swatch }) => (
              <button key={c}
                className={`inline-color-dot ${swatch} ${color === c ? 'active' : ''}`}
                onClick={() => setColor(c)} />
            ))}
            <button className="inline-note-close" onClick={handleCancel}>キャンセル</button>
            <button className="inline-note-submit" onClick={handleClose}>保存</button>
          </div>
        </>
      )}
    </div>
  )
}
