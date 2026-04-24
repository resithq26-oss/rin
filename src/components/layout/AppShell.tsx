'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSun, faStickyNote, faRotate, faCartShopping, faBox } from '@fortawesome/free-solid-svg-icons'
import { useTheme } from '@/hooks/useTheme'
import { supabase } from '@/lib/supabase'
import { getHabitStatus } from '@/lib/utils'
import type { Habit } from '@/types'

const NAV_ITEMS = [
  { href: '/',          icon: faSun,           label: 'ホーム' },
  { href: '/notes',     icon: faStickyNote,    label: 'ノート' },
  { href: '/routines',  icon: faRotate,        label: 'ルーティン' },
  { href: '/shopping',  icon: faCartShopping,  label: '買い物' },
  { href: '/stock',     icon: faBox,           label: 'ストック' },
]

interface AppShellProps {
  children: React.ReactNode
  title: string
  action?: React.ReactNode
}

export default function AppShell({ children, title, action }: AppShellProps) {
  const pathname = usePathname()
  const { theme, toggle } = useTheme()
  const [badges, setBadges] = useState<Record<string, number>>({})

  useEffect(() => {
    async function fetchBadges() {
      const [habitsRes, pickupsRes, stockRes] = await Promise.all([
        supabase.from('habits').select('interval_days, last_done'),
        supabase.from('pickups').select('id', { count: 'exact', head: true }).eq('status', '未完了'),
        supabase.from('inventory').select('id', { count: 'exact', head: true }).eq('stock', 0).eq('urgent', true),
      ])
      const dueCount = ((habitsRes.data ?? []) as Pick<Habit, 'interval_days' | 'last_done'>[])
        .filter(h => ['due', 'overdue'].includes(getHabitStatus(h as Habit).type)).length

      setBadges({
        '/routines': dueCount,
        '/shopping': pickupsRes.count ?? 0,
        '/stock':    stockRes.count    ?? 0,
      })
    }

    fetchBadges()
    const ch = supabase.channel('appshell-badges')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'habits' },    fetchBadges)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pickups' },   fetchBadges)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory' }, fetchBadges)
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [])

  return (
    <div className="app-shell">
      <header className="hdr">
        <span className="hdr-title">{title}</span>
        <button className="theme-toggle-btn" onClick={toggle}>
          {theme === 'rin' ? '🌙' : theme === 'night' ? '💻' : '☀️'}
        </button>
        {action}
      </header>

      <main className="main-scroll">
        {children}
      </main>

      <nav className="bottom-nav">
        {NAV_ITEMS.map(item => {
          const active = pathname === item.href
          const count  = badges[item.href]
          return (
            <Link key={item.href} href={item.href} className={`nav-item ${active ? 'active' : ''}`}>
              <span className="nav-icon-wrap">
                <FontAwesomeIcon icon={item.icon} style={{ fontSize: 20 }} />
                {count != null && count > 0 && (
                  <span className="nav-badge">{count}</span>
                )}
              </span>
              {item.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
