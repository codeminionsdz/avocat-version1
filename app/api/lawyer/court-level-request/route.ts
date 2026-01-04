import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import type { CourtLevel } from "@/lib/database.types"

/**
 * POST /api/lawyer/court-level-request
 * Allows lawyers to request authorization for higher court levels
 * Requires admin approval
 */

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { requestedLevel, justification } = body

    // Validate requested level
    const validLevels: CourtLevel[] = ["appeal", "supreme_court", "council_of_state"]
    if (!validLevels.includes(requestedLevel)) {
      return NextResponse.json(
        { error: "Invalid court level. Cannot request first_instance (already authorized by default)." },
        { status: 400 },
      )
    }

    // Check if lawyer already has this authorization
    const { data: lawyerProfile } = await supabase
      .from("lawyer_profiles")
      .select("authorized_courts")
      .eq("id", user.id)
      .single()

    if (!lawyerProfile) {
      return NextResponse.json({ error: "Lawyer profile not found" }, { status: 404 })
    }

    const authorizedCourts = lawyerProfile.authorized_courts || ["first_instance"]
    if (authorizedCourts.includes(requestedLevel)) {
      return NextResponse.json({ error: "You already have authorization for this court level" }, { status: 400 })
    }

    // Check if there's already a pending request
    const { data: existingRequest } = await supabase
      .from("court_level_requests")
      .select("*")
      .eq("lawyer_id", user.id)
      .eq("requested_level", requestedLevel)
      .eq("status", "pending")
      .single()

    if (existingRequest) {
      return NextResponse.json(
        { error: "You already have a pending request for this court level" },
        { status: 400 },
      )
    }

    // Create the request
    const { data: newRequest, error: insertError } = await supabase
      .from("court_level_requests")
      .insert({
        lawyer_id: user.id,
        requested_level: requestedLevel,
        status: "pending",
        justification: justification || null,
      })
      .select()
      .single()

    if (insertError) {
      console.error("[Court Level Request] Insert error:", insertError)
      throw insertError
    }

    return NextResponse.json({
      success: true,
      message: "Request submitted successfully. Awaiting admin approval.",
      request: newRequest,
    })
  } catch (error) {
    console.error("[Court Level Request] Error:", error)
    return NextResponse.json({ error: "Failed to submit request" }, { status: 500 })
  }
}

/**
 * GET /api/lawyer/court-level-request
 * Get all court level requests for the authenticated lawyer
 */

export async function GET() {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch all requests for this lawyer
    const { data: requests, error: fetchError } = await supabase
      .from("court_level_requests")
      .select("*")
      .eq("lawyer_id", user.id)
      .order("created_at", { ascending: false })

    if (fetchError) {
      console.error("[Court Level Request] Fetch error:", fetchError)
      throw fetchError
    }

    return NextResponse.json({ requests: requests || [] })
  } catch (error) {
    console.error("[Court Level Request] Error:", error)
    return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 })
  }
}
