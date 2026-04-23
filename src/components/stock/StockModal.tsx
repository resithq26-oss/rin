'use client'

import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import type { InventoryItem } from '@/types'

interface StockModalProps {
  item?: InventoryItem | null
  onSave: (fields: Omit<InventoryItem, 'id' | 'avg_days' | 'cycle_count'>) => void
  onDelete?: () => void
  onClose: () => void
}

async function fetchOgp(url: string) {
  try {
    const res = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}`)
    const json = await res.json()
    if (json.status === 'success') {
      return { imageUrl: json.data.image?.url || json.data.logo?.url || '', title: json.data.title || '' }
    }
  } catch {}
  return { imageUrl: '', title: '' }
}

function scrollToInput(e: React.FocusEvent) {
  setTimeout(() => (e.target as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' }), 300)
}

export default function StockModal({ item, onSave, onDelete, onClose }: StockModalProps) {
  const [name,       setName]       = useState(item?.name      ?? '')
  const [category,   setCategory]   = useState(item?.category  ?? '')
  const [emoji,      setEmoji]      = useState(item?.emoji     ?? '')
  const [inStock,    setInStock]    = useState((item?.stock ?? 1) > 0)
  const [unit,       setUnit]       = useState(item?.unit      ?? '個')
  const [memo,       setMemo]       = useState(item?.memo      ?? '')
  const [urgent,     setUrgent]     = useState(item?.urgent    ?? false)
  const [url,        setUrl]        = useState(item?.url       ?? '')
  const [imageUrl,   setImageUrl]   = useState(item?.image_url ?? '')
  const [ogpLoading, setOgpLoading] = useState(false)
  const isEdit = !!item

  async function handleUrlBlur() {
    if (!url.match(/^https?:\/\//)) return
    setOgpLoading(true)
    const { imageUrl: img, title } = await fetchOgp(url)
    if (img) setImageUrl(img)
    if (title && !name) setName(title)
    setOgpLoading(false)
  }

  return (
    <Modal
      title={isEdit ? '在庫を編集' : '在庫を追加'}
      onClose={onClose}
      footer={
        <>
          <button className="btn-primary"
            onClick={() => name.trim() && onSave({ name: name.trim(), category: category.trim(), emoji: emoji.trim(), stock: inStock ? 1 : 0, unit: unit.trim(), memo: memo.trim(), urgent, url: url.trim(), image_url: imageUrl })}>
            {isEdit ? '更新する' : '追加する'}
          </button>
          {isEdit && onDelete && (
            <button className="btn-danger" onClick={() => confirm('削除しますか？') && onDelete()}>削除する</button>
          )}
        </>
      }
    >
      <div className="fg"><label>商品名 *</label>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="例：シャンプー" autoFocus onFocus={scrollToInput} />
      </div>
      <div className="fg row2">
        <div><label>絵文字</label>
          <input value={emoji} onChange={e => setEmoji(e.target.value)} placeholder="📦" className="emoji-input" />
        </div>
        <div><label>カテゴリ</label>
          <input value={category} onChange={e => setCategory(e.target.value)} placeholder="ボディケア" onFocus={scrollToInput} />
        </div>
      </div>
      <div className="fg row2">
        <div>
          <div className="toggle-row" onClick={() => setInStock(v => !v)}>
            <span className="toggle-label">在庫あり</span>
            <span className={`toggle ${inStock ? 'on' : ''}`} />
          </div>
        </div>
        <div><label>単位</label>
          <input value={unit} onChange={e => setUnit(e.target.value)} placeholder="個" onFocus={scrollToInput} />
        </div>
      </div>
      <div className="fg">
        <div className="toggle-row" onClick={() => setUrgent(v => !v)}>
          <span className="toggle-label">在庫なしのとき急いで買う</span>
          <span className={`toggle ${urgent ? 'on' : ''}`} />
        </div>
      </div>
      <div className="fg"><label>メモ</label>
        <input value={memo} onChange={e => setMemo(e.target.value)} placeholder="任意メモ" onFocus={scrollToInput} />
      </div>
      <div className="fg">
        <label>URL {ogpLoading && <span className="ogp-loading">取得中…</span>}</label>
        <input value={url} onChange={e => setUrl(e.target.value)} onBlur={handleUrlBlur}
          placeholder="https://..." onFocus={scrollToInput} />
      </div>
      {imageUrl && (
        <div className="ogp-preview">
          <img src={imageUrl} alt="" className="ogp-img" onError={e => (e.target as HTMLImageElement).style.display = 'none'} />
          <a href={url} target="_blank" rel="noreferrer" className="ogp-link" onClick={e => e.stopPropagation()}>{url}</a>
        </div>
      )}
    </Modal>
  )
}
