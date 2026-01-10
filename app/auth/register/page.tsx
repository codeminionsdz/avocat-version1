"use client"

import type React from "react"
import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { MobileShell } from "@/components/mobile-shell"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { getBaseUrl } from "@/lib/config"

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  // SECURITY FIX: Always register as client. Only lawyer registration API should create lawyers.
  const role = "client"
  const returnUrl = searchParams.get("returnUrl")
  const [isLoading, setIsLoading] = useState(false)
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    const supabase = createClient()

    try {
      // Determine the redirect URL based on signup_intent
      const baseUrl = getBaseUrl()
      let redirectUrl: string
      
      // Check signup_intent from localStorage (set on welcome page)
      const signupIntent = typeof window !== 'undefined' ? localStorage.getItem("signup_intent") : null
      
      if (returnUrl) {
        // If there's a returnUrl (e.g., from QR/public flow), use it and override intent to client
        if (typeof window !== 'undefined') {
          localStorage.setItem("signup_intent", "client")
        }
        redirectUrl = `${baseUrl}${decodeURIComponent(returnUrl)}`
      } else if (signupIntent === "lawyer") {
        // User selected "I am a lawyer" on welcome page
        redirectUrl = `${baseUrl}/lawyer/register`
      } else {
        // Default to client onboarding
        redirectUrl = `${baseUrl}/client/onboarding`
      }

      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            role: "client", // SECURITY: Force client role. Only api/lawyer/register creates lawyers
            full_name: fullName,
            phone: phone,
          },
        },
      })

      if (authError) throw authError

      // Redirect to confirmation page
      router.push("/auth/sign-up-success")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during registration")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <MobileShell>
      <Header title="Create Account" showBack />
      <div className="flex-1 px-6 py-8">
        <form onSubmit={handleRegister} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your full name"
              required
              className="h-12"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              required
              className="h-12"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+213 XXX XXX XXX"
              required
              className="h-12"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Create a password"
              required
              className="h-12"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              required
              className="h-12"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}

          <Button type="submit" className="w-full h-12" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Create Account"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link 
              href={`/auth/login${returnUrl ? `?returnUrl=${encodeURIComponent(returnUrl)}` : ''}`} 
              className="text-primary font-medium"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </MobileShell>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <RegisterForm />
    </Suspense>
  )
}
