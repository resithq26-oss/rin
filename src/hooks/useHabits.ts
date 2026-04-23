'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { sortHabits } from '@/lib/utils'
import type { Habit } from '@/types'

export function useHabits() {
  const [habits,  setHabits]  = useState<Habit[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('habits').select('*').order('name')
    setHabits(sortHabits((data as Habit[]) || []))
    setLoading(false)
  }, [])

  useEffect(() => {
    fetch()
    const ch = supabase.channel('habits-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'habits' }, fetch)
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [fetch])

  return { habits, setHabits, loading, refetch: fetch }
}
