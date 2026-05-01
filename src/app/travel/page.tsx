'use client'

import { useState, useCallback, useEffect, Fragment } from 'react'
import AppShell from '@/components/layout/AppShell'
import { Toast, useToast } from '@/components/ui/Toast'
import { supabase } from '@/lib/supabase'
import { uid } from '@/lib/utils'
import type { Trip, TripItem, StayType, PackSection } from '@/types'

const STAY_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
  home:  { label: '自宅泊', emoji: '🏠', color: 'var(--color-info)' },
  hotel: { label: 'ホテル', emoji: '🏨', color: 'var(--color-primary)' },
  other: { label: 'その他', emoji: '⛺', color: 'var(--color-success)' },
}

function TripAddModal({ trips, onSave, onClose }: {
  trips: Trip[]
  onSave: (fields: Omit<Trip, 'id' | 'created_at'>, copyFrom?: string) => void
  onClose: () => void
}) {
  const [name,        setName]        = useState('')
  const [destination, setDestination] = useState('')
  const [startDate,   setStartDate]   = useState('')
  const [endDate,     setEndDate]     = useState('')
  const [stayType,    setStayType]    = useState<StayType>('home')
  const [nights,      setNights]      = useState(0)
  const [copyFrom,    setCopyFrom]    = useState('')

  function submit() {
    if (!name.trim()) return
    onSave({ name: name.trim(), destination: destination.trim(), start_date: startDate, end_date: endDate, stay_type: stayType, nights, memo: '', status: 'planning' }, copyFrom || undefined)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={e => { if (e.target !== e.currentTarget) return; if (window.innerWidth >= 768) return; onClose() }}>
      <div className="modal">
        <div className="modal-body">
          <div className="modal-hdr">
            <span className="modal-title">旅行を追加</span>
            <button className="modal-close" onClick={onClose}>✕</button>
          </div>
          <div className="fg"><label>旅行名 *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="例：山梨 義父家" autoFocus />
          </div>
          <div className="fg"><label>行き先</label>
            <input value={destination} onChange={e => setDestination(e.target.value)} placeholder="例：山梨県甲府市" />
          </div>
          <div className="fg row2">
            <div><label>出発日</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div><label>帰宅日</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
          </div>
          <div className="fg"><label>何泊？</label>
            <div className="nights-stepper">
              <button type="button" onClick={() => setNights(n => Math.max(0, n - 1))}>−</button>
              <span className="nights-value">{nights === 0 ? '未定' : `${nights}泊`}</span>
              <button type="button" onClick={() => setNights(n => n + 1)}>＋</button>
            </div>
          </div>
          <div className="fg"><label>宿泊タイプ</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['home', 'hotel', 'other'] as StayType[]).map(t => (
                <button key={t} onClick={() => setStayType(t)} style={{
                  flex: 1, padding: '8px 4px', borderRadius: 12, border: 'none', cursor: 'pointer',
                  fontWeight: 700, fontSize: 13,
                  background: stayType === t ? 'var(--color-primary)' : 'var(--color-border)',
                  color: stayType === t ? '#fff' : 'var(--color-text)',
                }}>
                  {STAY_LABELS[t].emoji} {STAY_LABELS[t].label}
                </button>
              ))}
            </div>
          </div>
          {trips.length > 0 && (
            <div className="fg"><label>過去の旅行からコピー <span style={{ fontSize: 11, color: 'var(--color-sub)', fontWeight: 400 }}>（持ち物・やることを引き継ぐ）</span></label>
              <select value={copyFrom} onChange={e => setCopyFrom(e.target.value)}>
                <option value="">コピーしない</option>
                {trips.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn-primary" onClick={submit}>追加する</button>
        </div>
      </div>
    </div>
  )
}

function TripEditModal({ trip, onSave, onClose }: {
  trip: Trip
  onSave: (fields: Partial<Trip>) => void
  onClose: () => void
}) {
  const [name,        setName]        = useState(trip.name)
  const [destination, setDestination] = useState(trip.destination)
  const [startDate,   setStartDate]   = useState(trip.start_date)
  const [endDate,     setEndDate]     = useState(trip.end_date)
  const [nights,      setNights]      = useState(trip.nights)
  const [stayType,    setStayType]    = useState<StayType>(trip.stay_type)

  function submit() {
    if (!name.trim()) return
    onSave({ name: name.trim(), destination: destination.trim(), start_date: startDate, end_date: endDate, nights, stay_type: stayType })
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={e => { if (e.target !== e.currentTarget) return; if (window.innerWidth >= 768) return; onClose() }}>
      <div className="modal">
        <div className="modal-body">
          <div className="modal-hdr">
            <span className="modal-title">旅行を編集</span>
            <button className="modal-close" onClick={onClose}>✕</button>
          </div>
          <div className="fg"><label>旅行名 *</label>
            <input value={name} onChange={e => setName(e.target.value)} autoFocus />
          </div>
          <div className="fg"><label>行き先</label>
            <input value={destination} onChange={e => setDestination(e.target.value)} placeholder="例：山梨県甲府市" />
          </div>
          <div className="fg row2">
            <div><label>出発日</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div><label>帰宅日</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
          </div>
          <div className="fg"><label>何泊？</label>
            <div className="nights-stepper">
              <button type="button" onClick={() => setNights(n => Math.max(0, n - 1))}>−</button>
              <span className="nights-value">{nights === 0 ? '未定' : `${nights}泊`}</span>
              <button type="button" onClick={() => setNights(n => n + 1)}>＋</button>
            </div>
          </div>
          <div className="fg"><label>宿泊タイプ</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['home', 'hotel', 'other'] as StayType[]).map(t => (
                <button key={t} onClick={() => setStayType(t)} style={{
                  flex: 1, padding: '8px 4px', borderRadius: 12, border: 'none', cursor: 'pointer',
                  fontWeight: 700, fontSize: 13,
                  background: stayType === t ? 'var(--color-primary)' : 'var(--color-border)',
                  color: stayType === t ? '#fff' : 'var(--color-text)',
                }}>
                  {STAY_LABELS[t].emoji} {STAY_LABELS[t].label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-primary" onClick={submit}>保存する</button>
        </div>
      </div>
    </div>
  )
}

const PACK_SECTION_OPTS: { id: PackSection; label: string }[] = [
  { id: null,        label: 'なし' },
  { id: 'carry',     label: '🎒 手持ち' },
  { id: 'suitcase',  label: '🧳 スーツケース' },
]

function ItemEditModal({ item, tripNights, onSave, onDelete, onClose }: {
  item: TripItem
  tripNights: number
  onSave: (id: string, text: string, qtyPerNight: number | null, section: PackSection) => void
  onDelete: (id: string) => void
  onClose: () => void
}) {
  const [text,    setText]    = useState(item.text)
  const [linked,  setLinked]  = useState(item.qty_per_night != null)
  const [qty,     setQty]     = useState(item.qty_per_night ?? 1)
  const [section, setSection] = useState<PackSection>(item.section ?? null)

  function submit() {
    const t = text.trim()
    if (!t) return
    onSave(item.id, t, linked ? qty : null, section)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={e => { if (e.target !== e.currentTarget) return; if (window.innerWidth >= 768) return; onClose() }}>
      <div className="modal">
        <div className="modal-body">
          <div className="modal-hdr">
            <span className="modal-title">アイテムを編集</span>
            <button className="modal-close" onClick={onClose}>✕</button>
          </div>
          <div className="fg"><label>テキスト</label>
            <input value={text} onChange={e => setText(e.target.value)} autoFocus onKeyDown={e => e.key === 'Enter' && submit()} />
          </div>
          {item.category === 'packing' && (
            <div className="fg"><label>収納場所</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {PACK_SECTION_OPTS.map(s => (
                  <button key={String(s.id)} onClick={() => setSection(s.id)} style={{
                    padding: '7px 14px', borderRadius: 12, border: 'none', cursor: 'pointer',
                    fontWeight: 700, fontSize: 13,
                    background: section === s.id ? 'var(--color-primary)' : 'var(--color-border)',
                    color: section === s.id ? '#fff' : 'var(--color-text)',
                  }}>{s.label}</button>
                ))}
              </div>
            </div>
          )}
          {tripNights > 0 && (
            <div className="fg"><label>泊数連動</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <button onClick={() => setLinked(l => !l)} style={{
                  padding: '8px 16px', borderRadius: 20, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13,
                  background: linked ? 'var(--color-warning)' : 'var(--color-border)',
                  color: linked ? '#fff' : 'var(--color-sub)',
                }}>🌙 {linked ? 'ON' : 'OFF'}</button>
                {linked && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: 'var(--color-border)', cursor: 'pointer', fontSize: 18 }}>−</button>
                    <span style={{ fontWeight: 700, fontSize: 16, minWidth: 24, textAlign: 'center' }}>{qty}</span>
                    <button onClick={() => setQty(q => q + 1)} style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: 'var(--color-border)', cursor: 'pointer', fontSize: 18 }}>＋</button>
                    <span style={{ fontSize: 13, color: 'var(--color-sub)' }}>× {tripNights}泊 = {qty * tripNights}個</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="modal-footer" style={{ gap: 8 }}>
          <button className="btn-primary" onClick={submit}>保存する</button>
          <button className="btn-danger" onClick={() => { onDelete(item.id); onClose() }}>削除</button>
        </div>
      </div>
    </div>
  )
}

function TripDetailModal({ trip, onUpdate, onDelete, onClose }: {
  trip: Trip
  onUpdate: (id: string, fields: Partial<Trip>) => void
  onDelete: (id: string) => void
  onClose: () => void
}) {
  const [items,             setItems]             = useState<TripItem[]>([])
  const [tab,               setTab]               = useState<'packing' | 'todo'>('packing')
  const [newText,           setNewText]           = useState('')
  const [memo,              setMemo]              = useState(trip.memo)
  const [editItem,          setEditItem]          = useState<TripItem | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showEdit,          setShowEdit]          = useState(false)
  const [addSection,        setAddSection]        = useState<PackSection>(null)
  const [addedToCart,       setAddedToCart]       = useState<Set<string>>(new Set())
  const { msg, show: showToast } = useToast()

  useEffect(() => {
    supabase.from('trip_items').select('*').eq('trip_id', trip.id).order('position')
      .then(({ data }) => setItems((data as TripItem[]) || []))
  }, [trip.id])

  const addItem = useCallback(async () => {
    const text = newText.trim()
    if (!text) return
    const pos  = items.filter(i => i.category === tab).length
    const item: TripItem = { id: uid(), trip_id: trip.id, category: tab, text, checked: false, qty_per_night: null, section: tab === 'packing' ? addSection : null, position: pos }
    await supabase.from('trip_items').insert([item])
    setItems(prev => [...prev, item])
    setNewText('')
  }, [newText, items, tab, trip.id])

  const toggleItem = useCallback(async (id: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, checked: !i.checked } : i))
    const item = items.find(i => i.id === id)
    if (item) await supabase.from('trip_items').update({ checked: !item.checked }).eq('id', id)
  }, [items])

  const deleteItem = useCallback(async (id: string) => {
    await supabase.from('trip_items').delete().eq('id', id)
    setItems(prev => prev.filter(i => i.id !== id))
  }, [])

  const updateItem = useCallback(async (id: string, text: string, qtyPerNight: number | null, section: PackSection) => {
    await supabase.from('trip_items').update({ text, qty_per_night: qtyPerNight, section }).eq('id', id)
    setItems(prev => prev.map(i => i.id === id ? { ...i, text, qty_per_night: qtyPerNight, section } : i))
  }, [])

  const toggleQty = useCallback(async (id: string) => {
    const item = items.find(i => i.id === id)
    if (!item) return
    const newQty = item.qty_per_night != null ? null : 1
    setItems(prev => prev.map(i => i.id === id ? { ...i, qty_per_night: newQty } : i))
    await supabase.from('trip_items').update({ qty_per_night: newQty }).eq('id', id)
  }, [items])

  const addToShopping = useCallback(async (item: TripItem) => {
    await supabase.from('pickups').insert([{
      id: uid(), name: item.text, category: '旅行', emoji: '✈️',
      status: '未完了', url: '', image_url: '', added_at: new Date().toISOString(),
    }])
    setAddedToCart(prev => new Set(prev).add(item.id))
    showToast('🛒 買い物リストに追加しました')
  }, [showToast])

  const saveMemo = useCallback(async () => {
    await supabase.from('trips').update({ memo }).eq('id', trip.id)
    onUpdate(trip.id, { memo })
    showToast('メモを保存しました')
  }, [memo, trip.id, onUpdate, showToast])

  const complete = useCallback(async () => {
    await supabase.from('trips').update({ status: 'done' }).eq('id', trip.id)
    onUpdate(trip.id, { status: 'done' })
    showToast('旅行を完了しました！')
    onClose()
  }, [trip.id, onUpdate, onClose, showToast])

  const tabItems = items.filter(i => i.category === tab)
  const checkedCount = tabItems.filter(i => i.checked).length
  const useGroups = tab === 'packing' && tabItems.some(i => i.section != null)
  const packGroups = useGroups
    ? [
        { key: 'carry' as PackSection,    label: '🎒 手持ち' },
        { key: 'suitcase' as PackSection, label: '🧳 スーツケース' },
        { key: null as PackSection,        label: 'その他' },
      ].map(g => ({ ...g, items: tabItems.filter(i => i.section === g.key) })).filter(g => g.items.length > 0)
    : [{ key: null as PackSection, label: null, items: tabItems }]

  return (
    <>
    <div className="modal-overlay" onClick={e => { if (e.target !== e.currentTarget) return; if (window.innerWidth >= 768) return; onClose() }}>
      <div className="modal" style={{ maxHeight: 'calc(100% - 40px)' }}>
        <div className="modal-body">
          <div className="modal-hdr">
            <span className="modal-title">{trip.name}</span>
            <button className="btn-shopping" style={{ fontSize: 12, padding: '4px 12px', marginRight: 4 }} onClick={() => setShowEdit(true)}>編集</button>
            <button className="modal-close" onClick={onClose}>✕</button>
          </div>

          {/* 旅行情報 */}
          <div className="trip-info-row">
            {trip.destination && <span className="trip-chip">📍 {trip.destination}</span>}
            {trip.start_date && <span className="trip-chip">📅 {trip.start_date}{trip.end_date && trip.end_date !== trip.start_date ? ` 〜 ${trip.end_date}` : ''}</span>}
            {trip.nights > 0 && <span className="trip-chip">🌙 {trip.nights}泊</span>}
            <span className="trip-chip" style={{ background: `color-mix(in srgb, ${STAY_LABELS[trip.stay_type].color} 15%, var(--color-surface))`, color: STAY_LABELS[trip.stay_type].color }}>
              {STAY_LABELS[trip.stay_type].emoji} {STAY_LABELS[trip.stay_type].label}
            </span>
          </div>

          {/* タブ */}
          <div className="trip-tabs">
            {(['packing', 'todo'] as const).map(t => (
              <button key={t} className={`trip-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                {t === 'packing' ? '🧳 持ち物' : '✅ やること'}
                <span className="trip-tab-count">{items.filter(i => i.category === t && i.checked).length}/{items.filter(i => i.category === t).length}</span>
              </button>
            ))}
          </div>

          {/* リスト */}
          <div className="trip-list">
            {packGroups.map(group => (
              <Fragment key={String(group.key ?? 'flat')}>
                {group.label && (
                  <div className="pack-section-header">
                    <span>{group.label}</span>
                    <span className="pack-section-count">{group.items.filter(i => i.checked).length}/{group.items.length}</span>
                  </div>
                )}
                {group.items.map(item => (
                  <div key={item.id} className={`trip-item ${item.checked ? 'checked' : ''}`}>
                    <button className="trip-check" onClick={() => toggleItem(item.id)}>
                      {item.checked ? '✓' : ''}
                    </button>
                    <span className="trip-item-text" style={{ cursor: 'pointer' }} onClick={() => setEditItem(item)}>{item.text}</span>
                    {trip.nights > 0 && (
                      <button
                        className={`trip-qty-toggle ${item.qty_per_night != null ? 'active' : ''}`}
                        onClick={() => toggleQty(item.id)}
                        title="泊数連動"
                      >
                        {item.qty_per_night != null ? `🌙${item.qty_per_night * trip.nights}個` : '🌙'}
                      </button>
                    )}
                    {!item.checked && tab === 'packing' && (
                      <button
                        className={`trip-cart-btn ${addedToCart.has(item.id) ? 'added' : ''}`}
                        onClick={() => addToShopping(item)}
                        title="買い物リストに追加"
                      >🛒</button>
                    )}
                    <button className="trip-delete-btn" onClick={() => deleteItem(item.id)}>✕</button>
                  </div>
                ))}
              </Fragment>
            ))}
            {tab === 'packing' && (
              <div className="pack-section-select">
                {PACK_SECTION_OPTS.map(s => (
                  <button key={String(s.id)} className={`pack-section-opt ${addSection === s.id ? 'active' : ''}`} onClick={() => setAddSection(s.id)}>
                    {s.label}
                  </button>
                ))}
              </div>
            )}
            <div className="trip-add-row">
              <input
                className="trip-add-input"
                value={newText}
                onChange={e => setNewText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addItem()}
                placeholder={tab === 'packing' ? '持ち物を追加…' : 'やることを追加…'}
              />
              <button className="trip-add-btn" onClick={addItem} disabled={!newText.trim()}>追加</button>
            </div>
          </div>

          {/* メモ */}
          <div className="fg" style={{ marginTop: 16 }}>
            <label>旅行メモ・記録</label>
            <textarea
              value={memo}
              onChange={e => setMemo(e.target.value)}
              onBlur={saveMemo}
              rows={3}
              placeholder="旅行の感想や記録を残そう…"
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* 進捗 */}
          {tabItems.length > 0 && (
            <div className="trip-progress">
              <div className="trip-progress-bar">
                <div className="trip-progress-fill" style={{ width: `${Math.round(checkedCount / tabItems.length * 100)}%` }} />
              </div>
              <span className="trip-progress-text">{checkedCount} / {tabItems.length} 完了</span>
            </div>
          )}
        </div>

        <div className="modal-footer" style={{ gap: 8 }}>
          {trip.status === 'planning' && (
            <button className="btn-primary" onClick={complete}>🎉 旅行完了</button>
          )}
          {showDeleteConfirm ? (
            <>
              <button className="btn-danger" style={{ flex: 1 }} onClick={() => { onDelete(trip.id); onClose() }}>本当に削除する</button>
              <button className="btn-shopping" style={{ flex: 'none', width: 'auto', padding: '0 20px' }} onClick={() => setShowDeleteConfirm(false)}>キャンセル</button>
            </>
          ) : (
            <button className="btn-danger" onClick={() => setShowDeleteConfirm(true)}>削除</button>
          )}
        </div>
        <Toast msg={msg} />
      </div>
    </div>
    {editItem && (
      <ItemEditModal
        item={editItem}
        tripNights={trip.nights}
        onSave={updateItem}
        onDelete={deleteItem}
        onClose={() => setEditItem(null)}
      />
    )}
    {showEdit && (
      <TripEditModal
        trip={trip}
        onSave={async (fields) => {
          await supabase.from('trips').update(fields).eq('id', trip.id)
          onUpdate(trip.id, fields)
          setShowEdit(false)
        }}
        onClose={() => setShowEdit(false)}
      />
    )}
  </>
  )
}

export default function TravelPage() {
  const [trips,    setTrips]    = useState<Trip[]>([])
  const [loading,  setLoading]  = useState(true)
  const [showAdd,  setShowAdd]  = useState(false)
  const [selected, setSelected] = useState<Trip | null>(null)
  const { msg, show: showToast } = useToast()

  useEffect(() => {
    supabase.from('trips').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setTrips((data as Trip[]) || []); setLoading(false) })
  }, [])

  const addTrip = useCallback(async (fields: Omit<Trip, 'id' | 'created_at'>, copyFrom?: string) => {
    const id = uid()
    const now = new Date().toISOString()
    const row: Trip = { id, created_at: now, ...fields }
    await supabase.from('trips').insert([row])
    setTrips(prev => [row, ...prev])

    if (copyFrom) {
      const { data: srcItems } = await supabase.from('trip_items').select('*').eq('trip_id', copyFrom)
      if (srcItems && srcItems.length > 0) {
        const copied = (srcItems as TripItem[]).map(i => ({ ...i, id: uid(), trip_id: id, checked: false }))
        await supabase.from('trip_items').insert(copied)
      }
    }
    showToast('旅行を追加しました')
  }, [showToast])

  const updateTrip = useCallback((id: string, fields: Partial<Trip>) => {
    setTrips(prev => prev.map(t => t.id === id ? { ...t, ...fields } : t))
  }, [])

  const deleteTrip = useCallback(async (id: string) => {
    await supabase.from('trips').delete().eq('id', id)
    setTrips(prev => prev.filter(t => t.id !== id))
    showToast('削除しました')
  }, [showToast])

  const planning = trips.filter(t => t.status === 'planning')
  const done     = trips.filter(t => t.status === 'done')

  const action = <button className="hdr-add-btn" onClick={() => setShowAdd(true)}>＋ 旅行</button>

  return (
    <AppShell title="✈️ 旅行" action={action}>
      {loading ? (
        <div className="empty"><div className="spinner" /></div>
      ) : trips.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">✈️</div>
          <div className="empty-text">旅行の記録がありません</div>
          <div className="empty-sub">「旅行」ボタンで追加してください</div>
        </div>
      ) : (
        <div style={{ padding: '12px 14px 32px' }}>
          {planning.length > 0 && (
            <>
              <div className="section-label" style={{ padding: '0 4px 10px', fontSize: 12, fontWeight: 700, color: 'var(--color-sub)' }}>準備中</div>
              <div className="list-card-group" style={{ marginBottom: 24 }}>
                {planning.map(trip => <TripCard key={trip.id} trip={trip} onClick={() => setSelected(trip)} />)}
              </div>
            </>
          )}
          {done.length > 0 && (
            <>
              <div className="section-label" style={{ padding: '0 4px 10px', fontSize: 12, fontWeight: 700, color: 'var(--color-sub)' }}>旅行記録</div>
              <div className="list-card-group">
                {done.map(trip => <TripCard key={trip.id} trip={trip} onClick={() => setSelected(trip)} />)}
              </div>
            </>
          )}
        </div>
      )}

      {showAdd && <TripAddModal trips={trips} onSave={addTrip} onClose={() => setShowAdd(false)} />}
      {selected && (
        <TripDetailModal
          trip={selected}
          onUpdate={(id, fields) => { updateTrip(id, fields); setSelected(prev => prev ? { ...prev, ...fields } : null) }}
          onDelete={deleteTrip}
          onClose={() => setSelected(null)}
        />
      )}
      <Toast msg={msg} />
    </AppShell>
  )
}

function TripCard({ trip, onClick }: { trip: Trip; onClick: () => void }) {
  const stay = STAY_LABELS[trip.stay_type]
  const isDone = trip.status === 'done'
  return (
    <div className={`trip-card ${isDone ? 'done' : ''}`} onClick={onClick}>
      <div className="trip-card-left">
        <span className="trip-card-emoji">{stay.emoji}</span>
        <div className="trip-card-info">
          <div className="trip-card-name">{trip.name}</div>
          {trip.destination && <div className="trip-card-sub">📍 {trip.destination}</div>}
          {trip.start_date && (
            <div className="trip-card-sub">
              📅 {trip.start_date}{trip.end_date && trip.end_date !== trip.start_date ? ` 〜 ${trip.end_date}` : ''}{trip.nights > 0 ? ` （${trip.nights}泊）` : ''}
            </div>
          )}
        </div>
      </div>
      <span className="trip-stay-badge" style={{ color: stay.color, background: `color-mix(in srgb, ${stay.color} 12%, var(--color-surface))` }}>
        {stay.label}
      </span>
    </div>
  )
}
