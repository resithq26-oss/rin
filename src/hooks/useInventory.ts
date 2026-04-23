'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { InventoryItem, Pickup } from '@/types'

export function useInventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [loading,   setLoading]   = useState(true)

  const fetch = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('inventory').select('*').order('category').order('name')
    setInventory((data as InventoryItem[]) || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetch()
    const ch = supabase.channel('inventory-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory' }, fetch)
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [fetch])

  return { inventory, setInventory, loading, refetch: fetch }
}

export function usePickups() {
  const [pickups,  setPickups]  = useState<Pickup[]>([])
  const [loading,  setLoading]  = useState(true)

  const fetch = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('pickups').select('*').order('added_at')
    setPickups((data as Pickup[]) || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetch()
    const ch = supabase.channel('pickups-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pickups' }, fetch)
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [fetch])

  return { pickups, setPickups, loading, refetch: fetch }
}
