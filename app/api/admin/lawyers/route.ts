// ============================================
// GET /api/admin/lawyers - List All Lawyers (Admin Only)
// ============================================

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function GET(request: Request): Promise<Response> {
  try {
    // TODO: Add admin authentication middleware
    // const auth = await requireAdmin(request)

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")

    const cookieStore = await cookies()

    // Use service role key to bypass RLS for admin access
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || "",
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
        },
      },
    )

    console.log("[API /admin/lawyers] Fetching lawyers with status:", status || "all")

    // Query lawyer_profiles
    let query = supabase.from("lawyer_profiles").select("*").order("created_at", { ascending: false })

    // Apply status filter if provided
    if (status && status !== "all") {
      query = query.eq("status", status)
    }

    const { data: lawyerProfiles, error: lawyersError } = await query

    if (lawyersError) {
      console.error("[API /admin/lawyers] Query error:", lawyersError)
      return Response.json(
        {
          success: false,
          error: { code: "DATABASE_ERROR", message: lawyersError.message },
        },
        { status: 500 },
      )
    }

    if (!lawyerProfiles || lawyerProfiles.length === 0) {
      console.log("[API /admin/lawyers] No lawyers found")
      return Response.json({ success: true, data: [] }, { status: 200 })
    }

    console.log("[API /admin/lawyers] Found lawyers:", lawyerProfiles.length)

    // Fetch related profiles
    const lawyerIds = lawyerProfiles.map((l) => l.id)
    const { data: profiles } = await supabase.from("profiles").select("*").in("id", lawyerIds)

    // Build lookup map
    const profileMap = new Map(profiles?.map((p) => [p.id, p]) || [])

    // Format response
    const formattedData = lawyerProfiles.map((lawyer) => ({
      id: lawyer.id,
      bar_number: lawyer.bar_number,
      specialties: lawyer.specialties,
      bio: lawyer.bio,
      years_of_experience: lawyer.years_of_experience,
      rating: lawyer.rating,
      consultations_count: lawyer.consultations_count,
      is_available: lawyer.is_available,
      status: lawyer.status,
      authorized_courts: lawyer.authorized_courts || ["first_instance"],
      created_at: lawyer.created_at,
      updated_at: lawyer.updated_at,
      profile: profileMap.get(lawyer.id) || null,
    }))

    return Response.json({ success: true, data: formattedData }, { status: 200 })
  } catch (error) {
    console.error("[API /admin/lawyers] Unexpected error:", error)
    return Response.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" },
      },
      { status: 500 },
    )
  }
}
