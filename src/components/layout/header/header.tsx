'use client'

import { useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { observer } from 'mobx-react-lite'
import { useAuth } from '@/hooks/common/use-auth'
import { useTheme } from '@/hooks/common/use-theme'
import { SiteLogo } from './components/site-logo'
import { NavLinks } from './components/nav-links'
import { ThemeToggle } from './components/theme-toggle'
import { UserDropdown } from './components/user-dropdown'

const Header = observer(() => {
  const { user, loading, logout } = useAuth()
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  const isActive = useCallback(
    (path: string) => {
      if (path === '/' && pathname === '/') return true
      if (path !== '/' && pathname?.startsWith(path)) return true
      return false
    },
    [pathname]
  )

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 shadow-sm">
      <div className="w-full flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-8">
          <SiteLogo />
          <NavLinks isActive={isActive} />
        </div>
        <div className="flex items-center space-x-3">
          <ThemeToggle theme={theme} onChange={setTheme} />
          <UserDropdown user={user} loading={loading} onLogout={logout} />
        </div>
      </div>
    </header>
  )
})

export default Header
