'use client'

import { useState, useEffect } from 'react'
import AppShell from '@/components/layout/AppShell'
import { Toast, useToast } from '@/components/ui/Toast'
import { supabase } from '@/lib/supabase'
import { uid } from '@/lib/utils'
import type { Aquarium, AquariumInhabitant, AquariumLayoutItem, AquariumPurchase, AquariumHistory } from '@/types'

const PURCHASE_CATS = ['機材', '生体', '水草', '石・流木', '消耗品', 'その他']

const HISTORY_TYPES = [
  { id: 'added',     emoji: '➕', label: '追加' },
  { id: 'death',     emoji: '✝️', label: '★' },
  { id: 'layout',    emoji: '🌿', label: 'レイアウト' },
  { id: 'care',      emoji: '💧', label: 'ケア' },
  { id: 'equipment', emoji: '⚙️', label: '設備' },
  { id: 'note',      emoji: '📝', label: 'メモ' },
  { id: 'other',     emoji: '✨', label: 'その他' },
]

const LAYOUT_TYPES = [
  { id: '水草',      emoji: '🌿' },
  { id: '流木',      emoji: '🪵' },
  { id: '石',        emoji: '🪨' },
  { id: 'シェルター', emoji: '🐚' },
  { id: 'オブジェ',   emoji: '🏺' },
  { id: 'その他',     emoji: '✨' },
]

function daysSince(iso: string | null): number | null {
  if (!iso) return null
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
}

function isToday(iso: string | null): boolean {
  if (!iso) return false
  return new Date(iso).toDateString() === new Date().toDateString()
}

function waterChangeColor(days: number | null): string {
  if (days === null) return 'wc-unknown'
  if (days <= 6)  return 'wc-good'
  if (days <= 13) return 'wc-soon'
  return 'wc-urgent'
}

// ───── モーダル: 水槽追加 ─────
function AddTankModal({ onClose, onSave }: { onClose: () => void; onSave: (t: Aquarium) => void }) {
  const [name,  setName]  = useState('')
  const [size,  setSize]  = useState('')
  const [emoji, setEmoji] = useState('🐠')
  const [memo,  setMemo]  = useState('')
  const [saving, setSaving] = useState(false)

  async function submit() {
    if (!name.trim()) return
    setSaving(true)
    const row: Aquarium = {
      id: uid(), name: name.trim(), size: size.trim(), emoji: emoji || '🐠',
      memo: memo.trim(), last_fed: null, last_water_change: null,
      sort_order: 0, created_at: new Date().toISOString(),
    }
    await supabase.from('aquariums').insert([row])
    onSave(row)
    setSaving(false)
  }

  return (
    <div className="aq-overlay" onClick={onClose}>
      <div className="aq-sheet" onClick={e => e.stopPropagation()}>
        <div className="aq-sheet-title">🐠 水槽を追加</div>
        <div className="aq-form-row">
          <input className="aq-emoji-input" value={emoji} onChange={e => setEmoji(e.target.value)} maxLength={2} />
          <input className="aq-text-input" placeholder="水槽の名前（例：60cm水槽）" value={name} onChange={e => setName(e.target.value)} autoFocus />
        </div>
        <input className="aq-text-input" placeholder="サイズ（例：60×30×36）" value={size} onChange={e => setSize(e.target.value)} />
        <input className="aq-text-input" placeholder="メモ（任意）" value={memo} onChange={e => setMemo(e.target.value)} />
        <div className="aq-sheet-actions">
          <button className="aq-btn-cancel" onClick={onClose}>キャンセル</button>
          <button className="aq-btn-save" onClick={submit} disabled={!name.trim() || saving}>追加</button>
        </div>
      </div>
    </div>
  )
}

