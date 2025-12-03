'use client'

import Link from 'next/link'

interface NavLinksProps {
  isActive: (path: string) => boolean
}

export function NavLinks({ isActive }: NavLinksProps) {
  return (
    <nav className="hidden md:flex items-center space-x-1">
      <Link
        href="/"
        className={`relative px-4 py-2 text-sm font-medium transition-all duration-200 rounded-md ${
          isActive('/')
            ? 'text-foreground bg-accent'
            : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
        }`}
      >
        首页
        {isActive('/') && (
          <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
        )}
      </Link>
    </nav>
  )
}
