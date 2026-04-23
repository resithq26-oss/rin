'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faSun, faStickyNote, faRotate, faCartShopping, faBox
} from '@fortawesome/free-solid-svg-icons'

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
  badges?: Partial<Record<string, number>>
}

export default function AppShell({ children, title, action, badges = {} }: AppShellProps) {
  const pathname = usePathname()

  return (
    <div className="app-shell">
      {/* Header */}
      <header className="hdr">
        <span className="hdr-title">{title}</span>
        {action}
      </header>

      {/* Main */}
      <main className="main-scroll">
        {children}
      </main>

      {/* Bottom Nav */}
      <nav className="bottom-nav">
        {NAV_ITEMS.map(item => {
          const active = pathname === item.href
          const count = badges[item.href]
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