// ───── モーダル: 生体追加 ─────
function AddFishModal({ aquariumId, onClose, onSave }: { aquariumId: string; onClose: () => void; onSave: (f: AquariumInhabitant) => void }) {
  const [name,    setName]    = useState('')
  const [species, setSpecies] = useState('')
  const [emoji,   setEmoji]   = useState('🐟')
  const [count,   setCount]   = useState(1)
  const [memo,    setMemo]    = useState('')
  const [saving,  setSaving]  = useState(false)

  async function submit() {
    if (!name.trim()) return
    setSaving(true)
    const row: AquariumInhabitant = {
      id: uid(), aquarium_id: aquariumId, name: name.trim(), species: species.trim(),
      emoji: emoji || '🐟', count, memo: memo.trim(),
      added_date: new Date().toISOString().slice(0, 10),
      created_at: new Date().toISOString(),
    }
    await supabase.from('aquarium_inhabitants').insert([row])
    onSave(row)
    setSaving(false)
  }

  return (
    <div className="aq-overlay" onClick={onClose}>
      <div className="aq-sheet" onClick={e => e.stopPropagation()}>
        <div className="aq-sheet-title">生体を追加</div>
        <div className="aq-form-row">
          <input className="aq-emoji-input" value={emoji} onChange={e => setEmoji(e.target.value)} maxLength={2} />
          <input className="aq-text-input" placeholder="名前（例：ネオンテトラ）" value={name} onChange={e => setName(e.target.value)} autoFocus />
        </div>
        <input className="aq-text-input" placeholder="種類・学名（任意）" value={species} onChange={e => setSpecies(e.target.value)} />
        <div className="aq-form-row">
          <span className="aq-form-label">匹数</span>
          <div className="aq-counter">
            <button onClick={() => setCount(c => Math.max(1, c - 1))}>－</button>
            <span>{count}</span>
            <button onClick={() => setCount(c => c + 1)}>＋</button>
          </div>
        </div>
        <input className="aq-text-input" placeholder="メモ（例：元気いっぱい！）" value={memo} onChange={e => setMemo(e.target.value)} />
        <div className="aq-sheet-actions">
          <button className="aq-btn-cancel" onClick={onClose}>キャンセル</button>
          <button className="aq-btn-save" onClick={submit} disabled={!name.trim() || saving}>追加</button>
        </div>
      </div>
    </div>
  )
}

// ───── モーダル: レイアウト追加 ─────
function AddLayoutModal({ aquariumId, onClose, onSave }: { aquariumId: string; onClose: () => void; onSave: (l: AquariumLayoutItem) => void }) {
  const [type,  setType]  = useState('水草')
  const [name,  setName]  = useState('')
  const [emoji, setEmoji] = useState('🌿')
  const [memo,  setMemo]  = useState('')
  const [saving, setSaving] = useState(false)

  function handleType(t: string) {
    setType(t)
    const def = LAYOUT_TYPES.find(l => l.id === t)
    if (def) setEmoji(def.emoji)
  }

  async function submit() {
    if (!name.trim()) return
    setSaving(true)
    const row: AquariumLayoutItem = {
      id: uid(), aquarium_id: aquariumId, name: name.trim(), type,
      emoji: emoji || '🌿', memo: memo.trim(),
      added_date: new Date().toISOString().slice(0, 10),
      created_at: new Date().toISOString(),
    }
    await supabase.from('aquarium_layout').insert([row])
    onSave(row)
    setSaving(false)
  }

  return (
    <div className="aq-overlay" onClick={onClose}>
      <div className="aq-sheet" onClick={e => e.stopPropagation()}>
        <div className="aq-sheet-title">レイアウトを追加</div>
        <div className="aq-type-chips">
          {LAYOUT_TYPES.map(l => (
            <button key={l.id} className={`aq-type-chip${type === l.id ? ' active' : ''}`} onClick={() => handleType(l.id)}>
              {l.emoji} {l.id}
            </button>
          ))}
        </div>
        <div className="aq-form-row">
          <input className="aq-emoji-input" value={emoji} onChange={e => setEmoji(e.target.value)} maxLength={2} />
          <input className="aq-text-input" placeholder="名前（例：アヌビアスナナ）" value={name} onChange={e => setName(e.target.value)} autoFocus />
        </div>
        <input className="aq-text-input" placeholder="メモ（例：左奥に設置）" value={memo} onChange={e => setMemo(e.target.value)} />
        <div className="aq-sheet-actions">
          <button className="aq-btn-cancel" onClick={onClose}>キャンセル</button>
          <button className="aq-btn-save" onClick={submit} disabled={!name.trim() || saving}>追加</button>
        </div>
      </div>
    </div>
  )
}

