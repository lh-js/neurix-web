'use client'

import { ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'

interface PageHeaderProps {
  icon: LucideIcon
  title: string
  actions?: ReactNode
}

export function PageHeader({ icon: Icon, title, actions }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <Icon className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold text-foreground">{title}</h1>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}
