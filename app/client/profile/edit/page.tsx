"use client"

import type React from "react"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Profile } from "@/lib/database.types"

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

export default function EditClientProfilePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [fullName, setFullName] = useState("")
  const [city, setCity] = useState("")
  const [phone, setPhone] = useState("")

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

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()

        if (profileError && profileError.code !== "PGRST116") {
          throw profileError
        }

        if (profileData) {
          const p = profileData as Profile
          setFullName(p.full_name || "")
          setCity(p.city || "")
          setPhone(p.phone || "")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile")
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [router])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
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

        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            full_name: fullName,
            city,
            phone,
          })
          .eq("id", user.id)

        if (profileError) throw profileError

        setSuccess(true)
        setTimeout(() => {
          router.push("/client/profile")
        }, 1000)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save profile")
      } finally {
        setIsSaving(false)
      }
    },
    [fullName, city, phone, router],
  )

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

          <Button type="submit" className="w-full h-12" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Profile"}
          </Button>
        </form>
      </div>
    </div>
  )
}
