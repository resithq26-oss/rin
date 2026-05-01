'use client'

import { useState, useRef } from 'react'
import { uid, NOTE_COLOR_SWATCHES } from '@/lib/utils'
import type { Note, NoteColor, NoteType, ChecklistItem } from '@/types'

interface InlineNoteInputProps {
  onSave: (fields: Omit<Note, 'id' | 'created_at' | 'updated_at'>) => void
}

export default function InlineNoteInput({ onSave }: InlineNoteInputProps) {
  const [expanded, setExpanded] = useState(false)
  const [title,    setTitle]    = useState('')
  const [content,  setContent]  = useState('')
  const [color,    setColor]    = useState<NoteColor>('default')
  const [type,     setType]     = useState<NoteType>('text')
  const [items,    setItems]    = useState<ChecklistItem[]>([])
  const titleRef    = useRef<HTMLInputElement>(null)
  const lastItemRef = useRef<HTMLInputElement>(null)

  function hasContent() {
    return title.trim() !== '' || content.trim() !== '' || items.some(i => i.text.trim())
  }

  function reset() {
    setTitle(''); setContent(''); setColor('default'); setType('text'); setItems([]); setExpanded(false)
  }

  function handlePlaceholderClick() {
    setExpanded(true)
    setTimeout(() => titleRef.current?.focus(), 50)
  }

  function handleSave() {
    if (title.trim() || content.trim() || items.some(i => i.text.trim())) {
      onSave({ title: title.trim(), content: content.trim(), category: '', type, color, pinned: false, items })
    }
    reset()
  }

  function handleCancel() {
    if (hasContent() && !confirm('入力内容を破棄しますか？')) return
    reset()
  }

  function switchType(t: NoteType) {
    if (t === type) return
    if (t === 'checklist') {
      if (items.length === 0) {
        const lines = content.split('\n').filter(l => l.trim())
        if (lines.length > 0) {
          setItems(lines.map(l => ({ id: uid(), text: l.trim(), note: '', checked: false })))
          setContent('')
        } else {
          setItems([{ id: uid(), text: '', note: '', checked: false }])
          setTimeout(() => lastItemRef.current?.focus(), 80)
        }
      }
    } else {
      if (!content.trim() && items.length > 0) {
        setContent(items.map(i => i.text).filter(Boolean).join('\n'))
      }
    }
    setType(t)
  }

  function addItem(autoFocus = false) {
    setItems(its => [...its, { id: uid(), text: '', note: '', checked: false }])
    if (autoFocus) setTimeout(() => lastItemRef.current?.focus(), 50)
  }

  function updateItem(id: string, text: string) {
    setItems(its => its.map(i => i.id === id ? { ...i, text } : i))
  }

  function removeItem(id: string) {
    setItems(its => its.filter(i => i.id !== id))
  }

  return (
    <div className={`inline-note-card note-color-${color} ${expanded ? 'expanded' : ''}`}>
      {!expanded ? (
        <div className="inline-note-placeholder" onClick={handlePlaceholderClick}>
          メモを書く…
        </div>
      ) : (
        <>
          <div className="inline-type-toggle">
            {(['text', 'checklist'] as NoteType[]).map(t => (
              <button key={t} className={`inline-type-btn ${type === t ? 'active' : ''}`} onClick={() => switchType(t)}>
                {t === 'text' ? '📝 テキスト' : '✅ リスト'}
              </button>
            ))}
          </div>

          <input
            ref={titleRef}
            className="inline-note-title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="タイトル"
            onKeyDown={e => e.key === 'Enter' && e.currentTarget.blur()}
          />

          {type === 'text' ? (
            <textarea
              className="inline-note-body"
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="メモの内容…"
              rows={3}
            />
          ) : (
            <div className="inline-checklist">
              {items.map((item, idx) => (
                <div key={item.id} className="inline-check-row">
                  <span className="inline-check-dot">○</span>
                  <input
                    ref={idx === items.length - 1 ? lastItemRef : undefined}
                    className="inline-check-input"
                    value={item.text}
                    onChange={e => updateItem(item.id, e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addItem(true) } }}
                    placeholder={`項目 ${idx + 1}`}
                  />
                  <button className="inline-check-del" onClick={() => removeItem(item.id)}>✕</button>
                </div>
              ))}
              <button className="inline-check-add" onClick={() => addItem(true)}>＋ 項目を追加</button>
            </div>
          )}

          <div className="inline-note-footer">
            <div className="inline-footer-colors">
              {NOTE_COLOR_SWATCHES.map(({ color: c, swatch }) => (
                <button key={c}
                  className={`inline-color-dot ${swatch} ${color === c ? 'active' : ''}`}
                  onClick={() => setColor(c)} />
              ))}
            </div>
            <div className="inline-footer-actions">
              <button className="inline-note-close" onClick={handleCancel}>キャンセル</button>
              <button className="inline-note-submit" onClick={handleSave}>保存</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
