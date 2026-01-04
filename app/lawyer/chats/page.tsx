"use client"

import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Loader2 } from "lucide-react"
import { useLawyerConsultations } from "@/lib/hooks/use-consultations"

export default function LawyerChatsPage() {
  const router = useRouter()
  // Get all consultations except pending and declined ones (show accepted, completed, cancelled with messages)
  // Updated: Fixed null client issue
  const { consultations: rawConsultations, isLoading } = useLawyerConsultations()

  // Filter out consultations with null clients immediately
  const consultations = rawConsultations?.filter((c) => c && c.id && c.client) || []

  // Debug: Log consultations data with detailed client info
  console.log("[LawyerChatsPage] Consultations:", consultations?.length)
  consultations?.forEach(c => {
    console.log("[LawyerChatsPage] Consultation:", {
      id: c.id,
      has_client: !!c.client,
      client_id: c.client_id,
      full_name: c.client?.full_name,
      phone: c.client?.phone,
      email: c.client?.email,
      entire_client: c.client
    })
  })

  const getTimeDisplay = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      const now = new Date()
      const diff = now.getTime() - date.getTime()
      const minutes = Math.floor(diff / 60000)
      const hours = Math.floor(diff / 3600000)

      if (minutes < 60) return `${minutes}m`
      if (hours < 24) return `${hours}h`
      return date.toLocaleDateString()
    } catch {
      return "N/A"
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header title="Chats" showNotifications />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header title="Chats" showNotifications />

      <div className="px-4 py-4 space-y-2">
        {!consultations || consultations.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <p className="text-muted-foreground mt-4">No active chats</p>
            <p className="text-sm text-muted-foreground mt-1">Accept requests to start chatting</p>
          </div>
        ) : (
          consultations.map((consultation) => {
            const client = consultation.client
            // Display client name, phone, or email as fallback
            const clientName = client?.full_name || client?.phone || client?.email || "عميل غير معروف"
            const clientPhone = client?.phone || ""
            const lastMessage = consultation.last_message
            const unreadCount = consultation.unread_count || 0
            
            let initials = "عم"
            try {
              if (clientName && clientName !== "عميل غير معروف") {
                // If name contains Arabic letters, use first letter of each word
                // If phone number, use first 2 digits
                if (/^[\d\s\-+()]+$/.test(clientName)) {
                  initials = clientName.replace(/\D/g, '').slice(0, 2) || "عم"
                } else {
                  const nameParts = clientName.trim().split(/\s+/)
                  initials = nameParts.slice(0, 2).map((n) => n[0]).join("").toUpperCase()
                }
              }
            } catch {
              initials = "عم"
            }

            // Display last message or consultation description
            const displayText = lastMessage 
              ? lastMessage.content 
              : consultation.description

            return (
              <Card
                key={consultation.id}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => router.push(`/lawyer/chats/${consultation.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary/10 text-primary">{initials}</AvatarFallback>
                      </Avatar>
                      {unreadCount > 0 && (
                        <Badge 
                          variant="destructive" 
                          className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                        >
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </Badge>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-foreground">{clientName}</h3>
                          {clientPhone && <p className="text-xs text-muted-foreground">{clientPhone}</p>}
                        </div>
                        <span className="text-xs text-muted-foreground">{getTimeDisplay(consultation.updated_at)}</span>
                      </div>
                      <p className={`text-sm mt-1 truncate ${unreadCount > 0 ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                        {displayText}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
