import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/**
 * GET /api/lawyer/public/[id]
 * Fetch public lawyer profile information
 * No authentication required - this is a public endpoint
 * 
 * IMPORTANT: id param is the user_id from profiles table
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    console.log('[Public Lawyer Profile] Fetching lawyer with id:', id)

    // First, check if lawyer profile exists (bypass RLS for public endpoint)
    const { data: lawyerProfile, error: lawyerError } = await supabase
      .from("lawyer_profiles")
      .select("*")
      .eq("id", id)
      .single()

    console.log('[Public Lawyer Profile] Lawyer profile result:', { 
      found: !!lawyerProfile, 
      error: lawyerError?.message,
      code: lawyerError?.code
    })

    if (lawyerError || !lawyerProfile) {
      console.error('[Public Lawyer Profile] Not found:', lawyerError)
      return NextResponse.json(
        { error: "Lawyer not found", details: lawyerError?.message },
        { status: 404 }
      )
    }

    // Fetch the profile data
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single()

    console.log('[Public Lawyer Profile] Profile result:', { 
      found: !!profile, 
      error: profileError?.message 
    })

    console.log('[Public Lawyer Profile] Profile result:', { 
      found: !!profile, 
      error: profileError?.message 
    })

    // Check if lawyer is active
    if (lawyerProfile.status !== "active") {
      console.log('[Public Lawyer Profile] Lawyer not active:', lawyerProfile.status)
      return NextResponse.json(
        { error: "Lawyer profile is not active" },
        { status: 404 }
      )
    }

    // Fetch active subscription (optional - don't block if not found)
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("lawyer_id", id)
      .eq("status", "active")
      .gte("ends_at", new Date().toISOString())
      .order("ends_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    console.log('[Public Lawyer Profile] Subscription:', !!subscription)

    // Format response
    const response = {
      lawyer: {
        ...lawyerProfile,
        profile: profile || null,
      },
      subscription: subscription || null,
    }

    console.log('[Public Lawyer Profile] Success, returning profile')
    return NextResponse.json(response)
  } catch (error) {
    console.error("Error fetching public lawyer profile:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
