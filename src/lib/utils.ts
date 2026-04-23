import type { Habit, HabitStatusInfo, NoteColor } from '@/types'

export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

export function loadLS<T>(key: string, def: T): T {
  if (typeof window === 'undefined') return def
  try { return JSON.parse(localStorage.getItem(key) ?? 'null') ?? def } catch { return def }
}

export function saveLS(key: string, val: unknown): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(val))
}

export function getHabitStatus(habit: Habit): HabitStatusInfo {
  if (habit.interval_days === 0) {
    return habit.last_done ? { type: 'done' } : { type: 'due' }
  }
  if (!habit.last_done) return { type: 'overdue', daysOver: null }
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const last = new Date(habit.last_done); last.setHours(0, 0, 0, 0)
  const since = Math.round((today.getTime() - last.getTime()) / 86400000)
  if (since === 0) return { type: 'done' }
  const left = habit.interval_days - since
  if (left > 0) return { type: 'upcoming', daysLeft: left }
  if (left === 0) return { type: 'due' }
  return { type: 'overdue', daysOver: Math.abs(left) }
}

export function sortHabits(habits: Habit[]): Habit[] {
  const order: Record<string, number> = { overdue: 0, due: 1, upcoming: 2, done: 3 }
  return [...habits].sort((a, b) => {
    const sa = getHabitStatus(a), sb = getHabitStatus(b)
    if (order[sa.type] !== order[sb.type]) return order[sa.type] - order[sb.type]
    if (sa.type === 'overdue') return (sb.daysOver || 999) - (sa.daysOver || 999)
    if (sa.type === 'upcoming') return (sa.daysLeft ?? 0) - (sb.daysLeft ?? 0)
    return 0
  })
}

export const NOTE_COLORS: Record<NoteColor, { bg: string; border: string }> = {
  default: { bg: 'bg-surface',          border: 'border-border' },
  red:     { bg: 'bg-red-50/80',        border: 'border-red-200' },
  orange:  { bg: 'bg-orange-50/80',     border: 'border-orange-200' },
  yellow:  { bg: 'bg-yellow-50/80',     border: 'border-yellow-200' },
  green:   { bg: 'bg-green-50/80',      border: 'border-green-200' },
  teal:    { bg: 'bg-teal-50/80',       border: 'border-teal-200' },
  blue:    { bg: 'bg-blue-50/80',       border: 'border-blue-200' },
  purple:  { bg: 'bg-purple-50/80',     border: 'border-purple-200' },
  pink:    { bg: 'bg-pink-50/80',       border: 'border-pink-200' },
}

export const NOTE_COLOR_SWATCHES: { color: NoteColor; swatch: string }[] = [
  { color: 'default', swatch: 'bg-gray-200' },
  { color: 'red',     swatch: 'bg-red-300' },
  { color: 'orange',  swatch: 'bg-orange-300' },
  { color: 'yellow',  swatch: 'bg-yellow-300' },
  { color: 'green',   swatch: 'bg-green-300' },
  { color: 'teal',    swatch: 'bg-teal-300' },
  { color: 'blue',    swatch: 'bg-blue-300' },
  { color: 'purple',  swatch: 'bg-purple-300' },
  { color: 'pink',    swatch: 'bg-pink-300' },
]
