'use client'

import Header from '@/components/layout/header/header'

/**
 * 客户端 Header 包装器
 * 将 Header 组件包装起来，避免影响服务器组件的边界
 */
export function ClientHeader() {
  return <Header />
}
