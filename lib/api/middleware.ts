// ============================================
// API MIDDLEWARE - Backend Ready Structure
// ============================================

import type { User, UserRole, LawyerProfile } from "./types"

// ============================================
// AUTHENTICATION MIDDLEWARE
// ============================================

export interface AuthenticatedRequest {
  user: Omit<User, "passwordHash">
  token: string
}

/**
 * Verifies JWT token and extracts user information
 * In production: Use jose or jsonwebtoken library
 */
export async function authenticateToken(token: string): Promise<AuthenticatedRequest | null> {
  // TODO: Implement JWT verification
  // 1. Verify token signature
  // 2. Check token expiration
  // 3. Extract user ID from payload
  // 4. Fetch user from database
  // 5. Return user object or null

  // Placeholder for development
  console.log("[Auth] Verifying token:", token.substring(0, 20) + "...")
  return null
}

/**
 * Middleware to require authentication
 */
export function requireAuth(handler: (req: AuthenticatedRequest) => Promise<Response>) {
  return async (request: Request): Promise<Response> => {
    const authHeader = request.headers.get("Authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return Response.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Missing or invalid authorization header" } },
        { status: 401 },
      )
    }

    const token = authHeader.substring(7)
    const auth = await authenticateToken(token)

    if (!auth) {
      return Response.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Invalid or expired token" } },
        { status: 401 },
      )
    }

    return handler(auth)
  }
}

// ============================================
// ROLE-BASED ACCESS CONTROL
// ============================================

/**
 * Middleware to require specific user roles
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return (handler: (req: AuthenticatedRequest) => Promise<Response>) => {
    return async (auth: AuthenticatedRequest): Promise<Response> => {
      if (!allowedRoles.includes(auth.user.role)) {
        return Response.json(
          {
            success: false,
            error: {
              code: "FORBIDDEN",
              message: `Access denied. Required roles: ${allowedRoles.join(", ")}`,
            },
          },
          { status: 403 },
        )
      }

      return handler(auth)
    }
  }
}

/**
 * Middleware to require admin role specifically
 */
export function requireAdmin(handler: (req: AuthenticatedRequest) => Promise<Response>) {
  return requireRole("admin")(handler)
}

/**
 * Middleware to require lawyer role specifically
 */
export function requireLawyer(handler: (req: AuthenticatedRequest) => Promise<Response>) {
  return requireRole("lawyer")(handler)
}

/**
 * Middleware to require client role specifically
 */
export function requireClient(handler: (req: AuthenticatedRequest) => Promise<Response>) {
  return requireRole("client")(handler)
}

// ============================================
// LAWYER STATUS GUARD
// ============================================

/**
 * Middleware to block inactive lawyers from performing actions
 */
export function requireActiveLawyer(handler: (req: AuthenticatedRequest, profile: LawyerProfile) => Promise<Response>) {
  return async (auth: AuthenticatedRequest): Promise<Response> => {
    if (auth.user.role !== "lawyer") {
      return Response.json(
        { success: false, error: { code: "FORBIDDEN", message: "Only lawyers can access this resource" } },
        { status: 403 },
      )
    }

    // TODO: Fetch lawyer profile from database
    // const profile = await db.lawyerProfiles.findByUserId(auth.user.id)
    const profile: LawyerProfile | null = null // Placeholder

    if (!profile) {
      return Response.json(
        { success: false, error: { code: "NOT_FOUND", message: "Lawyer profile not found" } },
        { status: 404 },
      )
    }

    if (profile.status !== "active") {
      return Response.json(
        {
          success: false,
          error: {
            code: "LAWYER_INACTIVE",
            message: "Your account is not active. Please complete subscription to continue.",
          },
        },
        { status: 403 },
      )
    }

    return handler(auth, profile)
  }
}

// ============================================
// RATE LIMITING (Structure)
// ============================================

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
}

/**
 * Rate limiting middleware structure
 * In production: Use Redis or similar for distributed rate limiting
 */
export function rateLimit(config: RateLimitConfig) {
  // In-memory store for development (use Redis in production)
  const requests = new Map<string, { count: number; resetTime: number }>()

  return (handler: (req: Request) => Promise<Response>) => {
    return async (request: Request): Promise<Response> => {
      const ip = request.headers.get("x-forwarded-for") || "unknown"
      const now = Date.now()

      const record = requests.get(ip)

      if (!record || now > record.resetTime) {
        requests.set(ip, { count: 1, resetTime: now + config.windowMs })
      } else if (record.count >= config.maxRequests) {
        return Response.json(
          { success: false, error: { code: "RATE_LIMITED", message: "Too many requests. Please try again later." } },
          { status: 429 },
        )
      } else {
        record.count++
      }

      return handler(request)
    }
  }
}

// ============================================
// INPUT VALIDATION HELPERS
// ============================================

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters")
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter")
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter")
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number")
  }

  return { valid: errors.length === 0, errors }
}
