// ============================================
// PATCH /api/lawyers/[id]/availability - Update Availability (Lawyer Only)
// ============================================

import type { UpdateLawyerAvailabilityRequest, LawyerProfile, ApiResponse } from "@/lib/api/types"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  try {
    const { id } = await params
    // TODO: Add lawyer authentication middleware
    // const { auth, profile } = await requireActiveLawyer(request)
    // Verify the lawyer is updating their own availability

    const body: UpdateLawyerAvailabilityRequest = await request.json()

    if (typeof body.isAvailable !== "boolean") {
      return Response.json(
        {
          success: false,
          error: { code: "VALIDATION_ERROR", message: "isAvailable must be a boolean" },
        } as ApiResponse<never>,
        { status: 400 },
      )
    }

    // TODO: Implement database update
    // 1. Verify lawyer owns this profile
    // 2. Verify lawyer status is 'active'
    // 3. Update availability

    // Placeholder response
    const mockResponse: ApiResponse<LawyerProfile> = {
      success: true,
      data: {
        id,
        userId: "user_1",
        name: "Lawyer Name",
        city: "Algiers",
        bio: "Bio",
        specialties: ["criminal"],
        status: "active",
        isAvailable: body.isAvailable,
        rating: 4.5,
        consultationsCount: 100,
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
