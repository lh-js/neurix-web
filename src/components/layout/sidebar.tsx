'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, User, Shield, ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

export default function Sidebar() {
  const pathname = usePathname()
  const [isPermissionOpen, setIsPermissionOpen] = useState(true)

  const isActive = (href: string) => {
    if (href === '/admin' && pathname === '/admin') return true
    if (href !== '/admin' && pathname?.startsWith(href)) return true
    return false
  }

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-border/40 bg-background/50 backdrop-blur-sm h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto">
      <nav className="flex-1 p-4 space-y-1">
        {/* 管理员首页 - 直接链接，不折叠 */}
        <Link
          href="/admin"
          className={cn(
            'flex items-center space-x-2 px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-200',
            'hover:bg-accent/50 hover:text-foreground',
            isActive('/admin') ? 'bg-accent text-foreground font-medium' : 'text-muted-foreground'
          )}
        >
          <Home className="h-4 w-4" />
          <span>管理员首页</span>
        </Link>

        {/* 用户权限管理 - 可折叠 */}
        <Collapsible open={isPermissionOpen} onOpenChange={setIsPermissionOpen} className="mt-4">
          <CollapsibleTrigger
            className={cn(
              'w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-200',
              'hover:bg-accent/50 hover:text-foreground',
              'text-muted-foreground',
              (isActive('/admin/user') || isActive('/admin/role-url')) &&
                'text-foreground bg-accent/30'
            )}
          >
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>用户权限管理</span>
            </div>
            {isPermissionOpen ? (
              <ChevronDown className="h-4 w-4 transition-transform duration-200" />
            ) : (
              <ChevronRight className="h-4 w-4 transition-transform duration-200" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-1 space-y-0.5 pl-7">
            {/* 用户管理 - 可跳转 */}
            <Link
              href="/admin/user"
              className={cn(
                'flex items-center space-x-2 px-3 py-2 text-sm rounded-md transition-all duration-200',
                'hover:bg-accent/50 hover:text-foreground',
                isActive('/admin/user')
                  ? 'bg-accent text-foreground font-medium'
                  : 'text-muted-foreground'
              )}
            >
              <User className="h-4 w-4" />
              <span>用户管理</span>
            </Link>
            {/* 权限URL管理 - 可跳转 */}
            <Link
              href="/admin/role-url"
              className={cn(
                'flex items-center space-x-2 px-3 py-2 text-sm rounded-md transition-all duration-200',
                'hover:bg-accent/50 hover:text-foreground',
                isActive('/admin/role-url')
                  ? 'bg-accent text-foreground font-medium'
                  : 'text-muted-foreground'
              )}
            >
              <Shield className="h-4 w-4" />
              <span>权限URL</span>
            </Link>
          </CollapsibleContent>
        </Collapsible>
      </nav>
    </aside>
  )
}
