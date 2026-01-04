"use client"

import type React from "react"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Building2, Info, MapPin, QrCode } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { LawyerQRCode } from "@/components/lawyer/lawyer-qr-code"
import type { LegalCategory, Profile, LawyerProfile, CourtLevel } from "@/lib/database.types"

const cities = [
  "Algiers",
  "Oran",
  "Constantine",
  "Annaba",
  "Blida",
  "Batna",
  "Djelfa",
  "Sétif",
  "Sidi Bel Abbès",
  "Biskra",
]

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

const courtLevelLabels: Record<CourtLevel, { label: string; description: string; arabic: string }> = {
  first_instance: {
    label: "First Instance Courts",
    arabic: "المحاكم الابتدائية",
    description: "Regular courts handling new cases (default for all lawyers)",
  },
  appeal: {
    label: "Courts of Appeal",
    arabic: "محاكم الاستئناف",
    description: "Appellate courts reviewing lower court decisions",
  },
  supreme_court: {
    label: "Supreme Court",
    arabic: "المحكمة العليا",
    description: "Highest court for cassation and final judgments",
  },
  council_of_state: {
    label: "Council of State",
    arabic: "مجلس الدولة",
    description: "Administrative court for disputes with government entities",
  },
}

const requestableCourtLevels: CourtLevel[] = ["appeal", "supreme_court", "council_of_state"]

