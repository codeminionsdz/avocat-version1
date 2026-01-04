"use client"

import { ChevronLeft, Bell } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useUnreadMessages } from "@/lib/hooks/use-notifications"

interface HeaderProps {
  title: string
  showBack?: boolean
  showNotifications?: boolean
}

export function Header({ title, showBack = false, showNotifications = false }: HeaderProps) {
  const router = useRouter()
  const { unreadCount } = useUnreadMessages()

  return (
    <header className="sticky top-0 z-40 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 border-b border-border">
      <div className="flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-2">
          {showBack && (
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="-ml-2">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
          <h1 className="text-lg font-semibold text-foreground">{title}</h1>
        </div>
        {showNotifications && (
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </Badge>
            )}
          </Button>
        )}
      </div>
    </header>
  )
}
