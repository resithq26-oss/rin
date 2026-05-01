'use client'

import Link from 'next/link'
import Image from 'next/image'
import AppShell from '@/components/layout/AppShell'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons'
import { useTheme } from '@/hooks/useTheme'
import { useAppMode } from '@/hooks/useAppMode'
import { useCompanion, COMPANIONS } from '@/hooks/useCompanion'
import { MOODS, applyMood, type MoodId } from '@/components/ui/MoodRibbon'
import { useState, useEffect } from 'react'
import type { Theme } from '@/hooks/useTheme'

const STANDARD_THEMES: { id: Theme; label: string; sub: string; icon: typeof faSun; iconBg: string; iconColor: string; bg: string; accent: string; subColor: string }[] = [
  {
    id: 'rin', label: 'ライト', sub: 'クリーンなライトテーマ',
    icon: faSun, iconBg: 'linear-gradient(135deg, #ffe082, #ff9800)', iconColor: '#fff',
    bg: 'linear-gradient(135deg, #f0f3ff 0%, #dde5ff 100%)', accent: '#4f6ef7', subColor: 'rgba(30,27,75,.5)',
  },
  {
    id: 'night', label: 'ダーク', sub: '落ち着いた夜のテーマ',
    icon: faMoon, iconBg: 'linear-gradient(135deg, #5c4b9e, #2d1b69)', iconColor: '#c4b5fd',
    bg: 'linear-gradient(135deg, #181b2e 0%, #0e1022 100%)', accent: '#a78bfa', subColor: 'rgba(255,255,255,.55)',
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
  const { theme, setTheme }       = useTheme()
  const { mode, setMode }         = useAppMode()
  const { companion, setCompanion } = useCompanion()
  const [mood, setMoodState]      = useState<MoodId | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('rin-mood') as MoodId | null
    if (saved && MOODS.some(m => m.id === saved)) setMoodState(saved)
  }, [])

  function selectMood(id: MoodId) {
    setMoodState(id)
    applyMood(id)
  }

  function switchMode(next: typeof mode) {
    setMode(next)
  }

  function selectCompanion(id: typeof companion) {
    setCompanion(id)
  }

  return (
    <AppShell title="⚙️ 設定">
      {/* モード選択 */}
      <div className="settings-section">
        <div className="settings-label">モード</div>
        <div className="mode-toggle-wrap">
          <button className={`mode-toggle-btn${mode === 'standard' ? ' active' : ''}`} onClick={() => switchMode('standard')}>
            <span className="mode-toggle-icon">📋</span>
            <div>
              <div className="mode-toggle-name">スタンダード</div>
              <div className="mode-toggle-sub">シンプル・ライト / ダーク</div>
            </div>
          </button>
          <button className={`mode-toggle-btn${mode === 'companion' ? ' active' : ''}`} onClick={() => switchMode('companion')}>
            <span className="mode-toggle-icon">🎀</span>
            <div>
              <div className="mode-toggle-name">コンパニオン</div>
              <div className="mode-toggle-sub">碧と一緒・気分テーマ</div>
            </div>
          </button>
        </div>
      </div>

      {/* ライト / ダーク：モード共通 */}
      <div className="settings-section">
        <div className="settings-label">テーマ</div>
        <div className="theme-cards">
          {STANDARD_THEMES.map(t => (
            <button key={t.id}
              className={`theme-card ${theme === t.id ? 'active' : ''}`}
              style={{ background: t.bg, '--accent': t.accent } as React.CSSProperties}
              onClick={() => setTheme(t.id)}
            >
              <div className="theme-card-icon" style={{ background: t.iconBg }}>
                <FontAwesomeIcon icon={t.icon} style={{ color: t.iconColor, fontSize: 22 }} />
              </div>
              <div className="theme-card-info">
                <div className="theme-card-name" style={{ color: t.accent }}>{t.label}</div>
                <div className="theme-card-sub" style={{ color: t.subColor }}>{t.sub}</div>
              </div>
              {theme === t.id && <div className="theme-card-check" style={{ background: t.accent }}>✓</div>}
            </button>
          ))}
        </div>
      </div>

      {/* コンパニオンモード専用設定 */}
      {mode === 'companion' && (
        <>
          <div className="settings-section">
            <div className="settings-label">Companion 選択</div>
            <div className="companion-cards">
              {COMPANIONS.map(c => (
                <button key={c.id}
                  className={`companion-select-card${companion === c.id ? ' active' : ''}`}
                  onClick={() => selectCompanion(c.id)}
                >
                  <div className="companion-select-avatar">
                    <Image src={c.img} alt={c.name} width={56} height={56} className="companion-select-img" />
                  </div>
                  <div className="companion-select-name">{c.name}</div>
                  {companion === c.id && <div className="companion-select-check" style={{ background: c.color }}>✓</div>}
                </button>
              ))}
              <div className="companion-select-card coming-soon">
                <div className="companion-select-avatar" style={{ background: 'var(--color-border)', borderRadius: '50%', width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🌸</div>
                <div className="companion-select-name">凛</div>
                <div className="companion-coming-badge">近日</div>
              </div>
            </div>
          </div>

          <div className="settings-section">
            <div className="settings-label">気分テーマ</div>
            <div className="mood-theme-grid">
              {MOODS.map(m => (
                <button key={m.id}
                  className={`mood-theme-card${mood === m.id ? ' active' : ''}`}
                  style={{ '--mood-color': m.color, '--mood-color-d': m.colorD } as React.CSSProperties}
                  onClick={() => selectMood(m.id)}
                >
                  <span className="mood-theme-emoji">{m.emoji}</span>
                  <span className="mood-theme-label">{m.label}</span>
                  {mood === m.id && <span className="mood-theme-check">✓</span>}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

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
          <div className="settings-info-row"><span>バージョン</span><span>3.4.0</span></div>
          <div className="settings-info-row"><span>データ保存</span><span>Supabase</span></div>
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
