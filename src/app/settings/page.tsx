'use client'

import Link from 'next/link'
import AppShell from '@/components/layout/AppShell'
import { useTheme } from '@/hooks/useTheme'
import type { Theme } from '@/hooks/useTheme'

const THEMES: { id: Theme; label: string; sub: string; icon: string; bg: string; accent: string; subColor: string }[] = [
  {
    id:       'rin',
    label:    '通常モード',
    sub:      'クリーンなライトテーマ',
    icon:     '🌤',
    bg:       'linear-gradient(135deg, #f0f3ff 0%, #dde5ff 100%)',
    accent:   '#4f6ef7',
    subColor: 'rgba(30,27,75,.5)',
  },
  {
    id:       'night',
    label:    'ナイトモード',
    sub:      '落ち着いた夜のテーマ',
    icon:     '🌙',
    bg:       'linear-gradient(135deg, #181b2e 0%, #0e1022 100%)',
    accent:   '#a78bfa',
    subColor: 'rgba(255,255,255,.55)',
  },
  {
    id:       'aoi',
    label:    '碧モード',
    sub:      'VSCode × サイバーテーマ',
    icon:     '💻',
    bg:       'linear-gradient(135deg, #0d1117 0%, #1c1c2e 100%)',
    accent:   '#4fc3f7',
    subColor: 'rgba(79,195,247,.7)',
  },
]

const GUIDE = [
  { emoji: '🏠', label: 'ホーム',     desc: 'ポータル。ルーティン・在庫・ピン留めメモ・クイックリンクをまとめて確認' },
  { emoji: '📝', label: 'ノート',     desc: 'テキストメモ・チェックリストを作成。カラーやカテゴリで整理' },
  { emoji: '🔄', label: 'ルーティン', desc: '繰り返しタスクを管理。期限が近い順に自動ソート' },
  { emoji: '🛒', label: '買い物',     desc: '買い物リスト。在庫ゼロのストックから直接追加も可能' },
  { emoji: '📦', label: 'ストック',   desc: '在庫の有無を管理。「緊急」フラグでバッジ通知' },
]

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()

  return (
    <AppShell title="⚙️ 設定">
      {/* テーマ選択 */}
      <div className="settings-section">
        <div className="settings-label">テーマ</div>
        <div className="theme-cards">
          {THEMES.map(t => (
            <button
              key={t.id}
              className={`theme-card ${theme === t.id ? 'active' : ''}`}
              style={{ background: t.bg, '--accent': t.accent } as React.CSSProperties}
              onClick={() => setTheme(t.id)}
            >
              <div className="theme-card-icon">{t.icon}</div>
              <div className="theme-card-info">
                <div className="theme-card-name" style={{ color: t.accent }}>{t.label}</div>
                <div className="theme-card-sub" style={{ color: t.subColor }}>{t.sub}</div>
              </div>
              {theme === t.id && (
                <div className="theme-card-check" style={{ background: t.accent }}>✓</div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 使い方ガイド */}
      <div className="settings-section">
        <div className="settings-label">使い方</div>
        <div className="list-card-group">
          {GUIDE.map(g => (
            <div key={g.label} className="list-card" style={{ cursor: 'default' }}>
              <div className="item-icon">{g.emoji}</div>
              <div className="item-info">
                <div className="item-name">{g.label}</div>
                <div className="item-sub">{g.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* アプリ情報 */}
      <div className="settings-section">
        <div className="settings-label">アプリ情報</div>
        <div className="settings-info-card">
          <div className="settings-info-row">
            <span>バージョン</span><span>2.0.0</span>
          </div>
          <div className="settings-info-row">
            <span>データ保存</span><span>Supabase</span>
          </div>
          <Link href="/changelog" className="settings-info-row" style={{ textDecoration: 'none', color: 'inherit', display: 'flex' }}>
            <span>アップデート履歴</span>
            <span style={{ color: 'var(--color-primary)' }}>→</span>
          </Link>
        </div>
      </div>

      <div style={{ height: 32 }} />
    </AppShell>
  )
}
