import type { Metadata } from 'next'
import { Noto_Sans_JP } from 'next/font/google'
import './globals.css'

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  variable: '--font-noto-sans-jp',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'アズカル - ペットシッターマッチングサービス',
    template: '%s | アズカル',
  },
  description: 'ペットを預けたい飼い主と、信頼できる個人シッターをつなぐ日本初のペット特化マーケットプレイス',
  keywords: ['ペットシッター', 'ペット預かり', 'ドッグシッター', 'ペットホテル', 'アズカル'],
  openGraph: {
    title: 'アズカル - ペットシッターマッチングサービス',
    description: 'ペットを預けたい飼い主と、信頼できる個人シッターをつなぐ日本初のペット特化マーケットプレイス',
    type: 'website',
    locale: 'ja_JP',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" className={notoSansJP.variable}>
      <body className={notoSansJP.className}>{children}</body>
    </html>
  )
}
