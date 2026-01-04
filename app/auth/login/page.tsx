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
  const role = searchParams.get("role") || "client"
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

      // Check user role and redirect accordingly
      const userRole = data.user?.user_metadata?.role

      if (role === "lawyer" && userRole !== "lawyer") {
        setError("This account is not registered as a lawyer")
        await supabase.auth.signOut()
        return
      }

      if (role === "client" && userRole === "lawyer") {
        setError("This account is registered as a lawyer. Please use the lawyer login.")
        await supabase.auth.signOut()
        return
      }

      // Redirect based on role
      if (userRole === "lawyer") {
        router.push("/lawyer")
      } else {
        router.push("/client/home")
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
            <Link href={`/auth/register?role=${role}`} className="text-primary font-medium">
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
