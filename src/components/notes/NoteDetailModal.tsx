'use client'

import Modal from '@/components/ui/Modal'
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

  return (
    <Modal
      title={note.title || 'ノート'}
      onClose={onClose}
      footer={
        <>
          <button className="btn-primary" onClick={onEdit}>編集する</button>
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
            <div key={item.id}
              className={`note-check-row ${item.checked ? 'checked' : ''}`}
              onClick={() => onToggleItem(note.id, item.id)}>
              <span className={`note-check-box ${item.checked ? 'on' : ''}`}>
                {item.checked ? '✓' : ''}
              </span>
              <div>
                <span className="note-check-text">{item.text}</span>
                {item.note && <span className="note-check-note">{item.note}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  )
}
