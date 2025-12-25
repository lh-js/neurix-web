'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'

function UnauthorizedContent() {
  const searchParams = useSearchParams()
  const redirectParam = searchParams.get('redirect')

  // 构建登录链接，如果存在原始页面则带上 redirect 参数
  const loginHref = redirectParam
    ? `/login?redirect=${encodeURIComponent(redirectParam)}`
    : '/login'

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/50 px-4">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-destructive/10 p-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">访问被拒绝</h1>
          <p className="text-muted-foreground">抱歉，您没有权限访问此页面。</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="default">
            <Link href="/">返回首页</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={loginHref}>前往登录</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function UnauthorizedPage() {
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
      <UnauthorizedContent />
    </Suspense>
  )
}
