'use client'

import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import type { Habit } from '@/types'

interface HabitModalProps {
  habit?: Habit | null
  onSave: (fields: Omit<Habit, 'id'>) => void
  onDelete?: () => void
  onClose: () => void
}

function scrollToInput(e: React.FocusEvent) {
  setTimeout(() => (e.target as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' }), 300)
}

const INTERVAL_PRESETS = [
  { label: '一回限り', value: 0 },
  { label: '毎日', value: 1 },
  { label: '2日', value: 2 },
  { label: '3日', value: 3 },
  { label: '週1', value: 7 },
  { label: '2週間', value: 14 },
  { label: '月1', value: 30 },
]

export default function HabitModal({ habit, onSave, onDelete, onClose }: HabitModalProps) {
  const [name,     setName]     = useState(habit?.name     ?? '')
  const [emoji,    setEmoji]    = useState(habit?.emoji    ?? '')
  const [category, setCategory] = useState(habit?.category ?? '')
  const [interval, setInterval] = useState(habit?.interval_days ?? 1)
  const isEdit = !!habit

  return (
    <Modal
      title={isEdit ? 'ルーティンを編集' : 'ルーティンを追加'}
      onClose={onClose}
      footer={
        <>
          <button className="btn-primary"
            onClick={() => name.trim() && onSave({ name: name.trim(), emoji: emoji.trim(), category: category.trim(), interval_days: interval, last_done: habit?.last_done ?? null })}>
            {isEdit ? '更新する' : '追加する'}
          </button>
          {isEdit && onDelete && (
            <button className="btn-danger" onClick={() => confirm('削除しますか？') && onDelete()}>削除する</button>
          )}
        </>
      }
    >
      <div className="fg"><label>名前 *</label>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="例：筋トレ" autoFocus onFocus={scrollToInput} />
      </div>
      <div className="fg row2">
        <div><label>絵文字</label>
          <input value={emoji} onChange={e => setEmoji(e.target.value)} placeholder="💪" className="emoji-input" />
        </div>
        <div><label>カテゴリ</label>
          <input value={category} onChange={e => setCategory(e.target.value)} placeholder="健康" onFocus={scrollToInput} />
        </div>
      </div>
      <div className="fg">
        <label>頻度</label>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {INTERVAL_PRESETS.map(p => (
            <button key={p.value} onClick={() => setInterval(p.value)}
              style={{
                padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
                fontWeight: 700, fontSize: 13,
                background: interval === p.value ? 'var(--color-primary)' : 'var(--color-border)',
                color: interval === p.value ? '#fff' : 'var(--color-text)',
              }}>
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </Modal>
  )
}