export default function EditProfilePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Profile fields
  const [fullName, setFullName] = useState("")
  const [city, setCity] = useState("")
  const [phone, setPhone] = useState("")

  // Lawyer profile fields
  const [barNumber, setBarNumber] = useState("")
  const [selectedSpecialties, setSelectedSpecialties] = useState<LegalCategory[]>([])
  const [bio, setBio] = useState("")
  const [experience, setExperience] = useState("")

  // Court authorization fields (self-declared)
  const [authorizedCourts, setAuthorizedCourts] = useState<CourtLevel[]>(["first_instance"])

  // Location fields
  const [latitude, setLatitude] = useState("")
  const [longitude, setLongitude] = useState("")
  const [officeAddress, setOfficeAddress] = useState("")
  const [locationVisibility, setLocationVisibility] = useState(false)
  const [isGettingLocation, setIsGettingLocation] = useState(false)

  // QR Code
  const [showQR, setShowQR] = useState(false)
  const [userId, setUserId] = useState("")

  useEffect(() => {
    const loadProfile = async () => {
      const supabase = createClient()

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push("/auth/login")
          return
        }

        setUserId(user.id)

        const [profileRes, lawyerRes] = await Promise.all([
          supabase.from("profiles").select("*").eq("id", user.id).single(),
          supabase.from("lawyer_profiles").select("*").eq("id", user.id).single(),
        ])

        if (profileRes.data) {
          const p = profileRes.data as Profile
          setFullName(p.full_name || "")
          setCity(p.city || "")
          setPhone(p.phone || "")
        }

        if (lawyerRes.data) {
          const lp = lawyerRes.data as LawyerProfile
          setBarNumber(lp.bar_number || "")
          setSelectedSpecialties((lp.specialties || []) as LegalCategory[])
          setBio(lp.bio || "")
          setExperience(lp.years_of_experience?.toString() || "")
          setAuthorizedCourts(lp.authorized_courts || ["first_instance"])
          setLatitude(lp.latitude?.toString() || "")
          setLongitude(lp.longitude?.toString() || "")
          setOfficeAddress(lp.office_address || "")
          setLocationVisibility(lp.location_visibility || false)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile")
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [router])

  const toggleSpecialty = useCallback((category: LegalCategory, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    setSelectedSpecialties((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }, [])

  const toggleCourtLevel = useCallback((level: CourtLevel) => {
    // First instance cannot be unchecked
    if (level === "first_instance") return

    setAuthorizedCourts((prev) =>
      prev.includes(level) ? prev.filter((c) => c !== level) : [...prev, level],
    )
  }, [])

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser")
      return
    }

    setIsGettingLocation(true)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toFixed(6))
        setLongitude(position.coords.longitude.toFixed(6))
        setIsGettingLocation(false)
      },
      (error) => {
        setIsGettingLocation(false)
        alert("Unable to get your location. Please enter manually.")
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)
    setSuccess(false)

    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setError("You must be logged in")
        return
      }

      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          city,
          phone,
        })
        .eq("id", user.id)

      if (profileError) throw profileError

      // Update lawyer profile
      const { error: lawyerError } = await supabase
        .from("lawyer_profiles")
        .update({
          bar_number: barNumber,
          specialties: selectedSpecialties,
          bio,
          years_of_experience: Number.parseInt(experience) || 0,
          authorized_courts: authorizedCourts,
          latitude: latitude ? Number.parseFloat(latitude) : null,
          longitude: longitude ? Number.parseFloat(longitude) : null,
          office_address: officeAddress || null,
          location_visibility: locationVisibility,
        })
        .eq("id", user.id)

      if (lawyerError) throw lawyerError

      setSuccess(true)
      setTimeout(() => {
        router.push("/lawyer/profile")
      }, 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24">
      <Header title="Edit Profile" showBack />

      <div className="px-4 py-6 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Info */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Personal Information</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  placeholder="Your full name"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <select
                  id="city"
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                >
                  <option value="">Select your city</option>
                  {cities.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+213..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Professional Info */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Professional Information</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="barNumber">Bar Registration Number</Label>
                <Input
                  id="barNumber"
                  placeholder="Your bar registration number"
                  required
                  value={barNumber}
                  onChange={(e) => setBarNumber(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Years of Experience</Label>
                <Input
                  id="experience"
                  type="number"
                  min="0"
                  placeholder="e.g., 10"
                  required
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Professional Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell clients about your experience and expertise..."
                  required
                  className="min-h-[120px]"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Specialties */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Specialties (select at least one)</h3>
            <div className="grid grid-cols-1 gap-2">
              {allCategories.map((category) => (
                <div
                  key={category}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedSpecialties.includes(category)
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    toggleSpecialty(category, e)
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      toggleSpecialty(category)
                    }
                  }}
                >
                  <Checkbox
                    checked={selectedSpecialties.includes(category)}
                    onClick={(e) => e.stopPropagation()}
                    onCheckedChange={() => {}}
                  />
                  <span className="text-sm font-medium">{categoryLabels[category]}</span>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <Card className="border-destructive/50 bg-destructive/5">
              <CardContent className="p-3 text-sm text-destructive">{error}</CardContent>
            </Card>
          )}

          {success && (
            <Card className="border-emerald-500/50 bg-emerald-500/5">
              <CardContent className="p-3 text-sm text-emerald-600">Profile saved successfully!</CardContent>
            </Card>
          )}

          <Button type="submit" className="w-full h-12" disabled={isSaving || selectedSpecialties.length === 0}>
            {isSaving ? "Saving..." : "Save Profile"}
          </Button>
        </form>

        {/* Court Levels of Practice (Self-Declared) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5" />
              Court Levels of Practice / مستويات الممارسة القضائية
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Select the court levels where you practice (as declared by you)
              </p>
              <p className="text-xs text-muted-foreground font-arabic">
                حدد مستويات المحاكم التي تمارس فيها (كما صرحت بها)
              </p>
            </div>

            <div className="grid gap-3">
              {(["first_instance", "appeal", "supreme_court", "council_of_state"] as CourtLevel[]).map((level) => {
                const levelInfo = courtLevelLabels[level]
                const isFirstInstance = level === "first_instance"
                const isChecked = authorizedCourts.includes(level)

                return (
                  <div
                    key={level}
                    className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                      isFirstInstance
                        ? "border-border bg-muted/30"
                        : isChecked
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    } ${
                      !isFirstInstance ? "cursor-pointer" : "cursor-not-allowed"
                    }`}
                    onClick={() => !isFirstInstance && toggleCourtLevel(level)}
                    role={!isFirstInstance ? "button" : undefined}
                    tabIndex={!isFirstInstance ? 0 : undefined}
                    onKeyDown={(e) => {
                      if (!isFirstInstance && (e.key === "Enter" || e.key === " ")) {
                        e.preventDefault()
                        toggleCourtLevel(level)
                      }
                    }}
                  >
                    <Checkbox
                      checked={isChecked}
                      disabled={isFirstInstance}
                      onClick={(e) => e.stopPropagation()}
                      onCheckedChange={() => !isFirstInstance && toggleCourtLevel(level)}
                      className="mt-0.5 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-foreground">{levelInfo.label}</div>
                      <div className="text-xs font-arabic text-muted-foreground mt-0.5">{levelInfo.arabic}</div>
                      <div className="text-xs text-muted-foreground mt-1">{levelInfo.description}</div>
                      {isFirstInstance && (
                        <div className="text-xs text-muted-foreground mt-1 italic">
                          (Always enabled for all lawyers)
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Legal Disclaimer */}
            <Card className="border-amber-500/50 bg-amber-500/5">
              <CardContent className="p-3 flex gap-2 items-start">
                <Info className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-amber-900 dark:text-amber-100">
                  <p className="font-medium mb-1">Legal Disclaimer</p>
                  <p className="text-xs opacity-90 leading-relaxed">
                    The lawyer declares the court levels they practice in. Avoca does not currently verify official
                    accreditation for higher courts. Responsibility lies with the lawyer.
                  </p>
                  <p className="text-xs opacity-90 mt-2 font-arabic leading-relaxed">
                    يصرح المحامي بمستويات المحاكم التي يمارس فيها. أفوكا لا تتحقق حاليًا من الاعتماد الرسمي للمحاكم العليا.
                    تقع المسؤولية على عاتق المحامي.
                  </p>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>

        {/* Office Location */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="h-5 w-5" />
              Office Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Add your office location to help clients find you on the map
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="officeAddress">Office Address</Label>
                <Textarea
                  id="officeAddress"
                  placeholder="e.g., 123 Rue Didouche Mourad, Algiers"
                  className="min-h-[80px]"
                  value={officeAddress}
                  onChange={(e) => setOfficeAddress(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="0.000001"
                    placeholder="36.7538"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="0.000001"
                    placeholder="3.0588"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                  />
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={getCurrentLocation}
                disabled={isGettingLocation}
                className="w-full"
              >
                {isGettingLocation ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Getting Location...
                  </>
                ) : (
                  <>
                    <MapPin className="h-4 w-4 mr-2" />
                    Use My Current Location
                  </>
                )}
              </Button>

              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium text-sm">Show Location to Clients</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Enable map and navigation on your public profile
                  </p>
                </div>
                <Switch
                  checked={locationVisibility}
                  onCheckedChange={setLocationVisibility}
                />
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              💡 Tip: You can find your coordinates by searching for your address on Google Maps
            </div>
          </CardContent>
        </Card>

        {/* QR Code */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <QrCode className="h-5 w-5" />
              Your Digital Business Card
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Share your professional profile with a QR code
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => setShowQR(!showQR)}
              className="w-full"
            >
              {showQR ? "Hide QR Code" : "Show QR Code"}
            </Button>

            {showQR && userId && (
              <div className="pt-2">
                <LawyerQRCode
                  url={`${typeof window !== 'undefined' ? window.location.origin : ''}/lawyer/${userId}`}
                  lawyerName={fullName || "Your Profile"}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
