'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { observer } from 'mobx-react-lite'
import { useAuth } from '@/hooks/common/use-auth'
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

const Header = observer(() => {
  const { user, loading, logout } = useAuth()
  const pathname = usePathname()

  const getUserInitials = (nickname: string) => {
    return nickname.slice(0, 2).toUpperCase()
  }

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true
    if (path !== '/' && pathname?.startsWith(path)) return true
    return false
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 shadow-sm">
      <div className="w-full flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-8">
          <Link
            href="/"
            className="flex items-center space-x-2 group transition-all duration-200 hover:opacity-80"
          >
            <div className="relative">
              <span className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Neurix
              </span>
              <span className="absolute inset-0 text-2xl font-bold bg-gradient-to-r from-foreground/20 to-foreground/10 bg-clip-text text-transparent blur-sm group-hover:blur-none transition-all duration-200">
                Neurix
              </span>
            </div>
          </Link>
          <nav className="hidden md:flex items-center space-x-1">
            <Link
              href="/"
              className={`relative px-4 py-2 text-sm font-medium transition-all duration-200 rounded-md ${
                isActive('/')
                  ? 'text-foreground bg-accent'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              }`}
            >
              首页
              {isActive('/') && (
                <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
              )}
            </Link>
            <Link
              href="/home"
              className={`relative px-4 py-2 text-sm font-medium transition-all duration-200 rounded-md ${
                isActive('/home')
                  ? 'text-foreground bg-accent'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              }`}
            >
              主页
              {isActive('/home') && (
                <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
              )}
            </Link>
          </nav>
        </div>
        <div className="flex items-center space-x-3">
          {loading ? (
            <Skeleton className="h-10 w-10 rounded-full" />
          ) : user ? (
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
                    <p className="text-xs leading-none text-muted-foreground truncate">
                      {user.email}
                    </p>
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
                  onClick={logout}
                  className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                >
                  退出登录
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>
      </div>
    </header>
  )
})

export default Header
