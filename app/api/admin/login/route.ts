// ============================================
// POST /api/admin/login - Admin Password Login
// ============================================

import type { AdminLoginRequest, ApiResponse } from "@/lib/api/types"

const ADMIN_PASSWORD = "avocatforwin"

export async function POST(request: Request): Promise<Response> {
  try {
    const body: AdminLoginRequest = await request.json()

    if (!body.password) {
      return Response.json(
        {
          success: false,
          error: { code: "VALIDATION_ERROR", message: "Password is required" },
        } as ApiResponse<never>,
        { status: 400 },
      )
    }

    if (body.password !== ADMIN_PASSWORD) {
      return Response.json(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "Invalid admin password" },
        } as ApiResponse<never>,
        { status: 401 },
      )
    }

    // TODO: In production, generate proper admin JWT token
    const mockResponse: ApiResponse<{ token: string }> = {
      success: true,
      data: {
        token: "admin_jwt_token_placeholder",
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
