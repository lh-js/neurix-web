import type { Metadata } from 'next'
import './globals.css'
// 必须在任何 Radix UI 组件之前导入，修复 MutationObserver 错误
import '@/lib/mutation-observer-polyfill'
import Script from 'next/script'
import { ConditionalLayout } from '@/components/common/conditional-layout'
import { ThemeProvider, ThemedToaster } from '@/components/providers/theme-provider'
import { ClientOnly } from '@/components/providers/client-only'

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
      <head>
        <Script src="/mo-guard.js" strategy="beforeInteractive" />
        <Script
          id="theme-bootstrap"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // 立即处理主题，避免闪烁
                try {
                  var theme = localStorage.getItem('neurix-theme');
                  var isDark = theme === 'dark' || (theme !== 'light' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);

                  if (isDark) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                  document.documentElement.setAttribute('data-theme-applied', 'true');
                } catch (e) {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.setAttribute('data-theme-applied', 'true');
                }
              })();
            `,
          }}
        />
      </head>
      <body className="h-screen flex flex-col bg-background">
        <ClientOnly>
          <ThemeProvider>
            <ConditionalLayout>{children}</ConditionalLayout>
            <ThemedToaster />
          </ThemeProvider>
        </ClientOnly>
      </body>
    </html>
  )
}
