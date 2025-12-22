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
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-center space-x-3">
        <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{title}</h1>
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  )
}
