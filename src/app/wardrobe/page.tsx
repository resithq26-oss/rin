'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import AppShell from '@/components/layout/AppShell'
import { Toast, useToast } from '@/components/ui/Toast'
import { supabase } from '@/lib/supabase'
import { uid } from '@/lib/utils'
import type { WardrobeItem } from '@/types'

const CATEGORIES = [
  { id: 'tops',    label: 'トップス', emoji: '👕' },
  { id: 'bottoms', label: 'ボトムス', emoji: '👖' },
  { id: 'outer',   label: 'アウター', emoji: '🧥' },
  { id: 'shoes',   label: 'シューズ', emoji: '👟' },
  { id: 'bag',     label: 'バッグ',   emoji: '👜' },
  { id: 'other',   label: 'その他',   emoji: '✨' },
]

async function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const MAX = 900
      const scale = Math.min(1, MAX / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width  = Math.round(img.width  * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      canvas.toBlob(b => resolve(b!), 'image/jpeg', 0.82)
    }
    img.src = url
  })
}

function AddModal({ onSave, onClose }: {
  onSave: (item: WardrobeItem) => void
  onClose: () => void
}) {
  const [name,     setName]     = useState('')
  const [category, setCategory] = useState('tops')
  const [file,     setFile]     = useState<File | null>(null)
  const [preview,  setPreview]  = useState<string | null>(null)
  const [saving,   setSaving]   = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  async function submit() {
    if (!name.trim()) return
    setSaving(true)
    const id  = uid()
    const now = new Date().toISOString()
    let photoUrl: string | null = null

    if (file) {
      const compressed = await compressImage(file)
      const { error } = await supabase.storage
        .from('wardrobe-photos')
        .upload(`${id}.jpg`, compressed, { contentType: 'image/jpeg' })
      if (!error) {
        photoUrl = supabase.storage.from('wardrobe-photos').getPublicUrl(`${id}.jpg`).data.publicUrl
      }
    }

    const row: WardrobeItem = {
      id, name: name.trim(), category, photo_url: photoUrl,
      color: '', wear_count: 0, last_worn: null, created_at: now,
    }
    await supabase.from('wardrobe_items').insert([row])
    onSave(row)
    setSaving(false)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={e => { if (e.target !== e.currentTarget) return; if (window.innerWidth >= 768) return; onClose() }}>
      <div className="modal">
        <div className="modal-body">
          <div className="modal-hdr">
            <span className="modal-title">服を追加</span>
            <button className="modal-close" onClick={onClose}>✕</button>
          </div>

          <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onFile} />
          <div className="wardrobe-photo-upload" onClick={() => inputRef.current?.click()}>
            {preview
              ? <img src={preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 16, imageOrientation: 'from-image' }} />
              : <>
                  <div style={{ fontSize: 44 }}>📷</div>
                  <div style={{ fontSize: 12, color: 'var(--color-sub)', marginTop: 8 }}>タップして撮影・選択</div>
                </>
            }
          </div>

          <div className="fg" style={{ marginTop: 16 }}><label>名前 *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="例：白T、デニム…" autoFocus />
          </div>
          <div className="fg"><label>カテゴリ</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {CATEGORIES.map(c => (
                <button key={c.id} onClick={() => setCategory(c.id)} style={{
                  padding: '6px 12px', borderRadius: 10, border: 'none', cursor: 'pointer',
                  fontWeight: 700, fontSize: 12,
                  background: category === c.id ? 'var(--color-primary)' : 'var(--color-border)',
                  color: category === c.id ? '#fff' : 'var(--color-text)',
                }}>{c.emoji} {c.label}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-primary" onClick={submit} disabled={!name.trim() || saving}>
            {saving ? '保存中…' : '追加する'}
          </button>
        </div>
      </div>
    </div>
  )
}

function DetailModal({ item, onUpdate, onDelete, onClose }: {
  item: WardrobeItem
  onUpdate: (id: string, fields: Partial<WardrobeItem>) => void
  onDelete: (id: string) => void
  onClose: () => void
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const { msg, show: showToast } = useToast()
  const cat = CATEGORIES.find(c => c.id === item.category)

  async function wornToday() {
    const now = new Date().toISOString()
    const newCount = item.wear_count + 1
    await supabase.from('wardrobe_items').update({ wear_count: newCount, last_worn: now }).eq('id', item.id)
    onUpdate(item.id, { wear_count: newCount, last_worn: now })
    showToast('記録したよ！')
  }

  async function deleteItem() {
    await supabase.from('wardrobe_items').delete().eq('id', item.id)
    if (item.photo_url) {
      await supabase.storage.from('wardrobe-photos').remove([`${item.id}.jpg`])
    }
    onDelete(item.id)
    onClose()
  }

  return (
    <>
    <div className="modal-overlay" onClick={e => { if (e.target !== e.currentTarget) return; if (window.innerWidth >= 768) return; onClose() }}>
      <div className="modal" style={{ maxHeight: 'calc(100% - 40px)' }}>
        <div className="modal-body" style={{ padding: 0 }}>
          <div className="modal-hdr" style={{ padding: '12px 16px' }}>
            <span className="modal-title">{item.name}</span>
            <button className="modal-close" onClick={onClose}>✕</button>
          </div>

          {item.photo_url
            ? <img src={item.photo_url} alt={item.name} style={{ width: '100%', maxHeight: 340, objectFit: 'cover', display: 'block', imageOrientation: 'from-image' }} />
            : <div style={{ width: '100%', height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)', fontSize: 72 }}>
                {cat?.emoji ?? '👕'}
              </div>
          }

          <div style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              {cat && <span className="wardrobe-cat-tag">{cat.emoji} {cat.label}</span>}
              <span style={{ fontSize: 13, color: 'var(--color-sub)', marginLeft: 'auto' }}>
                {item.wear_count > 0 ? `${item.wear_count}回着用` : 'まだ未着用'}
                {item.last_worn ? `・最終: ${item.last_worn.slice(0, 10)}` : ''}
              </span>
            </div>
            <button className="btn-primary" style={{ width: '100%' }} onClick={wornToday}>
              👗 今日着た！
            </button>
          </div>
        </div>

        <div className="modal-footer" style={{ gap: 8 }}>
          {showDeleteConfirm ? (
            <>
              <button className="btn-danger" style={{ flex: 1 }} onClick={deleteItem}>本当に削除する</button>
              <button className="btn-shopping" style={{ flex: 'none', padding: '0 20px' }} onClick={() => setShowDeleteConfirm(false)}>キャンセル</button>
            </>
          ) : (
            <button className="btn-danger" onClick={() => setShowDeleteConfirm(true)}>削除</button>
          )}
        </div>
        <Toast msg={msg} />
      </div>
    </div>
    </>
  )
}

export default function WardrobePage() {
  const [items,     setItems]     = useState<WardrobeItem[]>([])
  const [loading,   setLoading]   = useState(true)
  const [showAdd,   setShowAdd]   = useState(false)
  const [selected,  setSelected]  = useState<WardrobeItem | null>(null)
  const [catFilter, setCatFilter] = useState<string | null>(null)
  const { msg, show: showToast } = useToast()

  useEffect(() => {
    supabase.from('wardrobe_items').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setItems((data as WardrobeItem[]) || []); setLoading(false) })
  }, [])

  const addItem = useCallback((item: WardrobeItem) => {
    setItems(prev => [item, ...prev])
    showToast('追加しました！')
  }, [showToast])

  const updateItem = useCallback((id: string, fields: Partial<WardrobeItem>) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...fields } : i))
    setSelected(prev => prev?.id === id ? { ...prev, ...fields } : prev)
  }, [])

  const deleteItem = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id))
    showToast('削除しました')
  }, [showToast])

  const displayed = catFilter ? items.filter(i => i.category === catFilter) : items

  return (
    <AppShell title="👗 クローゼット" action={<button className="hdr-add-btn" onClick={() => setShowAdd(true)}>＋ 服</button>}>
      {/* カテゴリフィルター */}
      <div className="wardrobe-filter">
        <button className={`wardrobe-filter-btn ${catFilter === null ? 'active' : ''}`} onClick={() => setCatFilter(null)}>すべて</button>
        {CATEGORIES.map(c => (
          <button key={c.id} className={`wardrobe-filter-btn ${catFilter === c.id ? 'active' : ''}`} onClick={() => setCatFilter(c.id)}>
            {c.emoji} {c.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="empty"><div className="spinner" /></div>
      ) : displayed.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">👗</div>
          <div className="empty-text">{catFilter ? 'このカテゴリは空です' : 'クローゼットが空です'}</div>
          <div className="empty-sub">「＋ 服」ボタンで写真を追加してね</div>
        </div>
      ) : (
        <div className="wardrobe-grid">
          {displayed.map(item => {
            const cat = CATEGORIES.find(c => c.id === item.category)
            return (
              <div key={item.id} className="wardrobe-card" onClick={() => setSelected(item)}>
                {item.photo_url
                  ? <img src={item.photo_url} alt={item.name} className="wardrobe-card-photo" />
                  : <div className="wardrobe-card-photo-placeholder">{cat?.emoji ?? '👕'}</div>
                }
                <div className="wardrobe-card-info">
                  <div className="wardrobe-card-name">{item.name}</div>
                  <div className="wardrobe-card-footer">
                    {cat && <span className="wardrobe-cat-tag">{cat.label}</span>}
                    {item.wear_count > 0 && <span className="wardrobe-wear-count">{item.wear_count}回</span>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showAdd && <AddModal onSave={addItem} onClose={() => setShowAdd(false)} />}
      {selected && (
        <DetailModal
          item={selected}
          onUpdate={updateItem}
          onDelete={deleteItem}
          onClose={() => setSelected(null)}
        />
      )}
      <Toast msg={msg} />
    </AppShell>
  )
}
