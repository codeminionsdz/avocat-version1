import type React from "react"
import { MobileShell } from "@/components/mobile-shell"
import { BottomNav } from "@/components/bottom-nav"

export default function LawyerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <MobileShell>
      <div className="pb-20">{children}</div>
      <BottomNav role="lawyer" />
    </MobileShell>
  )
}
