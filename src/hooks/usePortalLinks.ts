'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { PortalLink } from '@/types'

export function usePortalLinks() {
  const [links, setLinks] = useState<PortalLink[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from('portal_links')
        .select('*')
        .order('position')
      setLinks(data ?? [])
      setLoading(false)
    }
    fetch()

    const ch = supabase.channel('portal-links')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'portal_links' }, fetch)
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [])

  return { links, setLinks, loading }
}
