'use client'

import { useState } from 'react'
import Link from 'next/link'
import AppShell from '@/components/layout/AppShell'
import NoteCard from '@/components/notes/NoteCard'
import NoteDetailModal from '@/components/notes/NoteDetailModal'
import NoteModal from '@/components/notes/NoteModal'
import { Toast, useToast } from '@/components/ui/Toast'
import { supabase } from '@/lib/supabase'
import { uid, getHabitStatus, sortHabits } from '@/lib/utils'
import { useNotes } from '@/hooks/useNotes'
import { useHabits } from '@/hooks/useHabits'
import { useInventory } from '@/hooks/useInventory'
import type { Note, Habit } from '@/types'

function StatusBadge({ habit }: { habit: Habit }) {
  const s = getHabitStatus(habit)
  if (s.type === 'done')    return <span className="badge badge-done">✓ 完了</span>
  if (s.type === 'due')     return <span className="badge badge-due">今日</span>
  if (s.type === 'overdue') return <span className="badge badge-overdue">{s.daysOver ? `${s.daysOver}日遅れ` : '未実施'}</span>
  return <span className="badge badge-upcoming">あと{s.daysLeft}日</span>
}

export default function TodayPage() {
  const { notes, setNotes, loading: nLoading }   = useNotes()
  const { habits, setHabits, loading: hLoading } = useHabits()
  const { inventory, loading: iLoading }         = useInventory()
  const [viewNote, setViewNote] = useState<Note | null>(null)
  const [editNote, setEditNote] = useState<Note | null>(null)
  const [showAdd,  setShowAdd]  = useState(false)
  const { msg, show: showToast } = useToast()

  const loading = nLoading || hLoading || iLoading
  const dueHabits   = habits.filter(h => ['due', 'overdue'].includes(getHabitStatus(h).type))
  const urgentItems = inventory.filter(i => i.stock === 0 && i.urgent)
  const pinnedNotes = notes.filter(n => n.pinned)

  const currentViewNote = viewNote ? notes.find(n => n.id === viewNote.id) ?? null : null
  const currentEditNote = editNote ? notes.find(n => n.id === editNote.id) ?? editNote : null

  async function complete(id: string) {
    const now = new Date().toISOString()
    await supabase.from('habits').update({ last_done: now }).eq('id', id)
    setHabits(hs => sortHabits(hs.map(h => h.id === id ? { ...h, last_done: now } : h)))
    showToast('✓ 完了しました')
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
    setViewNote(null)
    showToast('削除しました')
  }

  async function toggleNoteItem(noteId: string, itemId: string) {
    const note = notes.find(n => n.id === noteId)
    if (!note) return
    const items = note.items.map(i => i.id === itemId ? { ...i, checked: !i.checked } : i)
    const now = new Date().toISOString()
    await supabase.from('notes').update({ items, updated_at: now }).eq('id', noteId)
    setNotes(ns => ns.map(n => n.id === noteId ? { ...n, items, updated_at: now } : n))
  }

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 5)  return 'おやすみなさい 🌙'
    if (h < 12) return 'おはようございます ☀️'
    if (h < 18) return 'こんにちは 🌤'
    return 'お疲れさまです 🌆'
  }

  const badges = { '/routines': dueHabits.length, '/stock': urgentItems.length }
  const action = <button className="hdr-add-btn" onClick={() => setShowAdd(true)}>＋ メモ</button>

  return (
    <AppShell title="Rin ✦" action={action} badges={badges}>
      {loading ? (
        <div className="empty"><div className="spinner" /></div>
      ) : (
        <>
          <div style={{ padding: '20px 20px 4px', fontSize: 14, color: 'var(--color-sub)' }}>
            {greeting()}
          </div>

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
                  <NoteCard key={note.id} note={note} onClick={() => setViewNote(note)} />
                ))}
              </div>
            </div>
          )}

          {dueHabits.length === 0 && urgentItems.length === 0 && pinnedNotes.length === 0 && (
            <div className="empty">
              <div className="empty-icon">✨</div>
              <div className="empty-text">今日はすべて OK！</div>
              <div className="empty-sub">ルーティンも在庫もすべて管理されています</div>
            </div>
          )}
        </>
      )}

      {currentViewNote && (
        <NoteDetailModal
          note={currentViewNote}
          onEdit={() => { setEditNote(currentViewNote); setViewNote(null) }}
          onDelete={() => removeNote(currentViewNote.id)}
          onClose={() => setViewNote(null)}
          onToggleItem={toggleNoteItem}
        />
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
