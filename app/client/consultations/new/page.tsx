"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { CheckCircle, Calendar, Clock, Loader2 } from "lucide-react"
import { useLawyer } from "@/lib/hooks/use-lawyers"
import { createClient } from "@/lib/supabase/client"
import type { LegalCategory } from "@/lib/database.types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { mutate as globalMutate } from "swr"

const categoryLabels: Record<LegalCategory, string> = {
  criminal: "Criminal Law",
  family: "Family Law",
  civil: "Civil Law",
  commercial: "Commercial Law",
  administrative: "Administrative Law",
  labor: "Labor Law",
  immigration: "Immigration Law",
}

const allCategories: LegalCategory[] = [
  "criminal",
  "family",
  "civil",
  "commercial",
  "administrative",
  "labor",
  "immigration",
]

function NewConsultationContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const lawyerId = searchParams.get("lawyerId")
  const [message, setMessage] = useState("")
  const [category, setCategory] = useState<LegalCategory | "">("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { lawyer, isLoading } = useLawyer(lawyerId || "")

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!lawyer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Lawyer not found</p>
      </div>
    )
  }

  const handleSubmit = async () => {
    if (!category) {
      setError("Please select a legal category")
      return
    }

    if (!lawyerId) {
      setError("Lawyer ID is missing")
      return
    }

    setIsSubmitting(true)
    setError(null)

    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        // Redirect to login with return URL
        const returnUrl = encodeURIComponent(`/client/consultations/new?lawyerId=${lawyerId}`)
        router.push(`/auth/login?returnUrl=${returnUrl}`)
        return
      }

      console.log("[NewConsultation] Creating consultation:", {
        client_id: user.id,
        lawyer_id: lawyerId,
        category,
        description_length: message.length,
      })

      // Verify the lawyer exists and is active
      const { data: lawyerData, error: lawyerCheckError } = await supabase
        .from("lawyer_profiles")
        .select("id, status")
        .eq("id", lawyerId)
        .single()

      if (lawyerCheckError || !lawyerData) {
        console.error("[NewConsultation] Lawyer not found:", lawyerCheckError)
        setError("Lawyer not found. Please try again.")
        return
      }

      console.log("[NewConsultation] Lawyer check:", lawyerData)

      const { data: consultationData, error: insertError } = await supabase
        .from("consultations")
        .insert({
          client_id: user.id,
          lawyer_id: lawyerId,
          category: category,
          description: message,
          status: "pending",
          consultation_type: "chat", // Default to chat for this simple booking flow
          requested_duration: 30, // Default to 30 minutes
        })
        .select()
        .single()

      if (insertError) {
        console.error("[NewConsultation] Insert error:", insertError)
        throw insertError
      }

      console.log("[NewConsultation] Consultation created successfully:", consultationData)

      // Invalidate all consultation caches to refresh data
      await globalMutate((key) => {
        return typeof key === "string" && (key.includes("consultation") || key.includes("lawyer-consultations"))
      })

      console.log("[NewConsultation] Cache invalidated, redirecting...")

      router.push("/client/consultations")
    } catch (err) {
      console.error("[NewConsultation] Error:", err)
      setError(err instanceof Error ? err.message : "Failed to submit consultation request")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen pb-24">
      <Header title="Book Consultation" showBack />

      <div className="px-4 py-6 space-y-6">
        {/* Lawyer Info */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {lawyer.profile.full_name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">{lawyer.profile.full_name}</h3>
                  <CheckCircle className="h-4 w-4 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">{lawyer.profile.city || "Algeria"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Info */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-3 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-sm">Flexible scheduling</span>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-sm">Text chat only</span>
            </CardContent>
          </Card>
        </div>

        {/* Category Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">Legal Category</label>
          <Select value={category} onValueChange={(val) => setCategory(val as LegalCategory)}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {allCategories
                .filter((cat) => lawyer.specialties.includes(cat))
                .map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {categoryLabels[cat]}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        {/* Message Input */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">Describe your legal issue</label>
          <Textarea
            placeholder="Please provide details about your legal matter so the lawyer can better understand your needs..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[150px]"
          />
          <p className="text-xs text-muted-foreground">
            Be as detailed as possible. This information will be shared with the lawyer.
          </p>
        </div>

        {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}
      </div>

      {/* Submit Button */}
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
        <div className="max-w-md mx-auto">
          <Button
            onClick={handleSubmit}
            disabled={!message.trim() || !category || isSubmitting}
            className="w-full h-12"
          >
            {isSubmitting ? "Submitting request..." : "Submit Consultation Request"}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function NewConsultationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <NewConsultationContent />
    </Suspense>
  )
}
