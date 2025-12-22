"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface TooltipProps {
  children: React.ReactNode
  content: string
  side?: "top" | "bottom" | "left" | "right"
  className?: string
}

export function Tooltip({ children, content, side = "top", className }: TooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false)

  const sideClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  }

  const arrowClasses = {
    top: "top-full left-1/2 -translate-x-1/2 border-t-popover",
    bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-popover",
    left: "left-full top-1/2 -translate-y-1/2 border-l-popover",
    right: "right-full top-1/2 -translate-y-1/2 border-r-popover",
  }

  return (
    <div
      className={cn("relative inline-block", className)}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && content && (
        <div
          className={cn(
            "absolute z-50 px-2 py-1.5 text-xs text-popover-foreground bg-popover border border-border rounded-md shadow-lg whitespace-nowrap pointer-events-none animate-in fade-in-0 zoom-in-95 duration-200",
            sideClasses[side]
          )}
        >
          {content}
          <div
            className={cn(
              "absolute w-0 h-0 border-4 border-transparent",
              arrowClasses[side]
            )}
          />
        </div>
      )}
    </div>
  )
}

