"use client"

import { Header } from "@/components/header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MessageSquare, Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useClientConsultations } from "@/lib/hooks/use-consultations"
import type { LegalCategory, ConsultationStatus } from "@/lib/database.types"

const categoryLabels: Record<LegalCategory, string> = {
  criminal: "Criminal Law",
  family: "Family Law",
  civil: "Civil Law",
  commercial: "Commercial Law",
  administrative: "Administrative Law",
  labor: "Labor Law",
  immigration: "Immigration Law",
}

const statusConfig: Record<ConsultationStatus, { label: string; icon: typeof Clock; className: string }> = {
  pending: { label: "Pending", icon: Clock, className: "bg-amber-500/10 text-amber-600" },
  accepted: { label: "Active", icon: MessageSquare, className: "bg-emerald-500/10 text-emerald-600" },
  declined: { label: "Declined", icon: XCircle, className: "bg-destructive/10 text-destructive" },
  completed: { label: "Completed", icon: CheckCircle2, className: "bg-muted text-muted-foreground" },
  cancelled: { label: "Cancelled", icon: XCircle, className: "bg-muted text-muted-foreground" },
}

export default function ConsultationsPage() {
  const router = useRouter()
  const { consultations, isLoading } = useClientConsultations()

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header title="My Consultations" showNotifications />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header title="My Consultations" showNotifications />

      <div className="px-4 py-4 space-y-4">
        {consultations.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <p className="text-muted-foreground mt-4">No consultations yet</p>
            <p className="text-sm text-muted-foreground mt-1">Start by describing your legal issue</p>
          </div>
        ) : (
          consultations.map((consultation) => {
            const status = statusConfig[consultation.status]
            const StatusIcon = status.icon

            return (
              <Card
                key={consultation.id}
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => {
                  if (consultation.status === "accepted") {
                    router.push(`/client/chat/${consultation.id}`)
                  }
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {consultation.lawyer.full_name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold text-foreground truncate">{consultation.lawyer.full_name}</h3>
                        <Badge className={`${status.className} flex items-center gap-1`}>
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </Badge>
                      </div>
                      <Badge variant="secondary" className="mt-1 text-xs">
                        {categoryLabels[consultation.category]}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{consultation.description}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(consultation.created_at).toLocaleDateString()}
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
