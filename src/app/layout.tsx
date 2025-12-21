import type { Metadata } from 'next'
import './globals.css'
// 必须在任何 Radix UI 组件之前导入，修复 MutationObserver 错误
import '@/lib/mutation-observer-polyfill'
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
                // 立即保护 MutationObserver，必须在任何其他代码执行前运行
                (function() {
                  if (typeof window === 'undefined') return;
                  
                  // 保存原始的 MutationObserver
                  var OriginalMutationObserver = window.MutationObserver;
                  if (!OriginalMutationObserver) return;
                  
                  // 包装 observe 方法
                  var OriginalObserve = OriginalMutationObserver.prototype.observe;
                  
                  OriginalMutationObserver.prototype.observe = function(target, options) {
                    // 严格检查 target 是否是有效的 Node
                    var isValidNode = target && 
                                     typeof target === 'object' && 
                                     target.nodeType !== undefined && 
                                     target.nodeType === Node.ELEMENT_NODE &&
                                     target instanceof Node;
                    
                    if (!isValidNode) {
                      // 如果 target 是 document.body 但 body 还不存在，等待它准备好
                      if (target === document.body || (target && target.constructor && target.constructor.name === 'HTMLBodyElement')) {
                        var self = this;
                        var args = arguments;
                        var checkBody = setInterval(function() {
                          if (document.body && 
                              document.body instanceof Node && 
                              document.body.nodeType === Node.ELEMENT_NODE) {
                            clearInterval(checkBody);
                            try {
                              OriginalObserve.apply(self, [document.body, args[1]]);
                            } catch (e) {
                              // 静默处理错误
                            }
                          }
                        }, 10);
                        
                        setTimeout(function() {
                          clearInterval(checkBody);
                          if (document.body && document.body instanceof Node) {
                            try {
                              OriginalObserve.apply(self, [document.body, args[1]]);
                            } catch (e) {
                              // 静默处理错误
                            }
                          }
                        }, 1000);
                        return;
                      }
                      // 对于其他无效目标，直接返回，不执行
                      return;
                    }
                    
                    // 对于有效的 Node，正常执行
                    try {
                      OriginalObserve.apply(this, arguments);
                    } catch (e) {
                      // 如果仍然失败，静默处理
                    }
                  };
                })();
                
                // 然后处理主题
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
