"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Star, MapPin, CheckCircle, Briefcase, Calendar, Phone, Mail, Navigation, Download, Share2, Loader2, ThumbsUp, ThumbsDown, BookOpen, Scale, Building2, LandmarkIcon, University, LogIn, UserPlus } from "lucide-react"
import { LawyerQRCode } from "@/components/lawyer/lawyer-qr-code"
import { LawyerMap } from "@/components/lawyer/lawyer-map"
import { RequestConsultationModal } from "@/components/consultation/request-consultation-modal"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getWilayaName } from "@/lib/algeria-wilayas"
import { getLawyerProfileUrl } from "@/lib/config"
import type { LawyerWithProfile, LegalCategory, LegalInsightWithStats } from "@/lib/database.types"

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
  const [insights, setInsights] = useState<LegalInsightWithStats[]>([])
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [showSignInModal, setShowSignInModal] = useState(false)

  useEffect(() => {
    params.then((resolvedParams) => {
      setLawyerId(resolvedParams.id)
      fetchLawyerProfile(resolvedParams.id)
      fetchLawyerInsights(resolvedParams.id)
    })
  }, [params])

  // Check for returnUrl and auto-open consultation modal after login
  useEffect(() => {
    const checkAuthAndOpenModal = async () => {
      if (typeof window === 'undefined') return
      
      const urlParams = new URLSearchParams(window.location.search)
      const shouldOpenModal = urlParams.get('openConsultation') === 'true'
      
      if (shouldOpenModal && lawyerId) {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session) {
          // Remove query param and open modal
          const newUrl = window.location.pathname
          window.history.replaceState({}, '', newUrl)
          setShowRequestModal(true)
        }
      }
    }
    
    checkAuthAndOpenModal()
  }, [lawyerId])

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

  const fetchLawyerInsights = async (id: string) => {
    try {
      const response = await fetch(`/api/insights?lawyer_id=${id}`)
      if (response.ok) {
        const data = await response.json()
        setInsights(data)
      }
    } catch (error) {
      console.error("Error fetching lawyer insights:", error)
    }
  }

  const handleRequestConsultation = async () => {
    // Check authentication before opening modal
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      setShowSignInModal(true)
      return
    }
    
    setShowRequestModal(true)
  }

  const handleSignIn = () => {
    const currentPath = `/lawyer/${lawyerId}?openConsultation=true`
    router.push(`/auth/login?returnUrl=${encodeURIComponent(currentPath)}`)
  }

  const handleCreateAccount = () => {
    const currentPath = `/lawyer/${lawyerId}?openConsultation=true`
    router.push(`/auth/register?returnUrl=${encodeURIComponent(currentPath)}`)
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

  const profileUrl = getLawyerProfileUrl(lawyerId)
  const yearsOnPlatform = Math.max(1, new Date().getFullYear() - new Date(lawyer.created_at).getFullYear())
  const hasLocation = lawyer.latitude && lawyer.longitude && lawyer.location_visibility

  // Court level configuration
  const courtLevelConfig = {
    first_instance: {
      icon: Scale,
      labelEn: "First Instance",
      labelAr: "المحكمة الابتدائية",
      color: "bg-blue-100 text-blue-700 border-blue-200"
    },
    appeal: {
      icon: Building2,
      labelEn: "Appeal",
      labelAr: "محكمة الاستئناف",
      color: "bg-purple-100 text-purple-700 border-purple-200"
    },
    supreme_court: {
      icon: LandmarkIcon,
      labelEn: "Supreme Court",
      labelAr: "المحكمة العليا",
      color: "bg-amber-100 text-amber-700 border-amber-200"
    },
    council_of_state: {
      icon: University,
      labelEn: "Council of State",
      labelAr: "مجلس الدولة",
      color: "bg-emerald-100 text-emerald-700 border-emerald-200"
    }
  }

  const authorizedCourts = lawyer.authorized_courts || ["first_instance"]

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
                {getWilayaName(lawyer.profile.city) || "Algeria"}
              </span>
            </div>

            {/* Authorized Court Levels */}
            <div className="mt-4 w-full max-w-md">
              <div className="flex flex-wrap gap-2 justify-center">
                {authorizedCourts.map((courtLevel) => {
                  const config = courtLevelConfig[courtLevel]
                  const Icon = config.icon
                  return (
                    <Badge 
                      key={courtLevel} 
                      variant="outline"
                      className={`${config.color} px-3 py-1.5 font-medium border`}
                    >
                      <Icon className="h-3.5 w-3.5 mr-1.5" />
                      <span className="text-xs">{config.labelEn}</span>
                      <span className="mx-1.5">•</span>
                      <span className="text-xs font-arabic">{config.labelAr}</span>
                    </Badge>
                  )
                })}
              </div>
              <p className="text-xs text-muted-foreground text-center mt-2 italic">
                ⚖️ Court levels are self-declared by the lawyer
              </p>
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
        <Card className="border-primary/20 max-w-full overflow-hidden">
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
          <Card className="max-w-full overflow-hidden">
            <CardContent className="p-4 text-center">
              <Briefcase className="h-5 w-5 mx-auto text-primary" />
              <p className="text-2xl font-bold text-foreground mt-2">{lawyer.consultations_count}</p>
              <p className="text-xs text-muted-foreground">Consultations</p>
            </CardContent>
          </Card>
          <Card className="max-w-full overflow-hidden">
            <CardContent className="p-4 text-center">
              <Calendar className="h-5 w-5 mx-auto text-primary" />
              <p className="text-2xl font-bold text-foreground mt-2">{lawyer.years_of_experience}+</p>
              <p className="text-xs text-muted-foreground">Years Experience</p>
            </CardContent>
          </Card>
        </div>

        {/* Contact Information */}
        <Card className="max-w-full overflow-hidden">
          <CardContent className="p-4 space-y-3">
            <h3 className="font-semibold text-foreground">Contact Information</h3>
            {lawyer.profile.phone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-primary shrink-0" />
                <a href={`tel:${lawyer.profile.phone}`} className="text-foreground hover:underline break-all">
                  {lawyer.profile.phone}
                </a>
              </div>
            )}
            {lawyer.profile.email && (
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <a href={`mailto:${lawyer.profile.email}`} className="text-foreground hover:underline break-all">
                  {lawyer.profile.email}
                </a>
              </div>
            )}
            {lawyer.office_address && (
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span className="text-muted-foreground break-words">{lawyer.office_address}</span>
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
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap break-words">{lawyer.bio}</p>
          </div>
        )}

        {/* Legal Insights */}
        {insights.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Legal Insights
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/insights?lawyer_id=${lawyerId}`)}
              >
                View All
              </Button>
            </div>
            <div className="space-y-3">
              {insights.slice(0, 3).map((insight) => (
                <Card 
                  key={insight.id} 
                  className="max-w-full overflow-hidden cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => router.push(`/insights/${insight.id}`)}
                >
                  <CardHeader className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base line-clamp-2 break-words">{insight.title}</CardTitle>
                        <CardDescription className="line-clamp-2 mt-1 break-words">
                          {insight.content}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="shrink-0">
                        {insight.category}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="h-3 w-3" />
                        <span>{insight.helpful_count}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ThumbsDown className="h-3 w-3" />
                        <span>{insight.not_helpful_count}</span>
                      </div>
                      <span className="text-xs">
                        {new Date(insight.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Office Location Map */}
        {hasLocation && (
          <div>
            <h3 className="font-semibold text-foreground mb-3">Office Location</h3>
            <div className="map-container-wrapper">
              <LawyerMap
                latitude={lawyer.latitude!}
                longitude={lawyer.longitude!}
                lawyerName={lawyer.profile.full_name}
                officeAddress={lawyer.office_address}
              />
            </div>
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

      {/* Sign In Required Modal */}
      <Dialog open={showSignInModal} onOpenChange={setShowSignInModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl">🔐</span>
              Sign In Required
            </DialogTitle>
            <DialogDescription>
              You need to be signed in to request a consultation with this lawyer.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <Button
              onClick={handleSignIn}
              className="w-full h-12"
              size="lg"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Sign In
            </Button>
            <Button
              onClick={handleCreateAccount}
              variant="outline"
              className="w-full h-12"
              size="lg"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Create Account
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            After signing in, you'll be able to request consultations with lawyers.
          </p>
        </DialogContent>
      </Dialog>

      {/* Request Consultation Modal */}
      {lawyer && (
        <RequestConsultationModal
          open={showRequestModal}
          onOpenChange={setShowRequestModal}
          lawyerId={lawyerId}
          lawyerName={lawyer.profile.full_name}
        />
      )}
    </div>
  )
}
