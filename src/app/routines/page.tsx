'use client'

import { useState, useCallback } from 'react'
import AppShell from '@/components/layout/AppShell'
import HabitModal from '@/components/routines/HabitModal'
import SwipeRow from '@/components/ui/SwipeRow'
import { CompanionBubble, MSG } from '@/components/ui/CompanionBubble'
import { Toast, useToast } from '@/components/ui/Toast'
import { supabase } from '@/lib/supabase'
import { uid, getHabitStatus, sortHabits, completionDate } from '@/lib/utils'
import { useHabits } from '@/hooks/useHabits'
import type { Habit } from '@/types'

function StatusBadge({ habit }: { habit: Habit }) {
  const s = getHabitStatus(habit)
  if (s.type === 'done')    return <span className="badge badge-done">✓ 完了</span>
  if (s.type === 'due')     return <span className="badge badge-due">今日</span>
  if (s.type === 'overdue') return <span className="badge badge-overdue">{s.daysOver ? `${s.daysOver}日遅れ` : '未実施'}</span>
  return <span className="badge badge-upcoming">あと{s.daysLeft}日</span>
}

export default function RoutinesPage() {
  const { habits, setHabits, loading } = useHabits()
  const [showAdd,   setShowAdd]   = useState(false)
  const [editHabit, setEditHabit] = useState<Habit | null>(null)
  const { msg, show: showToast } = useToast()
  const [companion, setCompanion] = useState(MSG.default)

  const complete = useCallback(async (id: string) => {
    const habit = habits.find(h => h.id === id)
    if (!habit) return
    const now = completionDate(habit)
    const isAppointment = !!habit.target_date
    const update: Record<string, unknown> = { last_done: now }
    if (isAppointment) { update.target_date = null; update.booked = false }
    await supabase.from('habits').update(update).eq('id', id)
    setHabits(hs => {
      const next = sortHabits(hs.map(h => h.id === id
        ? { ...h, last_done: now, ...(isAppointment ? { target_date: null, booked: false } : {}) }
        : h))
      const allDone = next.every(h => getHabitStatus(h).type === 'done')
      setCompanion(allDone ? MSG.allHabitsDone : MSG.habitDone)
      return next
    })
    showToast('✓ 完了しました')
  }, [habits, setHabits, showToast])

  const save = useCallback(async (fields: Omit<Habit, 'id'>) => {
    const { prep_days, prep_note, ...baseFields } = fields
    const { prep_days: _pd, prep_note: _pn, ...safe } = fields as Record<string, unknown>
    const tryInsert = async (payload: Record<string, unknown>) => {
      const { error } = await supabase.from('habits').insert([payload])
      if (error) {
        const { error: e2 } = await supabase.from('habits').insert([safe])
        return e2
      }
      return null
    }
    const tryUpdate = async (payload: Record<string, unknown>, id: string) => {
      const { error } = await supabase.from('habits').update(payload).eq('id', id)
      if (error) {
        const { error: e2 } = await supabase.from('habits').update(safe).eq('id', id)
        return e2
      }
      return null
    }

    if (editHabit) {
      const err = await tryUpdate({ ...baseFields, prep_days, prep_note }, editHabit.id)
      if (err) { showToast('保存に失敗しました'); return }
      setHabits(hs => sortHabits(hs.map(h => h.id === editHabit.id ? { ...h, ...fields } : h)))
      setEditHabit(null)
      showToast('更新しました')
    } else {
      const id = uid()
      const err = await tryInsert({ id, ...baseFields, prep_days, prep_note })
      if (err) { showToast('保存に失敗しました'); return }
      setHabits(hs => sortHabits([...hs, { id, ...fields }]))
      setShowAdd(false)
      setCompanion(MSG.habitAdded)
      showToast('追加しました')
    }
  }, [editHabit, setHabits, showToast])

  const remove = useCallback(async () => {
    if (!editHabit) return
    await supabase.from('habits').delete().eq('id', editHabit.id)
    setHabits(hs => hs.filter(h => h.id !== editHabit.id))
    setEditHabit(null)
    setCompanion(MSG.habitDeleted)
    showToast('削除しました')
  }, [editHabit, setHabits, showToast])

  const removeDirect = useCallback(async (id: string) => {
    await supabase.from('habits').delete().eq('id', id)
    setHabits(hs => hs.filter(h => h.id !== id))
    showToast('削除しました')
  }, [setHabits, showToast])

  const dueCount = habits.filter(h => ['due', 'overdue'].includes(getHabitStatus(h).type)).length

  const action = <button className="hdr-add-btn" onClick={() => setShowAdd(true)}>＋ 追加</button>

  return (
    <AppShell title="🔄 ルーティン" action={action}>
      <CompanionBubble message={companion} />
      {loading ? (
        <div className="empty"><div className="spinner" /><p>読み込み中…</p></div>
      ) : habits.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">🔄</div>
          <div className="empty-text">ルーティンがありません</div>
          <div className="empty-sub">「追加」ボタンで登録してください</div>
        </div>
      ) : (
        <div style={{ margin: '12px 14px 0' }}>
          <div className="list-card-group">
            {habits.map(habit => {
              const s = getHabitStatus(habit)
              const isDone = s.type === 'done'
              return (
                <SwipeRow key={habit.id}
                  onEdit={() => setEditHabit(habit)}
                  onDelete={() => confirm('削除しますか？') && removeDirect(habit.id)}>
                  <div className={`habit-card ${s.type}`} onClick={() => setEditHabit(habit)}>
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
                    {!isDone && (
                      <button className="complete-btn"
                        onClick={e => { e.stopPropagation(); complete(habit.id) }}>
                        完了！
                      </button>
                    )}
                  </div>
                </SwipeRow>
              )
            })}
          </div>
        </div>
      )}

      {(showAdd || editHabit) && (
        <HabitModal
          habit={editHabit}
          onSave={save}
          onDelete={editHabit ? remove : undefined}
          onClose={() => { setShowAdd(false); setEditHabit(null) }}
        />
      )}
      <Toast msg={msg} />
    </AppShell>
  )
}
