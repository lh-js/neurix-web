'use client'

import Link from 'next/link'

interface FooterLink {
  label: string
  href: string
  external?: boolean
}

interface FooterLinksSectionProps {
  title: string
  links: FooterLink[]
}

export function FooterLinksSection({ title, links }: FooterLinksSectionProps) {
  return (
    <div className="flex flex-col space-y-4">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <nav className="flex flex-col space-y-3">
        {links.map(link =>
          link.external ? (
            <a
              key={link.label}
              href={link.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 w-fit"
            >
              {link.label}
            </a>
          ) : (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 w-fit"
            >
              {link.label}
            </Link>
          )
        )}
      </nav>
    </div>
  )
}
