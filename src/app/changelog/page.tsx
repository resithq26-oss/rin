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
    version: 'v3.7.0',
    date: '2026-05-01',
    items: [
      { tag: 'new', text: '水槽歴史タイムライン機能を追加。追加・★・レイアウト変更・ケア・設備・メモなどイベントタイプ別に記録できる' },
      { tag: 'new', text: '日付・タイプ・詳細メモ付きでタイムライン表示。立ち上げの歴史を振り返れる' },
    ],
  },
  {
    version: 'v3.6.0',
    date: '2026-05-01',
    items: [
      { tag: 'new', text: '水槽管理機能を追加（/aquarium）。複数水槽をタブで切り替えて管理できる' },
      { tag: 'new', text: '生体リスト（お魚・エビなど）とレイアウトリスト（水草・流木・石など）を水槽ごとに記録' },
      { tag: 'new', text: 'えさやり・水換えをワンタップで記録。水換えは何日前かを色分けで表示' },
    ],
  },
  {
    version: 'v3.5.0',
    date: '2026-05-01',
    items: [
      { tag: 'new', text: 'ショッピングヒストリー機能を追加（/history）。Amazon Order History.csv をインポートすると購入履歴を一覧・検索・年別フィルターで閲覧できる' },
      { tag: 'new', text: '統計カード（総購入数・総支出額・利用期間）と年別チャートで購買傾向を可視化' },
      { tag: 'new', text: 'PINコード保護（4桁 + HttpOnly Cookie）でヒストリーページをセキュアに。個人データはすべてサーバーサイドAPIで操作し、クライアントに認証情報を露出しない設計' },
    ],
  },
  {
    version: 'v3.4.0',
    date: '2026-05-01',
    items: [
      { tag: 'new', text: 'コンパニオンモードの設定を2段階に整理。「Companion 選択」（碧 / 凛…）と「テーマ」（気分リボンの6色）を独立して選べるように' },
      { tag: 'new', text: 'テーマ選択（気分）がアプリのカラーをリアルタイムで変更するように。MoodRibbon・設定ページが同一状態を共有' },
      { tag: 'new', text: '将来の「凛」コンパニオン追加に向けた設計を整備' },
    ],
  },
  {
    version: 'v3.3.0',
    date: '2026-05-01',
    items: [
      { tag: 'new', text: 'モード切り替え機能を追加（設定画面から）。スタンダードモード（シンプル・ライト/ダーク2択）とコンパニオンモード（碧アイコン・気分リボン・立ち絵背景）を選択できる' },
      { tag: 'new', text: 'コンパニオンモードでは /public/rin/ にテーマ別の立ち絵画像を配置することで背景に薄く表示される（companion-rin.png・companion-night.png・companion-aoi.png）' },
      { tag: 'new', text: 'ノートカードに ✕ ボタンを追加。クリックすると付箋を剥がすようなアニメーションでアーカイブできる' },
      { tag: 'new', text: 'ノートページにアーカイブセクションを追加。アーカイブしたノートを折りたたみで表示・元に戻す・削除ができる' },
    ],
  },
  {
    version: 'v3.2.0',
    date: '2026-04-30',
    items: [
      { tag: 'new', text: '美容院・歯科など予定日が決まっているルーティンに「次の予定日」入力欄を追加。ホーム画面の「📅 次の予定」セクションに表示され、「予約した！」ボタンで予約済みにできる' },
      { tag: 'new', text: '予定日まで7日以内かつ未予約の場合、カードが赤くなり⚠️未予約アラートを表示' },
      { tag: 'new', text: '「完了！」を押すと次の予定日・予約状況がリセットされ、次回の予定入力に備えられる' },
    ],
  },
  {
    version: 'v3.1.0',
    date: '2026-04-30',
    items: [
      { tag: 'new', text: 'ルーティンに「曜日固定」設定を追加。7日以上の間隔のルーティンで特定の曜日（月〜日）を指定できる。「完了」を押すと直前の目標曜日に戻してdueDateを正確に保つ' },
    ],
  },
  {
    version: 'v3.0.0',
    date: '2026-04-30',
    items: [
      { tag: 'new', text: 'デジタルクローゼット機能を追加。スマホで撮影した写真がカード化されクローゼット感覚で管理できる。「今日着た！」ボタンで着用回数・最終着用日を記録' },
      { tag: 'new', text: '旅行の未チェック持ち物から買い物リストへワンタップで追加できる🛒ボタンを追加' },
    ],
  },
  {
    version: 'v2.9.0',
    date: '2026-04-30',
    items: [
      { tag: 'new',    text: '旅行の持ち物リストにセクション分け（手持ち・スーツケース）を追加。追加時に収納場所を選択でき、グループ表示に対応' },
    ],
  },
  {
    version: 'v2.8.0',
    date: '2026-04-30',
    items: [
      { tag: 'new',    text: 'ホーム画面に「気分リボン」を追加。今日の気分（元気・のんびり・集中など）を選ぶとリボンの色が変わり、localStorage で記憶' },
      { tag: 'change', text: '設定画面のテーマカードアイコンを絵文字からFontAwesomeアイコンに変更（OS依存から解放）' },
    ],
  },
  {
    version: 'v2.7.0',
    date: '2026-04-30',
    items: [
      { tag: 'new',    text: '旅行の編集機能を追加。旅行名・行き先・日程・泊数・宿泊タイプをモーダルから編集可能に' },
    ],
  },
  {
    version: 'v2.6.0',
    date: '2026-04-29',
    items: [
      { tag: 'new', text: '防災プラン機能を追加。家族メンバー別の避難バッグ管理・避難情報・緊急連絡先を一元管理' },
      { tag: 'new', text: '緊急連絡先からワンタップで電話発信できるリンクを追加' },
    ],
  },
  {
    version: 'v2.5.0',
    date: '2026-04-29',
    items: [
      { tag: 'new', text: '旅行管理機能を追加。持ち物リスト・やること・旅行メモ・過去旅行コピーに対応' },
    ],
  },
  {
    version: 'v2.4.0',
    date: '2026-04-29',
    items: [
      { tag: 'new',    text: 'PCレイアウトに「今日のまとめ」右パネルを追加（準備アラート・やること・在庫切れ・ピン留めメモを常時表示）' },
      { tag: 'fix',    text: 'PCでモーダルが画面中央にフローティング表示されるよう修正' },
      { tag: 'fix',    text: 'PCでモーダルの背景クリックで閉じないよう修正' },
      { tag: 'fix',    text: 'PCでフローティングナビバーが表示されていた問題を修正' },
      { tag: 'change', text: 'faviconを✦アイコンに変更' },
    ],
  },
  {
    version: 'v2.3.0',
    date: '2026-04-29',
    items: [
      { tag: 'new',    text: '準備リマインダー機能。ルーティンに「何日前から通知するか」設定を追加' },
      { tag: 'new',    text: '買い物リストで購入チェック時、ストックの在庫数を自動で更新' },
      { tag: 'fix',    text: '買い物チェックボタンのタップ感を改善（押した瞬間に緑になるように）' },
      { tag: 'fix',    text: 'ルーティンの保存エラーを修正' },
    ],
  },
  {
    version: 'v2.2.0',
    date: '2026-04-27',
    items: [
      { tag: 'new',    text: 'ストック一覧から買い物リストへ直接追加できる🛒ボタンを追加' },
      { tag: 'new',    text: '買い物リストにスワイプ削除を追加' },
      { tag: 'fix',    text: 'スマホでモーダル表示中にキーボードが保存ボタンを隠す問題を改善' },
    ],
  },
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
