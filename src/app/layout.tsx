import type { Metadata } from 'next'
import './globals.css'
import { ConditionalLayout } from '@/components/common/conditional-layout'
import { ThemeProvider, ThemedToaster } from '@/components/providers/theme-provider'

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
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="h-screen flex flex-col">
        <ThemeProvider>
          <ConditionalLayout>{children}</ConditionalLayout>
          <ThemedToaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
