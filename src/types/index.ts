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
  archived?: boolean
}

export interface Habit {
  id: string
  name: string
  emoji: string
  category: string
  interval_days: number
  last_done: string | null
  prep_days?: number
  prep_note?: string
  weekday?: number | null     // 0=日 1=月 … 6=土
  target_date?: string | null // 次の具体的な予定日 (YYYY-MM-DD)
  booked?: boolean            // 予約済みかどうか
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
  delegate?: boolean
}

export interface PortalLink {
  id: string
  title: string
  url: string
  emoji: string
  category: string
  position: number
}

export type StayType = 'home' | 'hotel' | 'other'
export type TripStatus = 'planning' | 'done'
export type PackSection = 'carry' | 'suitcase' | null

export interface Trip {
  id: string
  name: string
  destination: string
  start_date: string
  end_date: string
  stay_type: StayType
  nights: number
  memo: string
  status: TripStatus
  created_at: string
}

export interface TripItem {
  id: string
  trip_id: string
  category: 'packing' | 'todo'
  text: string
  checked: boolean
  qty_per_night: number | null
  section: PackSection
  position: number
}

export interface DisasterMember {
  id: string
  name: string
  emoji: string
  location: string
  created_at: string
}

export interface DisasterBagItem {
  id: string
  member_id: string
  text: string
  checked: boolean
  position: number
}

export interface DisasterContact {
  id: string
  name: string
  phone: string
  relation: string
  position: number
}

export interface DisasterInfo {
  id: string
  meeting_point_1: string
  meeting_point_2: string
  shelter: string
  notes: string
  updated_at: string
}

export interface WardrobeItem {
  id: string
  name: string
  category: string
  photo_url: string | null
  color: string
  wear_count: number
  last_worn: string | null
  created_at: string
}

export interface Aquarium {
  id: string
  name: string
  size: string
  emoji: string
  memo: string
  last_fed: string | null
  last_water_change: string | null
  sort_order: number
  created_at: string
}

export interface AquariumInhabitant {
  id: string
  aquarium_id: string
  name: string
  species: string
  emoji: string
  count: number
  memo: string
  added_date: string
  created_at: string
}

export interface AquariumLayoutItem {
  id: string
  aquarium_id: string
  name: string
  type: string
  emoji: string
  memo: string
  added_date: string
  created_at: string
}

export interface AquariumPurchase {
  id: string
  aquarium_id: string
  name: string
  category: string
  price: number
  quantity: number
  bought_at: string
  created_at: string
}

export interface AquariumHistory {
  id: string
  aquarium_id: string
  event_type: string
  title: string
  note: string
  emoji: string
  event_date: string
  created_at: string
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
