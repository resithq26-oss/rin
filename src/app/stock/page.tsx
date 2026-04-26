'use client'

import { useState, useCallback } from 'react'
import AppShell from '@/components/layout/AppShell'
import StockModal from '@/components/stock/StockModal'
import StockDetailModal from '@/components/stock/StockDetailModal'
import { CompanionBubble, MSG } from '@/components/ui/CompanionBubble'
import { Toast, useToast } from '@/components/ui/Toast'
import { supabase } from '@/lib/supabase'
import { uid } from '@/lib/utils'
import { useInventory, usePickups } from '@/hooks/useInventory'
import type { InventoryItem } from '@/types'

function groupBy<T>(arr: T[], key: keyof T): Record<string, T[]> {
  return arr.reduce((acc, item) => {
    const k = String(item[key] || '未分類')
    if (!acc[k]) acc[k] = []
    acc[k].push(item)
    return acc
  }, {} as Record<string, T[]>)
}

export default function StockPage() {
  const { inventory, setInventory, loading: iLoading } = useInventory()
  const { pickups, setPickups, loading: pLoading }     = usePickups()
  const [viewItem,  setViewItem]  = useState<InventoryItem | null>(null)
  const [editItem,  setEditItem]  = useState<InventoryItem | null>(null)
  const [showAdd,   setShowAdd]   = useState(false)
  const [catFilter, setCatFilter] = useState('すべて')
  const { msg, show: showToast } = useToast()
  const [companion, setCompanion] = useState(MSG.default)

  const loading = iLoading || pLoading
  const cats = ['すべて', ...Array.from(new Set(inventory.map(i => i.category || '未分類').filter(Boolean)))]

  const toggleStock = useCallback(async (id: string) => {
    const item = inventory.find(x => x.id === id)
    if (!item) return
    const stock = item.stock > 0 ? 0 : 1
    await supabase.from('inventory').update({ stock }).eq('id', id)
    setInventory(inv => inv.map(x => x.id === id ? { ...x, stock } : x))
    if (viewItem?.id === id) setViewItem(v => v ? { ...v, stock } : v)
  }, [inventory, setInventory, viewItem])

  const addToShopping = useCallback(async (item: InventoryItem) => {
    const existing = pickups.find(p => p.name.trim() === item.name.trim())
    if (existing) {
      if (existing.status === '未完了') { showToast('すでに買い物リストにあります'); return }
      await supabase.from('pickups').update({ status: '未完了' }).eq('id', existing.id)
      setPickups(ps => ps.map(x => x.id === existing.id ? { ...x, status: '未完了' } : x))
    } else {
      const id = uid()
      const row = { id, status: '未完了' as const, added_at: new Date().toISOString(), name: item.name, category: item.category, emoji: item.emoji, url: '', image_url: '' }
      await supabase.from('pickups').insert([row])
      setPickups(ps => [...ps, row])
    }
    showToast('🛒 買い物リストに追加しました')
  }, [pickups, setPickups, showToast])

  const save = useCallback(async (fields: Omit<InventoryItem, 'id' | 'avg_days' | 'cycle_count'>) => {
    if (editItem) {
      await supabase.from('inventory').update(fields).eq('id', editItem.id)
      setInventory(inv => inv.map(x => x.id === editItem.id ? { ...x, ...fields } : x))
      setEditItem(null)
      setCompanion(MSG.stockUpdated)
      showToast('更新しました')
    } else {
      const id = uid()
      const row: InventoryItem = { id, avg_days: 0, cycle_count: 0, ...fields }
      await supabase.from('inventory').insert([row])
      setInventory(inv => [...inv, row])
      setShowAdd(false)
      setCompanion(MSG.stockAdded)
      showToast('追加しました')
    }
  }, [editItem, setInventory, showToast])

  const remove = useCallback(async (id: string) => {
    await supabase.from('inventory').delete().eq('id', id)
    setInventory(inv => inv.filter(x => x.id !== id))
    setViewItem(null)
    setEditItem(null)
    showToast('削除しました')
  }, [setInventory, showToast])

  const allGroups = groupBy(
    catFilter === 'すべて' ? inventory : inventory.filter(i => (i.category || '未分類') === catFilter),
    'category'
  )

  const action = <button className="hdr-add-btn" onClick={() => setShowAdd(true)}>＋ 追加</button>

  return (
    <AppShell title="📦 ストック" action={action}>
      <CompanionBubble message={companion} />
      {loading ? (
        <div className="empty"><div className="spinner" /><p>読み込み中…</p></div>
      ) : (
        <>
          <div className="cat-chips">
            {cats.map(c => (
              <button key={c} className={`cat-chip ${catFilter === c ? 'active' : ''}`}
                onClick={() => setCatFilter(c)}>{c}</button>
            ))}
          </div>
          {inventory.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">📦</div>
              <div className="empty-text">在庫データがありません</div>
            </div>
          ) : (
            Object.entries(allGroups).map(([cat, items]) => (
              <div key={cat} style={{ margin: '12px 14px 0' }}>
                <div className="section-label">{cat || '未分類'}</div>
                <div className="list-card-group">
                  {items.map(item => {
                    const noStock = item.stock === 0
                    return (
                      <div key={item.id}
                        className="list-card"
                        style={{ borderLeft: `4px solid ${noStock ? 'var(--color-danger)' : 'var(--color-success)'}` }}
                        onClick={() => setViewItem(item)}
                      >
                        {item.image_url
                          ? <img src={item.image_url} alt="" className="item-thumb" onError={e => (e.target as HTMLImageElement).style.display = 'none'} />
                          : <div className="item-icon">{item.emoji || '📦'}</div>}
                        <div className="item-info">
                          <div className="item-name">{item.name}</div>
                          {item.memo && <div className="item-sub">{item.memo}</div>}
                        </div>
                        <button
                          className={`stock-badge ${noStock ? 'stock-out' : 'stock-in'}`}
                          onClick={e => { e.stopPropagation(); toggleStock(item.id) }}
                        >
                          {noStock ? '在庫なし' : 'あり ✓'}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </>
      )}

      {viewItem && (
        <StockDetailModal
          item={inventory.find(x => x.id === viewItem.id) ?? viewItem}
          onClose={() => setViewItem(null)}
          onEdit={() => { setEditItem(viewItem); setViewItem(null) }}
          onDelete={() => remove(viewItem.id)}
          onToggle={() => toggleStock(viewItem.id)}
          onAddToShopping={() => addToShopping(viewItem)}
        />
      )}
      {(showAdd || editItem) && (
        <StockModal
          item={editItem}
          catList={Array.from(new Set(inventory.map(i => i.category).filter(Boolean)))}
          onSave={save}
          onDelete={editItem ? () => remove(editItem.id) : undefined}
          onClose={() => { setShowAdd(false); setEditItem(null) }}
        />
      )}
      <Toast msg={msg} />
    </AppShell>
  )
}
