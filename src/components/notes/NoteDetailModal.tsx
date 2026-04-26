'use client'

import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import { Toast, useToast } from '@/components/ui/Toast'
import { supabase } from '@/lib/supabase'
import { uid } from '@/lib/utils'
import type { Note } from '@/types'

interface NoteDetailModalProps {
  note: Note
  onEdit: () => void
  onDelete: () => void
  onClose: () => void
  onToggleItem: (noteId: string, itemId: string) => void
}

export default function NoteDetailModal({ note, onEdit, onDelete, onClose, onToggleItem }: NoteDetailModalProps) {
  const checked = note.items.filter(i => i.checked).length
  const total = note.items.length
  const pct = total > 0 ? (checked / total) * 100 : 0
  const { msg, show: showToast } = useToast()
  const [adding, setAdding] = useState<string | null>(null)

  async function addToShopping(name: string, key: string) {
    if (adding) return
    setAdding(key)
    const { data: existing } = await supabase.from('pickups').select('id, status').eq('name', name.trim()).maybeSingle()
    if (existing) {
      if (existing.status === '未完了') { showToast('すでに買い物リストにあります'); setAdding(null); return }
      await supabase.from('pickups').update({ status: '未完了' }).eq('id', existing.id)
    } else {
      await supabase.from('pickups').insert([{
        id: uid(), name: name.trim(), category: note.category || '', emoji: '📝',
        status: '未完了', url: '', image_url: '', added_at: new Date().toISOString(),
      }])
    }
    showToast('🛒 買い物リストに追加しました')
    setAdding(null)
  }

  async function addAllToShopping() {
    const unchecked = note.items.filter(i => !i.checked)
    for (const item of unchecked) await addToShopping(item.text, item.id)
  }

  return (
    <>
      <Modal
        title={note.title || 'ノート'}
        onClose={onClose}
        footer={
          <>
            <button className="btn-primary" onClick={onEdit}>編集する</button>
            {note.type === 'checklist' && note.items.some(i => !i.checked) && (
              <button className="btn-shopping" onClick={addAllToShopping}>
                🛒 未完了を全部追加
              </button>
            )}
            {note.type === 'text' && note.title && (
              <button className="btn-shopping" onClick={() => addToShopping(note.title, 'title')}>
                🛒 買い物リストへ追加
              </button>
            )}
            <button className="btn-complete" onClick={onDelete}>✓ 完了して削除</button>
            <button className="btn-danger" onClick={() => confirm('削除しますか？') && onDelete()}>削除する</button>
          </>
        }
      >
        {note.type === 'checklist' && total > 0 && (
          <div className="progress-wrap">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${pct}%` }} />
            </div>
            <span className="progress-text">{checked}/{total}</span>
          </div>
        )}

        {note.category && (
          <div style={{ fontSize: 12, color: 'var(--color-sub)', marginBottom: 12 }}>🏷 {note.category}</div>
        )}

        {note.type === 'text' && note.content && (
          <p style={{ fontSize: 16, lineHeight: 1.7, color: 'var(--color-text)', whiteSpace: 'pre-wrap' }}>
            {note.content}
          </p>
        )}

        {note.type === 'checklist' && (
          <div className="note-view-checklist">
            {note.items.map(item => (
              <div key={item.id} className={`note-check-row ${item.checked ? 'checked' : ''}`}>
                <span
                  className={`note-check-box ${item.checked ? 'on' : ''}`}
                  onClick={() => onToggleItem(note.id, item.id)}
                >
                  {item.checked ? '✓' : ''}
                </span>
                <div style={{ flex: 1 }} onClick={() => onToggleItem(note.id, item.id)}>
                  <span className="note-check-text">{item.text}</span>
                  {item.note && <span className="note-check-note">{item.note}</span>}
                </div>
                {!item.checked && (
                  <button
                    className="note-item-cart-btn"
                    onClick={e => { e.stopPropagation(); addToShopping(item.text, item.id) }}
                    disabled={adding === item.id}
                  >
                    🛒
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </Modal>
      <Toast msg={msg} />
    </>
  )
}
