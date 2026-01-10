"use client"

import { useEffect } from "react"
import { Header } from "@/components/header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { FileCheck, MessageSquare, Users, TrendingUp, CheckCircle, Clock, AlertTriangle, Loader2 } from "lucide-react"
import { useLawyerProfile } from "@/lib/hooks/use-lawyer-profile"
import { useLawyerConsultations } from "@/lib/hooks/use-consultations"
import { useUnreadConsultations, useUnreadMessages } from "@/lib/hooks/use-notifications"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function LawyerHomePage() {
  const router = useRouter()
  const { lawyerProfile, profile, isLoading, updateAvailability } = useLawyerProfile()
  const { consultations: pendingConsultations } = useLawyerConsultations("pending")
  const { consultations: activeConsultations } = useLawyerConsultations("accepted")
  const { unreadCount: unreadRequests } = useUnreadConsultations()
  const { unreadCount: unreadMessages } = useUnreadMessages()

  console.log("[LawyerHomePage] Data:", {
    lawyerProfile: lawyerProfile?.id,
    pendingCount: pendingConsultations.length,
    activeCount: activeConsultations.length,
    unreadRequests,
    unreadMessages,
  })

  // If no lawyer profile, redirect to registration
  useEffect(() => {
    if (!isLoading && !lawyerProfile) {
      router.push("/lawyer/register")
    }
  }, [isLoading, lawyerProfile, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Show loading while redirecting
  if (!lawyerProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const lawyerStatus = lawyerProfile.status

  // Check if profile is complete
  const isProfileComplete = Boolean(
    profile?.full_name &&
      profile?.city &&
      lawyerProfile.bar_number &&
      lawyerProfile.specialties?.length > 0 &&
      lawyerProfile.bio &&
      lawyerProfile.years_of_experience,
  )

  const statusConfig = {
    active: { label: "Active", icon: CheckCircle, className: "bg-emerald-500/10 text-emerald-600" },
    pending: { label: "Pending Approval", icon: Clock, className: "bg-amber-500/10 text-amber-600" },
    inactive: { label: "Inactive", icon: AlertTriangle, className: "bg-destructive/10 text-destructive" },
  }

  const StatusIcon = statusConfig[lawyerStatus].icon

  return (
    <div className="min-h-screen">
      <Header title="Dashboard" showNotifications />

      <div className="px-4 py-6 space-y-6">
        {/* Profile Completion Alert */}
        {!isProfileComplete && (
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardContent className="p-4">
              <p className="text-sm font-medium text-amber-700">Complete Your Profile to Continue</p>
              <p className="text-sm text-amber-600 mt-1">
                Finish your profile so clients can find you and send consultation requests.
              </p>
              <Button size="sm" variant="outline" onClick={() => router.push("/lawyer/profile/edit")} className="mt-3">
                Complete Profile
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Status Card */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Account Status</p>
                <Badge className={`mt-1 ${statusConfig[lawyerStatus].className}`}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {statusConfig[lawyerStatus].label}
                </Badge>
              </div>
              {lawyerStatus === "active" && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Available</span>
                  <Switch checked={lawyerProfile.is_available} onCheckedChange={updateAvailability} />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {lawyerStatus === "pending" && (
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardContent className="p-4">
              <p className="text-sm text-foreground font-medium">Account Under Review</p>
              <p className="text-sm text-muted-foreground mt-1">
                Your account is pending admin approval. You will be notified once your payment receipt is verified.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => router.push("/lawyer/requests")}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center relative">
                  <FileCheck className="h-5 w-5 text-primary" />
                  {unreadRequests > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {unreadRequests}
                    </Badge>
                  )}
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{pendingConsultations.length}</p>
                  <p className="text-xs text-muted-foreground">طلبات معلقة / Pending Requests</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => router.push("/lawyer/chats")}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center relative">
                  <MessageSquare className="h-5 w-5 text-emerald-600" />
                  {unreadMessages > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {unreadMessages > 9 ? "9+" : unreadMessages}
                    </Badge>
                  )}
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{activeConsultations.length}</p>
                  <p className="text-xs text-muted-foreground">محادثات نشطة / Active Chats</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                  <Users className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{lawyerProfile.consultations_count}</p>
                  <p className="text-xs text-muted-foreground">Total Clients</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{lawyerProfile.rating.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground">Rating</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Quick Actions</h3>
          <div className="space-y-2">
            <Card
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => router.push("/lawyer/requests")}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileCheck className="h-5 w-5 text-primary" />
                  <span className="font-medium">View Pending Requests</span>
                </div>
                <Badge variant="secondary">{pendingConsultations.length}</Badge>
              </CardContent>
            </Card>
            <Card
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => router.push("/lawyer/chats")}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-emerald-600" />
                  <span className="font-medium">Active Conversations</span>
                </div>
                <Badge variant="secondary">{activeConsultations.length}</Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
