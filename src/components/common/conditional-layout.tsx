'use client'

import { usePathname } from 'next/navigation'
import Header from '@/components/layout/header/header'
import Footer from '@/components/layout/footer/footer'
import Sidebar from '@/components/layout/sidebar/sidebar'
import { AuthGuard } from '@/components/common/auth-guard'
import { isMinimalLayoutRoute, shouldShowSidebar } from '@/config/auth.config'

interface ConditionalLayoutProps {
  children: React.ReactNode
}

/**
 * 条件布局组件
 * 根据配置决定是否显示 header、footer 和侧边栏
 */
export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname()
  const isMinimal = isMinimalLayoutRoute(pathname || '')
  const showSidebar = shouldShowSidebar(pathname || '')
  const isChatPage = pathname === '/chat'

  // 最小化布局（不显示 header 和 footer）
  if (isMinimal) {
    return <AuthGuard>{children}</AuthGuard>
  }

  // 聊天页面特殊处理 - 占满整个视口，只显示header
  if (isChatPage) {
    return (
      <AuthGuard>
        <Header />
        <div className="h-screen pt-16">{children}</div>
      </AuthGuard>
    )
  }

  // 标准布局（显示 header 和 footer）
  // 只有管理员页面才显示侧边栏
  // 注意：Header 组件使用 observer，可能会触发 MobX 响应
  // 但 Header 组件只读取 store，不会自动触发请求
  return (
    <AuthGuard>
      <Header />
      <main className="flex-1 flex flex-col lg:flex-row gap-4 pt-16">
        {showSidebar && <Sidebar />}
        <div className="flex-1 min-h-[calc(100vh-4rem)] w-full">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
            {children}
          </div>
        </div>
      </main>
      <Footer />
    </AuthGuard>
  )
}
