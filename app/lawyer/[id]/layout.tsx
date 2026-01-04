import type React from "react"

/**
 * PUBLIC LAWYER PROFILE LAYOUT
 * 
 * This layout provides public access to lawyer profiles without authentication.
 * It bypasses the protected /lawyer layout to allow:
 * - QR code scans
 * - Shared profile links
 * - Direct URL access
 * 
 * Routes under /lawyer/[id] are accessible to everyone.
 */
export default function PublicLawyerProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // No authentication check - this is a public route
  // No MobileShell or BottomNav - public viewers don't need lawyer navigation
  return <>{children}</>
}
