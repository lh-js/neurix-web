import { ClientHeader } from './client-header'
import Footer from '@/components/layout/footer/footer'

/**
 * 首页布局组件（服务器组件）
 * 这个组件确保首页的内容直接输出到 HTML，不经过客户端组件边界
 * Header 是客户端组件，但它只影响 header 部分，不影响主要内容
 */
export function HomePageLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ClientHeader />
      <div className="flex-1 min-h-[calc(100vh-4rem)] w-full pt-16">{children}</div>
      <Footer />
    </>
  )
}
