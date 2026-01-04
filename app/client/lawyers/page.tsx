"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, Star, MapPin, CheckCircle, Loader2, Building2 } from "lucide-react"
import { useLawyers } from "@/lib/hooks/use-lawyers"
import type { LegalCategory, CourtLevel } from "@/lib/database.types"

const categoryLabels: Record<LegalCategory, string> = {
  criminal: "Criminal Law",
  family: "Family Law",
  civil: "Civil Law",
  commercial: "Commercial Law",
  administrative: "Administrative Law",
  labor: "Labor Law",
  immigration: "Immigration Law",
}

const courtLevelLabels: Record<CourtLevel, string> = {
  first_instance: "First Instance",
  appeal: "Appeal",
  supreme_court: "Supreme Court",
  council_of_state: "Council of State",
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

function LawyersListContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const categoryParam = searchParams.get("category") as LegalCategory | null
  const courtLevelParam = searchParams.get("courtLevel") as CourtLevel | null

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<LegalCategory | null>(categoryParam)
  const [selectedCourtLevel, setSelectedCourtLevel] = useState<CourtLevel | null>(courtLevelParam)

  const { lawyers, isLoading } = useLawyers(selectedCategory, selectedCourtLevel)

  const filteredLawyers = lawyers.filter((lawyer) => {
    const matchesSearch =
      lawyer.profile.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lawyer.profile.city?.toLowerCase() || "").includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  return (
    <div className="min-h-screen pb-4">
      <Header title="Find a Lawyer" showNotifications />

      <div className="px-4 py-4 space-y-4">
        {/* Court Level Filter Alert */}
        {selectedCourtLevel && selectedCourtLevel !== "first_instance" && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-3 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              <span className="text-sm text-foreground">
                Showing lawyers authorized for: <strong>{courtLevelLabels[selectedCourtLevel]}</strong>
              </span>
            </CardContent>
          </Card>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11"
          />
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 no-scrollbar">
          <Badge
            variant={selectedCategory === null ? "default" : "secondary"}
            className="cursor-pointer whitespace-nowrap py-1.5 px-3"
            onClick={() => setSelectedCategory(null)}
          >
            All
          </Badge>
          {allCategories.map((cat) => (
            <Badge
              key={cat}
              variant={selectedCategory === cat ? "default" : "secondary"}
              className="cursor-pointer whitespace-nowrap py-1.5 px-3"
              onClick={() => setSelectedCategory(cat)}
            >
              {categoryLabels[cat]}
            </Badge>
          ))}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Results Count */}
        {!isLoading && (
          <p className="text-sm text-muted-foreground">
            {filteredLawyers.length} lawyer{filteredLawyers.length !== 1 ? "s" : ""} found
            {selectedCourtLevel && selectedCourtLevel !== "first_instance" && " (authorized for this court level)"}
          </p>
        )}

        {/* Lawyer Cards */}
        {!isLoading && (
          <div className="space-y-3">
            {filteredLawyers.map((lawyer) => (
              <Card
                key={lawyer.id}
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => router.push(`/client/lawyers/${lawyer.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <Avatar className="h-14 w-14">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {lawyer.profile.full_name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground truncate">{lawyer.profile.full_name}</h3>
                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                          {lawyer.rating.toFixed(1)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {lawyer.profile.city || "Algeria"}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {lawyer.specialties.slice(0, 2).map((spec) => (
                          <Badge key={spec} variant="secondary" className="text-xs py-0.5">
                            {categoryLabels[spec]}
                          </Badge>
                        ))}
                        {lawyer.specialties.length > 2 && (
                          <Badge variant="secondary" className="text-xs py-0.5">
                            +{lawyer.specialties.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          lawyer.is_available ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {lawyer.is_available ? "Available" : "Busy"}
                      </span>
                      <span className="text-xs text-muted-foreground">{lawyer.consultations_count} consults</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && filteredLawyers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No lawyers found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function LawyersPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LawyersListContent />
    </Suspense>
  )
}
