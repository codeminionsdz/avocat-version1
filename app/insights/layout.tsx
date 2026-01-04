'use client'

import type React from "react"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { MobileShell } from "@/components/mobile-shell"
import { BottomNav } from "@/components/bottom-nav"
import type { UserRole } from "@/lib/types"

export default function InsightsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [userRole, setUserRole] = useState<UserRole | null>(null)

  useEffect(() => {
    const fetchUserRole = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()
        
        if (profile) {
          setUserRole(profile.role as UserRole)
        }
      } else {
        // Default to client role for non-authenticated users
        setUserRole('client')
      }
    }

    fetchUserRole()
  }, [])

  // Don't render bottom nav until we know the role
  if (userRole === null) {
    return <MobileShell>{children}</MobileShell>
  }

  return (
    <MobileShell>
      <div className="pb-20">{children}</div>
      <BottomNav role={userRole} />
    </MobileShell>
  )
}
