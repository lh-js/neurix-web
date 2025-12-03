'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { LinkMenuItem } from '@/config/sidebar.config'

interface SidebarLinkProps {
  item: LinkMenuItem
  isActive: (href: string) => boolean
}

export function SidebarLink({ item, isActive }: SidebarLinkProps) {
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
