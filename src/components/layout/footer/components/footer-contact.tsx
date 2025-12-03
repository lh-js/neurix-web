'use client'

export function FooterContact() {
  return (
    <div className="flex flex-col space-y-4">
      <h3 className="text-sm font-semibold text-foreground">联系我们</h3>
      <div className="flex flex-col space-y-3">
        <a
          href="mailto:support@neurix.com"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 w-fit"
        >
          support@neurix.com
        </a>
        <a
          href="#"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 w-fit"
        >
          意见反馈
        </a>
      </div>
    </div>
  )
}
