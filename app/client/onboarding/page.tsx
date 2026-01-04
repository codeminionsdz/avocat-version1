"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MobileShell } from "@/components/mobile-shell"
import { Button } from "@/components/ui/button"
import { AvocaLogo } from "@/components/avoca-logo"
import { Scale, MessageSquare, UserCheck, ShieldCheck } from "lucide-react"

const onboardingSteps = [
  {
    icon: Scale,
    title: "Find Legal Help",
    description: "Describe your legal issue and our AI assistant will help classify your case.",
  },
  {
    icon: UserCheck,
    title: "Verified Lawyers",
    description: "Browse and select from our network of verified legal professionals in Algeria.",
  },
  {
    icon: MessageSquare,
    title: "Easy Communication",
    description: "Chat directly with your chosen lawyer through our secure messaging system.",
  },
  {
    icon: ShieldCheck,
    title: "Your Privacy Matters",
    description: "All your conversations and case details are kept confidential and secure.",
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      router.push("/client")
    }
  }

  const handleSkip = () => {
    router.push("/client")
  }

  const step = onboardingSteps[currentStep]
  const Icon = step.icon

  return (
    <MobileShell>
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4">
          <AvocaLogo size="sm" />
          <Button variant="ghost" onClick={handleSkip} className="text-muted-foreground">
            Skip
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-8">
            <Icon className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-4">{step.title}</h2>
          <p className="text-muted-foreground max-w-xs leading-relaxed">{step.description}</p>
        </div>

        {/* Progress & Navigation */}
        <div className="px-6 pb-8 space-y-6">
          {/* Progress dots */}
          <div className="flex justify-center gap-2">
            {onboardingSteps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === currentStep ? "w-8 bg-primary" : "w-2 bg-muted"
                }`}
              />
            ))}
          </div>

          <Button onClick={handleNext} className="w-full h-12">
            {currentStep === onboardingSteps.length - 1 ? "Get Started" : "Next"}
          </Button>
        </div>
      </div>
    </MobileShell>
  )
}
