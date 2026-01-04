// ============================================
// POST /api/subscriptions/payment-receipt - Submit Payment Receipt (Lawyer Only)
// ============================================

import type { SubmitPaymentReceiptRequest, PaymentReceipt, ApiResponse } from "@/lib/api/types"

export async function POST(request: Request): Promise<Response> {
  try {
    // TODO: Add lawyer authentication middleware
    // const auth = await requireLawyer(request)

    const body: SubmitPaymentReceiptRequest = await request.json()

    // Validate required fields
    if (!body.subscriptionId || !body.receiptUrl || !body.amount) {
      return Response.json(
        {
          success: false,
          error: { code: "VALIDATION_ERROR", message: "subscriptionId, receiptUrl, and amount are required" },
        } as ApiResponse<never>,
        { status: 400 },
      )
    }

    // Validate amount (must be exactly 15000 DZD for annual plan)
    if (body.amount !== 15000) {
      return Response.json(
        {
          success: false,
          error: { code: "VALIDATION_ERROR", message: "Amount must be 15,000 DZD (annual subscription)" },
        } as ApiResponse<never>,
        { status: 400 },
      )
    }

    // TODO: Implement receipt submission
    // 1. Verify lawyer owns this subscription
    // 2. Verify no pending receipt already exists
    // 3. Create payment receipt with status 'pending'
    // 4. Update lawyer status to 'pending'
    // 5. Notify admin of new receipt

    // Placeholder response
    const mockResponse: ApiResponse<PaymentReceipt> = {
      success: true,
      data: {
        id: "receipt_new",
        subscriptionId: body.subscriptionId,
        lawyerId: "lawyer_1",
        receiptUrl: body.receiptUrl,
        amount: body.amount,
        status: "pending",
        submittedAt: new Date(),
        createdAt: new Date(),
      },
    }

    return Response.json(mockResponse, { status: 201 })
  } catch {
    return Response.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" },
      } as ApiResponse<never>,
      { status: 500 },
    )
  }
}
