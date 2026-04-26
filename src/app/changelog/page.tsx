'use client'

import Link from 'next/link'
import AppShell from '@/components/layout/AppShell'

type Tag = 'new' | 'fix' | 'change'

interface ChangeItem {
  tag: Tag
  text: string
}

interface Release {
  version: string
  date: string
  items: ChangeItem[]
}

const RELEASES: Release[] = [
  {
    version: 'v2.1.0',
    date: '2026-04-26',
    items: [
      { tag: 'new',    text: '碧モード復活。VSCode × サイバー配色に全面刷新' },
      { tag: 'change', text: '凛モードを「通常モード」に改名（ライトテーマ）' },
      { tag: 'fix',    text: '設定画面のテーマカードで凛モードの文字が見えない問題を修正' },
    ],
  },
  {
    version: 'v2.0.0',
    date: '2026-04-26',
    items: [
      { tag: 'new',    text: 'ホームをポータル化。クイックリンクの追加・削除に対応' },
      { tag: 'new',    text: 'PCレイアウト対応。サイドバーナビを追加' },
      { tag: 'new',    text: 'アップデート履歴ページを追加' },
      { tag: 'change', text: '碧（サイバー）テーマを削除' },
      { tag: 'change', text: 'キャラクター画像を廃止、絵文字アイコンに統一' },
    ],
  },
  {
    version: 'v1.1.0',
    date: '2026-04-25',
    items: [
      { tag: 'new',    text: 'ノートから買い物リストへ直接追加できるボタンを追加' },
      { tag: 'new',    text: '設定ページを追加（テーマ切り替え・使い方ガイド）' },
      { tag: 'new',    text: '碧モード（サイバーパンクテーマ）を追加' },
      { tag: 'new',    text: 'キャラクター表示オン/オフ機能を追加' },
      { tag: 'change', text: 'フローティングピル型ナビゲーションに変更' },
      { tag: 'fix',    text: '碧モードでのメモ入力背景が白くなる問題を修正' },
    ],
  },
  {
    version: 'v1.0.0',
    date: '2026-04-20',
    items: [
      { tag: 'new', text: 'Rin リリース。ノート・ルーティン・買い物・ストックの4機能' },
      { tag: 'new', text: 'PWA対応（ホーム画面への追加）' },
      { tag: 'new', text: '凛モード・ナイトモードのテーマ切り替え' },
      { tag: 'new', text: 'コンパニオンバブルによる挨拶メッセージ' },
      { tag: 'new', text: 'バッジによる未完了タスク・買い物・在庫切れの通知' },
    ],
  },
]

const TAG_LABEL: Record<Tag, string> = { new: 'NEW', fix: 'FIX', change: '変更' }

export default function ChangelogPage() {
  return (
    <AppShell title="📋 更新履歴">
      <div style={{ padding: '8px 0 32px' }}>
        {RELEASES.map(rel => (
          <div key={rel.version} className="changelog-entry">
            <div className="changelog-version">{rel.version}</div>
            <div className="changelog-date">{rel.date}</div>
            <div className="changelog-items">
              {rel.items.map((item, i) => (
                <div key={i} className="changelog-item">
                  <span className={`changelog-tag tag-${item.tag}`}>{TAG_LABEL[item.tag]}</span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div style={{ padding: '24px 14px 0' }}>
          <Link href="/settings" style={{ fontSize: 14, color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600 }}>
            ← 設定に戻る
          </Link>
        </div>
      </div>
    </AppShell>
  )
}
