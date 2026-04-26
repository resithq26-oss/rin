'use client'

import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import type { Pickup } from '@/types'

interface ShoppingModalProps {
  pickup?: Pickup | null
  catList?: string[]
  onSave: (fields: Omit<Pickup, 'id' | 'status' | 'added_at'>) => void
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

export default function ShoppingModal({ pickup, catList = [], onSave, onDelete, onClose }: ShoppingModalProps) {
  const [name,       setName]       = useState(pickup?.name      ?? '')
  const [category,   setCategory]   = useState(pickup?.category  ?? '')
  const [emoji,      setEmoji]      = useState(pickup?.emoji     ?? '')
  const [url,        setUrl]        = useState(pickup?.url       ?? '')
  const [imageUrl,   setImageUrl]   = useState(pickup?.image_url ?? '')
  const [ogpLoading, setOgpLoading] = useState(false)
  const isEdit = !!pickup

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
      title={isEdit ? '買い物メモを編集' : 'メモを追加'}
      onClose={onClose}
      footer={
        <>
          <button className="btn-primary"
            onClick={() => name.trim() && onSave({ name: name.trim(), category: category.trim(), emoji: emoji.trim(), url: url.trim(), image_url: imageUrl })}>
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
          <input value={emoji} onChange={e => setEmoji(e.target.value)} placeholder="🛒" className="emoji-input" />
        </div>
        <div><label>カテゴリ</label>
          <input value={category} onChange={e => setCategory(e.target.value)} placeholder="食品"
            list="shop-cat-list" onFocus={scrollToInput} />
          <datalist id="shop-cat-list">
            {catList.map(c => <option key={c} value={c} />)}
          </datalist>
        </div>
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
