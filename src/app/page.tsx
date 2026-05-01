'use client'

import { useState } from 'react'
import Link from 'next/link'
import AppShell from '@/components/layout/AppShell'
import NoteCard from '@/components/notes/NoteCard'
import NoteModal from '@/components/notes/NoteModal'
import { CompanionBubble, getGreeting } from '@/components/ui/CompanionBubble'
import { MoodRibbon } from '@/components/ui/MoodRibbon'
import { Toast, useToast } from '@/components/ui/Toast'
import { supabase } from '@/lib/supabase'
import { uid, getHabitStatus, sortHabits, completionDate, getNextDueDate } from '@/lib/utils'
import { useNotes } from '@/hooks/useNotes'
import { useHabits } from '@/hooks/useHabits'
import { useInventory } from '@/hooks/useInventory'
import { useAppMode } from '@/hooks/useAppMode'
import type { Note, Habit } from '@/types'

const APPS = [
  { href: '/notes',    emoji: '📝', label: 'ノート' },
  { href: '/routines', emoji: '🔄', label: 'ルーティン' },
  { href: '/shopping', emoji: '🛒', label: '買い物' },
  { href: '/stock',    emoji: '📦', label: 'ストック' },
  { href: '/travel',    emoji: '✈️', label: '旅行' },
  { href: '/disaster',  emoji: '🛡️', label: '防災' },
  { href: '/wardrobe',  emoji: '👗', label: 'クローゼット' },
  { href: '/aquarium',  emoji: '🐠', label: '水槽' },
  { href: '/history',   emoji: '🛍️', label: 'ヒストリー' },
  { href: '/settings',  emoji: '⚙️', label: '設定' },
]

function StatusBadge({ habit }: { habit: Habit }) {
  const s = getHabitStatus(habit)
  if (s.type === 'done')    return <span className="badge badge-done">✓ 完了</span>
  if (s.type === 'due')     return <span className="badge badge-due">今日</span>
  if (s.type === 'overdue') return <span className="badge badge-overdue">{s.daysOver ? `${s.daysOver}日遅れ` : '未実施'}</span>
  if (s.daysLeft === 1)     return <span className="badge badge-due" style={{ opacity: .7 }}>明日</span>
  return <span className="badge badge-upcoming">あと{s.daysLeft}日</span>
}

