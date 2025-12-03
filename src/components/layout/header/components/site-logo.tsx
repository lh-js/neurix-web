'use client'

import Link from 'next/link'

export function SiteLogo() {
  return (
    <Link
      href="/"
      className="flex items-center space-x-2 group transition-all duration-200 hover:opacity-80"
    >
      <div className="relative">
        <span className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          Neurix
        </span>
        <span className="absolute inset-0 text-2xl font-bold bg-gradient-to-r from-foreground/20 to-foreground/10 bg-clip-text text-transparent blur-sm group-hover:blur-none transition-all duration-200">
          Neurix
        </span>
      </div>
    </Link>
  )
}
