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

const WEEKDAYS = [
  { value: 1, label: '月' },
  { value: 2, label: '火' },
  { value: 3, label: '水' },
  { value: 4, label: '木' },
  { value: 5, label: '金' },
  { value: 6, label: '土' },
  { value: 0, label: '日' },
]

const PREP_PRESETS = [
  { label: 'なし', value: 0 },
  { label: '3日前', value: 3 },
  { label: '1週間前', value: 7 },
  { label: '2週間前', value: 14 },
  { label: '3週間前', value: 21 },
]

export default function HabitModal({ habit, onSave, onDelete, onClose }: HabitModalProps) {
  const [name,     setName]     = useState(habit?.name     ?? '')
  const [emoji,    setEmoji]    = useState(habit?.emoji    ?? '')
  const [category, setCategory] = useState(habit?.category ?? '')
  const [interval,    setInterval]    = useState(habit?.interval_days ?? 1)
  const [weekday,     setWeekday]     = useState<number | null>(habit?.weekday ?? null)
  const [lastDone,    setLastDone]    = useState(habit?.last_done ? habit.last_done.slice(0, 10) : '')
  const [targetDate,  setTargetDate]  = useState(habit?.target_date ?? '')
  const [booked,      setBooked]      = useState(habit?.booked ?? false)
  const [prepDays,    setPrepDays]    = useState(habit?.prep_days ?? 0)
  const [prepNote,    setPrepNote]    = useState(habit?.prep_note ?? '')
  const isEdit = !!habit

  const showWeekday = interval >= 7
  const showPrep = interval >= 7

  return (
    <Modal
      title={isEdit ? 'ルーティンを編集' : 'ルーティンを追加'}
      onClose={onClose}
      footer={
        <>
          <button className="btn-primary"
            onClick={() => name.trim() && onSave({
              name: name.trim(), emoji: emoji.trim(), category: category.trim(),
              interval_days: interval,
              last_done: lastDone ? new Date(lastDone).toISOString() : null,
              weekday: showWeekday ? weekday : null,
              target_date: targetDate || null,
              booked,
              prep_days: showPrep ? prepDays : 0,
              prep_note: showPrep ? prepNote.trim() : '',
            })}>
            {isEdit ? '更新する' : '追加する'}
          </button>
          {isEdit && onDelete && (
            <button className="btn-danger" onClick={() => confirm('削除しますか？') && onDelete()}>削除する</button>
          )}
        </>
      }
    >
      <div className="fg"><label>名前 *</label>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="例：美容院" autoFocus onFocus={scrollToInput} />
      </div>
      <div className="fg row2">
        <div><label>絵文字</label>
          <input value={emoji} onChange={e => setEmoji(e.target.value)} placeholder="💇" className="emoji-input" />
        </div>
        <div><label>カテゴリ</label>
          <input value={category} onChange={e => setCategory(e.target.value)} placeholder="美容" onFocus={scrollToInput} />
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

      <div className="fg">
        <label>最終実施日 <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--color-sub)' }}>（ずれた場合に手修正）</span></label>
        <input type="date" value={lastDone} onChange={e => setLastDone(e.target.value)} />
      </div>

      {showWeekday && (
        <div className="fg">
          <label>📅 曜日固定 <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--color-sub)' }}>（省略可）</span></label>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => setWeekday(null)} style={{
              padding: '6px 12px', borderRadius: 20, border: 'none', cursor: 'pointer',
              fontWeight: 700, fontSize: 13,
              background: weekday === null ? 'var(--color-primary)' : 'var(--color-border)',
              color: weekday === null ? '#fff' : 'var(--color-text)',
            }}>なし</button>
            {WEEKDAYS.map(d => (
              <button key={d.value} onClick={() => setWeekday(d.value)} style={{
                padding: '6px 12px', borderRadius: 20, border: 'none', cursor: 'pointer',
                fontWeight: 700, fontSize: 13,
                background: weekday === d.value ? 'var(--color-primary)' : 'var(--color-border)',
                color: weekday === d.value ? '#fff' : 'var(--color-text)',
              }}>{d.label}</button>
            ))}
          </div>
        </div>
      )}

      <div className="fg">
        <label>📌 次の予定日 <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--color-sub)' }}>（美容院・歯科など具体的な日付がある場合）</span></label>
        <input type="date" value={targetDate} onChange={e => { setTargetDate(e.target.value); if (!e.target.value) setBooked(false) }} />
      </div>

      {targetDate && (
        <div className="fg">
          <label>予約状況</label>
          <button
            onClick={() => setBooked(b => !b)}
            style={{
              padding: '8px 20px', borderRadius: 20, border: 'none', cursor: 'pointer',
              fontWeight: 700, fontSize: 14,
              background: booked ? '#10b981' : 'var(--color-border)',
              color: booked ? '#fff' : 'var(--color-text)',
              alignSelf: 'flex-start',
            }}>
            {booked ? '✓ 予約済み' : '未予約'}
          </button>
        </div>
      )}

      {showPrep && (
        <>
          <div className="fg">
            <label>🔔 準備リマインダー <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--color-sub)' }}>（何日前から教える？）</span></label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {PREP_PRESETS.map(p => (
                <button key={p.value} onClick={() => setPrepDays(p.value)}
                  style={{
                    padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
                    fontWeight: 700, fontSize: 13,
                    background: prepDays === p.value ? '#f59e0b' : 'var(--color-border)',
                    color: prepDays === p.value ? '#fff' : 'var(--color-text)',
                  }}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          {prepDays > 0 && (
            <div className="fg">
              <label>やること <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--color-sub)' }}>（省略可）</span></label>
              <input
                value={prepNote}
                onChange={e => setPrepNote(e.target.value)}
                placeholder="例：予約の電話を入れる"
                onFocus={scrollToInput}
              />
            </div>
          )}
        </>
      )}
    </Modal>
  )
}
