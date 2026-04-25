'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHouse, faStickyNote, faRotate, faCartShopping, faBox, faGear } from '@fortawesome/free-solid-svg-icons'
import { supabase } from '@/lib/supabase'
import { getHabitStatus } from '@/lib/utils'
import type { Habit } from '@/types'

const NAV_ITEMS = [
  { href: '/',         icon: faHouse,        label: 'ホーム' },
  { href: '/notes',    icon: faStickyNote,   label: 'ノート' },
  { href: '/routines', icon: faRotate,       label: 'ルーティン' },
  { href: '/shopping', icon: faCartShopping, label: '買い物' },
  { href: '/stock',    icon: faBox,          label: 'ストック' },
  { href: '/settings', icon: faGear,         label: '設定' },
]

interface AppShellProps {
  children: React.ReactNode
  title: string
  action?: React.ReactNode
}

export default function AppShell({ children, title, action }: AppShellProps) {
  const pathname = usePathname()
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

  const navItems = NAV_ITEMS.map(item => ({
    ...item,
    active: pathname === item.href,
    count:  badges[item.href],
  }))

  return (
    <div className="app-shell">
      {/* PC サイドバー */}
      <aside className="sidebar">
        <div className="sidebar-logo">Rin ✦</div>
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <Link key={item.href} href={item.href} className={`sidebar-nav-item ${item.active ? 'active' : ''}`}>
              <span className="nav-icon-wrap">
                <FontAwesomeIcon icon={item.icon} style={{ fontSize: 17 }} />
                {item.count != null && item.count > 0 && (
                  <span className="nav-badge">{item.count}</span>
                )}
              </span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* メインコンテンツ */}
      <div className="shell-main">
        <header className="hdr">
          <span className="hdr-title">{title}</span>
          {action}
        </header>

        <main className="main-scroll">
          {children}
        </main>
      </div>

      {/* モバイル フローティングナビ */}
      <nav className="bottom-nav">
        {navItems.map(item => (
          <Link key={item.href} href={item.href} className={`nav-item ${item.active ? 'active' : ''}`}>
            <span className="nav-icon-wrap">
              <FontAwesomeIcon icon={item.icon} style={{ fontSize: 18 }} />
              {item.count != null && item.count > 0 && (
                <span className="nav-badge">{item.count}</span>
              )}
            </span>
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  )
}
