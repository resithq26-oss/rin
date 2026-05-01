'use client'

import { useState, useRef, useEffect } from 'react'
import Modal from '@/components/ui/Modal'
import { uid, NOTE_COLOR_SWATCHES } from '@/lib/utils'
import type { Note, NoteColor, NoteType, ChecklistItem } from '@/types'

interface NoteModalProps {
  note?: Note | null
  onSave: (fields: Omit<Note, 'id' | 'created_at' | 'updated_at'>) => void
  onDelete?: () => void
  onClose: () => void
}

function scrollToInput(e: React.FocusEvent) {
  setTimeout(() => (e.target as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' }), 300)
}

export default function NoteModal({ note, onSave, onDelete, onClose }: NoteModalProps) {
  const [title,    setTitle]    = useState(note?.title    ?? '')
  const [content,  setContent]  = useState(note?.content  ?? '')
  const [category, setCategory] = useState(note?.category ?? '')
  const [type,     setType]     = useState<NoteType>(note?.type ?? 'text')
  const [color,    setColor]    = useState<NoteColor>(note?.color ?? 'default')
  const [pinned,   setPinned]   = useState(note?.pinned ?? false)
  const [items,    setItems]    = useState<ChecklistItem[]>(
    note?.items?.length ? note.items.map(i => ({ ...i })) : []
  )
  const isEdit = !!note
  const lastItemRef = useRef<HTMLInputElement>(null)

  function addItem(autoFocus = false) {
    const newId = uid()
    setItems(its => [...its, { id: newId, text: '', note: '', checked: false }])
    if (autoFocus) setTimeout(() => lastItemRef.current?.focus(), 50)
  }

  function switchToChecklist() {
    setType('checklist')
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
  }

  function switchToText() {
    if (!content.trim() && items.length > 0) {
      setContent(items.map(i => i.text).filter(Boolean).join('\n'))
    }
    setType('text')
  }

  function updateItem(id: string, text: string) {
    setItems(its => its.map(i => i.id === id ? { ...i, text } : i))
  }
  function removeItem(id: string) {
    setItems(its => its.filter(i => i.id !== id))
  }

  function handleSave() {
    if (!title.trim() && !content.trim() && items.length === 0) return
    onSave({ title: title.trim(), content: content.trim(), category: category.trim(), type, color, pinned, items })
  }

  return (
    <Modal
      title={isEdit ? 'ノートを編集' : 'ノートを追加'}
      onClose={onClose}
      footer={
        <>
          <button className="btn-primary" onClick={handleSave}>
            {isEdit ? '更新する' : '追加する'}
          </button>
          {isEdit && onDelete && (
            <button className="btn-danger" onClick={() => confirm('削除しますか？') && onDelete()}>
              削除する
            </button>
          )}
        </>
      }
    >
      {/* Type switch */}
      <div className="fg">
        <label>種類</label>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['text', 'checklist'] as NoteType[]).map(t => (
            <button key={t} onClick={() => t === 'checklist' ? switchToChecklist() : switchToText()}
              style={{
                flex: 1, height: 44, borderRadius: 12, border: 'none', cursor: 'pointer',
                fontWeight: 700, fontSize: 14,
                background: type === t ? 'var(--color-primary)' : 'var(--color-border)',
                color: type === t ? '#fff' : 'var(--color-text)',
              }}>
              {t === 'text' ? '📝 テキスト' : '✅ チェックリスト'}
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div className="fg">
        <label>タイトル</label>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="タイトルを入力" autoFocus onFocus={scrollToInput} />
      </div>

      {/* Category */}
      <div className="fg">
        <label>カテゴリ</label>
        <input value={category} onChange={e => setCategory(e.target.value)} placeholder="例：仕事・買い物・アイデア" onFocus={scrollToInput} />
      </div>

      {/* Content or Checklist */}
      {type === 'text' ? (
        <div className="fg">
          <label>内容</label>
          <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="メモを入力…" rows={4} onFocus={scrollToInput} />
        </div>
      ) : (
        <div className="fg">
          <label>チェックリスト</label>
          <div className="note-item-list">
            {items.map((item, idx) => (
              <div key={item.id} className="note-item-row">
                <span className="note-item-dot">○</span>
                <input
                  ref={idx === items.length - 1 ? lastItemRef : undefined}
                  value={item.text}
                  onChange={e => updateItem(item.id, e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addItem(true) } }}
                  placeholder={`項目 ${idx + 1}`}
                  onFocus={scrollToInput}
                  className="note-item-input"
                />
                <button className="note-item-del" onClick={() => removeItem(item.id)}>✕</button>
              </div>
            ))}
          </div>
          <button className="note-add-item-btn" onClick={() => addItem(true)}>＋ 項目を追加</button>
        </div>
      )}

      {/* Memo for checklist */}
      {type === 'checklist' && (
        <div className="fg">
          <label>メモ（任意）</label>
          <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="追記メモ…" rows={2} onFocus={scrollToInput} />
        </div>
      )}

      {/* Color */}
      <div className="fg">
        <label>カラー</label>
        <div className="color-picker">
          {NOTE_COLOR_SWATCHES.map(({ color: c, swatch }) => (
            <button key={c} className={`color-swatch ${swatch} ${color === c ? 'selected' : ''}`}
              onClick={() => setColor(c)} title={c} />
          ))}
        </div>
      </div>

      {/* Pin */}
      <div className="fg">
        <div className="toggle-row" onClick={() => setPinned(v => !v)}>
          <span className="toggle-label">📌 ピン留め</span>
          <span className={`toggle ${pinned ? 'on' : ''}`} />
        </div>
      </div>
    </Modal>
  )
}
