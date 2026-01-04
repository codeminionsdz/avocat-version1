"use client"

import { useState, Suspense } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin, CheckCircle, Clock, XCircle, Loader2 } from "lucide-react"
import { categoryLabels } from "@/lib/mock-data"
import { useAdminLawyers } from "@/lib/hooks/use-admin-lawyers"
import type { LegalCategory } from "@/lib/database.types"

const statusConfig = {
  active: { label: "Active", icon: CheckCircle, className: "bg-emerald-500/10 text-emerald-600" },
  pending: { label: "Pending", icon: Clock, className: "bg-amber-500/10 text-amber-600" },
  inactive: { label: "Inactive", icon: XCircle, className: "bg-destructive/10 text-destructive" },
}

function AdminLawyersContent() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<string | "all">("all")

  const { lawyers, isLoading } = useAdminLawyers(filterStatus === "all" ? null : filterStatus)

  const filteredLawyers = lawyers.filter((lawyer) => {
    const matchesSearch =
      (lawyer.profile?.full_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (lawyer.profile?.email?.toLowerCase() || "").includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Manage Lawyers</h1>
        <p className="text-muted-foreground">View and manage all registered lawyers</p>
      </div>

      <div className="space-y-4">
        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11"
          />
        </div>

        {/* Status Filter */}
        <div className="flex gap-2">
          {(["all", "active", "pending", "inactive"] as const).map((status) => (
            <Badge
              key={status}
              variant={filterStatus === status ? "default" : "secondary"}
              className="cursor-pointer whitespace-nowrap py-1.5 px-3 capitalize"
              onClick={() => setFilterStatus(status)}
            >
              {status === "all" ? "All" : statusConfig[status as keyof typeof statusConfig].label}
            </Badge>
          ))}
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Results Count */}
        {!isLoading && (
          <p className="text-sm text-muted-foreground">
            {filteredLawyers.length} lawyer{filteredLawyers.length !== 1 ? "s" : ""}
          </p>
        )}

        {/* Lawyer Cards */}
        {!isLoading && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredLawyers.map((lawyer) => {
              const status = statusConfig[lawyer.status as keyof typeof statusConfig]
              const StatusIcon = status.icon

              return (
                <Card
                  key={lawyer.id}
                  className="cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => router.push(`/admin/lawyers/${lawyer.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {(lawyer.profile?.full_name || "")
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-semibold text-foreground truncate">{lawyer.profile?.full_name}</h3>
                          <Badge className={`${status.className} flex items-center gap-1`}>
                            <StatusIcon className="h-3 w-3" />
                            {status.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{lawyer.profile?.email}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {lawyer.profile?.city || "Not specified"}
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {lawyer.specialties.slice(0, 2).map((spec) => (
                            <Badge key={spec} variant="secondary" className="text-xs py-0.5">
                              {categoryLabels[spec as LegalCategory]}
                            </Badge>
                          ))}
                          {lawyer.specialties.length > 2 && (
                            <Badge variant="secondary" className="text-xs py-0.5">
                              +{lawyer.specialties.length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {!isLoading && filteredLawyers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No lawyers found</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AdminLawyersPage() {
  return (
    <Suspense fallback={null}>
      <AdminLawyersContent />
    </Suspense>
  )
}
