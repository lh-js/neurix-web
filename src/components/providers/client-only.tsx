'use client'

import { useEffect, useState } from 'react'

interface ClientOnlyProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * 客户端渲染包装组件
 * 确保只在客户端 DOM 准备好后才渲染子组件
 * 用于修复 Radix UI Portal 组件的 MutationObserver 错误
 */
export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // 确保 DOM 完全准备好
    // 使用 requestAnimationFrame 确保在浏览器完成布局后再渲染
    if (typeof window !== 'undefined') {
      const timer = requestAnimationFrame(() => {
        // 再次检查确保 document.body 存在
        if (document.body) {
          setMounted(true)
        } else {
          // 如果 body 还不存在，等待一下再试
          setTimeout(() => {
            if (document.body) {
              setMounted(true)
            }
          }, 0)
        }
      })

      return () => cancelAnimationFrame(timer)
    }
  }, [])

  if (!mounted) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
