"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { MobileShell } from "@/components/mobile-shell"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { createClient } from "@/lib/supabase/client"
import type { LegalCategory, CourtLevel } from "@/lib/database.types"
import { WILAYAS } from "@/lib/wilayas"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Building2, Info } from "lucide-react"

const categoryLabels: Record<LegalCategory, string> = {
  criminal: "Criminal Law",
  family: "Family Law",
  civil: "Civil Law",
  commercial: "Commercial Law",
  administrative: "Administrative Law",
  labor: "Labor Law",
  immigration: "Immigration Law",
}

const courtLevelLabels: Record<CourtLevel, { label: string; description: string }> = {
  first_instance: {
    label: "First Instance Courts / المحاكم الابتدائية",
    description: "Regular courts handling new cases (required for all lawyers)",
  },
  appeal: {
    label: "Courts of Appeal / محاكم الاستئناف",
    description: "Appellate courts reviewing lower court decisions",
  },
  supreme_court: {
    label: "Supreme Court / المحكمة العليا",
    description: "Highest court for cassation and final judgments",
  },
  council_of_state: {
    label: "Council of State / مجلس الدولة",
    description: "Administrative court for disputes with government entities",
  },
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

const allCourtLevels: CourtLevel[] = ["first_instance", "appeal", "supreme_court", "council_of_state"]

export default function LawyerRegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedSpecialties, setSelectedSpecialties] = useState<LegalCategory[]>([])
  const [selectedCourtLevels, setSelectedCourtLevels] = useState<CourtLevel[]>(["first_instance"])
  const [barNumber, setBarNumber] = useState("")
  const [city, setCity] = useState("")
  const [bio, setBio] = useState("")
  const [experience, setExperience] = useState("")

  const toggleSpecialty = (category: LegalCategory) => {
    setSelectedSpecialties((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }

  const toggleCourtLevel = (courtLevel: CourtLevel) => {
    // First instance is always required
    if (courtLevel === "first_instance") return

    setSelectedCourtLevels((prev) =>
      prev.includes(courtLevel) ? prev.filter((c) => c !== courtLevel) : [...prev, courtLevel],
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setError("You must be logged in to complete registration")
        return
      }

      // Update profile with city
      const { error: profileError } = await supabase.from("profiles").update({ city }).eq("id", user.id)

      if (profileError) throw profileError

      // Create or update lawyer profile with court authorizations
      const { error: lawyerError } = await supabase.from("lawyer_profiles").upsert({
        id: user.id,
        bar_number: barNumber,
        specialties: selectedSpecialties,
        bio: bio,
        years_of_experience: Number.parseInt(experience) || 0,
        authorized_courts: selectedCourtLevels,
        status: "pending",
      })

      if (lawyerError) throw lawyerError

      router.push("/lawyer/subscription")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <MobileShell>
      <Header title="Lawyer Profile" showBack />
      <div className="px-6 py-6 pb-24">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-foreground">Complete Your Profile</h2>
          <p className="text-sm text-muted-foreground mt-1">
            This information will be displayed to clients seeking legal help.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Bar Registration */}
          <div className="space-y-2">
            <Label htmlFor="barNumber">Bar Registration Number</Label>
            <Input
              id="barNumber"
              placeholder="Enter your bar registration number"
              required
              className="h-12"
              value={barNumber}
              onChange={(e) => setBarNumber(e.target.value)}
            />
          </div>

          {/* City / Wilaya */}
          <div className="space-y-2">
            <Label htmlFor="city">Wilaya (الولاية)</Label>
            <Select value={city} onValueChange={setCity} required>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="اختر الولاية / Sélectionner wilaya" />
              </SelectTrigger>
              <SelectContent>
                {WILAYAS.map((wilaya) => (
                  <SelectItem key={wilaya.code} value={wilaya.nameAr}>
                    {wilaya.code} - {wilaya.nameAr} / {wilaya.nameFr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Specialties */}
          <div className="space-y-3">
            <Label>Specialties (select all that apply)</Label>
            <div className="grid grid-cols-1 gap-2">
              {allCategories.map((category) => (
                <div
                  key={category}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedSpecialties.includes(category)
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => toggleSpecialty(category)}
                >
                  <Checkbox checked={selectedSpecialties.includes(category)} />
                  <span className="text-sm font-medium">{categoryLabels[category]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Professional Bio</Label>
            <Textarea
              id="bio"
              placeholder="Tell clients about your experience, education, and areas of expertise..."
              className="min-h-[120px]"
              required
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          {/* Years of Experience */}
          <div className="space-y-2">
            <Label htmlFor="experience">Years of Experience</Label>
            <Input
              id="experience"
              type="number"
              min="0"
              placeholder="e.g., 10"
              required
              className="h-12"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
            />
          </div>

          {/* Court Authorizations */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              <Label>Court Authorizations / التراخيص القضائية</Label>
            </div>
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-3 flex items-start gap-2">
                <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Select the courts you are authorized to practice in. This helps clients find lawyers qualified for
                  their specific case level (First Instance, Appeal, Supreme Court, or Council of State).
                </p>
              </CardContent>
            </Card>
            <div className="grid grid-cols-1 gap-2">
              {allCourtLevels.map((courtLevel) => {
                const isFirstInstance = courtLevel === "first_instance"
                const isSelected = selectedCourtLevels.includes(courtLevel)
                return (
                  <div
                    key={courtLevel}
                    className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                      isFirstInstance
                        ? "border-primary bg-primary/5 opacity-60 cursor-not-allowed"
                        : isSelected
                          ? "border-primary bg-primary/5 cursor-pointer"
                          : "border-border hover:border-primary/50 cursor-pointer"
                    }`}
                    onClick={() => !isFirstInstance && toggleCourtLevel(courtLevel)}
                  >
                    <Checkbox checked={isSelected} disabled={isFirstInstance} className="mt-0.5" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">{courtLevelLabels[courtLevel].label}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {courtLevelLabels[courtLevel].description}
                      </div>
                      {isFirstInstance && (
                        <div className="text-xs text-primary mt-1 font-medium">Required for all lawyers</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}

          <Button type="submit" className="w-full h-12" disabled={isLoading || selectedSpecialties.length === 0}>
            {isLoading ? "Saving..." : "Continue to Subscription"}
          </Button>
        </form>
      </div>
    </MobileShell>
  )
}
