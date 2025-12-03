'use client'

export function FooterBrand() {
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center space-x-2">
        <span className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          Neurix
        </span>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
        智能AI平台，为您提供强大的AI能力和优质的服务体验。
      </p>
    </div>
  )
}
