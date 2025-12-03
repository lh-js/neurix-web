'use client'

export function FooterBottom({ year }: { year: number }) {
  return (
    <div className="flex flex-col items-center justify-between gap-3 md:flex-row pt-2">
      <p className="text-xs text-muted-foreground text-center md:text-left">
        © {year} Neurix. All rights reserved.
      </p>
      <div className="flex items-center space-x-4">
        <a
          href="#"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-200"
        >
          隐私政策
        </a>
        <a
          href="#"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-200"
        >
          服务条款
        </a>
      </div>
    </div>
  )
}
