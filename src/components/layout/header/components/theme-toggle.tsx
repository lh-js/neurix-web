'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

type ThemeMode = 'light' | 'dark' | 'system'

interface ThemeToggleProps {
  theme: ThemeMode
  onChange: (mode: ThemeMode) => void
}

export function ThemeToggle({ theme, onChange }: ThemeToggleProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="w-9 h-9 rounded-full hover:bg-accent transition-colors"
          aria-label="切换主题"
        >
          <span className="text-lg">
            {theme === 'light' && '🌞'}
            {theme === 'dark' && '🌙'}
            {theme === 'system' && '💻'}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuLabel className="text-xs text-muted-foreground">主题</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer" onClick={() => onChange('light')}>
          明亮主题{' '}
          {theme === 'light' && <span className="ml-auto text-xs text-primary">正在使用</span>}
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer" onClick={() => onChange('dark')}>
          暗黑主题{' '}
          {theme === 'dark' && <span className="ml-auto text-xs text-primary">正在使用</span>}
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer" onClick={() => onChange('system')}>
          跟随系统{' '}
          {theme === 'system' && <span className="ml-auto text-xs text-primary">正在使用</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
