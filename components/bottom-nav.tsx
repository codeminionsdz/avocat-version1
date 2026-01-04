"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, MessageSquare, User, Scale, LayoutDashboard, Users, FileCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import type { UserRole } from "@/lib/types"

interface BottomNavProps {
  role: UserRole
}

const clientTabs = [
  { href: "/client", icon: Home, label: "Home" },
  { href: "/client/lawyers", icon: Scale, label: "Lawyers" },
  { href: "/client/consultations", icon: MessageSquare, label: "Consults" },
  { href: "/client/profile", icon: User, label: "Profile" },
]

const lawyerTabs = [
  { href: "/lawyer", icon: Home, label: "Home" },
  { href: "/lawyer/requests", icon: FileCheck, label: "Requests" },
  { href: "/lawyer/chats", icon: MessageSquare, label: "Chats" },
  { href: "/lawyer/profile", icon: User, label: "Profile" },
]

const adminTabs = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/lawyers", icon: Users, label: "Lawyers" },
  { href: "/admin/payments", icon: FileCheck, label: "Payments" },
]

export function BottomNav({ role }: BottomNavProps) {
  const pathname = usePathname()

  const tabs = role === "client" ? clientTabs : role === "lawyer" ? lawyerTabs : adminTabs

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
      <div className="max-w-md mx-auto flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || pathname.startsWith(tab.href + "/")
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[64px]",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <tab.icon className={cn("h-5 w-5", isActive && "stroke-[2.5px]")} />
              <span className="text-xs font-medium">{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
