"use client"

import { Header } from "@/components/header"
import { Card, CardContent } from "@/components/ui/card"
import { Shield } from "lucide-react"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <Header title="Privacy & Security" showBack />
      <div className="px-4 py-6">
        <Card>
          <CardContent className="p-8 text-center">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <h2 className="text-lg font-semibold text-foreground mt-4">Coming Soon</h2>
            <p className="text-muted-foreground mt-2">Privacy settings will be available soon</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
