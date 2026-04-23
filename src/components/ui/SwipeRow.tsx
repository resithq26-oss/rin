'use client'

import { useState, useRef, useEffect } from 'react'

interface SwipeRowProps {
  onEdit: () => void
  onDelete: () => void
  children: React.ReactNode
}

export default function SwipeRow({ onEdit, onDelete, children }: SwipeRowProps) {
  const [offsetX, setOffsetX] = useState(0)
  const [snapped, setSnapped] = useState<'edit' | 'delete' | null>(null)
  const t = useRef({ x0: 0, y0: 0, active: false, locked: false })
  const SNAP = 80, THRESHOLD = 44

  function onTouchStart(e: React.TouchEvent) {
    const { clientX, clientY } = e.touches[0]
    t.current = { x0: clientX, y0: clientY, active: true, locked: false }
    if (snapped) { setSnapped(null); setOffsetX(0) }
  }
  function onTouchMove(e: React.TouchEvent) {
    if (!t.current.active) return
    const dx = e.touches[0].clientX - t.current.x0
    const dy = e.touches[0].clientY - t.current.y0
    if (!t.current.locked) {
      if (Math.abs(dy) > Math.abs(dx) + 4) { t.current.active = false; return }
      if (Math.abs(dx) > 8) t.current.locked = true
    }
    if (t.current.locked) setOffsetX(Math.max(-SNAP, Math.min(SNAP, dx)))
  }
  function onTouchEnd() {
    if (!t.current.locked) { t.current.active = false; return }
    t.current.active = false
    if (offsetX < -THRESHOLD) setSnapped('delete')
    else if (offsetX > THRESHOLD) setSnapped('edit')
    else setSnapped(null)
    setOffsetX(0)
  }

  useEffect(() => {
    if (!snapped) return
    const timer = setTimeout(() => setSnapped(null), 3000)
    return () => clearTimeout(timer)
  }, [snapped])

  const tx = snapped === 'delete' ? -SNAP : snapped === 'edit' ? SNAP : offsetX
  const easing = !t.current.active ? 'transform .2s ease' : 'none'

  return (
    <div className="swipe-row" onClick={snapped ? e => { e.stopPropagation(); setSnapped(null) } : undefined}>
      <button className="swipe-btn swipe-edit" onClick={e => { e.stopPropagation(); setSnapped(null); onEdit() }}>✏️<br />編集</button>
      <button className="swipe-btn swipe-delete" onClick={e => { e.stopPropagation(); setSnapped(null); onDelete() }}>🗑️<br />削除</button>
      <div className="swipe-content" style={{ transform: `translateX(${tx}px)`, transition: easing }}
        onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
        {children}
      </div>
    </div>
  )
}
