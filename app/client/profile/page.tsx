"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ChevronRight, User, Shield, Bell, HelpCircle, LogOut, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Profile } from "@/lib/database.types"
import { Badge } from "@/components/ui/badge"

const menuItems = [
  { icon: User, label: "Edit Profile", href: "/client/profile/edit", comingSoon: false },
  { icon: Bell, label: "Notifications", href: "/client/profile/notifications", comingSoon: true },
  { icon: Shield, label: "Privacy & Security", href: "/client/profile/privacy", comingSoon: true },
  { icon: HelpCircle, label: "Help & Support", href: "/client/profile/help", comingSoon: true },
]

export default function ClientProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [email, setEmail] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

        // Fetch user profile from database
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()

        if (profileError && profileError.code !== "PGRST116") {
          throw profileError
        }

        setProfile(profileData)
      } catch (err) {
        console.error("Error loading profile:", err)
        setError("Failed to load profile")
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [router])

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

  const displayName = profile?.full_name || email?.split("@")[0] || "User"
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="min-h-screen">
      <Header title="Profile" />

      <div className="px-4 py-6 space-y-6">
        {/* Profile Card */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-lg font-semibold text-foreground">{displayName}</h2>
                <p className="text-sm text-muted-foreground">{email}</p>
                {profile?.created_at && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Member since{" "}
                    {new Date(profile.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Menu Items */}
        <div className="space-y-2">
          {menuItems.map((item) => (
            <Card
              key={item.label}
              className={`${!item.comingSoon ? "cursor-pointer hover:bg-muted/50 transition-colors" : "opacity-60 cursor-not-allowed"}`}
              onClick={() => !item.comingSoon && router.push(item.href)}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <item.icon className="h-5 w-5 text-muted-foreground" />
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{item.label}</span>
                    {item.comingSoon && (
                      <Badge variant="secondary" className="text-xs">
                        Coming soon
                      </Badge>
                    )}
                  </div>
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
