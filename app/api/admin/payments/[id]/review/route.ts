import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

// PATCH /api/admin/payments/[id]/review - Approve/Reject Payment (Admin Only)

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  try {
    const { id } = await params
    const body = await request.json()

    const cookieStore = await cookies()
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

    // Get the payment receipt with lawyer details
    const { data: receipt, error: receiptError } = await supabase
      .from("payment_receipts")
      .select("*")
      .eq("id", id)
      .single()

    if (receiptError || !receipt) {
      return Response.json({ success: false, error: "Payment receipt not found" }, { status: 404 })
    }

    if (body.status === "approved") {
      // 1. Update payment receipt to approved
      // 2. Update subscription to active with dates
      // 3. Update lawyer_profiles to active so they appear to clients
      const { error: receiptUpdateError } = await supabase
        .from("payment_receipts")
        .update({ status: "approved", reviewed_at: new Date() })
        .eq("id", id)

      if (receiptUpdateError) throw receiptUpdateError

      // Get the subscription
      const { data: subscription, error: subError } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("id", receipt.subscription_id)
        .single()

      if (subError || !subscription) throw new Error("Subscription not found")

      // Update subscription to active and set dates
      const startDate = new Date()
      const endDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days
      const { error: subUpdateError } = await supabase
        .from("subscriptions")
        .update({
          status: "active",
          starts_at: startDate.toISOString(),
          ends_at: endDate.toISOString(),
        })
        .eq("id", subscription.id)

      if (subUpdateError) throw subUpdateError

      // Activate lawyer profile - THIS IS CRITICAL
      const { error: lawyerUpdateError } = await supabase
        .from("lawyer_profiles")
        .update({ status: "active" })
        .eq("id", receipt.lawyer_id)

      if (lawyerUpdateError) throw lawyerUpdateError

      return Response.json({
        success: true,
        message: "Payment approved and lawyer activated",
      })
    } else if (body.status === "rejected") {
      const { error } = await supabase
        .from("payment_receipts")
        .update({
          status: "rejected",
          reviewed_at: new Date(),
          admin_notes: body.rejectionReason,
        })
        .eq("id", id)

      if (error) throw error

      return Response.json({
        success: true,
        message: "Payment rejected",
      })
    }

    return Response.json({ success: false, error: "Invalid status" }, { status: 400 })
  } catch (error) {
    console.error("Error reviewing payment:", error)
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    )
  }
}
