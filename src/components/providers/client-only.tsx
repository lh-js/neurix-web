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
    // 检查 document.body 是否存在且是一个有效的 Node
    if (typeof window !== 'undefined') {
      const checkBody = () => {
        // 检查 body 是否存在且是有效的 Node 实例
        if (
          document.body &&
          document.body instanceof Node &&
          document.body.nodeType === Node.ELEMENT_NODE
        ) {
          setMounted(true)
          return true
        }
        return false
      }

      // 立即检查一次
      if (checkBody()) {
        return
      }

      // 如果 body 还不存在，等待它创建
      const timer = setInterval(() => {
        if (checkBody()) {
          clearInterval(timer)
        }
      }, 10)

      // 设置超时，避免无限等待
      const timeout = setTimeout(() => {
        clearInterval(timer)
        if (document.body) {
          setMounted(true)
        }
      }, 1000)

      return () => {
        clearInterval(timer)
        clearTimeout(timeout)
      }
    }
  }, [])

  if (!mounted) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
