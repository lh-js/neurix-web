'use client'

import { usePathname } from 'next/navigation'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import { AuthGuard } from '@/components/common/auth-guard'
import { isMinimalLayoutRoute } from '@/config/auth.config'

interface ConditionalLayoutProps {
  children: React.ReactNode
}

/**
 * 条件布局组件
 * 根据配置决定是否显示 header 和 footer
 */
export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname()
  const isMinimal = isMinimalLayoutRoute(pathname || '')

  // 最小化布局（不显示 header 和 footer）
  if (isMinimal) {
    return <AuthGuard>{children}</AuthGuard>
  }

  // 标准布局（显示 header 和 footer）
  // 注意：Header 组件使用 observer，可能会触发 MobX 响应
  // 但 Header 组件只读取 store，不会自动触发请求
  return (
    <AuthGuard>
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </AuthGuard>
  )
}