// ───── モーダル: 購入追加 ─────
function AddPurchaseModal({ aquariumId, onClose, onSave }: { aquariumId: string; onClose: () => void; onSave: (p: AquariumPurchase) => void }) {
  const [name,     setName]     = useState('')
  const [category, setCategory] = useState('機材')
  const [price,    setPrice]    = useState('')
  const [quantity, setQuantity] = useState(1)
  const [boughtAt, setBoughtAt] = useState(new Date().toISOString().slice(0, 10))
  const [saving,   setSaving]   = useState(false)

  async function submit() {
    if (!name.trim()) return
    setSaving(true)
    const row: AquariumPurchase = {
      id: uid(), aquarium_id: aquariumId, name: name.trim(), category,
      price: parseInt(price.replace(/,/g, '')) || 0,
      quantity, bought_at: boughtAt, created_at: new Date().toISOString(),
    }
    await supabase.from('aquarium_purchases').insert([row])
    onSave(row)
    setSaving(false)
  }

  return (
    <div className="aq-overlay" onClick={onClose}>
      <div className="aq-sheet" onClick={e => e.stopPropagation()}>
        <div className="aq-sheet-title">💳 購入を追加</div>
        <div className="aq-type-chips">
          {PURCHASE_CATS.map(c => (
            <button key={c} className={`aq-type-chip${category === c ? ' active' : ''}`} onClick={() => setCategory(c)}>{c}</button>
          ))}
        </div>
        <input className="aq-text-input" placeholder="商品名" value={name} onChange={e => setName(e.target.value)} autoFocus />
        <div className="aq-form-row">
          <input className="aq-text-input" placeholder="価格（円）" value={price} onChange={e => setPrice(e.target.value)} style={{ flex: 2 }} />
          <div className="aq-counter" style={{ flexShrink: 0 }}>
            <button onClick={() => setQuantity(c => Math.max(1, c - 1))}>－</button>
            <span>{quantity}</span>
            <button onClick={() => setQuantity(c => c + 1)}>＋</button>
          </div>
        </div>
        <input className="aq-text-input" type="date" value={boughtAt} onChange={e => setBoughtAt(e.target.value)} />
        <div className="aq-sheet-actions">
          <button className="aq-btn-cancel" onClick={onClose}>キャンセル</button>
          <button className="aq-btn-save" onClick={submit} disabled={!name.trim() || saving}>追加</button>
        </div>
      </div>
    </div>
  )
}

// ───── モーダル: 歴史追加 ─────
function AddHistoryModal({ aquariumId, onClose, onSave }: { aquariumId: string; onClose: () => void; onSave: (h: AquariumHistory) => void }) {
  const [type,      setType]      = useState('note')
  const [emoji,     setEmoji]     = useState('📝')
  const [title,     setTitle]     = useState('')
  const [note,      setNote]      = useState('')
  const [eventDate, setEventDate] = useState(new Date().toISOString().slice(0, 10))
  const [saving,    setSaving]    = useState(false)

  function handleType(t: string) {
    setType(t)
    const def = HISTORY_TYPES.find(h => h.id === t)
    if (def) setEmoji(def.emoji)
  }

  async function submit() {
    if (!title.trim()) return
    setSaving(true)
    const row: AquariumHistory = {
      id: uid(), aquarium_id: aquariumId, event_type: type,
      title: title.trim(), note: note.trim(), emoji: emoji || '📝',
      event_date: eventDate, created_at: new Date().toISOString(),
    }
    await supabase.from('aquarium_history').insert([row])
    onSave(row)
    setSaving(false)
  }

  return (
    <div className="aq-overlay" onClick={onClose}>
      <div className="aq-sheet" onClick={e => e.stopPropagation()}>
        <div className="aq-sheet-title">📜 記録を追加</div>
        <div className="aq-type-chips">
          {HISTORY_TYPES.map(h => (
            <button key={h.id} className={`aq-type-chip${type === h.id ? ' active' : ''}`} onClick={() => handleType(h.id)}>
              {h.emoji} {h.label}
            </button>
          ))}
        </div>
        <div className="aq-form-row">
          <input className="aq-emoji-input" value={emoji} onChange={e => setEmoji(e.target.value)} maxLength={2} />
          <input className="aq-text-input" placeholder="タイトル（例：石巻貝3匹追加）" value={title} onChange={e => setTitle(e.target.value)} autoFocus />
        </div>
        <textarea className="aq-text-input aq-textarea" placeholder="メモ・詳細（任意）" value={note} onChange={e => setNote(e.target.value)} rows={3} />
        <input className="aq-text-input" type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} />
        <div className="aq-sheet-actions">
          <button className="aq-btn-cancel" onClick={onClose}>キャンセル</button>
          <button className="aq-btn-save" onClick={submit} disabled={!title.trim() || saving}>追加</button>
        </div>
      </div>
    </div>
  )
}

