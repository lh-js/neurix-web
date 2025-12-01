'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { sidebarMenuConfig, MenuItem, LinkMenuItem, GroupMenuItem } from '@/config/sidebar.config'

export default function Sidebar() {
  const pathname = usePathname()
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    // 初始化时，设置 defaultOpen 为 true 的分组为打开状态
    const initial: Record<string, boolean> = {}
    sidebarMenuConfig.forEach(item => {
      if (item.type === 'group' && item.defaultOpen) {
        initial[item.id] = true
      }
    })
    return initial
  })

  const isActive = (href: string) => {
    if (!pathname) return false
    // 精确匹配
    if (pathname === href) return true
    // 对于非 /admin 的路径，需要确保是精确匹配或者是子路径（后面跟着 /）
    if (href !== '/admin' && pathname.startsWith(href)) {
      // 确保匹配的是完整路径，而不是部分匹配
      // 例如：/admin/role 不应该匹配 /admin/role-url
      const nextChar = pathname[href.length]
      return nextChar === undefined || nextChar === '/' || nextChar === '?'
    }
    return false
  }

  const toggleGroup = (groupId: string) => {
    setOpenGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId],
    }))
  }

  const renderLinkItem = (item: LinkMenuItem) => {
    const Icon = item.icon
    return (
      <Link
        key={item.id}
        href={item.href}
        className={cn(
          'flex items-center space-x-2 px-3 py-2 text-sm rounded-md transition-all duration-200',
          'hover:bg-accent/50 hover:text-foreground',
          isActive(item.href) ? 'bg-accent text-foreground font-medium' : 'text-muted-foreground'
        )}
      >
        <Icon className="h-4 w-4" />
        <span>{item.label}</span>
      </Link>
    )
  }

  const renderGroupItem = (item: GroupMenuItem) => {
    const Icon = item.icon
    const isOpen = openGroups[item.id] ?? false

    return (
      <Collapsible
        key={item.id}
        open={isOpen}
        onOpenChange={() => toggleGroup(item.id)}
        className="mt-4"
      >
        <CollapsibleTrigger
          className={cn(
            'w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-200',
            'hover:bg-accent/50 hover:text-foreground',
            'text-muted-foreground'
          )}
        >
          <div className="flex items-center space-x-2">
            <Icon className="h-4 w-4" />
            <span>{item.label}</span>
          </div>
          {isOpen ? (
            <ChevronDown className="h-4 w-4 transition-transform duration-200" />
          ) : (
            <ChevronRight className="h-4 w-4 transition-transform duration-200" />
          )}
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-1 space-y-0.5 pl-7">
          {item.children.map(child => renderLinkItem(child))}
        </CollapsibleContent>
      </Collapsible>
    )
  }

  const renderMenuItem = (item: MenuItem) => {
    if (item.type === 'link') {
      return renderLinkItem(item)
    } else {
      return renderGroupItem(item)
    }
  }

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-border/40 bg-background/50 backdrop-blur-sm h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto">
      <nav className="flex-1 p-4 space-y-1">
        {sidebarMenuConfig.map(item => (
          <div key={item.id}>{renderMenuItem(item)}</div>
        ))}
      </nav>
    </aside>
  )
}
