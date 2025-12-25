'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { isAuthenticated, canAccessPage, buildLoginRedirectUrl } from '@/utils/auth.util'
import { LOGIN_PATH } from '@/config/auth.config'
import { Spinner } from '@/components/ui/spinner'
import { useAuth } from '@/hooks/common/use-auth'
import { withUser } from '@/hooks/common/use-auth'

interface AuthGuardProps {
  children: React.ReactNode
}

/**
 * 内部组件：处理 searchParams 的逻辑
 * 需要被 Suspense 包裹以支持静态生成
 * 使用 withUser 包裹以响应 MobX store 变化
 */
const AuthGuardInnerBase = ({ children }: AuthGuardProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isChecking, setIsChecking] = useState(true)
  const { user, loading, initialized, accessiblePages, pagesLoading, pagesInitialized } = useAuth()

  useEffect(() => {
    const authenticated = isAuthenticated()
    const safePathname = pathname || '/'
    const searchString = searchParams?.toString()
    const currentFullPath = searchString ? `${safePathname}?${searchString}` : safePathname

    // 等待页面权限加载完成
    if (!pagesInitialized || pagesLoading) {
      return
    }

    // 检查页面是否在可访问页面列表中
    // 如果登录：返回用户可访问的页面 + 公共页面
    // 如果未登录：只返回公共页面
    const pageInAccessibleList = canAccessPage(pathname, accessiblePages)

    // 接口异常时会落到兜底页面列表，此时不应该把已登录用户直接踢回登录页
    // 兜底列表只包含登录/注册/忘记密码/根路径，若当前用户有 token，
    // 暂时保留在当前页面，等待后续请求成功后再由 withUser 刷新权限
    const isFallbackAccessibleList =
      authenticated &&
      accessiblePages &&
      accessiblePages.length === 4 &&
      [LOGIN_PATH, '/register', '/forgot-password', '/'].every(page =>
        accessiblePages.includes(page)
      )

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

    // 当权限接口失败时，使用兜底页面列表，保持在当前页面而不是跳回登录
    if (isFallbackAccessibleList) {
      const timer = setTimeout(() => {
        setIsChecking(false)
      }, 0)
      return () => clearTimeout(timer)
    }

    // 如果页面不在可访问列表中，说明没有权限访问
    // 如果未登录，跳转到登录页，并记录来源页面
    if (!authenticated) {
      router.push(buildLoginRedirectUrl(currentFullPath))
      return
    }

    // 已登录但页面不在可访问列表中，说明没有权限
    // 跳转到用户有权限访问的第一个页面
    if (accessiblePages && accessiblePages.length > 0) {
      const firstAccessiblePage = accessiblePages[0]
      // 优先跳转到根目录，其次跳转到列表中的第一个页面
      if (canAccessPage('/', accessiblePages)) {
        router.push('/')
      } else if (firstAccessiblePage) {
        router.push(firstAccessiblePage)
      } else {
        router.push(buildLoginRedirectUrl(currentFullPath))
      }
      return
    }

    // 如果没有任何可访问的页面，跳转到登录页
    router.push(buildLoginRedirectUrl(currentFullPath))
  }, [
    pathname,
    router,
    searchParams,
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
const AuthGuardInner = withUser(AuthGuardInnerBase) as typeof AuthGuardInnerBase

/**
 * 路由保护组件
 * 检查用户登录状态和页面访问权限，保护需要登录的页面
 * 使用 Suspense 包裹以支持 Next.js 静态生成
 */
export function AuthGuard({ children }: AuthGuardProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Spinner className="h-8 w-8" />
            <p className="text-sm text-muted-foreground">加载中...</p>
          </div>
        </div>
      }
    >
      <AuthGuardInner>{children}</AuthGuardInner>
    </Suspense>
  )
}