// ───── メインページ ─────
export default function AquariumPage() {
  const [tanks,       setTanks]       = useState<Aquarium[]>([])
  const [selectedId,  setSelectedId]  = useState<string | null>(null)
  const [inhabitants, setInhabitants] = useState<AquariumInhabitant[]>([])
  const [layout,      setLayout]      = useState<AquariumLayoutItem[]>([])
  const [purchases,   setPurchases]   = useState<AquariumPurchase[]>([])
  const [purchasesOk, setPurchasesOk] = useState(false)
  const [showPurchases, setShowPurchases] = useState(false)
  const [history,     setHistory]     = useState<AquariumHistory[]>([])
  const [loading,     setLoading]     = useState(true)
  const [modal,       setModal]       = useState<'tank' | 'fish' | 'layout' | 'purchase' | 'history' | null>(null)
  const { msg, show: showToast } = useToast()

  const tank = tanks.find(t => t.id === selectedId) ?? null

  useEffect(() => {
    supabase.from('aquariums').select('*').order('sort_order').then(({ data }) => {
      if (data && data.length > 0) { setTanks(data); setSelectedId(data[0].id) }
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (!selectedId) return
    supabase.from('aquarium_inhabitants').select('*').eq('aquarium_id', selectedId).order('created_at')
      .then(({ data }) => setInhabitants(data ?? []))
    supabase.from('aquarium_layout').select('*').eq('aquarium_id', selectedId).order('type')
      .then(({ data }) => setLayout(data ?? []))
    supabase.from('aquarium_purchases').select('*').eq('aquarium_id', selectedId).order('bought_at')
      .then(({ data, error }) => { if (!error) { setPurchases(data ?? []); setPurchasesOk(true) } })
    supabase.from('aquarium_history').select('*').eq('aquarium_id', selectedId).order('event_date', { ascending: false })
      .then(({ data }) => setHistory(data ?? []))
  }, [selectedId])

  async function handleFeed() {
    if (!tank) return
    const now = new Date().toISOString()
    await supabase.from('aquariums').update({ last_fed: now }).eq('id', tank.id)
    setTanks(ts => ts.map(t => t.id === tank.id ? { ...t, last_fed: now } : t))
    showToast('🐠 えさやり記録したよ！')
  }

  async function handleWaterChange() {
    if (!tank) return
    const now = new Date().toISOString()
    await supabase.from('aquariums').update({ last_water_change: now }).eq('id', tank.id)
    setTanks(ts => ts.map(t => t.id === tank.id ? { ...t, last_water_change: now } : t))
    showToast('💧 水換え記録したよ！')
  }

  async function deleteFish(id: string) {
    await supabase.from('aquarium_inhabitants').delete().eq('id', id)
    setInhabitants(fs => fs.filter(f => f.id !== id))
  }

  async function deleteLayout(id: string) {
    await supabase.from('aquarium_layout').delete().eq('id', id)
    setLayout(ls => ls.filter(l => l.id !== id))
  }

  async function deleteHistory(id: string) {
    await supabase.from('aquarium_history').delete().eq('id', id)
    setHistory(hs => hs.filter(h => h.id !== id))
  }

  const layoutByType = LAYOUT_TYPES.map(t => ({
    ...t,
    items: layout.filter(l => l.type === t.id),
  })).filter(t => t.items.length > 0)

  const fedToday = isToday(tank?.last_fed ?? null)
  const wcDays   = daysSince(tank?.last_water_change ?? null)

  if (loading) return <AppShell title="水槽"><div className="aq-loading">読み込み中…</div></AppShell>

  return (
    <AppShell title="水槽">
      <div className="aq-page">

        {/* 水槽タブ */}
        <div className="aq-tabs-wrap">
          <div className="aq-tabs">
            {tanks.map(t => (
              <button
                key={t.id}
                className={`aq-tab${selectedId === t.id ? ' active' : ''}`}
                onClick={() => setSelectedId(t.id)}
              >
                {t.emoji} {t.name}
              </button>
            ))}
            <button className="aq-tab-add" onClick={() => setModal('tank')}>＋ 水槽追加</button>
          </div>
        </div>

        {tanks.length === 0 ? (
          <div className="aq-empty">
            <div className="aq-empty-icon">🐠</div>
            <div className="aq-empty-text">最初の水槽を追加しよう！</div>
            <button className="aq-btn-primary" onClick={() => setModal('tank')}>水槽を追加</button>
          </div>
        ) : tank ? (
          <>
            {/* タンクメモ */}
            {(tank.size || tank.memo) && (
              <div className="aq-tank-meta">
                {tank.size && <span className="aq-tank-size">📐 {tank.size}</span>}
                {tank.memo && <span className="aq-tank-memo">{tank.memo}</span>}
              </div>
            )}

            {/* お世話カード */}
            <div className="aq-care-grid">
              <div className={`aq-care-card${fedToday ? ' done' : ''}`}>
                <div className="aq-care-icon">🐠</div>
                <div className="aq-care-label">えさやり</div>
                <div className="aq-care-status">
                  {fedToday ? '今日あげた！' : 'まだあげてないよ'}
                </div>
                <button
                  className={`aq-care-btn${fedToday ? ' done' : ''}`}
                  onClick={handleFeed}
                >
                  {fedToday ? '✓ 記録済み' : 'えさをあげる'}
                </button>
              </div>

              <div className={`aq-care-card ${waterChangeColor(wcDays)}`}>
                <div className="aq-care-icon">💧</div>
                <div className="aq-care-label">水換え</div>
                <div className="aq-care-status">
                  {wcDays === null ? '記録なし' : wcDays === 0 ? '今日やった！' : `${wcDays}日前`}
                </div>
                <button className="aq-care-btn" onClick={handleWaterChange}>
                  水換えした！
                </button>
              </div>
            </div>

            {/* 生体セクション */}
            <div className="aq-section">
              <div className="aq-section-hdr">
                <span className="aq-section-title">🐠 生体</span>
                <button className="aq-add-btn" onClick={() => setModal('fish')}>＋ 追加</button>
              </div>
              {inhabitants.length === 0 ? (
                <div className="aq-section-empty">まだ生体が登録されてないよ</div>
              ) : (
                <div className="aq-list">
                  {inhabitants.map(f => (
                    <div key={f.id} className="aq-item">
                      <div className="aq-item-emoji">{f.emoji}</div>
                      <div className="aq-item-info">
                        <div className="aq-item-name">
                          {f.name}
                          {f.count > 1 && <span className="aq-item-count">{f.count}匹</span>}
                        </div>
                        {f.species && <div className="aq-item-sub">{f.species}</div>}
                        {f.memo    && <div className="aq-item-memo">{f.memo}</div>}
                      </div>
                      <button className="aq-delete-btn" onClick={() => deleteFish(f.id)}>🗑️</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* レイアウトセクション */}
            <div className="aq-section">
              <div className="aq-section-hdr">
                <span className="aq-section-title">🌿 レイアウト</span>
                <button className="aq-add-btn" onClick={() => setModal('layout')}>＋ 追加</button>
              </div>
              {layout.length === 0 ? (
                <div className="aq-section-empty">水草・流木・石などを追加しよう</div>
              ) : (
                <div className="aq-list">
                  {layoutByType.map(group => (
                    <div key={group.id}>
                      <div className="aq-layout-type-hdr">{group.emoji} {group.id}</div>
                      {group.items.map(l => (
                        <div key={l.id} className="aq-item">
                          <div className="aq-item-emoji">{l.emoji}</div>
                          <div className="aq-item-info">
                            <div className="aq-item-name">{l.name}</div>
                            {l.memo && <div className="aq-item-memo">{l.memo}</div>}
                          </div>
                          <button className="aq-delete-btn" onClick={() => deleteLayout(l.id)}>🗑️</button>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>

            {/* 購入リストセクション */}
            {purchasesOk && (() => {
              const total = purchases.reduce((s, p) => s + p.price * p.quantity, 0)
              const bycat = PURCHASE_CATS.map(c => ({ cat: c, items: purchases.filter(p => p.category === c) })).filter(g => g.items.length > 0)
              return (
                <div className="aq-section">
                  <div className="aq-section-hdr">
                    <span className="aq-section-title">💳 購入リスト</span>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <button className="aq-add-btn" onClick={() => setModal('purchase')}>＋ 追加</button>
                      <button className="aq-add-btn" onClick={() => setShowPurchases(s => !s)}>{showPurchases ? '▲' : '▼'}</button>
                    </div>
                  </div>
                  <div className="aq-purchase-total">
                    <span className="aq-purchase-total-label">チャームでの総費用</span>
                    <span className="aq-purchase-total-value">¥{total.toLocaleString('ja-JP')}</span>
                    <span className="aq-purchase-total-count">{purchases.length}品</span>
                  </div>
                  {showPurchases && (
                    <div className="aq-list">
                      {bycat.map(group => (
                        <div key={group.cat}>
                          <div className="aq-layout-type-hdr">{group.cat}</div>
                          {group.items.map(p => (
                            <div key={p.id} className="aq-item">
                              <div className="aq-item-info" style={{ flex: 1 }}>
                                <div className="aq-item-name">{p.name}</div>
                                <div className="aq-item-sub">{p.bought_at}{p.quantity > 1 && ` ×${p.quantity}`}</div>
                              </div>
                              <div className="aq-purchase-price">¥{(p.price * p.quantity).toLocaleString('ja-JP')}</div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })()}

      {/* 歴史タイムライン */}
      {tank && (
        <div className="aq-section" style={{ margin: '0 0 16px' }}>
          <div className="aq-section-hdr">
            <span className="aq-section-title">📜 記録</span>
            <button className="aq-add-btn" onClick={() => setModal('history')}>＋ 追加</button>
          </div>
          {history.length === 0 ? (
            <div className="aq-section-empty">水槽の歴史をここに残そう✨</div>
          ) : (
            <div className="aq-history-list">
              {history.map(h => {
                const typeDef = HISTORY_TYPES.find(t => t.id === h.event_type)
                const d = new Date(h.event_date)
                const dateStr = `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`
                return (
                  <div key={h.id} className="aq-history-item">
                    <div className={`aq-history-dot type-${h.event_type}`}>{h.emoji || typeDef?.emoji}</div>
                    <div className="aq-history-body">
                      <div className="aq-history-title">{h.title}</div>
                      {h.note && <div className="aq-history-note">{h.note}</div>}
                      <div className="aq-history-meta">
                        <span className={`aq-history-type-tag type-${h.event_type}`}>{typeDef?.label ?? h.event_type}</span>
                        <span>{dateStr}</span>
                      </div>
                    </div>
                    <button className="aq-delete-btn" onClick={() => deleteHistory(h.id)}>🗑️</button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {modal === 'tank'     && <AddTankModal    onClose={() => setModal(null)} onSave={t => { setTanks(ts => [...ts, t]); setSelectedId(t.id); setModal(null) }} />}
      {modal === 'fish'     && tank && <AddFishModal    aquariumId={tank.id} onClose={() => setModal(null)} onSave={f => { setInhabitants(fs => [...fs, f]); setModal(null) }} />}
      {modal === 'layout'   && tank && <AddLayoutModal   aquariumId={tank.id} onClose={() => setModal(null)} onSave={l => { setLayout(ls => [...ls, l]); setModal(null) }} />}
      {modal === 'purchase' && tank && <AddPurchaseModal aquariumId={tank.id} onClose={() => setModal(null)} onSave={p => { setPurchases(ps => [...ps, p]); setModal(null) }} />}
      {modal === 'history'  && tank && <AddHistoryModal  aquariumId={tank.id} onClose={() => setModal(null)} onSave={h => { setHistory(hs => [h, ...hs]); setModal(null); showToast('📜 記録を追加したよ！') }} />}

      <Toast msg={msg} />
    </AppShell>
  )
}
