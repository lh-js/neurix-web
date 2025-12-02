'use client'

import { ThemeProvider as Provider, useTheme } from '@/hooks/common/use-theme'
import { ReactNode, useEffect, useState } from 'react'
import { Toaster } from '@/components/ui/sonner'

export function ThemeProvider({ children }: { children: ReactNode }) {
  return <Provider>{children}</Provider>
}

export function ThemedToaster() {
  const { theme } = useTheme()
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    if (theme === 'system') {
      const mql = window.matchMedia('(prefers-color-scheme: dark)')
      const updateTheme = () => {
        setResolvedTheme(mql.matches ? 'dark' : 'light')
      }
      updateTheme()
      mql.addEventListener('change', updateTheme)
      return () => mql.removeEventListener('change', updateTheme)
    } else {
      setResolvedTheme(theme)
    }
  }, [theme])

  return <Toaster theme={resolvedTheme} />
}