export default function PortalPage() {
  const { notes, setNotes, loading: nLoading }   = useNotes()
  const { habits, setHabits, loading: hLoading } = useHabits()
  const { inventory, loading: iLoading }         = useInventory()
  const { mode } = useAppMode()
  const [editNote, setEditNote] = useState<Note | null>(null)
  const [showAdd,  setShowAdd]  = useState(false)
  const { msg, show: showToast } = useToast()

  const loading = nLoading || hLoading || iLoading
  const scheduledHabits = habits.filter(h => (h.weekday != null && h.interval_days > 0) || !!h.target_date)
  const scheduledIds    = new Set(scheduledHabits.map(h => h.id))
  const dueHabits   = habits.filter(h => {
    if (scheduledIds.has(h.id)) return false
    const s = getHabitStatus(h)
    return ['due', 'overdue'].includes(s.type) || (s.type === 'upcoming' && (s.daysLeft ?? 999) <= 1)
  })
  const prepHabits  = habits.filter(h => {
    if (!h.prep_days || h.prep_days <= 0) return false
    const s = getHabitStatus(h)
    return s.type === 'upcoming' && s.daysLeft !== undefined && s.daysLeft <= h.prep_days
  })
  const urgentItems = inventory.filter(i => i.stock === 0 && i.urgent)
  const pinnedNotes = notes.filter(n => n.pinned && !n.archived)

  const currentEditNote = editNote ? notes.find(n => n.id === editNote.id) ?? editNote : null

  async function complete(id: string) {
    const habit = habits.find(h => h.id === id)
    if (!habit) return
    const now = completionDate(habit)
    const isAppointment = !!habit.target_date
    const update: Record<string, unknown> = { last_done: now }
    if (isAppointment) { update.target_date = null; update.booked = false }
    await supabase.from('habits').update(update).eq('id', id)
    setHabits(hs => sortHabits(hs.map(h => h.id === id
      ? { ...h, last_done: now, ...(isAppointment ? { target_date: null, booked: false } : {}) }
      : h)))
    showToast('✓ 完了しました')
  }

  async function bookHabit(id: string) {
    await supabase.from('habits').update({ booked: true }).eq('id', id)
    setHabits(hs => hs.map(h => h.id === id ? { ...h, booked: true } : h))
    showToast('✓ 予約済みにしました')
  }

  async function saveNote(fields: Omit<Note, 'id' | 'created_at' | 'updated_at'>) {
    const now = new Date().toISOString()
    if (editNote) {
      await supabase.from('notes').update({ ...fields, updated_at: now }).eq('id', editNote.id)
      setNotes(ns => ns.map(n => n.id === editNote.id ? { ...n, ...fields, updated_at: now } : n))
      setEditNote(null)
    } else {
      const id = uid()
      const row: Note = { id, created_at: now, updated_at: now, ...fields }
      await supabase.from('notes').insert([row])
      setNotes(ns => [row, ...ns])
      setShowAdd(false)
    }
    showToast('保存しました')
  }

  async function removeNote(id: string) {
    await supabase.from('notes').delete().eq('id', id)
    setNotes(ns => ns.filter(n => n.id !== id))
    showToast('削除しました')
  }

  async function archiveNote(id: string) {
    await supabase.from('notes').update({ archived: true }).eq('id', id)
    setNotes(ns => ns.filter(n => n.id !== id))
    showToast('アーカイブしました')
  }

  const action = <button className="hdr-add-btn" onClick={() => setShowAdd(true)}>＋ メモ</button>

  return (
    <AppShell title="Rin ✦" action={action}>
      {loading ? (
        <div className="empty"><div className="spinner" /></div>
      ) : (
        <>
          {mode === 'companion' && <CompanionBubble message={getGreeting()} />}
          {mode === 'companion' && <MoodRibbon />}

          {/* アプリ一覧 */}
          <div className="today-section">
            <div className="today-section-label">🗂️ <span>アプリ</span></div>
            <div className="portal-links-grid">
              {APPS.map(app => (
                <Link key={app.href} href={app.href} className="portal-link-btn">
                  <span className="portal-link-emoji">{app.emoji}</span>
                  <span className="portal-link-label">{app.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* 準備リマインダー */}
          {prepHabits.length > 0 && (
            <div className="today-section">
              <div className="today-section-label">
                🔔 <span>そろそろ準備しよう</span>
                <Link href="/routines" style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--color-primary)', fontWeight: 700, textDecoration: 'none' }}>すべて見る</Link>
              </div>
              <div className="list-card-group">
                {prepHabits.map(habit => {
                  const s = getHabitStatus(habit)
                  return (
                    <div key={habit.id} className="prep-alert-card">
                      <div className="prep-alert-emoji">{habit.emoji || '📌'}</div>
                      <div className="prep-alert-info">
                        <div className="prep-alert-name">{habit.name}</div>
                        <div className="prep-alert-sub">
                          あと{s.daysLeft}日
                          {habit.prep_note ? ` · ${habit.prep_note}` : ''}
                        </div>
                      </div>
                      <span className="prep-alert-badge">準備して</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* 日程管理（曜日固定 + 予定日指定ルーティン） */}
          {scheduledHabits.length > 0 && (
            <div className="today-section">
              <div className="today-section-label">
                📅 <span>次の予定</span>
                <Link href="/routines" style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--color-primary)', fontWeight: 700, textDecoration: 'none' }}>すべて見る</Link>
              </div>
              <div className="list-card-group">
                {scheduledHabits.map(habit => {
                  const WD = '日月火水木金土'

                  // 予定日指定タイプ（target_date）
                  if (habit.target_date) {
                    const target = new Date(habit.target_date)
                    target.setHours(0, 0, 0, 0)
                    const today = new Date(); today.setHours(0, 0, 0, 0)
                    const daysLeft = Math.round((target.getTime() - today.getTime()) / 86400000)
                    const dateStr  = `${target.getMonth() + 1}/${target.getDate()}(${WD[target.getDay()]})`
                    const isUrgent = daysLeft <= 7 && !habit.booked
                    const isPast   = daysLeft < 0
                    return (
                      <div key={habit.id} className={`habit-card scheduled appointment${isUrgent ? ' appointment-urgent' : ''}`}>
                        <div className="habit-icon">{habit.emoji || '📌'}</div>
                        <div className="habit-info">
                          <div className="habit-name">{habit.name}</div>
                          <div className="habit-sub">
                            {isPast ? '期限切れ' : `${dateStr}（あと${daysLeft}日）`}
                            {isUrgent && <span className="appt-urgent-tag"> ⚠️ 未予約</span>}
                          </div>
                        </div>
                        {habit.booked
                          ? <span className="badge badge-done">✓ 予約済</span>
                          : <button className="book-btn" onClick={() => bookHabit(habit.id)}>予約した！</button>
                        }
                        <button className="complete-btn" onClick={() => complete(habit.id)}>完了！</button>
                      </div>
                    )
                  }

                  // 曜日固定タイプ
                  const s    = getHabitStatus(habit)
                  const next = getNextDueDate(habit)
                  const dateStr = next
                    ? `${next.getMonth() + 1}/${next.getDate()}(${WD[next.getDay()]})`
                    : ''
                  const isDone = s.type === 'done'
                  return (
                    <div key={habit.id} className={`habit-card scheduled ${s.type}`} style={{ opacity: isDone ? .65 : 1 }}>
                      <div className="habit-icon">{habit.emoji || '📌'}</div>
                      <div className="habit-info">
                        <div className="habit-name">{habit.name}</div>
                        <div className="habit-sub">
                          次: <strong>{dateStr}</strong>
                          {!isDone && s.daysLeft != null ? `（あと${s.daysLeft}日）` : ''}
                        </div>
                      </div>
                      {isDone
                        ? <span className="badge badge-done">✓ 完了</span>
                        : <StatusBadge habit={habit} />
                      }
                      {!isDone && (
                        <button className="complete-btn" onClick={() => complete(habit.id)}>完了！</button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Due Habits */}
          {dueHabits.length > 0 && (
            <div className="today-section">
              <div className="today-section-label">
                🔄 <span>やること</span>
                <Link href="/routines" style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--color-primary)', fontWeight: 700, textDecoration: 'none' }}>すべて見る</Link>
              </div>
              <div className="list-card-group">
                {dueHabits.slice(0, 5).map(habit => {
                  const s = getHabitStatus(habit)
                  return (
                    <div key={habit.id} className={`habit-card ${s.type}`}>
                      <div className="habit-icon">{habit.emoji || '📌'}</div>
                      <div className="habit-info">
                        <div className="habit-name">{habit.name}</div>
                        <div className="habit-sub">
                          {habit.interval_days === 0 ? '一回限り' : habit.interval_days === 1 ? '毎日' : `${habit.interval_days}日ごと`}
                          {habit.weekday != null ? ` · ${'日月火水木金土'[habit.weekday]}曜日` : ''}
                          {habit.category ? ` · ${habit.category}` : ''}
                        </div>
                      </div>
                      <StatusBadge habit={habit} />
                      <button className="complete-btn" onClick={() => complete(habit.id)}>完了！</button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Urgent Stock */}
          {urgentItems.length > 0 && (
            <div className="today-section">
              <div className="today-section-label">
                📦 <span>在庫切れ（要購入）</span>
                <Link href="/stock" style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--color-primary)', fontWeight: 700, textDecoration: 'none' }}>すべて見る</Link>
              </div>
              <div className="list-card-group">
                {urgentItems.slice(0, 3).map(item => (
                  <div key={item.id} className="list-card" style={{ borderLeft: '4px solid var(--color-danger)' }}>
                    <div className="item-icon">{item.emoji || '📦'}</div>
                    <div className="item-info">
                      <div className="item-name">{item.name}</div>
                      {item.category && <div className="item-sub">{item.category}</div>}
                    </div>
                    <span className="badge badge-overdue">在庫なし</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pinned Notes */}
          {pinnedNotes.length > 0 && (
            <div className="today-section">
              <div className="today-section-label">
                📌 <span>ピン留めノート</span>
                <Link href="/notes" style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--color-primary)', fontWeight: 700, textDecoration: 'none' }}>すべて見る</Link>
              </div>
              <div className="notes-grid" style={{ padding: 0 }}>
                {pinnedNotes.map(note => (
                  <NoteCard key={note.id} note={note} onClick={() => setEditNote(note)} onDismiss={() => archiveNote(note.id)} />
                ))}
              </div>
            </div>
          )}

          {dueHabits.length === 0 && prepHabits.length === 0 && urgentItems.length === 0 && pinnedNotes.length === 0 && (
            <div className="empty">
              <div className="empty-icon">✨</div>
              <div className="empty-text">今日はすべて OK！</div>
              <div className="empty-sub">ルーティンも在庫もすべて管理されています</div>
            </div>
          )}
        </>
      )}

      {(showAdd || editNote) && (
        <NoteModal
          note={currentEditNote}
          onSave={saveNote}
          onClose={() => { setShowAdd(false); setEditNote(null) }}
        />
      )}
      <Toast msg={msg} />
    </AppShell>
  )
}
