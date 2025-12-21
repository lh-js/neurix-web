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
        <Script
          id="mutation-observer-guard"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // 提前包裹 MutationObserver.observe，吞掉非 Node 目标的调用
                if (typeof window !== 'undefined' && window.MutationObserver) {
                  var OriginalMutationObserver = window.MutationObserver;
                  var originalObserve = OriginalMutationObserver.prototype.observe;

                  var ensureBodyReady = function (self, options) {
                    var tryAttach = function () {
                      if (document && document.body) {
                        try { originalObserve.call(self, document.body, options); } catch (_) {}
                        return true;
                      }
                      return false;
                    };

                    if (tryAttach()) return;

                    var interval = setInterval(function () {
                      if (tryAttach()) clearInterval(interval);
                    }, 10);

                    setTimeout(function () {
                      clearInterval(interval);
                      tryAttach();
                    }, 1000);
                  };

                  OriginalMutationObserver.prototype.observe = function (target, options) {
                    var isNode = target && typeof target === 'object' && typeof target.nodeType === 'number';
                    var isBodyTarget = target === document.body || (target && target.nodeName === 'BODY');

                    if (!isNode) {
                      if (isBodyTarget) {
                        ensureBodyReady(this, options);
                      }
                      return;
                    }

                    try {
                      return originalObserve.call(this, target, options);
                    } catch (err) {
                      if (err && err.name === 'TypeError') return;
                      throw err;
                    }
                  };
                }

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
