'use client'

import { useCallback, useState } from 'react'
import { usePathname } from 'next/navigation'
import { observer } from 'mobx-react-lite'
import { useAuth } from '@/hooks/common/use-auth'
import { useTheme } from '@/hooks/common/use-theme'
import { SiteLogo } from './components/site-logo'
import { NavLinks } from './components/nav-links'
import { ThemeToggle } from './components/theme-toggle'
import { UserDropdown } from './components/user-dropdown'
import { MobileSidebar } from '@/components/layout/sidebar/mobile-sidebar'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'
import { shouldShowSidebar } from '@/config/auth.config'

const Header = observer(() => {
  const { user, loading, logout } = useAuth()
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const showSidebar = shouldShowSidebar(pathname || '')

  const isActive = useCallback(
    (path: string) => {
      if (path === '/' && pathname === '/') return true
      if (path !== '/' && pathname?.startsWith(path)) return true
      return false
    },
    [pathname]
  )

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 shadow-sm">
        <div className="w-full flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 sm:gap-4 lg:space-x-8">
            {showSidebar && (
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileSidebarOpen(true)}
                aria-label="打开菜单"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
            <SiteLogo />
            <NavLinks isActive={isActive} />
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3">
            <ThemeToggle theme={theme} onChange={setTheme} />
            <UserDropdown user={user} loading={loading} onLogout={logout} />
          </div>
        </div>
      </header>
      {showSidebar && (
        <MobileSidebar open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen} />
      )}
    </>
  )
})

export default Header
