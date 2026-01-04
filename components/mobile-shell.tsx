"use client"

import type { ReactNode } from "react"

interface MobileShellProps {
  children: ReactNode
  className?: string
}

export function MobileShell({ children, className = "" }: MobileShellProps) {
  return <div className={`mobile-container bg-background ${className}`}>{children}</div>
}
