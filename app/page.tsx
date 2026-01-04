"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MobileShell } from "@/components/mobile-shell"
import { AvocaLogo } from "@/components/avoca-logo"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<"client" | "lawyer" | null>(null)

  const handleContinue = () => {
    if (selectedRole === "client") {
      router.push("/auth/login?role=client")
    } else if (selectedRole === "lawyer") {
      router.push("/auth/login?role=lawyer")
    }
  }

  return (
    <MobileShell>
      <div className="min-h-screen flex flex-col bg-primary">
        {/* Hero Section */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 pt-12 pb-8">
          <AvocaLogo size="lg" variant="white" />
          <p className="text-primary-foreground/80 text-center mt-4 text-lg">Legal Services in Algeria</p>
          <p className="text-primary-foreground/60 text-center mt-2 text-sm max-w-xs">
            Connect with verified lawyers and get the legal help you need
          </p>
        </div>

        {/* Role Selection - Removed admin option */}
        <div className="bg-card rounded-t-3xl px-6 py-8 space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-foreground">Welcome</h2>
            <p className="text-muted-foreground text-sm mt-1">How would you like to use Avoca?</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setSelectedRole("client")}
              className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                selectedRole === "client" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
              }`}
            >
              <div className="font-semibold text-foreground">I need legal help</div>
              <div className="text-sm text-muted-foreground mt-1">Find and consult with verified lawyers</div>
            </button>

            <button
              onClick={() => setSelectedRole("lawyer")}
              className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                selectedRole === "lawyer" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
              }`}
            >
              <div className="font-semibold text-foreground">I am a lawyer</div>
              <div className="text-sm text-muted-foreground mt-1">Offer your legal services to clients</div>
            </button>
          </div>

          <Button onClick={handleContinue} disabled={!selectedRole} className="w-full h-12 text-base">
            Continue
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </MobileShell>
  )
}
