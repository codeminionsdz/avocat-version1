"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { ChevronRight, User, CreditCard, MapPin, Calendar, LogOut, CheckCircle, Loader2 } from "lucide-react"
import { categoryLabels } from "@/lib/mock-data"
import { createClient } from "@/lib/supabase/client"
import type { LawyerProfile, Profile } from "@/lib/database.types"
import type { LegalCategory } from "@/lib/types"

const menuItems = [
  { icon: User, label: "Edit Profile", href: "/lawyer/profile/edit" },
  { icon: CreditCard, label: "Subscription", href: "/lawyer/subscription" },
  { icon: Calendar, label: "Availability Schedule", href: "/lawyer/profile/availability" },
]

export default function LawyerProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [lawyerProfile, setLawyerProfile] = useState<LawyerProfile | null>(null)
  const [isAvailable, setIsAvailable] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState<string>("")

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

        setEmail(user.email || "")

        // Fetch both profile and lawyer profile
        const [profileRes, lawyerRes] = await Promise.all([
          supabase.from("profiles").select("*").eq("id", user.id).single(),
          supabase.from("lawyer_profiles").select("*").eq("id", user.id).single(),
        ])

        if (profileRes.error && profileRes.error.code !== "PGRST116") throw profileRes.error
        if (lawyerRes.error && lawyerRes.error.code !== "PGRST116") throw lawyerRes.error

        setProfile(profileRes.data)
        setLawyerProfile(lawyerRes.data)
        setIsAvailable(lawyerRes.data?.is_available || false)
      } catch (err) {
        console.error("Error loading profile:", err)
        setError("Failed to load profile")
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [router])

  const handleAvailabilityChange = async (checked: boolean) => {
    setIsAvailable(checked)
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    await supabase.from("lawyer_profiles").update({ is_available: checked }).eq("id", user.id)
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <Header title="Profile" />
        <div className="p-4 text-center text-destructive">{error}</div>
      </div>
    )
  }

  const displayName = profile.full_name || email?.split("@")[0] || "Lawyer"
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const specialties = (lawyerProfile.specialties as LegalCategory[]) || []

  const isProfileComplete = Boolean(
    profile.full_name &&
      profile.city &&
      lawyerProfile.bar_number &&
      lawyerProfile.specialties?.length > 0 &&
      lawyerProfile.bio &&
      lawyerProfile.years_of_experience,
  )

  return (
    <div className="min-h-screen">
      <Header title="Profile" />

      <div className="px-4 py-6 space-y-6">
        {!isProfileComplete && (
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardContent className="p-4">
              <p className="text-sm font-medium text-amber-700">Profile Incomplete</p>
              <p className="text-sm text-amber-600 mt-1">
                Complete your profile to receive consultation requests from clients
              </p>
              <Button size="sm" variant="outline" onClick={() => router.push("/lawyer/profile/edit")} className="mt-3">
                Complete Profile
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Profile Card */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-foreground">{displayName}</h2>
                  {lawyerProfile.status === "active" && <CheckCircle className="h-4 w-4 text-primary" />}
                </div>
                <p className="text-sm text-muted-foreground">{email}</p>
                {profile.city && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <MapPin className="h-3 w-3" />
                    {profile.city}
                  </div>
                )}
              </div>
            </div>

            {/* Specialties */}
            {specialties.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-4">
                {specialties.map((spec) => (
                  <Badge key={spec} variant="secondary" className="text-xs">
                    {categoryLabels[spec as keyof typeof categoryLabels]}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Availability Toggle */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Availability Status</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {isAvailable ? "Accepting new consultations" : "Not accepting new consultations"}
                </p>
              </div>
              <Switch checked={isAvailable} onCheckedChange={handleAvailabilityChange} />
            </div>
          </CardContent>
        </Card>

        {/* Stats - Show only if available */}
        {lawyerProfile.years_of_experience && (
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-foreground">{lawyerProfile.years_of_experience}</p>
                  <p className="text-xs text-muted-foreground">Years of Experience</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Menu Items */}
        <div className="space-y-2">
          {menuItems.map((item) => (
            <Card
              key={item.label}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => router.push(item.href)}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <item.icon className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium text-foreground">{item.label}</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Logout Button */}
        <Button
          variant="outline"
          className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 bg-transparent"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Log Out
        </Button>
      </div>
    </div>
  )
}
