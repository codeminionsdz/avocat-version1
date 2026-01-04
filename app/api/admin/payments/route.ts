// ============================================
// GET /api/admin/payments - List Pending Payment Receipts (Admin Only)
// ============================================

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function GET(request: Request): Promise<Response> {
  try {
    // TODO: Add admin authentication middleware
    // const auth = await requireAdmin(request)

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "100")
    const status = searchParams.get("status") || "pending"

    const cookieStore = await cookies()

    // CRITICAL: Use service role key to bypass RLS for admin access
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

    console.log("[API /admin/payments] Fetching receipts with status:", status)

    // Query payment_receipts
    // Note: payment_receipts.lawyer_id → auth.users.id, not profiles.id directly
    // We need to query separately and join manually
    const { data: receipts, error: receiptsError } = await supabase
      .from("payment_receipts")
      .select("*")
      .eq("status", status)
      .order("created_at", { ascending: false })

    if (receiptsError) {
      console.error("[API /admin/payments] Query error:", {
        message: receiptsError.message,
        details: receiptsError.details,
        hint: receiptsError.hint,
        code: receiptsError.code,
      })
      return Response.json(
        {
          success: false,
          error: { code: "DATABASE_ERROR", message: receiptsError.message },
        },
        { status: 500 },
      )
    }

    if (!receipts || receipts.length === 0) {
      console.log("[API /admin/payments] No receipts found")
      return Response.json(
        {
          success: true,
          data: {
            data: [],
            total: 0,
            page,
            limit,
            totalPages: 0,
          },
        },
        { status: 200 },
      )
    }

    console.log("[API /admin/payments] Found receipts:", receipts.length)

    // Fetch related subscriptions
    const subscriptionIds = receipts.map((r) => r.subscription_id).filter(Boolean)
    const { data: subscriptions } = await supabase
      .from("subscriptions")
      .select("*")
      .in("id", subscriptionIds)

    // Fetch related profiles
    const lawyerIds = receipts.map((r) => r.lawyer_id).filter(Boolean)
    const { data: profiles } = await supabase.from("profiles").select("*").in("id", lawyerIds)

    // Build lookup maps
    const subscriptionMap = new Map(subscriptions?.map((s) => [s.id, s]) || [])
    const profileMap = new Map(profiles?.map((p) => [p.id, p]) || [])

    // Get total count for pagination
    const { count, error: countError } = await supabase
      .from("payment_receipts")
      .select("*", { count: "exact", head: true })
      .eq("status", status)

    if (countError) {
      console.error("[API /admin/payments] Count error:", countError)
    }

    const total = count || 0
    const totalPages = Math.ceil(total / limit)

    // Format response - NO MOCK DATA, manually join data
    const formattedData = receipts.map((receipt) => ({
      id: receipt.id,
      subscription_id: receipt.subscription_id,
      lawyer_id: receipt.lawyer_id,
      receipt_url: receipt.receipt_url,
      status: receipt.status,
      admin_notes: receipt.admin_notes,
      reviewed_at: receipt.reviewed_at,
      created_at: receipt.created_at,
      subscription: subscriptionMap.get(receipt.subscription_id) || null,
      lawyer: profileMap.get(receipt.lawyer_id) || null,
    }))

    return Response.json(
      {
        success: true,
        data: {
          data: formattedData,
          total,
          page,
          limit,
          totalPages,
        },
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("[API /admin/payments] Unexpected error:", error)
    return Response.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" },
      },
      { status: 500 },
    )
  }
}
