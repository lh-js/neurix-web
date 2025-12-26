'use client'

import { Suspense, useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { WifiOff, RefreshCw } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import { userStore } from '@/stores/user-store'
import { runInAction } from 'mobx'
import { useAuth } from '@/hooks/common/use-auth'

function NetworkErrorContent() {
  const searchParams = useSearchParams()
  const redirectParam = searchParams.get('redirect')
  const { networkError } = useAuth()
  const [isOnline, setIsOnline] = useState(typeof window !== 'undefined' ? navigator.onLine : true)
  const [shouldRedirect, setShouldRedirect] = useState(false)
  const isInitializedRef = useRef(false)
  const hasRedirectedRef = useRef(false)

  // 页面加载时，如果网络已恢复且没有网络错误，立即跳转，不显示页面
  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      shouldRedirect ||
      isInitializedRef.current ||
      hasRedirectedRef.current
    )
      return

    isInitializedRef.current = true

    // 只有当网络在线且没有网络错误时，才跳转
    // 如果 networkError 为 true，说明网络还是不通，不应该跳转
    if (navigator.onLine && !networkError) {
      hasRedirectedRef.current = true
      // 清除网络错误状态
      runInAction(() => {
        userStore.networkError = false
      })
      // 使用 setTimeout 将 setState 移到下一个事件循环，避免在 effect 中同步调用
      setTimeout(() => {
        setShouldRedirect(true)
        // 立即跳转，不显示页面
        if (redirectParam) {
          window.location.href = redirectParam
        } else {
          window.location.reload()
        }
      }, 0)
      return
    }
  }, [redirectParam, networkError, shouldRedirect])

  // 只监听网络状态变化，用于更新 UI 显示，不自动刷新
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleOnline = () => {
      setIsOnline(true)
    }

    const handleOffline = () => {
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleRefresh = () => {
    setShouldRedirect(true)
    // 清除网络错误状态
    runInAction(() => {
      userStore.networkError = false
    })
    // 刷新页面，会重新获取用户信息和可访问资源
    if (redirectParam) {
      window.location.href = redirectParam
    } else {
      window.location.reload()
    }
  }

  // 如果正在跳转，显示加载状态（与 Suspense fallback 完全一致的布局）
  useEffect(() => {
    if (shouldRedirect) {
      // 禁用 body 滚动，避免滚动条影响位置
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [shouldRedirect])

  if (shouldRedirect) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="h-8 w-8" />
          <p className="text-sm text-muted-foreground">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/50 px-4">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-amber-500/10 p-4">
            <WifiOff className="h-12 w-12 text-amber-500" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">网络连接异常</h1>
          <p className="text-muted-foreground">无法连接到服务器，请检查您的网络连接。</p>
          <p className="text-sm text-muted-foreground mt-2">
            网络恢复后，请手动刷新页面或点击下方按钮刷新。
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={handleRefresh} variant="default" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              刷新页面
            </Button>
            <Button asChild variant="outline">
              <Link href="/">返回首页</Link>
            </Button>
          </div>

          {!isOnline && (
            <p className="text-xs text-muted-foreground">当前网络已断开，请检查网络连接</p>
          )}
        </div>
      </div>
    </div>
  )
}

// 统一的 loading 组件，确保位置一致
const LoadingFallback = () => {
  useEffect(() => {
    // 禁用 body 滚动，避免滚动条影响位置
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [])

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
      <div className="flex flex-col items-center gap-4">
        <Spinner className="h-8 w-8" />
        <p className="text-sm text-muted-foreground">加载中...</p>
      </div>
    </div>
  )
}

export default function NetworkErrorPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <NetworkErrorContent />
    </Suspense>
  )
}
