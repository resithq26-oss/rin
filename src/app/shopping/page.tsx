'use client'

import { useState, useCallback } from 'react'
import AppShell from '@/components/layout/AppShell'
import ShoppingModal from '@/components/shopping/ShoppingModal'
import SwipeRow from '@/components/ui/SwipeRow'
import { CompanionBubble, MSG } from '@/components/ui/CompanionBubble'
import { Toast, useToast } from '@/components/ui/Toast'
import { supabase } from '@/lib/supabase'
import { uid } from '@/lib/utils'
import { usePickups, useInventory } from '@/hooks/useInventory'
import type { Pickup } from '@/types'

function groupBy<T>(arr: T[], key: keyof T): Record<string, T[]> {
  return arr.reduce((acc, item) => {
    const k = String(item[key] || '未分類')
    if (!acc[k]) acc[k] = []
    acc[k].push(item)
    return acc
  }, {} as Record<string, T[]>)
}

export default function ShoppingPage() {
  const { pickups, setPickups, loading: pLoading } = usePickups()
  const { inventory, loading: iLoading } = useInventory()
  const [showAdd,    setShowAdd]    = useState(false)
  const [editPickup, setEditPickup] = useState<Pickup | null>(null)
  const { msg, show: showToast } = useToast()
  const [companion, setCompanion] = useState(MSG.default)

  const loading = pLoading || iLoading
  const visible = pickups.filter(p => p.status === '未完了')

  const toggle = useCallback(async (id: string) => {
    const p = pickups.find(x => x.id === id)
    if (!p) return
    const linked = inventory.some(i => i.name === p.name)
    if (linked) {
      await supabase.from('pickups').update({ status: '完了' }).eq('id', id)
      setPickups(ps => ps.map(x => x.id === id ? { ...x, status: '完了' } : x))
    } else {
      await supabase.from('pickups').delete().eq('id', id)
      setPickups(ps => ps.filter(x => x.id !== id))
    }
    setCompanion(MSG.itemBought)
    showToast('✓ 購入済みにしました')
  }, [pickups, inventory, setPickups, showToast])

  const save = useCallback(async (fields: Omit<Pickup, 'id' | 'status' | 'added_at'>) => {
    if (editPickup) {
      await supabase.from('pickups').update(fields).eq('id', editPickup.id)
      setPickups(ps => ps.map(x => x.id === editPickup.id ? { ...x, ...fields } : x))
      setEditPickup(null)
      showToast('更新しました')
    } else {
      const id = uid()
      const row: Pickup = { id, status: '未完了', added_at: new Date().toISOString(), ...fields }
      await supabase.from('pickups').insert([row])
      setPickups(ps => [...ps, row])
      setShowAdd(false)
      setCompanion(MSG.itemAdded)
      showToast('追加しました')
    }
  }, [editPickup, setPickups, showToast])

  const remove = useCallback(async () => {
    if (!editPickup) return
    await supabase.from('pickups').delete().eq('id', editPickup.id)
    setPickups(ps => ps.filter(x => x.id !== editPickup.id))
    setEditPickup(null)
    showToast('削除しました')
  }, [editPickup, setPickups, showToast])

  const removeDirect = useCallback(async (id: string) => {
    await supabase.from('pickups').delete().eq('id', id)
    setPickups(ps => ps.filter(x => x.id !== id))
    showToast('削除しました')
  }, [setPickups, showToast])

  const groups = groupBy(visible, 'category')
  const action = <button className="hdr-add-btn" onClick={() => setShowAdd(true)}>＋ 追加</button>

  return (
    <AppShell title="🛒 買い物" action={action}>
      <CompanionBubble message={visible.length === 0 ? MSG.cartEmpty : companion} />
      {loading ? (
        <div className="empty"><div className="spinner" /><p>読み込み中…</p></div>
      ) : visible.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">🛒</div>
          <div className="empty-text">買い物リストは空です</div>
          <div className="empty-sub">「追加」ボタンで登録してください</div>
        </div>
      ) : (
        Object.entries(groups).map(([cat, items]) => (
          <div key={cat} style={{ margin: '12px 14px 0' }}>
            <div className="section-label">{cat}</div>
            <div className="list-card-group">
              {items.map(p => (
                <SwipeRow key={p.id}
                  onEdit={() => setEditPickup(p)}
                  onDelete={() => confirm('削除しますか？') && removeDirect(p.id)}>
                  <div className="list-card" onClick={() => setEditPickup(p)}>
                    {p.image_url
                      ? <img src={p.image_url} alt="" className="item-thumb" onError={e => (e.target as HTMLImageElement).style.display = 'none'} />
                      : <div className="item-icon">{p.emoji || '🛒'}</div>}
                    <div className="item-info">
                      <div className="item-name">{p.name}</div>
                      {p.category && <div className="item-sub">{p.category}</div>}
                    </div>
                    <button className="check-btn"
                      onClick={e => { e.stopPropagation(); toggle(p.id) }}>✓</button>
                  </div>
                </SwipeRow>
              ))}
            </div>
          </div>
        ))
      )}

      {(showAdd || editPickup) && (
        <ShoppingModal
          pickup={editPickup}
          onSave={save}
          onDelete={editPickup ? remove : undefined}
          onClose={() => { setShowAdd(false); setEditPickup(null) }}
        />
      )}
      <Toast msg={msg} />
    </AppShell>
  )
}
