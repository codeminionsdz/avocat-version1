"use client"

import type React from "react"
import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { MobileShell } from "@/components/mobile-shell"
import { Header } from "@/components/header"
import { AvocaLogo } from "@/components/avoca-logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  // SECURITY: Don't accept role from URL. Auto-detect from database.
  const returnUrl = searchParams.get("returnUrl")
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    console.log("[v0] Login attempt - checking env vars")
    console.log("[v0] NEXT_PUBLIC_SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL ? "set" : "NOT SET")
    console.log("[v0] NEXT_PUBLIC_SUPABASE_ANON_KEY:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "set" : "NOT SET")

    const supabase = createClient()

    try {
      console.log("[v0] Calling signInWithPassword for email:", email)
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log("[v0] Auth response received", { hasData: !!data, hasError: !!authError })

      if (authError) throw authError

      // Check signup_intent from localStorage (for post-email-confirmation redirect)
      const signupIntent = typeof window !== 'undefined' ? localStorage.getItem("signup_intent") : null
      
      // Check user role from database (not URL)
      const userRole = data.user?.user_metadata?.role

      // Redirect based on priority: returnUrl > signup_intent > actual role
      if (returnUrl) {
        // Clear signup_intent after successful redirect
        if (typeof window !== 'undefined') {
          localStorage.removeItem("signup_intent")
        }
        // Use replace to avoid back button issues
        router.replace(decodeURIComponent(returnUrl))
      } else if (signupIntent === "lawyer") {
        // User selected "I am a lawyer" on welcome page
        // Clear the intent after using it
        if (typeof window !== 'undefined') {
          localStorage.removeItem("signup_intent")
        }
        // Check if they have a lawyer profile, redirect accordingly
        router.replace("/lawyer")
      } else if (userRole === "lawyer") {
        // User has lawyer role in database
        router.replace("/lawyer")
      } else {
        // Default to client home
        // Clear signup_intent if any
        if (typeof window !== 'undefined') {
          localStorage.removeItem("signup_intent")
        }
        router.replace("/client/home")
      }
    } catch (err) {
      console.log("[v0] Login error:", err)
      setError(err instanceof Error ? err.message : "An error occurred during sign in")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <MobileShell>
      <Header title="Sign In" showBack />
      <div className="flex-1 px-6 py-8">
        <div className="flex justify-center mb-8">
          <AvocaLogo />
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
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
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              required
              className="h-12"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}

          <Button type="submit" className="w-full h-12" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            {"Don't have an account? "}
            <Link 
              href={`/auth/register${returnUrl ? `?returnUrl=${encodeURIComponent(returnUrl)}` : ''}`} 
              className="text-primary font-medium"
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </MobileShell>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}
