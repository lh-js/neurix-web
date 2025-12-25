'use client'

import { Suspense, useMemo } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import type { UserInfo } from '@/service/types/auth'
import { buildLoginRedirectUrl } from '@/utils/auth.util'

interface UserDropdownProps {
  user: UserInfo | null
  loading: boolean
  onLogout: () => void
}

function UserDropdownContent({ user, loading, onLogout }: UserDropdownProps) {
  const getUserInitials = (nickname: string) => nickname.slice(0, 2).toUpperCase()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const loginHref = useMemo(() => {
    const safePathname = pathname || '/'
    const searchString = searchParams?.toString()
    const currentFullPath = searchString ? `${safePathname}?${searchString}` : safePathname
    return buildLoginRedirectUrl(currentFullPath)
  }, [pathname, searchParams])

  if (loading) {
    return <Skeleton className="h-10 w-10 rounded-full" />
  }

  if (!user) {
    return (
      <Link href={loginHref}>
        <Button variant="default" size="default">
          登录
        </Button>
      </Link>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full hover:bg-accent transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <Avatar className="ring-2 ring-border hover:ring-primary/50 transition-all duration-200">
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-foreground font-semibold">
              {getUserInitials(user.nickname)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal px-3 py-3">
          <div className="flex flex-col space-y-1.5">
            <p className="text-sm font-semibold leading-none">{user.nickname}</p>
            <p className="text-xs leading-none text-muted-foreground truncate">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="font-normal px-3 py-3">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">剩余 Token</span>
              <span className="text-xs font-medium text-foreground">{user.tokens}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">已使用</span>
              <span className="text-xs font-medium text-foreground">{user.usage}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onLogout}
          className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
        >
          退出登录
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function UserDropdown(props: UserDropdownProps) {
  return (
    <Suspense fallback={<Skeleton className="h-10 w-10 rounded-full" />}>
      <UserDropdownContent {...props} />
    </Suspense>
  )
}
