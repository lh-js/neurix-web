import { headers } from 'next/headers'
import { ConditionalLayout } from '@/components/common/conditional-layout'
import { HomePageLayout } from './home-page-layout'

/**
 * 首页布局组件
 * 如果是首页（'/'），使用服务器端布局，确保内容直接输出到 HTML
 * 其他页面使用 ConditionalLayout（客户端组件）
 */
export async function HomeLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || ''

  // 如果是首页，使用服务器端布局，不经过客户端组件包装
  if (pathname === '/') {
    return <HomePageLayout>{children}</HomePageLayout>
  }

  // 其他页面使用 ConditionalLayout
  return <ConditionalLayout>{children}</ConditionalLayout>
}
