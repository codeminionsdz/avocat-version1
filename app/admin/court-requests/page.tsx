"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { CourtLevel, CourtLevelRequest } from "@/lib/database.types"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { CheckCircle2, XCircle, Clock, Building2, User, Calendar, FileText, Loader2 } from "lucide-react"

const courtLevelLabels: Record<CourtLevel, { label: string; arabic: string }> = {
  first_instance: { label: "First Instance Court", arabic: "محكمة الدرجة الأولى" },
  appeal: { label: "Court of Appeal", arabic: "محكمة الاستئناف" },
  supreme_court: { label: "Supreme Court", arabic: "المحكمة العليا" },
  council_of_state: { label: "Council of State", arabic: "مجلس الدولة" },
}

type RequestWithLawyer = CourtLevelRequest & {
  lawyer_profiles?: {
    full_name: string
    bar_number: string
    city: string
  }
}

export default function AdminCourtRequestsPage() {
  const [requests, setRequests] = useState<RequestWithLawyer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const loadRequests = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      const { data: requests, error: fetchError } = await supabase
        .from("court_level_requests")
        .select("*")
        .order("created_at", { ascending: false })

      if (fetchError) throw fetchError

      if (!requests || requests.length === 0) {
        setRequests([])
        return
      }

      // Fetch lawyer profiles and user profiles separately
      const lawyerIds = [...new Set(requests.map((r) => r.lawyer_id))]
      
      const { data: lawyerProfiles } = await supabase
        .from("lawyer_profiles")
        .select("id, bar_number, city")
        .in("id", lawyerIds)

      const { data: userProfiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", lawyerIds)

      // Create maps
      const lawyerMap = new Map(lawyerProfiles?.map((p) => [p.id, p]) || [])
      const userMap = new Map(userProfiles?.map((p) => [p.id, p]) || [])

      // Combine the data
      const requestsWithLawyers = requests.map((request) => {
        const lawyer = lawyerMap.get(request.lawyer_id)
        const user = userMap.get(request.lawyer_id)
        
        return {
          ...request,
          lawyer_profiles: lawyer && user ? {
            full_name: user.full_name,
            bar_number: lawyer.bar_number,
            city: lawyer.city,
          } : undefined,
        }
      })

      setRequests(requestsWithLawyers)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load requests")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadRequests()
  }, [])

  const handleApprove = async (request: RequestWithLawyer) => {
    setProcessingId(request.id)
    setError(null)
    setSuccess(null)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("Not authenticated")

      // Get current authorized_courts
      const { data: lawyerData, error: fetchError } = await supabase
        .from("lawyer_profiles")
        .select("authorized_courts")
        .eq("id", request.lawyer_id)
        .single()

      if (fetchError) throw fetchError

      const currentCourts = (lawyerData.authorized_courts as string[]) || []

      // Add the requested level if not already present
      const updatedCourts = currentCourts.includes(request.requested_level)
        ? currentCourts
        : [...currentCourts, request.requested_level]

      // Update lawyer_profiles
      const { error: updateError } = await supabase
        .from("lawyer_profiles")
        .update({ authorized_courts: updatedCourts })
        .eq("id", request.lawyer_id)

      if (updateError) throw updateError

      // Update request status
      const { error: requestError } = await supabase
        .from("court_level_requests")
        .update({
          status: "approved",
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          admin_notes: adminNotes[request.id] || null,
        })
        .eq("id", request.id)

      if (requestError) throw requestError

      setSuccess(`Approved ${courtLevelLabels[request.requested_level].label} authorization`)
      await loadRequests()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve request")
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (request: RequestWithLawyer) => {
    setProcessingId(request.id)
    setError(null)
    setSuccess(null)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("Not authenticated")

      const { error: requestError } = await supabase
        .from("court_level_requests")
        .update({
          status: "rejected",
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          admin_notes: adminNotes[request.id] || "Request rejected",
        })
        .eq("id", request.id)

      if (requestError) throw requestError

      setSuccess(`Rejected ${courtLevelLabels[request.requested_level].label} authorization request`)
      await loadRequests()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reject request")
    } finally {
      setProcessingId(null)
    }
  }

  const pendingRequests = requests.filter((r) => r.status === "pending")
  const reviewedRequests = requests.filter((r) => r.status !== "pending")

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24">
      <Header title="Court Authorization Requests" showBack />

      <div className="px-4 py-6 space-y-6">
        {error && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="p-3 text-sm text-destructive">{error}</CardContent>
          </Card>
        )}

        {success && (
          <Card className="border-emerald-500/50 bg-emerald-500/5">
            <CardContent className="p-3 text-sm text-emerald-600">{success}</CardContent>
          </Card>
        )}

        {/* Pending Requests */}
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-600" />
            Pending Requests ({pendingRequests.length})
          </h2>

          {pendingRequests.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No pending requests at this time.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <Card key={request.id} className="border-amber-500/50">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      {courtLevelLabels[request.requested_level].label}
                      <Badge variant="outline" className="ml-auto text-amber-600 border-amber-600">
                        Pending Review
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Lawyer Info */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{request.lawyer_profiles?.full_name || "Unknown"}</span>
                      </div>
                      <div className="flex items-center gap-4 text-muted-foreground text-xs">
                        <span>Bar: {request.lawyer_profiles?.bar_number}</span>
                        <span>City: {request.lawyer_profiles?.city}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground text-xs">
                        <Calendar className="h-3 w-3" />
                        Requested: {new Date(request.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Justification */}
                    {request.justification && (
                      <div className="space-y-2">
                        <Label className="text-xs flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          Justification
                        </Label>
                        <Card className="bg-muted/30">
                          <CardContent className="p-3 text-sm whitespace-pre-wrap">{request.justification}</CardContent>
                        </Card>
                      </div>
                    )}

                    {/* Admin Notes */}
                    <div className="space-y-2">
                      <Label htmlFor={`notes-${request.id}`} className="text-xs">
                        Admin Notes (Optional)
                      </Label>
                      <textarea
                        id={`notes-${request.id}`}
                        className="w-full min-h-[80px] px-3 py-2 text-sm rounded-md border border-input bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="Add notes about this decision..."
                        value={adminNotes[request.id] || ""}
                        onChange={(e) =>
                          setAdminNotes((prev) => ({
                            ...prev,
                            [request.id]: e.target.value,
                          }))
                        }
                        disabled={processingId === request.id}
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <Button
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => handleApprove(request)}
                        disabled={processingId === request.id}
                      >
                        {processingId === request.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Approve
                          </>
                        )}
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={() => handleReject(request)}
                        disabled={processingId === request.id}
                      >
                        {processingId === request.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Reviewed Requests */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Recent Decisions ({reviewedRequests.length})</h2>

          {reviewedRequests.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No reviewed requests yet.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {reviewedRequests.slice(0, 10).map((request) => (
                <Card key={request.id} className={request.status === "approved" ? "border-emerald-500/30" : "border-destructive/30"}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">{request.lawyer_profiles?.full_name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {courtLevelLabels[request.requested_level].label}
                        </div>
                        {request.admin_notes && (
                          <div className="text-xs text-muted-foreground mt-1 italic">{request.admin_notes}</div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge
                          variant={request.status === "approved" ? "default" : "destructive"}
                          className={request.status === "approved" ? "bg-emerald-500" : ""}
                        >
                          {request.status === "approved" ? (
                            <>
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Approved
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3 mr-1" />
                              Rejected
                            </>
                          )}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(request.reviewed_at!).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
