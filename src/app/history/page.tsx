'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import AppShell from '@/components/layout/AppShell'
import { Toast, useToast } from '@/components/ui/Toast'

interface HistoryItem {
  id: string
  order_id: string
  asin: string
  product_name: string
  order_date: string
  order_status: string
  quantity: number
  unit_price: number
  total_amount: number
}

interface StatsData {
  totalItems: number
  totalSpend: number
  firstDate: string
  lastDate: string
  byYear: Record<string, { count: number; total: number }>
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++ }
      else inQuotes = !inQuotes
    } else if (ch === ',' && !inQuotes) {
      result.push(current); current = ''
    } else {
      current += ch
    }
  }
  result.push(current)
  return result
}

function parseCSV(text: string): Array<Record<string, string>> {
  const lines = text.split(/\r?\n/).filter(l => l.trim())
  if (lines.length < 2) return []
  const headers = parseCSVLine(lines[0])
  return lines.slice(1).map(line => {
    const vals = parseCSVLine(line)
    return Object.fromEntries(headers.map((h, i) => [h.trim(), (vals[i] ?? '').trim()]))
  })
}

function toNum(s: string): number {
  return parseFloat(s.replace(/,/g, '')) || 0
}

function csvRowToItem(row: Record<string, string>): HistoryItem | null {
  const asin    = row['ASIN']?.trim() || ''
  const orderId = row['Order ID']?.trim() || ''
  const date    = row['Order Date']?.trim().slice(0, 10) || ''
  const name    = row['Product Name']?.trim() || ''
  if (!asin || !orderId || !date || !name) return null
  return {
    id: `${orderId}-${asin}`,
    order_id: orderId,
    asin,
    product_name: name,
    order_date: date,
    order_status: row['Order Status']?.trim() || '',
    quantity: parseInt(row['Original Quantity'] || '1') || 1,
    unit_price: toNum(row['Unit Price'] || '0'),
    total_amount: toNum(row['Total Amount'] || '0'),
  }
}

function yen(n: number): string {
  return `¥${n.toLocaleString('ja-JP')}`
}

