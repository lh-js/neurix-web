import type { Metadata } from 'next'
import './globals.css'
import { ConditionalLayout } from '@/components/common/conditional-layout'
import { Toaster } from '@/components/ui/sonner'

export const metadata: Metadata = {
  title: 'Neurix',
  description: 'Neurix',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen flex flex-col">
        <ConditionalLayout>{children}</ConditionalLayout>
        <Toaster />
      </body>
    </html>
  )
}
