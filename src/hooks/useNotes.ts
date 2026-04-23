'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Note } from '@/types'

export function useNotes() {
  const [notes,   setNotes]   = useState<Note[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('notes')
      .select('*')
      .order('pinned', { ascending: false })
      .order('updated_at', { ascending: false })
    setNotes((data as Note[]) || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetch()
    const ch = supabase.channel('notes-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notes' }, fetch)
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [fetch])

  return { notes, setNotes, loading, refetch: fetch }
}
