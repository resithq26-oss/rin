'use client'

import Modal from '@/components/ui/Modal'
import type { InventoryItem } from '@/types'

interface StockDetailModalProps {
  item: InventoryItem
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
  onToggle: () => void
  onAddToShopping: () => void
}

export default function StockDetailModal({ item, onClose, onEdit, onDelete, onToggle, onAddToShopping }: StockDetailModalProps) {
  const noStock = item.stock === 0

  return (
    <Modal
      title={item.name}
      onClose={onClose}
      footer={
        <>
          <button className="btn-primary" onClick={onEdit}>編集する</button>
          {noStock && (
            <button className="btn-shopping" onClick={() => { onAddToShopping(); onClose() }}>
              🛒 買い物リストへ追加
            </button>
          )}
          <button className="btn-danger" onClick={() => { if (confirm('削除しますか？')) onDelete() }}>削除する</button>
        </>
      }
    >
      {/* 在庫トグル — 大きめ */}
      <button
        className={`stock-toggle-btn ${noStock ? 'out' : 'in'}`}
        onClick={onToggle}
      >
        <span className="stock-toggle-icon">{noStock ? '📭' : '📦'}</span>
        <span className="stock-toggle-label">{noStock ? '在庫なし　→ 在庫ありに変更' : '在庫あり　→ 在庫なしに変更'}</span>
      </button>

      {/* 詳細情報 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
        {item.category && (
          <div className="stock-detail-row">
            <span className="stock-detail-label">カテゴリ</span>
            <span>{item.category}</span>
          </div>
        )}
        {item.unit && (
          <div className="stock-detail-row">
            <span className="stock-detail-label">単位</span>
            <span>{item.unit}</span>
          </div>
        )}
        {item.urgent && (
          <div className="stock-detail-row">
            <span className="stock-detail-label">優先度</span>
            <span style={{ color: 'var(--color-danger)', fontWeight: 700 }}>🚨 緊急</span>
          </div>
        )}
        {item.memo && (
          <div className="stock-detail-row">
            <span className="stock-detail-label">メモ</span>
            <span>{item.memo}</span>
          </div>
        )}
        {item.url && (
          <div className="stock-detail-row">
            <span className="stock-detail-label">リンク</span>
            <a href={item.url} target="_blank" rel="noreferrer"
              style={{ color: 'var(--color-primary)', fontSize: 13, wordBreak: 'break-all' }}>
              {item.url}
            </a>
          </div>
        )}
      </div>

      {item.image_url && (
        <div className="ogp-preview" style={{ marginTop: 16 }}>
          <img src={item.image_url} alt="" className="ogp-img"
            onError={e => (e.target as HTMLImageElement).style.display = 'none'} />
          {item.url && (
            <a href={item.url} target="_blank" rel="noreferrer" className="ogp-link">{item.url}</a>
          )}
        </div>
      )}
    </Modal>
  )
}
