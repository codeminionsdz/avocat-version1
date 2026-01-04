"use client"

import { useState, use } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, CheckCircle, Briefcase, Calendar, Loader2 } from "lucide-react"
import { useLawyer } from "@/lib/hooks/use-lawyers"
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

export default function LawyerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [isBooking, setIsBooking] = useState(false)

  const { lawyer, isLoading } = useLawyer(id)

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

  const handleBookConsultation = () => {
    setIsBooking(true)
    router.push(`/client/consultations/new?lawyerId=${id}`)
  }

  const yearsOnPlatform = Math.max(1, new Date().getFullYear() - new Date(lawyer.created_at).getFullYear())

  return (
    <div className="min-h-screen pb-24">
      <Header title="Lawyer Profile" showBack />

      <div className="px-4 py-6 space-y-6">
        {/* Profile Header */}
        <div className="flex flex-col items-center text-center">
          <Avatar className="h-24 w-24">
            <AvatarFallback className="bg-primary/10 text-primary text-2xl font-semibold">
              {lawyer.profile.full_name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="mt-4">
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-xl font-bold text-foreground">{lawyer.profile.full_name}</h1>
              <CheckCircle className="h-5 w-5 text-primary" />
            </div>
            <div className="flex items-center justify-center gap-4 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                {lawyer.rating.toFixed(1)} rating
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {lawyer.profile.city || "Algeria"}
              </span>
            </div>
          </div>
        </div>

        {/* Availability Badge */}
        <div className="flex justify-center">
          <span
            className={`text-sm px-4 py-2 rounded-full ${
              lawyer.is_available ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"
            }`}
          >
            {lawyer.is_available ? "Available for consultations" : "Currently unavailable"}
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Briefcase className="h-5 w-5 mx-auto text-primary" />
              <p className="text-2xl font-bold text-foreground mt-2">{lawyer.consultations_count}</p>
              <p className="text-xs text-muted-foreground">Consultations</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="h-5 w-5 mx-auto text-primary" />
              <p className="text-2xl font-bold text-foreground mt-2">{yearsOnPlatform}+</p>
              <p className="text-xs text-muted-foreground">Years on Avoca</p>
            </CardContent>
          </Card>
        </div>

        {/* Specialties */}
        <div>
          <h3 className="font-semibold text-foreground mb-3">Specialties</h3>
          <div className="flex flex-wrap gap-2">
            {lawyer.specialties.map((spec) => (
              <Badge key={spec} variant="secondary" className="py-1.5 px-3">
                {categoryLabels[spec]}
              </Badge>
            ))}
          </div>
        </div>

        {/* Bio */}
        {lawyer.bio && (
          <div>
            <h3 className="font-semibold text-foreground mb-3">About</h3>
            <p className="text-muted-foreground leading-relaxed">{lawyer.bio}</p>
          </div>
        )}

        {/* Experience */}
        <div>
          <h3 className="font-semibold text-foreground mb-3">Experience</h3>
          <p className="text-muted-foreground">{lawyer.years_of_experience} years of professional experience</p>
        </div>
      </div>

      {/* Book Button */}
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
        <div className="max-w-md mx-auto">
          <Button onClick={handleBookConsultation} disabled={!lawyer.is_available || isBooking} className="w-full h-12">
            {isBooking ? "Booking..." : lawyer.is_available ? "Book Consultation" : "Currently Unavailable"}
          </Button>
        </div>
      </div>
    </div>
  )
}
