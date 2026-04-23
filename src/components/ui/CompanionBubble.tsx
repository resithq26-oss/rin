'use client'

import { useEffect, useState } from 'react'

interface CompanionBubbleProps {
  message: string
}

export function CompanionBubble({ message }: CompanionBubbleProps) {
  const [visible, setVisible] = useState(false)
  const [displayed, setDisplayed] = useState(message)

  useEffect(() => {
    setVisible(false)
    const t1 = setTimeout(() => { setDisplayed(message); setVisible(true) }, 120)
    return () => clearTimeout(t1)
  }, [message])

  return (
    <div className="companion-wrap">
      <div className="companion-icon">🌸</div>
      <div className={`companion-bubble ${visible ? 'visible' : ''}`}>
        {displayed}
      </div>
    </div>
  )
}

// メッセージ集
export const MSG = {
  // 時刻別挨拶
  greetMorning:  'おはよう！今日も一緒に頑張ろうね ☀️',
  greetAfternoon:'こんにちは！何か書き留めておきたいことある？',
  greetEvening:  'おかえり。今日はどんな一日だった？🌤',
  greetNight:    'お疲れさま。もう少しで一日終わりだね 🌙',
  greetLate:     'こんな時間まで起きてるんだね。無理しないでね 🌛',

  // ノート
  noteAdded:     '新しいメモ、ちゃんと預かっておくよ。',
  noteUpdated:   '更新したね。いつでも見返せるよ。',
  noteDeleted:   'スッキリしたかな？必要なことはちゃんと残してあるよ。',
  notePinned:    'ピン留めしたんだね。大事なことは目立つところにね 📌',
  noteEmpty:     'メモを書いて、頭の中を整理しよう。',

  // ルーティン
  habitDone:     'やったね！続けることが一番大切だよ、えらい ✨',
  habitAdded:    '新しいルーティン、応援してるよ。一緒に続けよう。',
  habitDeleted:  '無理なルーティンは削っていいんだよ。自分のペースで。',
  allHabitsDone: '今日のルーティン全部終わったね！すごい 🎉',

  // 買い物
  itemBought:    '買えたね！お疲れさま 🛒',
  itemAdded:     '買い物リストに追加したよ。忘れずに済んだね。',
  cartEmpty:     '買い物リストは空っぽ。のんびりしてていいよ。',

  // ストック
  stockAdded:    '在庫に登録したよ。なくなりそうになったら教えてね。',
  stockUpdated:  '在庫を更新したね。管理上手！',
  stockAlert:    '在庫が切れてるものがあるよ。早めに確認してみて 📦',

  // 全クリア
  allClear:      'やること全部終わってる！今日も完璧だよ ✨',

  // デフォルト
  default:       'おかえり。何かお手伝いできることはある？',
}

export function getGreeting(): string {
  const h = new Date().getHours()
  if (h >= 5  && h < 12) return MSG.greetMorning
  if (h >= 12 && h < 17) return MSG.greetAfternoon
  if (h >= 17 && h < 21) return MSG.greetEvening
  if (h >= 21 && h < 24) return MSG.greetNight
  return MSG.greetLate
}
