"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Scale, ArrowRight, Bot, AlertTriangle } from "lucide-react"
import { categoryLabels, type LegalCategory } from "@/lib/mock-data"

export default function ClientHomePage() {
  const router = useRouter()
  const [issue, setIssue] = useState("")

  const handleStartConsultation = () => {
    if (issue.trim()) {
      router.push(`/client/ai-assistant?issue=${encodeURIComponent(issue)}`)
    }
  }

  const quickCategories: LegalCategory[] = ["family", "criminal", "civil", "labor"]

  return (
    <div className="min-h-screen">
      <Header title="Avoca" showNotifications />

      <div className="px-4 py-6 space-y-6">
        {/* Welcome Section */}
        <div>
          <h2 className="text-xl font-semibold text-foreground">Hello!</h2>
          <p className="text-muted-foreground mt-1">How can we help you today?</p>
        </div>

        {/* Issue Input Card */}
        <Card className="border-primary/20">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Bot className="h-5 w-5" />
              <span className="font-medium">Describe your legal issue</span>
            </div>
            <Textarea
              placeholder="Tell us about your situation. For example: 'I need help with a divorce case' or 'I was wrongfully terminated from my job'"
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
              className="min-h-[100px] resize-none"
            />
            <Button onClick={handleStartConsultation} disabled={!issue.trim()} className="w-full">
              Start AI Consultation
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Quick Categories */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Quick Categories</h3>
          <div className="flex flex-wrap gap-2">
            {quickCategories.map((cat) => (
              <Badge
                key={cat}
                variant="secondary"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors py-2 px-3"
                onClick={() => router.push(`/client/lawyers?category=${cat}`)}
              >
                {categoryLabels[cat]}
              </Badge>
            ))}
          </div>
        </div>

        {/* Legal Disclaimer */}
        <Card className="bg-muted/50 border-amber-500/30">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-foreground">Legal Disclaimer</p>
                <p className="text-muted-foreground mt-1">
                  Our AI assistant helps classify your case but does not provide legal advice. Always consult a
                  qualified lawyer for legal matters.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Find Lawyers CTA */}
        <Card
          className="bg-primary text-primary-foreground cursor-pointer hover:bg-primary/90 transition-colors"
          onClick={() => router.push("/client/lawyers")}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <Scale className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">Browse Lawyers</p>
                <p className="text-sm text-primary-foreground/80">Find verified professionals</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
