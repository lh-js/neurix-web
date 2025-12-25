'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { LOGIN_PATH } from '@/config/auth.config'
import { Spinner } from '@/components/ui/spinner'

/**
 * 401错误处理弹窗内容组件
 * 需要被 Suspense 包裹以使用 useSearchParams
 */
function AuthExpiredDialogContent() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // 监听401错误事件
    const handle401Error = () => {
      setOpen(true)
    }

    // 监听自定义事件
    window.addEventListener('auth:expired', handle401Error)

    return () => {
      window.removeEventListener('auth:expired', handle401Error)
    }
  }, [])

  const handleLogin = () => {
    // 关闭弹窗
    setOpen(false)
    // 获取当前页面的完整路径（包括查询参数）
    const safePathname = pathname || '/'
    const searchString = searchParams?.toString()
    const currentFullPath = searchString ? `${safePathname}?${searchString}` : safePathname
    // 跳转到登录页面，带上当前页面作为 redirect 参数
    const loginUrl = `${LOGIN_PATH}?redirect=${encodeURIComponent(currentFullPath)}`
    router.push(loginUrl)
  }

  const handleCancel = () => {
    // 关闭弹窗
    setOpen(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>登录已过期</AlertDialogTitle>
          <AlertDialogDescription>
            您的登录状态已过期，请重新登录以继续使用。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>取消</AlertDialogCancel>
          <AlertDialogAction onClick={handleLogin}>前往登录</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

/**
 * 401错误处理弹窗组件
 * 监听全局的401错误事件，显示登录过期提示
 */
export function AuthExpiredDialog() {
  return (
    <Suspense
      fallback={
        <div className="hidden">
          <Spinner className="h-4 w-4" />
        </div>
      }
    >
      <AuthExpiredDialogContent />
    </Suspense>
  )
}
