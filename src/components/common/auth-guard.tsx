'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { isAuthenticated } from '@/utils/auth.util'
import { isProtectedRoute, LOGIN_PATH } from '@/config/auth.config'
import { Spinner } from '@/components/ui/spinner'

interface AuthGuardProps {
  children: React.ReactNode
}

/**
 * 路由保护组件
 * 检查用户登录状态，保护需要登录的页面
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const authenticated = isAuthenticated()
    const isProtected = isProtectedRoute(pathname)

    // 如果是受保护的路由且未登录，跳转到登录页
    if (isProtected && !authenticated) {
      router.push(LOGIN_PATH)
      return
    }

    // 如果是登录页且已登录，跳转到默认页面
    if (pathname === LOGIN_PATH && authenticated) {
      router.push('/admin')
      return
    }

    // 使用 setTimeout 避免在 effect 中同步调用 setState
    const timer = setTimeout(() => {
      setIsChecking(false)
    }, 0)

    return () => clearTimeout(timer)
  }, [pathname, router])

  // 检查中显示加载状态
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="h-8 w-8" />
          <p className="text-sm text-muted-foreground">加载中...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

