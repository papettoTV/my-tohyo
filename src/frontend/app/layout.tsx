import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MyTohyo',
  description: 'あなたの投票記録を安全に保存し、政治参加の履歴を管理できるプラットフォーム',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
