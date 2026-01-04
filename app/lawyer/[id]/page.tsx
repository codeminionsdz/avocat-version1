"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Star, MapPin, CheckCircle, Briefcase, Calendar, Phone, Mail, Navigation, Download, Share2, Loader2 } from "lucide-react"
import { LawyerQRCode } from "@/components/lawyer/lawyer-qr-code"
import { LawyerMap } from "@/components/lawyer/lawyer-map"
import type { LawyerWithProfile, LegalCategory } from "@/lib/database.types"

const categoryLabels: Record<LegalCategory, string> = {
  criminal: "Criminal Law",
  family: "Family Law",
  civil: "Civil Law",
  commercial: "Commercial Law",
  administrative: "Administrative Law",
  labor: "Labor Law",
  immigration: "Immigration Law",
}

interface PublicLawyerProfileProps {
  params: Promise<{ id: string }>
}

export default function PublicLawyerProfile({ params }: PublicLawyerProfileProps) {
  const router = useRouter()
  const [lawyerId, setLawyerId] = useState<string>("")
  const [lawyer, setLawyer] = useState<LawyerWithProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeSubscription, setActiveSubscription] = useState<any>(null)
  const [showQR, setShowQR] = useState(false)

  useEffect(() => {
    params.then((resolvedParams) => {
      setLawyerId(resolvedParams.id)
      fetchLawyerProfile(resolvedParams.id)
    })
  }, [params])

  const fetchLawyerProfile = async (id: string) => {
    try {
      const response = await fetch(`/api/lawyer/public/${id}`)
      if (response.ok) {
        const data = await response.json()
        setLawyer(data.lawyer)
        setActiveSubscription(data.subscription)
      }
    } catch (error) {
      console.error("Error fetching lawyer profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRequestConsultation = () => {
    // Redirect to consultation page - auth will be checked there
    // If user is not logged in, they'll be redirected to login from the consultation page
    router.push(`/client/consultations/new?lawyerId=${lawyerId}`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!lawyer) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="text-6xl">⚖️</div>
          <h2 className="text-xl font-semibold">Lawyer Not Found</h2>
          <p className="text-muted-foreground">This profile may have been removed or is not available.</p>
        </div>
      </div>
    )
  }

  const profileUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/lawyer/${lawyerId}`
  const yearsOnPlatform = Math.max(1, new Date().getFullYear() - new Date(lawyer.created_at).getFullYear())
  const hasLocation = lawyer.latitude && lawyer.longitude && lawyer.location_visibility

  return (
    <div className="min-h-screen pb-24">
      <Header title="Lawyer Profile" showBack />

      <div className="px-4 py-6 space-y-6">
        {/* Profile Header */}
        <div className="flex flex-col items-center text-center">
          <Avatar className="h-24 w-24 ring-4 ring-primary/10">
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
              {lawyer.status === 'active' && <CheckCircle className="h-5 w-5 text-primary" />}
            </div>
            <div className="flex items-center justify-center gap-4 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                {lawyer.rating.toFixed(1)}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {lawyer.profile.city || "Algeria"}
              </span>
            </div>
          </div>

          {/* Subscription Badge */}
          {activeSubscription && (
            <div className="mt-3">
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                Premium Member
              </Badge>
            </div>
          )}
        </div>

        {/* QR Code Section */}
        <Card className="border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground">Digital Business Card</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowQR(!showQR)}
                className="h-8"
              >
                {showQR ? "Hide QR" : "Show QR"}
              </Button>
            </div>
            {showQR && (
              <div className="flex flex-col items-center space-y-3 pt-2">
                <LawyerQRCode url={profileUrl} lawyerName={lawyer.profile.full_name} />
                <p className="text-xs text-muted-foreground text-center">
                  Scan to view profile or share with clients
                </p>
              </div>
            )}
          </CardContent>
        </Card>

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
              <p className="text-2xl font-bold text-foreground mt-2">{lawyer.years_of_experience}+</p>
              <p className="text-xs text-muted-foreground">Years Experience</p>
            </CardContent>
          </Card>
        </div>

        {/* Contact Information */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <h3 className="font-semibold text-foreground">Contact Information</h3>
            {lawyer.profile.phone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-primary" />
                <a href={`tel:${lawyer.profile.phone}`} className="text-foreground hover:underline">
                  {lawyer.profile.phone}
                </a>
              </div>
            )}
            {lawyer.profile.email && (
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-primary" />
                <a href={`mailto:${lawyer.profile.email}`} className="text-foreground hover:underline">
                  {lawyer.profile.email}
                </a>
              </div>
            )}
            {lawyer.office_address && (
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="h-4 w-4 text-primary mt-0.5" />
                <span className="text-muted-foreground">{lawyer.office_address}</span>
              </div>
            )}
          </CardContent>
        </Card>

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

        {/* Office Location Map */}
        {hasLocation && (
          <div>
            <h3 className="font-semibold text-foreground mb-3">Office Location</h3>
            <LawyerMap
              latitude={lawyer.latitude!}
              longitude={lawyer.longitude!}
              lawyerName={lawyer.profile.full_name}
              officeAddress={lawyer.office_address}
            />
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent border-t">
        <div className="max-w-md mx-auto space-y-2">
          <Button
            onClick={handleRequestConsultation}
            disabled={!lawyer.is_available}
            className="w-full h-12"
          >
            {lawyer.is_available ? "Request Consultation" : "Currently Unavailable"}
          </Button>
          {hasLocation && (
            <Button
              variant="outline"
              className="w-full h-12"
              onClick={() => {
                // Scroll to map
                const mapElement = document.querySelector('[data-map-container]')
                mapElement?.scrollIntoView({ behavior: 'smooth', block: 'center' })
              }}
            >
              <Navigation className="h-4 w-4 mr-2" />
              View Office Location
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
