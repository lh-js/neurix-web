import type { Metadata } from 'next'
import './globals.css'
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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('neurix-theme');
                  let isDark = false;
                  
                  if (theme === 'dark') {
                    isDark = true;
                  } else if (theme === 'light') {
                    isDark = false;
                  } else {
                    // system 或未设置，根据系统主题决定
                    isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                  }
                  
                  // 立即应用主题，避免闪烁
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                  
                  // 设置标志，告诉 ThemeProvider 已经应用了主题
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
