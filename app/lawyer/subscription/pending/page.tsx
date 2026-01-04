"use client"

import { useRouter } from "next/navigation"
import { MobileShell } from "@/components/mobile-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Clock, Mail } from "lucide-react"
import { AvocaLogo } from "@/components/avoca-logo"

export default function SubscriptionPendingPage() {
  const router = useRouter()

  return (
    <MobileShell>
      <div className="min-h-screen flex flex-col px-6 py-12">
        <div className="flex justify-center mb-8">
          <AvocaLogo />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center mb-6">
            <Clock className="h-10 w-10 text-amber-600" />
          </div>

          <h1 className="text-2xl font-bold text-foreground">Payment Under Review</h1>
          <p className="text-muted-foreground mt-3 max-w-xs leading-relaxed">
            Thank you for submitting your payment receipt. Our team is reviewing your subscription.
          </p>

          <Card className="w-full mt-8 bg-muted/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary" />
                <div className="text-left">
                  <p className="text-sm font-medium">You will be notified</p>
                  <p className="text-xs text-muted-foreground">
                    We will send you an email once your account is activated.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 space-y-2 text-sm text-muted-foreground">
            <p>Typical review time: 24-48 hours</p>
            <p>Questions? Contact support@avoca.dz</p>
          </div>
        </div>

        <Button variant="outline" onClick={() => router.push("/")} className="mt-8">
          Return to Home
        </Button>
      </div>
    </MobileShell>
  )
}
