'use client'

import AppShell from '@/components/layout/AppShell'
import { useTheme } from '@/hooks/useTheme'
import { useCharacter } from '@/hooks/useCharacter'
import type { Theme } from '@/hooks/useTheme'

const THEMES: { id: Theme; label: string; sub: string; avatar: string; bg: string; accent: string }[] = [
  {
    id:     'rin',
    label:  '凛モード',
    sub:    '清潔感のある昼間テーマ',
    avatar: '/rin/day.png',
    bg:     'linear-gradient(135deg, #f0f3ff 0%, #dde5ff 100%)',
    accent: '#4f6ef7',
  },
  {
    id:     'night',
    label:  'ナイトモード',
    sub:    '落ち着いた夜のテーマ',
    avatar: '/rin/night.png',
    bg:     'linear-gradient(135deg, #181b2e 0%, #0e1022 100%)',
    accent: '#a78bfa',
  },
  {
    id:     'aoi',
    label:  '碧モード',
    sub:    'ネオンが光るサイバーテーマ',
    avatar: '/rin/aoi.png',
    bg:     'linear-gradient(135deg, #0c1118 0%, #060a0e 100%)',
    accent: '#00e5ff',
  },
]

const GUIDE = [
  { emoji: '🏠', label: 'ホーム',      desc: '今日のルーティン・在庫切れ・ピン留めメモをまとめて確認' },
  { emoji: '📝', label: 'ノート',      desc: 'テキストメモ・チェックリストを作成。カラーやカテゴリで整理' },
  { emoji: '🔄', label: 'ルーティン',  desc: '繰り返しタスクを管理。期限が近い順に自動ソート' },
  { emoji: '🛒', label: '買い物',      desc: '買い物リスト。在庫ゼロのストックから直接追加も可能' },
  { emoji: '📦', label: 'ストック',    desc: '在庫の有無を管理。「緊急」フラグでバッジ通知' },
]

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { charVisible, setCharVisible } = useCharacter()

  return (
    <AppShell title="⚙️ 設定">
      {/* キャラクター表示 */}
      <div className="settings-section">
        <div className="settings-label">表示設定</div>
        <div className="settings-info-card">
          <div className="settings-info-row" style={{ cursor: 'pointer' }} onClick={() => setCharVisible(!charVisible)}>
            <div>
              <div style={{ fontWeight: 600 }}>キャラクター表示</div>
              <div style={{ fontSize: 12, color: 'var(--color-sub)', marginTop: 2 }}>オフにするとプレーンなアイコン表示になります</div>
            </div>
            <span className={`toggle ${charVisible ? 'on' : ''}`} />
          </div>
        </div>
      </div>

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
              {charVisible
                ? <img src={t.avatar} alt={t.label} className="theme-card-avatar" />
                : <div className="theme-card-swatch" style={{ background: t.accent }} />
              }
              <div className="theme-card-info">
                <div className="theme-card-name" style={{ color: t.accent }}>{t.label}</div>
                <div className="theme-card-sub">{t.sub}</div>
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
            <span>バージョン</span><span>1.0.0</span>
          </div>
          <div className="settings-info-row">
            <span>データ保存</span><span>Supabase</span>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
