'use client'

import { useState } from 'react'
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

  function addItem() {
    setItems(its => [...its, { id: uid(), text: '', note: '', checked: false }])
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
            <button key={t} onClick={() => setType(t)}
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
                <input value={item.text} onChange={e => updateItem(item.id, e.target.value)}
                  placeholder={`項目 ${idx + 1}`} onFocus={scrollToInput} className="note-item-input" />
                <button className="note-item-del" onClick={() => removeItem(item.id)}>✕</button>
              </div>
            ))}
          </div>
          <button className="note-add-item-btn" onClick={addItem}>＋ 項目を追加</button>
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
