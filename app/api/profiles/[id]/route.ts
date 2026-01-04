import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // Create Supabase client with service role key to bypass RLS
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    console.log("[API /profiles/:id] Fetching profile:", id)

    const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", id).single()

    if (error) {
      console.error("[API /profiles/:id] Error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    console.log("[API /profiles/:id] Found profile:", profile)

    return NextResponse.json(profile)
  } catch (error) {
    console.error("[API /profiles/:id] Unexpected error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}
