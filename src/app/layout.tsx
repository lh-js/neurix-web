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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // 保护 MutationObserver.observe，确保 body 存在时才执行
                if (typeof window !== 'undefined' && window.MutationObserver) {
                  var OriginalMutationObserver = window.MutationObserver;
                  var OriginalObserve = MutationObserver.prototype.observe;
                  
                  // 重写 observe 方法
                  MutationObserver.prototype.observe = function(target, options) {
                    // 如果目标是 document.body，确保 body 存在且是有效的 Node
                    if (target === document.body) {
                      if (!document.body || !(document.body instanceof Node) || document.body.nodeType !== Node.ELEMENT_NODE) {
                        // body 还不存在，延迟执行
                        var self = this;
                        var checkBody = setInterval(function() {
                          if (document.body && document.body instanceof Node && document.body.nodeType === Node.ELEMENT_NODE) {
                            clearInterval(checkBody);
                            // body 已准备好，执行原始的 observe
                            OriginalObserve.call(self, document.body, options);
                          }
                        }, 10);
                        
                        // 设置超时，避免无限等待
                        setTimeout(function() {
                          clearInterval(checkBody);
                          if (document.body && document.body instanceof Node) {
                            OriginalObserve.call(self, document.body, options);
                          }
                        }, 1000);
                        return;
                      }
                    }
                    
                    // 对于其他目标，正常执行
                    if (target && target instanceof Node) {
                      try {
                        OriginalObserve.call(this, target, options);
                      } catch (e) {
                        // 如果 observe 失败，静默处理（避免控制台错误）
                        console.warn('MutationObserver.observe failed:', e);
                      }
                    }
                  };
                }
              })();
            `,
          }}
        />
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
