'use client'

import { ChevronDown, ChevronRight } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import type { GroupMenuItem, LinkMenuItem } from '@/config/sidebar.config'
import { SidebarLink } from './sidebar-link'

interface SidebarGroupProps {
  item: GroupMenuItem
  isOpen: boolean
  onToggle: (groupId: string) => void
  isActive: (href: string) => boolean
}

export function SidebarGroup({ item, isOpen, onToggle, isActive }: SidebarGroupProps) {
  const Icon = item.icon

  return (
    <Collapsible
      key={item.id}
      open={isOpen}
      onOpenChange={() => onToggle(item.id)}
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
        {item.children.map((child: LinkMenuItem) => (
          <SidebarLink key={child.id} item={child} isActive={isActive} />
        ))}
      </CollapsibleContent>
    </Collapsible>
  )
}
