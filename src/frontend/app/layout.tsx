import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MyTohyo',
  description: 'あなたの投票記録を安全に保存し、政治参加の履歴を管理できるプラットフォーム',
  generator: 'v0.dev',
}

import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { GoogleAnalytics } from '@/components/GoogleAnalytics'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID || '';
  const isProduction = process.env.NODE_ENV === 'production';

  return (
    <html lang="ja">
      <head>
        {isProduction && gaId && <GoogleAnalytics gaId={gaId} />}
      </head>
      <body className="antialiased min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow pt-16 flex flex-col">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
