"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { MobileShell } from "@/components/mobile-shell"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle, CreditCard, Upload, Loader2, Copy, Check } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useLawyerProfile } from "@/lib/hooks/use-lawyer-profile"
import { useAuth } from "@/lib/auth-context"

export default function SubscriptionPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user } = useAuth()
  const [hasUploaded, setHasUploaded] = useState(false)
  const [uploadedFileName, setUploadedFileName] = useState("")
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const { subscription, isLoading } = useLawyerProfile()

  const subscriptionStatus = subscription?.status || "inactive"

  const statusConfig = {
    active: {
      icon: CheckCircle,
      title: "Subscription Active",
      description: subscription?.ends_at
        ? `Your subscription is active until ${new Date(subscription.ends_at).toLocaleDateString()}`
        : "Your subscription is active",
      badgeClass: "bg-emerald-500/10 text-emerald-600",
    },
    inactive: {
      icon: CreditCard,
      title: "Subscription Required",
      description: "Subscribe to start receiving consultation requests from clients",
      badgeClass: "bg-amber-500/10 text-amber-600",
    },
    pending: {
      icon: AlertCircle,
      title: "Payment Under Review",
      description: "Your payment receipt is being reviewed by our admin team",
      badgeClass: "bg-amber-500/10 text-amber-600",
    },
    expired: {
      icon: AlertCircle,
      title: "Subscription Expired",
      description: "Your subscription has expired. Please renew to continue.",
      badgeClass: "bg-destructive/10 text-destructive",
    },
    cancelled: {
      icon: AlertCircle,
      title: "Subscription Cancelled",
      description: "Your subscription has been cancelled.",
      badgeClass: "bg-muted text-muted-foreground",
    },
  }

  const status = statusConfig[subscriptionStatus as keyof typeof statusConfig] || statusConfig.inactive
  const StatusIcon = status.icon

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const userEmail = user?.email || ""
  const reference = `AVOCA-SUB-${userEmail}`

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setReceiptFile(file)
      setUploadedFileName(file.name)
      setHasUploaded(true)
    }
  }

  const handleSubmit = async () => {
    if (!receiptFile) return

    setIsSubmitting(true)
    setError(null)

    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setError("You must be logged in")
        return
      }

      // Upload receipt to storage FIRST
      const fileExt = receiptFile.name.split(".").pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from("receipts")
        .upload(fileName, receiptFile)

      if (uploadError) {
        console.error("[Subscription] Storage upload error:", uploadError)
        
        // If bucket doesn't exist, create it
        if (uploadError.message?.includes("not found") || uploadError.message?.includes("does not exist")) {
          throw new Error("Storage bucket 'receipts' not configured. Please contact admin.")
        }
        
        throw new Error(`Failed to upload receipt: ${uploadError.message}`)
      }

      if (!uploadData?.path) {
        throw new Error("Receipt uploaded but no path returned")
      }

      const receiptUrl = supabase.storage.from("receipts").getPublicUrl(uploadData.path).data.publicUrl

      // Create subscription record
      const { data: subData, error: subError } = await supabase
        .from("subscriptions")
        .insert({
          lawyer_id: user.id,
          plan: "annual",
          amount: 15000,
          status: "pending",
        })
        .select()
        .single()

      if (subError) {
        console.error("[Subscription] DB insert error:", subError)
        throw new Error(`Failed to create subscription: ${subError.message}`)
      }

      if (!subData) {
        throw new Error("Subscription created but no data returned")
      }

      // Create payment receipt record - CRITICAL: This must succeed
      const { error: receiptError, data: receiptData } = await supabase
        .from("payment_receipts")
        .insert({
          subscription_id: subData.id,
          lawyer_id: user.id,
          receipt_url: receiptUrl,
          status: "pending",
        })
        .select()
        .single()

      if (receiptError) {
        console.error("[Subscription] Payment receipt insert error:", receiptError)
        throw new Error(`Failed to create payment receipt: ${receiptError.message}`)
      }

      if (!receiptData) {
        throw new Error("Payment receipt created but no data returned")
      }

      console.log("[Subscription] Success:", {
        subscription_id: subData.id,
        receipt_id: receiptData.id,
        lawyer_id: user.id,
      })

      router.push("/lawyer/subscription/pending")
    } catch (err) {
      console.error("[Subscription] Error:", err)
      setError(err instanceof Error ? err.message : "Failed to submit payment receipt")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <MobileShell>
        <Header title="Subscription" showBack />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MobileShell>
    )
  }

  const showPaymentFlow = subscriptionStatus === "inactive" || subscriptionStatus === "expired"

  return (
    <MobileShell>
      <Header title="Subscription" showBack />
      <div className="px-6 py-6 space-y-6">
        {/* Status Card */}
        <Card>
          <CardContent className="p-6 text-center">
            <div
              className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center ${subscriptionStatus === "active" ? "bg-emerald-500/10" : "bg-amber-500/10"}`}
            >
              <StatusIcon
                className={`h-8 w-8 ${subscriptionStatus === "active" ? "text-emerald-600" : "text-amber-600"}`}
              />
            </div>
            <h2 className="text-lg font-semibold text-foreground mt-4">{status.title}</h2>
            <p className="text-sm text-muted-foreground mt-2">{status.description}</p>
            <Badge className={`mt-4 ${status.badgeClass}`}>
              {subscriptionStatus === "active"
                ? "Active"
                : subscriptionStatus === "pending"
                  ? "Pending"
                  : subscriptionStatus === "expired"
                    ? "Expired"
                    : "Required"}
            </Badge>
          </CardContent>
        </Card>

        {/* Subscription Plan */}
        <Card className="border-primary">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Professional Plan</h3>
              <Badge>Popular</Badge>
            </div>
            <div className="mb-4">
              <span className="text-3xl font-bold text-foreground">15,000 DZD</span>
              <span className="text-muted-foreground">/year</span>
            </div>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <span>Unlimited consultation requests</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <span>Featured in lawyer listings</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <span>In-app chat with clients</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <span>Profile verification badge</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Payment Instructions */}
        {showPaymentFlow && (
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-6">
              <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Payment Instructions
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Transfer the subscription fee to the following account and upload your payment receipt:
              </p>
              
              <div className="space-y-3 bg-card rounded-lg p-4 border">
                {/* Bank Name */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Bank:</span>
                  <span className="font-medium">CPA Algeria</span>
                </div>
                
                {/* RIP Account */}
                <div className="flex justify-between items-center gap-2">
                  <span className="text-sm text-muted-foreground">RIP:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-medium text-sm">007 99999 0044057865 72</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0"
                      onClick={() => copyToClipboard("00799999004405786572", "rip")}
                    >
                      {copiedField === "rip" ? (
                        <Check className="h-3 w-3 text-emerald-600" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Beneficiary */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Beneficiary:</span>
                  <span className="font-medium">Ouail Rouabia</span>
                </div>

                {/* Amount */}
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-sm text-muted-foreground">Amount:</span>
                  <span className="font-bold text-lg text-primary">15,000 DZD</span>
                </div>

                {/* Reference */}
                <div className="flex flex-col gap-1 pt-2 border-t">
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-muted-foreground">Reference:</span>
                    <div className="flex items-center gap-2 flex-1 justify-end">
                      <span className="font-mono text-xs text-right break-all">{reference}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 flex-shrink-0"
                        onClick={() => copyToClipboard(reference, "ref")}
                      >
                        {copiedField === "ref" ? (
                          <Check className="h-3 w-3 text-emerald-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground italic text-right">
                    Please include this reference in your transfer
                  </p>
                </div>
              </div>

              <div className="mt-4 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                <p className="text-xs text-amber-900 dark:text-amber-100">
                  ⏱️ Payments are reviewed manually within <strong>24–48 hours</strong>
                </p>
              </div>

              <div className="mt-3 text-center">
                <p className="text-xs text-muted-foreground">
                  Online payment methods (CIB / Edahabia) coming soon
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upload Receipt */}
        {showPaymentFlow && (
          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                hasUploaded ? "border-emerald-500 bg-emerald-500/5" : "border-border hover:border-primary/50"
              }`}
            >
              {hasUploaded ? (
                <>
                  <CheckCircle className="h-10 w-10 mx-auto text-emerald-600" />
                  <p className="mt-3 font-medium text-foreground">Receipt Uploaded</p>
                  <p className="text-sm text-muted-foreground mt-1">{uploadedFileName}</p>
                </>
              ) : (
                <>
                  <Upload className="h-10 w-10 mx-auto text-muted-foreground" />
                  <p className="mt-3 font-medium text-foreground">Upload Payment Receipt</p>
                  <p className="text-sm text-muted-foreground mt-1">PDF, JPG or PNG (max 5MB)</p>
                </>
              )}
            </div>

            {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}

            <Button onClick={handleSubmit} disabled={!hasUploaded || isSubmitting} className="w-full h-12">
              {isSubmitting ? "Submitting..." : "Submit for Review"}
            </Button>
          </div>
        )}
      </div>
    </MobileShell>
  )
}
