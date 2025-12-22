'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { sidebarMenuConfig, MenuItem, GroupMenuItem, LinkMenuItem } from '@/config/sidebar.config'
import { useAuth, withUser } from '@/hooks/common/use-auth'
import { canAccessPage } from '@/utils/auth.util'
import { SidebarLink } from './components/sidebar-link'
import { SidebarGroup } from './components/sidebar-group'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface MobileSidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function MobileSidebarComponent({ open, onOpenChange }: MobileSidebarProps) {
  const pathname = usePathname()
  const { accessiblePages } = useAuth()
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    sidebarMenuConfig.forEach(item => {
      if (item.type === 'group' && item.defaultOpen) {
        initial[item.id] = true
      }
    })
    return initial
  })

  // 根据用户权限过滤菜单项
  const filteredMenuConfig = sidebarMenuConfig
    .filter(item => {
      if (item.type === 'link') {
        return canAccessPage(item.href, accessiblePages || [])
      } else {
        const hasAccessibleChild = item.children.some(child =>
          canAccessPage(child.href, accessiblePages || [])
        )
        return hasAccessibleChild
      }
    })
    .map(item => {
      if (item.type === 'group') {
        return {
          ...item,
          children: item.children.filter(child => canAccessPage(child.href, accessiblePages || [])),
        }
      }
      return item
    }) as MenuItem[]

  const isActive = (href: string) => {
    if (!pathname) return false
    if (pathname === href) return true
    if (href !== '/admin' && pathname.startsWith(href)) {
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

  const handleLinkClick = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[300px] h-full max-h-screen m-0 p-0 gap-0 fixed left-0 top-0 translate-x-0 translate-y-0 data-[state=open]:slide-in-from-left [&>button]:hidden !top-0 !left-0 !translate-x-0 !translate-y-0 flex flex-col">
        <DialogHeader className="px-4 py-4 border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle>菜单</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        <nav className="flex-1 overflow-y-auto p-4 space-y-1 min-h-0">
          {filteredMenuConfig.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">暂无菜单项</p>
          ) : (
            filteredMenuConfig.map(item => {
              if (item.type === 'link') {
                return (
                  <div key={item.id} onClick={handleLinkClick}>
                    <SidebarLink item={item as LinkMenuItem} isActive={isActive} />
                  </div>
                )
              }
              const groupItem = item as GroupMenuItem
              return (
                <MobileSidebarGroup
                  key={groupItem.id}
                  item={groupItem}
                  isOpen={openGroups[groupItem.id] ?? false}
                  onToggle={toggleGroup}
                  isActive={isActive}
                  onLinkClick={handleLinkClick}
                />
              )
            })
          )}
        </nav>
      </DialogContent>
    </Dialog>
  )
}

// 移动端分组组件，支持点击子项后关闭
function MobileSidebarGroup({
  item,
  isOpen,
  onToggle,
  isActive,
  onLinkClick,
}: {
  item: GroupMenuItem
  isOpen: boolean
  onToggle: (groupId: string) => void
  isActive: (href: string) => boolean
  onLinkClick: () => void
}) {
  return (
    <SidebarGroup item={item} isOpen={isOpen} onToggle={onToggle} isActive={isActive}>
      {item.children.map((child: LinkMenuItem) => (
        <div key={child.id} onClick={onLinkClick}>
          <SidebarLink item={child} isActive={isActive} />
        </div>
      ))}
    </SidebarGroup>
  )
}

export const MobileSidebar = withUser(MobileSidebarComponent)
