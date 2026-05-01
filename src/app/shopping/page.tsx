'use client'

import { useState, useCallback, useRef } from 'react'
import AppShell from '@/components/layout/AppShell'
import ShoppingModal from '@/components/shopping/ShoppingModal'
import { CompanionBubble, MSG } from '@/components/ui/CompanionBubble'
import { Toast, useToast } from '@/components/ui/Toast'
import { supabase } from '@/lib/supabase'
import { uid } from '@/lib/utils'
import { usePickups, useInventory } from '@/hooks/useInventory'
import type { Pickup } from '@/types'

export default function ShoppingPage() {
  const { pickups, setPickups, loading: pLoading } = usePickups()
  const { inventory, loading: iLoading } = useInventory()
  const [editPickup,   setEditPickup]   = useState<Pickup | null>(null)
  const [openSwipeId,  setOpenSwipeId]  = useState<string | null>(null)
  const [togglingId,   setTogglingId]   = useState<string | null>(null)
  const [quickName,    setQuickName]    = useState('')
  const quickRef    = useRef<HTMLInputElement>(null)
  const touchStartX = useRef(0)
  const { msg, show: showToast } = useToast()
  const [companion, setCompanion] = useState(MSG.default)

  const loading = pLoading || iLoading
  const visible       = pickups.filter(p => p.status === '未完了')
  const myItems       = visible.filter(p => !p.delegate)
  const delegateItems = visible.filter(p => !!p.delegate)
  const catList = Array.from(new Set(pickups.map(p => p.category).filter(Boolean)))

  const toggle = useCallback(async (id: string) => {
    if (togglingId === id) return
    const p = pickups.find(x => x.id === id)
    if (!p) return
    setTogglingId(id)
    const linkedItem = inventory.find(i => i.name === p.name)
    if (linkedItem) {
      await Promise.all([
        supabase.from('pickups').update({ status: '完了' }).eq('id', id),
        supabase.from('inventory').update({ stock: linkedItem.stock + 1 }).eq('id', linkedItem.id),
      ])
      setPickups(ps => ps.map(x => x.id === id ? { ...x, status: '完了' } : x))
      showToast('✓ 購入済み・在庫を更新しました')
    } else {
      await supabase.from('pickups').delete().eq('id', id)
      setPickups(ps => ps.filter(x => x.id !== id))
      showToast('✓ 購入済みにしました')
    }
    setTogglingId(null)
    setCompanion(MSG.itemBought)
  }, [togglingId, pickups, inventory, setPickups, showToast])

  const toggleDelegate = useCallback(async (id: string) => {
    const p = pickups.find(x => x.id === id)
    if (!p) return
    const delegate = !p.delegate
    await supabase.from('pickups').update({ delegate }).eq('id', id)
    setPickups(ps => ps.map(x => x.id === id ? { ...x, delegate } : x))
  }, [pickups, setPickups])

  const quickAdd = useCallback(async () => {
    const name = quickName.trim()
    if (!name) return
    const id = uid()
    const row: Pickup = { id, status: '未完了', added_at: new Date().toISOString(), name, category: '', emoji: '🛒', url: '', image_url: '' }
    await supabase.from('pickups').insert([row])
    setPickups(ps => [...ps, row])
    setQuickName('')
    setCompanion(MSG.itemAdded)
    showToast('追加しました')
    quickRef.current?.focus()
  }, [quickName, setPickups, showToast])

  const save = useCallback(async (fields: Omit<Pickup, 'id' | 'status' | 'added_at'>) => {
    if (editPickup) {
      await supabase.from('pickups').update(fields).eq('id', editPickup.id)
      setPickups(ps => ps.map(x => x.id === editPickup.id ? { ...x, ...fields } : x))
      setEditPickup(null)
      showToast('更新しました')
    }
  }, [editPickup, setPickups, showToast])

  const remove = useCallback(async (id: string) => {
    await supabase.from('pickups').delete().eq('id', id)
    setPickups(ps => ps.filter(x => x.id !== id))
    setEditPickup(null)
    setOpenSwipeId(null)
    showToast('削除しました')
  }, [setPickups, showToast])

  function copyDelegateList() {
    const lines = delegateItems.map(p => `・${p.name}`).join('\n')
    const text = `🛒 買い物お願い！\n\n${lines}`
    navigator.clipboard.writeText(text).then(() => showToast('📋 コピーしました'))
  }

  function onTouchStart(id: string, e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
    if (openSwipeId !== null && openSwipeId !== id) setOpenSwipeId(null)
  }

  function onTouchEnd(id: string, e: React.TouchEvent) {
    const dx = touchStartX.current - e.changedTouches[0].clientX
    if (dx > 55) {
      setOpenSwipeId(id)
    } else if (dx < -20 && openSwipeId === id) {
      setOpenSwipeId(null)
    }
  }

  function renderItem(p: Pickup) {
    const isOpen = openSwipeId === p.id
    return (
      <div
        key={p.id}
        className="shop-swipe-wrap"
        onTouchStart={e => onTouchStart(p.id, e)}
        onTouchEnd={e => onTouchEnd(p.id, e)}
      >
        <div
          className="shop-item"
          style={{ transform: isOpen ? 'translateX(-72px)' : 'translateX(0)' }}
        >
          <div className="shop-item-icon">{p.emoji || '🛒'}</div>
          <div className="shop-item-name" onClick={() => { if (isOpen) setOpenSwipeId(null); else setEditPickup(p) }}>
            {p.name}
          </div>
          <button
            className={`delegate-btn ${p.delegate ? 'on' : ''}`}
            onClick={() => toggleDelegate(p.id)}
            title="人に頼む"
          >🙏</button>
          <button
            className={`check-btn ${togglingId === p.id ? 'done' : ''}`}
            onClick={() => toggle(p.id)}
          >✓</button>
        </div>
        <button className="shop-delete-reveal" onClick={() => remove(p.id)}>
          🗑<br /><span>削除</span>
        </button>
      </div>
    )
  }

  return (
    <AppShell title="🛒 買い物">
      <CompanionBubble message={visible.length === 0 ? MSG.cartEmpty : companion} />

      {/* クイック追加バー */}
      <div className="quick-add-bar">
        <input
          ref={quickRef}
          className="quick-add-input"
          value={quickName}
          onChange={e => setQuickName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && quickAdd()}
          placeholder="商品名を入力してすぐ追加…"
        />
        <button className="quick-add-btn" onClick={quickAdd} disabled={!quickName.trim()}>追加</button>
      </div>

      {loading ? (
        <div className="empty"><div className="spinner" /><p>読み込み中…</p></div>
      ) : visible.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">🛒</div>
          <div className="empty-text">買い物リストは空です</div>
          <div className="empty-sub">上の入力欄からすぐに追加できます</div>
        </div>
      ) : (
        <div style={{ margin: '12px 14px 0' }}>
          {myItems.length > 0 && (
            <div className="shop-list">
              {myItems.map(p => renderItem(p))}
            </div>
          )}
          {delegateItems.length > 0 && (
            <div style={{ marginTop: myItems.length > 0 ? 20 : 0 }}>
              <div className="shop-delegate-hdr">
                <span>🙏 人に頼む</span>
                <button className="copy-btn" onClick={copyDelegateList}>📋 コピー</button>
              </div>
              <div className="shop-list">
                {delegateItems.map(p => renderItem(p))}
              </div>
            </div>
          )}
        </div>
      )}

      {editPickup && (
        <ShoppingModal
          pickup={editPickup}
          catList={catList}
          onSave={save}
          onDelete={() => remove(editPickup.id)}
          onClose={() => setEditPickup(null)}
        />
      )}
      <Toast msg={msg} />
    </AppShell>
  )
}
