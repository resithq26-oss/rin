import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Rin',
  description: 'ゆいの日常を支えるパーソナルコンパニオン',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#6366f1',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" style={{ height: '100%' }}>
      <head>
        {/* テーマフラッシュ防止 */}
        <script dangerouslySetInnerHTML={{ __html: `try{var t=localStorage.getItem('rin-theme');if(t)document.documentElement.setAttribute('data-theme',t);}catch(e){}` }} />
      </head>
      <body style={{ height: '100%', margin: 0 }}>{children}</body>
    </html>
  )
}
