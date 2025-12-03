'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { sidebarMenuConfig, MenuItem, LinkMenuItem, GroupMenuItem } from '@/config/sidebar.config'
import { useAuth, withUser } from '@/hooks/common/use-auth'
import { canAccessPage } from '@/utils/auth.util'

function SidebarComponent() {
  const pathname = usePathname()
  const { accessiblePages } = useAuth()
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

  // 根据用户权限过滤菜单项
  const filteredMenuConfig = useMemo(() => {
    if (!accessiblePages || accessiblePages.length === 0) {
      return []
    }

    return sidebarMenuConfig
      .filter(item => {
        if (item.type === 'link') {
          // 检查链接菜单项是否有权限访问
          return canAccessPage(item.href, accessiblePages)
        } else {
          // 对于分组菜单，检查是否有至少一个子菜单项有权限访问
          const hasAccessibleChild = item.children.some(child =>
            canAccessPage(child.href, accessiblePages)
          )
          return hasAccessibleChild
        }
      })
      .map(item => {
        if (item.type === 'group') {
          // 过滤分组内的子菜单项，只保留有权限的
          return {
            ...item,
            children: item.children.filter(child => canAccessPage(child.href, accessiblePages)),
          }
        }
        return item
      }) as MenuItem[]
  }, [accessiblePages])

  const isActive = (href: string) => {
    if (!pathname) return false
    // 精确匹配
    if (pathname === href) return true
    // 对于非 /admin 的路径，需要确保是精确匹配或者是子路径（后面跟着 /）
    if (href !== '/admin' && pathname.startsWith(href)) {
      // 确保匹配的是完整路径，而不是部分匹配
      // 例如：/admin/role 不应该匹配 /admin/role-page
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
    <aside className="hidden lg:flex flex-col w-64 border-r border-border/40 bg-background/50 backdrop-blur-sm sticky top-16 self-start h-fit max-h-[calc(100vh-4rem)] overflow-y-auto">
      <nav className="flex-1 p-4 space-y-1">
        {filteredMenuConfig.map(item => (
          <div key={item.id}>{renderMenuItem(item)}</div>
        ))}
      </nav>
    </aside>
  )
}

// 使用 withUser HOC 使组件响应 userStore 的变化
export default withUser(SidebarComponent)
