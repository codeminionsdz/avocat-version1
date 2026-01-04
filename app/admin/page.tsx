"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { Users, FileCheck, MessageSquare, TrendingUp, Clock, CheckCircle, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface AdminStats {
  totalLawyers: number
  activeLawyers: number
  pendingApprovals: number
  totalConsultations: number
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<AdminStats>({
    totalLawyers: 0,
    activeLawyers: 0,
    pendingApprovals: 0,
    totalConsultations: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [recentActivity, setRecentActivity] = useState<
    Array<{ id: string; type: string; message: string; timestamp: string }>
  >([])

  useEffect(() => {
    const loadStats = async () => {
      const supabase = createClient()

      try {
        // Get total lawyers and count by status
        const { data: allLawyers } = await supabase.from("lawyer_profiles").select("id, status").throwOnError()

        const activeLawyers = allLawyers?.filter((l) => l.status === "active").length || 0
        const pendingLawyers = allLawyers?.filter((l) => l.status === "pending").length || 0

        // Get total consultations
        const { count: consultationCount } = await supabase
          .from("consultations")
          .select("id", { count: "exact", head: true })
          .throwOnError()

        // Get recent payment receipts for activity
        const { data: recentReceipts } = await supabase
          .from("payment_receipts")
          .select("id, created_at, status")
          .order("created_at", { ascending: false })
          .limit(3)
          .throwOnError()

        setStats({
          totalLawyers: allLawyers?.length || 0,
          activeLawyers,
          pendingApprovals: pendingLawyers,
          totalConsultations: consultationCount || 0,
        })

        // Format recent activity
        if (recentReceipts) {
          const activity = recentReceipts.map((receipt) => ({
            id: receipt.id,
            type: receipt.status === "approved" ? "success" : "pending",
            message:
              receipt.status === "approved"
                ? "Payment approved"
                : receipt.status === "pending"
                  ? "Payment pending review"
                  : "Payment rejected",
            timestamp: new Date(receipt.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
          }))
          setRecentActivity(activity)
        }
      } catch (error) {
        console.error("Error loading stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()
  }, [])

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your platform metrics</p>
      </div>

      <div className="space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  ) : (
                    <Users className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.totalLawyers}</p>
                  <p className="text-xs text-muted-foreground">Total Lawyers</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.activeLawyers}</p>
                  <p className="text-xs text-muted-foreground">Active Lawyers</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.pendingApprovals}</p>
                  <p className="text-xs text-muted-foreground">Pending Approvals</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.totalConsultations}</p>
                  <p className="text-xs text-muted-foreground">Consultations</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Growth Card */}
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-primary-foreground/80">Platform Status</p>
                <p className="text-3xl font-bold mt-1">{stats.totalLawyers > 0 ? "Active" : "Getting Started"}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Card
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => router.push("/admin/payments")}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                      <FileCheck className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Review Payment Receipts</p>
                      <p className="text-sm text-muted-foreground">{stats.pendingApprovals} pending</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => router.push("/admin/lawyers")}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Manage Lawyers</p>
                      <p className="text-sm text-muted-foreground">{stats.totalLawyers} registered</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Recent Activity</h3>
            <Card>
              <CardContent className="p-0 divide-y divide-border">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity) => (
                    <div key={activity.id} className="p-4 flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          activity.type === "success" ? "bg-emerald-500/10" : "bg-amber-500/10"
                        }`}
                      >
                        {activity.type === "success" ? (
                          <CheckCircle className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <Clock className="h-4 w-4 text-amber-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.message}</p>
                        <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-muted-foreground text-sm">No recent activity</div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
