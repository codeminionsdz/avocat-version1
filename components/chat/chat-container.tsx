"use client"

import type { ReactNode } from "react"
import { useRef, useEffect } from "react"

interface ChatContainerProps {
  children: ReactNode
}

export function ChatContainer({ children }: ChatContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  })

  return (
    <div ref={containerRef} className="flex-1 px-4 py-4 space-y-4 overflow-y-auto">
      {children}
    </div>
  )
}
