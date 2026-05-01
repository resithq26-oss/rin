'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { getHabitStatus, sortHabits } from '@/lib/utils'
import type { Habit, InventoryItem, Note } from '@/types'

export default function RightPanel() {
  const [habits,    setHabits]    = useState<Habit[]>([])
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [notes,     setNotes]     = useState<Note[]>([])

  const fetchAll = useCallback(async () => {
    const [h, i, n] = await Promise.all([
      supabase.from('habits').select('*'),
      supabase.from('inventory').select('*').eq('stock', 0).eq('urgent', true),
      supabase.from('notes').select('*').eq('pinned', true).order('updated_at', { ascending: false }).limit(3),
    ])
    setHabits(sortHabits((h.data as Habit[]) || []))
    setInventory((i.data as InventoryItem[]) || [])
    setNotes((n.data as Note[]) || [])
  }, [])

  useEffect(() => {
    fetchAll()
    const ch = supabase.channel('rp-summary')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'habits' },    fetchAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory' }, fetchAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notes' },     fetchAll)
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [fetchAll])

  const prepHabits = habits.filter(h => {
    if (!h.prep_days || h.prep_days <= 0) return false
    const s = getHabitStatus(h)
    return s.type === 'upcoming' && s.daysLeft !== undefined && s.daysLeft <= h.prep_days
  })
  const dueHabits = habits.filter(h => ['due', 'overdue'].includes(getHabitStatus(h).type))
  const allEmpty  = prepHabits.length === 0 && dueHabits.length === 0 && inventory.length === 0 && notes.length === 0

  return (
    <aside className="right-panel">
      <div className="rp-heading">今日のまとめ</div>

      {allEmpty ? (
        <div className="rp-empty">
          <span className="rp-empty-icon">✨</span>
          <span className="rp-empty-text">今日はすべて OK！</span>
        </div>
      ) : (
        <>
          {prepHabits.length > 0 && (
            <section className="rp-section">
              <div className="rp-label">
                🔔 準備しよう
                <Link href="/routines" className="rp-more">→</Link>
              </div>
              {prepHabits.map(h => {
                const s = getHabitStatus(h)
                return (
                  <div key={h.id} className="rp-card rp-card-prep">
                    <span className="rp-emoji">{h.emoji || '📌'}</span>
                    <div className="rp-info">
                      <span className="rp-name">{h.name}</span>
                      <span className="rp-sub">あと{s.daysLeft}日{h.prep_note ? ` · ${h.prep_note}` : ''}</span>
                    </div>
                  </div>
                )
              })}
            </section>
          )}

          {dueHabits.length > 0 && (
            <section className="rp-section">
              <div className="rp-label">
                🔄 やること
                <Link href="/routines" className="rp-more">→</Link>
              </div>
              {dueHabits.slice(0, 6).map(h => {
                const s = getHabitStatus(h)
                return (
                  <div key={h.id} className={`rp-card rp-card-${s.type}`}>
                    <span className="rp-emoji">{h.emoji || '📌'}</span>
                    <div className="rp-info">
                      <span className="rp-name">{h.name}</span>
                      <span className="rp-sub">
                        {s.type === 'overdue' ? `${s.daysOver ?? 0}日遅れ` : '今日'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </section>
          )}

          {inventory.length > 0 && (
            <section className="rp-section">
              <div className="rp-label">
                📦 在庫切れ
                <Link href="/stock" className="rp-more">→</Link>
              </div>
              {inventory.slice(0, 4).map(item => (
                <div key={item.id} className="rp-card rp-card-overdue">
                  <span className="rp-emoji">{item.emoji || '📦'}</span>
                  <div className="rp-info">
                    <span className="rp-name">{item.name}</span>
                    {item.category && <span className="rp-sub">{item.category}</span>}
                  </div>
                </div>
              ))}
            </section>
          )}

          {notes.length > 0 && (
            <section className="rp-section">
              <div className="rp-label">
                📌 ピン留め
                <Link href="/notes" className="rp-more">→</Link>
              </div>
              {notes.map(note => (
                <div key={note.id} className="rp-note">
                  <div className="rp-note-title">{note.title || '無題'}</div>
                  {note.content && (
                    <div className="rp-note-body">
                      {note.content.length > 64 ? `${note.content.slice(0, 64)}…` : note.content}
                    </div>
                  )}
                </div>
              ))}
            </section>
          )}
        </>
      )}
    </aside>
  )
}
