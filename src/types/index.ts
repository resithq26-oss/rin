export type NoteColor = 'default' | 'red' | 'orange' | 'yellow' | 'green' | 'teal' | 'blue' | 'purple' | 'pink'
export type NoteType = 'text' | 'checklist'
export type HabitStatus = 'done' | 'due' | 'upcoming' | 'overdue'

export interface ChecklistItem {
  id: string
  text: string
  note?: string
  checked: boolean
}

export interface Note {
  id: string
  title: string
  content: string
  items: ChecklistItem[]
  color: NoteColor
  pinned: boolean
  type: NoteType
  category: string
  created_at: string
  updated_at: string
}

export interface Habit {
  id: string
  name: string
  emoji: string
  category: string
  interval_days: number
  last_done: string | null
}

export interface HabitStatusInfo {
  type: HabitStatus
  daysLeft?: number
  daysOver?: number | null
}

export interface Pickup {
  id: string
  name: string
  category: string
  emoji: string
  status: '未完了' | '完了'
  url: string
  image_url: string
  added_at: string
}

export interface InventoryItem {
  id: string
  name: string
  category: string
  emoji: string
  stock: number
  unit: string
  memo: string
  urgent: boolean
  url: string
  image_url: string
  avg_days: number
  cycle_count: number
}
