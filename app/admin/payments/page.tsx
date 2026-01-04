"use client"

import { useState, Suspense } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { FileCheck, Clock, CheckCircle, XCircle, Eye, MapPin, Loader2 } from "lucide-react"
import { usePaymentReceipts } from "@/lib/hooks/use-payment-receipts"

function AdminPaymentsContent() {
  const { receipts, isLoading, mutate } = usePaymentReceipts()
  const [processingId, setProcessingId] = useState<string | null>(null)

  const handleApprove = async (receiptId: string, lawyerId: string) => {
    setProcessingId(receiptId)
    try {
      const response = await fetch(`/api/admin/payments/${receiptId}/review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      })

      if (response.ok) {
        mutate()
      }
    } catch (error) {
      console.error("Error approving payment:", error)
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (receiptId: string) => {
    setProcessingId(receiptId)
    try {
      const response = await fetch(`/api/admin/payments/${receiptId}/review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected" }),
      })

      if (response.ok) {
        mutate()
      }
    } catch (error) {
      console.error("Error rejecting payment:", error)
    } finally {
      setProcessingId(null)
    }
  }

  const getTimeAgo = (date: string) => {
    const hours = Math.floor((Date.now() - new Date(date).getTime()) / 3600000)
    if (hours < 1) return "Just now"
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Payment Reviews</h1>
        <p className="text-muted-foreground">Review and approve lawyer subscription payments</p>
      </div>

      <div className="space-y-6">
        {/* Summary */}
        <Card className="bg-amber-500/10 border-amber-500/30 max-w-md">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{receipts.length} Pending Reviews</p>
              <p className="text-sm text-muted-foreground">Payment receipts awaiting verification</p>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Payment Cards */}
        {!isLoading && receipts.length === 0 ? (
          <div className="text-center py-12">
            <FileCheck className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <p className="text-muted-foreground mt-4">No pending payments</p>
            <p className="text-sm text-muted-foreground mt-1">All receipts have been reviewed</p>
          </div>
        ) : !isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {receipts.map((payment) => (
              <Card key={payment.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {(payment.lawyer?.full_name || "")
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold text-foreground">{payment.lawyer?.full_name}</h3>
                        <span className="text-xs text-muted-foreground">{getTimeAgo(payment.created_at)}</span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{payment.lawyer?.email}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {payment.lawyer?.city || "Not specified"}
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <Badge variant="secondary">{payment.subscription?.amount || 0} DZD</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-primary"
                          onClick={() => window.open(payment.receipt_url, "_blank")}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(payment.id, payment.lawyer_id)}
                          disabled={processingId === payment.id}
                          className="flex-1"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          {processingId === payment.id ? "..." : "Approve"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReject(payment.id)}
                          disabled={processingId === payment.id}
                          className="flex-1 text-destructive hover:text-destructive hover:bg-destructive/10 bg-transparent"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          {processingId === payment.id ? "..." : "Reject"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default function AdminPaymentsPage() {
  return (
    <Suspense fallback={null}>
      <AdminPaymentsContent />
    </Suspense>
  )
}
