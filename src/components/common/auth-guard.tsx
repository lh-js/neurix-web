'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { isAuthenticated, canAccessPage } from '@/utils/auth.util'
import { LOGIN_PATH } from '@/config/auth.config'
import { Spinner } from '@/components/ui/spinner'
import { useAuth } from '@/hooks/common/use-auth'
import { withUser } from '@/hooks/common/use-auth'

interface AuthGuardProps {
  children: React.ReactNode
}

/**
 * 路由保护组件
 * 检查用户登录状态和页面访问权限，保护需要登录的页面
 */
function AuthGuardComponent({ children }: AuthGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isChecking, setIsChecking] = useState(true)
  const { user, loading, initialized, accessiblePages, pagesLoading, pagesInitialized } = useAuth()

  useEffect(() => {
    const authenticated = isAuthenticated()

    // 等待页面权限加载完成
    if (!pagesInitialized || pagesLoading) {
      return
    }

    // 检查页面是否在可访问页面列表中
    // 如果登录：返回用户可访问的页面 + 公共页面
    // 如果未登录：只返回公共页面
    const pageInAccessibleList = canAccessPage(pathname, accessiblePages)

    // 如果页面在可访问列表中，允许访问
    if (pageInAccessibleList) {
      // 如果是登录页且已登录，需要等待用户信息加载完成后再决定是否跳转
      if (pathname === LOGIN_PATH && authenticated) {
        // 等待用户信息加载完成
        if (!initialized || loading) {
          return
        }
        // 只有当用户信息成功加载且有权限时，才跳转到默认页面
        if (user && accessiblePages && accessiblePages.length > 0) {
          // 检查是否有重定向参数，且该页面可访问
          const redirectParam = searchParams.get('redirect')
          if (redirectParam && canAccessPage(redirectParam, accessiblePages)) {
            router.push(redirectParam)
            return
          }

          // 如果没有有效的重定向参数，优先跳转到 /，如果没有权限则跳转到第一个可访问的页面
          if (canAccessPage('/', accessiblePages)) {
            router.push('/')
          } else {
            const firstAccessiblePage = accessiblePages[0]
            if (firstAccessiblePage) {
              router.push(firstAccessiblePage)
            }
          }
          return
        }
        // 如果用户信息加载失败，停留在登录页（不清除 token，可能是网络错误）
      }
      const timer = setTimeout(() => {
        setIsChecking(false)
      }, 0)
      return () => clearTimeout(timer)
    }

    // 如果页面不在可访问列表中，说明没有权限访问
    // 如果未登录，跳转到登录页，并记录来源页面
    if (!authenticated) {
      const redirectUrl = `${LOGIN_PATH}?redirect=${encodeURIComponent(pathname)}`
      router.push(redirectUrl)
      return
    }

    // 已登录但页面不在可访问列表中，说明没有权限
    // 跳转到用户有权限访问的第一个页面
    if (accessiblePages && accessiblePages.length > 0) {
      const firstAccessiblePage = accessiblePages[0]
      if (canAccessPage('/admin', accessiblePages)) {
        router.push('/admin')
      } else if (firstAccessiblePage) {
        router.push(firstAccessiblePage)
      } else {
        router.push(LOGIN_PATH)
      }
      return
    }

    // 如果没有任何可访问的页面，跳转到登录页
    router.push(LOGIN_PATH)
  }, [
    pathname,
    router,
    user,
    loading,
    initialized,
    accessiblePages,
    pagesLoading,
    pagesInitialized,
  ])

  // 检查中显示加载状态
  if (isChecking || !initialized || loading || !pagesInitialized || pagesLoading) {
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

// 使用 withUser HOC 使组件响应 userStore 的变化
export const AuthGuard = withUser(AuthGuardComponent)
