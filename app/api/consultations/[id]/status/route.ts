// ============================================
// PATCH /api/consultations/[id]/status - Update Consultation Status
// ============================================

import type { UpdateConsultationStatusRequest, Consultation, ApiResponse } from "@/lib/api/types"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  try {
    const { id } = await params
    // TODO: Add authentication middleware
    // const auth = await requireAuth(request)

    const body: UpdateConsultationStatusRequest = await request.json()

    // Validate status
    const validStatuses = ["pending", "accepted", "rejected", "completed", "cancelled"]
    if (!validStatuses.includes(body.status)) {
      return Response.json(
        {
          success: false,
          error: { code: "VALIDATION_ERROR", message: "Invalid status value" },
        } as ApiResponse<never>,
        { status: 400 },
      )
    }

    // TODO: Implement status update logic
    // 1. Find consultation by ID
    // 2. Verify user has permission to update:
    //    - Lawyers can: accept, reject, complete
    //    - Clients can: cancel (if still pending)
    // 3. Validate status transition is allowed
    // 4. Update status
    // 5. Send notification to other party

    // Placeholder response
    const mockResponse: ApiResponse<Consultation> = {
      success: true,
      data: {
        id,
        clientId: "client_1",
        lawyerId: "lawyer_1",
        category: "criminal",
        summary: "Case summary",
        status: body.status,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    }

    return Response.json(mockResponse, { status: 200 })
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
