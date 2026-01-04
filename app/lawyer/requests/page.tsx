"use client"

import { Header } from "@/components/header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Clock, Check, X, Loader2 } from "lucide-react"
import { useLawyerConsultations } from "@/lib/hooks/use-consultations"
import { createClient } from "@/lib/supabase/client"
import type { LegalCategory } from "@/lib/database.types"

const categoryLabels: Record<LegalCategory, string> = {
  criminal: "Criminal Law",
  family: "Family Law",
  civil: "Civil Law",
  commercial: "Commercial Law",
  administrative: "Administrative Law",
  labor: "Labor Law",
  immigration: "Immigration Law",
}

function RequestCard({
  consultation,
  onUpdate,
}: {
  consultation: {
    id: string
    category: LegalCategory
    description: string
    created_at: string
    client: { full_name: string; id?: string }
  }
  onUpdate: () => void
}) {
  const handleAccept = async () => {
    const supabase = createClient()
    await supabase.from("consultations").update({ status: "accepted" }).eq("id", consultation.id)
    onUpdate()
  }

  const handleDecline = async () => {
    const supabase = createClient()
    await supabase.from("consultations").update({ status: "declined" }).eq("id", consultation.id)
    onUpdate()
  }

  const getTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr)
    const hours = Math.floor((Date.now() - date.getTime()) / 3600000)
    if (hours < 1) return "Just now"
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-primary/10 text-primary">
              {(consultation.client?.full_name || "UC")
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold text-foreground">{consultation.client?.full_name || "Unknown Client"}</h3>
              <span className="text-xs text-muted-foreground">{getTimeAgo(consultation.created_at)}</span>
            </div>
            <Badge variant="secondary" className="mt-1 text-xs">
              {categoryLabels[consultation.category]}
            </Badge>
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{consultation.description}</p>

            <div className="flex gap-2 mt-4">
              <Button size="sm" onClick={handleAccept} className="flex-1">
                <Check className="h-4 w-4 mr-1" />
                Accept
              </Button>
              <Button size="sm" variant="outline" onClick={handleDecline} className="flex-1 bg-transparent">
                <X className="h-4 w-4 mr-1" />
                Decline
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function LawyerRequestsPage() {
  const { consultations, isLoading, mutate } = useLawyerConsultations("pending")

  console.log("[LawyerRequestsPage] Consultations:", consultations.length, consultations)

  // Show all consultations, provide fallback for missing client data
  const displayConsultations = (consultations || []).map(c => {
    if (!c.client) {
      console.warn("[LawyerRequestsPage] Consultation without client profile:", c.id, "client_id:", c.client_id)
      return {
        ...c,
        client: { 
          id: c.client_id,
          full_name: "Unknown Client",
          phone_number: null,
          role: "client" as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      }
    }
    return c
  })

  console.log("[LawyerRequestsPage] Display consultations:", displayConsultations.length)

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header title="Consultation Requests" showNotifications />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header title="Consultation Requests" showNotifications />

      <div className="px-4 py-4 space-y-4">
        {displayConsultations.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <p className="text-muted-foreground mt-4">No pending requests</p>
            <p className="text-sm text-muted-foreground mt-1">New requests will appear here</p>
          </div>
        ) : (
          displayConsultations.map((consultation) => (
            <RequestCard key={consultation.id} consultation={consultation} onUpdate={mutate} />
          ))
        )}
      </div>
    </div>
  )
}
