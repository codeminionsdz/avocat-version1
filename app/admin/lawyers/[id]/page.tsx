"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MapPin, Mail, Calendar, Briefcase, Star, CheckCircle, XCircle, ArrowLeft, Loader2 } from "lucide-react"
import { categoryLabels } from "@/lib/mock-data"
import { useAdminLawyer } from "@/lib/hooks/use-admin-lawyers"
import type { LegalCategory } from "@/lib/database.types"

const statusConfig = {
  active: { label: "Active", className: "bg-emerald-500/10 text-emerald-600" },
  pending: { label: "Pending Approval", className: "bg-amber-500/10 text-amber-600" },
  inactive: { label: "Inactive", className: "bg-destructive/10 text-destructive" },
}

export default function AdminLawyerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { lawyer, isLoading } = useAdminLawyer(id)

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!lawyer) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Lawyer not found</p>
      </div>
    )
  }

  const handleActivate = async () => {
    console.log("TODO: Call API to activate lawyer")
  }

  const handleDeactivate = async () => {
    console.log("TODO: Call API to deactivate lawyer")
  }

  const status = statusConfig[lawyer.status as keyof typeof statusConfig]

  return (
    <div className="p-8">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6 -ml-2">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Lawyers
      </Button>

      <div className="max-w-3xl">
        {/* Profile Header */}
        <div className="flex items-start gap-6 mb-8">
          <Avatar className="h-24 w-24">
            <AvatarFallback className="bg-primary/10 text-primary text-2xl font-semibold">
              {(lawyer.profile?.full_name || "")
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{lawyer.profile?.full_name}</h1>
            <Badge className={`mt-2 ${status.className}`}>{status.label}</Badge>
            <p className="text-muted-foreground mt-2">{lawyer.bio}</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Contact Info */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <h3 className="font-semibold text-foreground mb-4">Contact Information</h3>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{lawyer.profile?.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{lawyer.profile?.city || "Not specified"}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Joined {new Date(lawyer.created_at).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-foreground mb-4">Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <Briefcase className="h-5 w-5 mx-auto text-primary" />
                  <p className="text-2xl font-bold text-foreground mt-2">{lawyer.consultations_count}</p>
                  <p className="text-xs text-muted-foreground">Consultations</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <Star className="h-5 w-5 mx-auto text-amber-500" />
                  <p className="text-2xl font-bold text-foreground mt-2">{lawyer.rating?.toFixed(1) || "N/A"}</p>
                  <p className="text-xs text-muted-foreground">Rating</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Specialties */}
        <Card className="mt-6">
          <CardContent className="p-4">
            <h3 className="font-semibold text-foreground mb-3">Specialties</h3>
            <div className="flex flex-wrap gap-2">
              {lawyer.specialties.map((spec) => (
                <Badge key={spec} variant="secondary" className="py-1.5 px-3">
                  {categoryLabels[spec as LegalCategory]}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-8">
          {lawyer.status === "pending" && (
            <>
              <Button onClick={handleActivate}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve & Activate
              </Button>
              <Button
                variant="outline"
                onClick={handleDeactivate}
                className="text-destructive hover:text-destructive hover:bg-destructive/10 bg-transparent"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </>
          )}
          {lawyer.status === "active" && (
            <Button
              variant="outline"
              onClick={handleDeactivate}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 bg-transparent"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Deactivate Account
            </Button>
          )}
          {lawyer.status === "inactive" && (
            <Button onClick={handleActivate}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Reactivate Account
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