export default function HistoryPage() {
  const [stats, setStats]             = useState<StatsData | null>(null)
  const [items, setItems]             = useState<HistoryItem[]>([])
  const [count, setCount]             = useState(0)
  const [page, setPage]               = useState(1)
  const [q, setQ]                     = useState('')
  const [qInput, setQInput]           = useState('')
  const [year, setYear]               = useState('')
  const [loadingItems, setLoadingItems] = useState(false)
  const [loadingStats, setLoadingStats] = useState(true)
  const [importing, setImporting]     = useState(false)
  const [importMsg, setImportMsg]     = useState('')
  const [showChart, setShowChart]     = useState(false)
  const fileRef   = useRef<HTMLInputElement>(null)
  const debounce  = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const { msg, show: showToast } = useToast()

  const totalPages    = Math.ceil(count / 50)
  const years         = stats ? Object.keys(stats.byYear).sort() : []
  const maxYearTotal  = stats && years.length
    ? Math.max(...Object.values(stats.byYear).map(v => v.total))
    : 1

  const fetchStats = useCallback(async () => {
    setLoadingStats(true)
    const res  = await fetch('/api/history/stats')
    const json = await res.json()
    if (json.ok && json.data) setStats(json.data)
    setLoadingStats(false)
  }, [])

  const fetchItems = useCallback(async (p: number, qVal: string, yearVal: string) => {
    setLoadingItems(true)
    const params = new URLSearchParams({ page: String(p), q: qVal, year: yearVal })
    const res  = await fetch(`/api/history?${params}`)
    const json = await res.json()
    if (json.ok) { setItems(json.data || []); setCount(json.count || 0) }
    setLoadingItems(false)
  }, [])

  useEffect(() => { fetchStats() }, [fetchStats])
  useEffect(() => { fetchItems(page, q, year) }, [page, q, year, fetchItems])

  function handleQChange(v: string) {
    setQInput(v)
    clearTimeout(debounce.current)
    debounce.current = setTimeout(() => { setQ(v); setPage(1) }, 300)
  }

  function handleYearChange(y: string) {
    setYear(y); setPage(1)
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    setImportMsg('CSVを読み込み中…')
    const text    = await file.text()
    const rows    = parseCSV(text)
    const records = rows.map(csvRowToItem).filter((r): r is HistoryItem => r !== null)
    if (records.length === 0) {
      showToast('有効なデータが見つかりませんでした')
      setImporting(false); setImportMsg('')
      return
    }
    const BATCH = 200
    let done = 0
    for (let i = 0; i < records.length; i += BATCH) {
      setImportMsg(`${done} / ${records.length} 件完了…`)
      const res = await fetch('/api/history/import', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(records.slice(i, i + BATCH)),
      })
      if (!res.ok) {
        const err = await res.json()
        showToast(`エラー: ${err.error}`)
        setImporting(false); setImportMsg('')
        if (fileRef.current) fileRef.current.value = ''
        return
      }
      done += Math.min(BATCH, records.length - i)
    }
    setImporting(false); setImportMsg('')
    showToast(`✓ ${records.length.toLocaleString()}件インポート完了！`)
    if (fileRef.current) fileRef.current.value = ''
    setPage(1); setQ(''); setQInput(''); setYear('')
    fetchStats()
    fetchItems(1, '', '')
  }

  return (
    <AppShell title="ショッピングヒストリー">
      <div className="history-page">

        {/* インポートカード */}
        <div className="history-import-card">
          <span className="history-import-icon">📦</span>
          <div className="history-import-text">
            <div className="history-import-title">Amazon購入履歴をインポート</div>
            <div className="history-import-sub">
              {importing ? importMsg : 'Order History.csv を選択してね'}
            </div>
          </div>
          <button
            className="history-import-btn"
            onClick={() => fileRef.current?.click()}
            disabled={importing}
          >
            {importing ? '処理中…' : 'CSV を選択'}
          </button>
          <input ref={fileRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={handleFile} />
        </div>

        {/* 統計カード */}
        {!loadingStats && stats && (
          <div className="history-stats-grid">
            <div className="history-stat-card">
              <div className="history-stat-value">{stats.totalItems.toLocaleString()}</div>
              <div className="history-stat-label">総購入数</div>
            </div>
            <div className="history-stat-card">
              <div className="history-stat-value">{yen(stats.totalSpend)}</div>
              <div className="history-stat-label">総支出額</div>
            </div>
            <div className="history-stat-card">
              <div className="history-stat-value">
                {stats.firstDate.slice(0, 4)}〜{stats.lastDate.slice(0, 4)}
              </div>
              <div className="history-stat-label">利用期間</div>
            </div>
          </div>
        )}

        {/* 年別チャート */}
        {stats && years.length > 0 && (
          <div className="history-chart-card">
            <button className="history-chart-toggle" onClick={() => setShowChart(s => !s)}>
              <span>📊 年別チャート</span>
              <span className="history-chart-chevron">{showChart ? '▲' : '▼'}</span>
            </button>
            {showChart && (
              <div className="history-chart">
                {years.map(y => (
                  <div
                    key={y}
                    className={`history-chart-row${year === y ? ' active' : ''}`}
                    onClick={() => handleYearChange(year === y ? '' : y)}
                  >
                    <div className="history-chart-year">{y}</div>
                    <div className="history-chart-bar-wrap">
                      <div
                        className="history-chart-bar"
                        style={{ width: `${Math.max(2, (stats.byYear[y].total / maxYearTotal) * 100)}%` }}
                      />
                    </div>
                    <div className="history-chart-right">
                      <span className="history-chart-amount">{yen(stats.byYear[y].total)}</span>
                      <span className="history-chart-count">{stats.byYear[y].count}件</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 検索 & フィルター */}
        <div className="history-filter-row">
          <input
            className="history-search-input"
            type="text"
            placeholder="商品名で検索…"
            value={qInput}
            onChange={e => handleQChange(e.target.value)}
          />
        </div>

        <div className="history-year-tabs">
          <button
            className={`history-year-tab${year === '' ? ' active' : ''}`}
            onClick={() => handleYearChange('')}
          >全年</button>
          {years.slice().reverse().map(y => (
            <button
              key={y}
              className={`history-year-tab${year === y ? ' active' : ''}`}
              onClick={() => handleYearChange(y)}
            >{y}</button>
          ))}
        </div>

        {/* 件数ヘッダー */}
        {!loadingItems && count > 0 && (
          <div className="history-count-row">
            {q || year
              ? `${count.toLocaleString()}件ヒット`
              : `全${count.toLocaleString()}件`}
          </div>
        )}

        {/* アイテムリスト */}
        <div className="history-list">
          {loadingItems ? (
            <div className="history-empty">読み込み中…</div>
          ) : items.length === 0 ? (
            <div className="history-empty">
              {stats ? '該当する商品がないよ' : 'CSVをインポートして履歴を表示しよう！'}
            </div>
          ) : items.map(item => (
            <div key={item.id} className="history-item">
              <div className="history-item-main">
                <div className="history-item-name">{item.product_name}</div>
                <div className="history-item-meta">
                  <span className="history-item-date">{item.order_date}</span>
                  {item.quantity > 1 && (
                    <span className="history-item-qty">×{item.quantity}</span>
                  )}
                </div>
              </div>
              <div className="history-item-amount">{yen(item.total_amount)}</div>
            </div>
          ))}
        </div>

        {/* ページネーション */}
        {totalPages > 1 && (
          <div className="history-pagination">
            <button
              className="history-page-btn"
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
            >←</button>
            <span className="history-page-info">{page} / {totalPages}</span>
            <button
              className="history-page-btn"
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
            >→</button>
          </div>
        )}

      </div>
      <Toast msg={msg} />
    </AppShell>
  )
}
