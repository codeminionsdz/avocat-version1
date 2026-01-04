import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // PUBLIC ROUTES - No authentication required
  const isPublicLawyerProfile = /^\/lawyer\/[^\/]+$/.test(pathname)
  const isPublicApi = pathname.startsWith('/api/lawyer/public/')
  const isAuthPage = pathname.startsWith('/auth/')
  const isLandingPage = pathname === '/'

  // Skip auth for public routes
  if (isPublicLawyerProfile || isPublicApi || isAuthPage || isLandingPage) {
    return supabaseResponse
  }

  // Protected routes for clients
  if (pathname.startsWith("/client") && !user) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    url.searchParams.set("role", "client")
    url.searchParams.set("returnUrl", pathname)
    return NextResponse.redirect(url)
  }

  // Protected routes for lawyers (dashboard, profile, etc. - but NOT /lawyer/[id])
  if (pathname.startsWith("/lawyer") && !user) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    url.searchParams.set("role", "lawyer")
    url.searchParams.set("returnUrl", pathname)
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
