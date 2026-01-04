import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import type { ConsultationWithClient } from "@/lib/database.types"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function GET(request: Request) {
  try {
    // Check environment variables
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("[API /lawyer/consultations] Missing environment variables")
      console.error("NEXT_PUBLIC_SUPABASE_URL:", !!supabaseUrl)
      console.error("SUPABASE_SERVICE_ROLE_KEY:", !!supabaseServiceKey)
      return NextResponse.json({ 
        error: "Server configuration error",
        details: "Missing Supabase credentials"
      }, { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const lawyerId = searchParams.get("lawyer_id")

    if (!lawyerId) {
      return NextResponse.json({ error: "lawyer_id is required" }, { status: 400 })
    }

    // Create Supabase client with service role key to bypass RLS
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    console.log("[API /lawyer/consultations] Fetching for lawyer:", lawyerId, "status:", status)

    // Fetch consultations
    let query = supabase
      .from("consultations")
      .select("*")
      .eq("lawyer_id", lawyerId)
      .order("updated_at", { ascending: false })

    if (status) {
      query = query.eq("status", status)
    } else {
      // If no status filter, exclude pending and declined consultations
      // Show accepted, completed, and cancelled (which may have chat history)
      query = query.in("status", ["accepted", "completed", "cancelled"])
    }

    const { data: consultations, error: consultError } = await query

    if (consultError) {
      console.error("[API /lawyer/consultations] Error fetching consultations:", consultError)
      return NextResponse.json({ error: consultError.message }, { status: 500 })
    }

    console.log("[API /lawyer/consultations] Found consultations:", consultations?.length || 0)

    if (!consultations || consultations.length === 0) {
      return NextResponse.json({ consultations: [] })
    }

    // Fetch client profiles
    const clientIds = consultations.map((c) => c.client_id).filter(Boolean)
    console.log("[API /lawyer/consultations] Fetching profiles for client IDs:", clientIds)

    if (clientIds.length === 0) {
      console.warn("[API /lawyer/consultations] No client IDs found in consultations")
      return NextResponse.json({ consultations: [] })
    }

    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*")
      .in("id", clientIds)

    if (profilesError) {
      console.error("[API /lawyer/consultations] Error fetching profiles:", profilesError)
    }

    console.log("[API /lawyer/consultations] Found profiles:", profiles?.length || 0)
    
    // Fetch email addresses from auth.users for profiles without full_name
    const profilesNeedingEmail = profiles?.filter(p => !p.full_name) || []
    let emailMap = new Map()
    
    if (profilesNeedingEmail.length > 0) {
      const { data: authUsers } = await supabase.auth.admin.listUsers()
      if (authUsers?.users) {
        authUsers.users.forEach(user => {
          emailMap.set(user.id, user.email)
        })
      }
    }
    
    // Enhance profiles with email if full_name is missing
    const enhancedProfiles = profiles?.map(p => ({
      ...p,
      email: emailMap.get(p.id) || null
    })) || []
    
    // Check for missing profiles
    const foundProfileIds = new Set(enhancedProfiles.map(p => p.id))
    const missingProfileIds = clientIds.filter(id => !foundProfileIds.has(id))
    if (missingProfileIds.length > 0) {
      console.warn("[API /lawyer/consultations] Missing profiles for client IDs:", missingProfileIds)
    }

    // Fetch last message and unread count for each consultation
    const consultationIds = consultations.map((c) => c.id)
    const { data: messages } = await supabase
      .from("messages")
      .select("*")
      .in("consultation_id", consultationIds)
      .order("created_at", { ascending: false })

    // Build message maps
    const lastMessageMap = new Map()
    const unreadCountMap = new Map()

    consultations.forEach((c) => {
      const consultationMessages = messages?.filter((m) => m.consultation_id === c.id) || []
      if (consultationMessages.length > 0) {
        lastMessageMap.set(c.id, consultationMessages[0])
      }
      const unreadCount = consultationMessages.filter((m) => !m.is_read && m.sender_id !== lawyerId).length
      unreadCountMap.set(c.id, unreadCount)
    })

    // Build lookup map
    const profileMap = new Map(enhancedProfiles.map((p) => [p.id, p]))

    // Join consultations with client profiles and message info
    // Filter out consultations where client profile is missing
    const result: ConsultationWithClient[] = consultations
      .map((consultation) => ({
        ...consultation,
        client: profileMap.get(consultation.client_id) || null,
        last_message: lastMessageMap.get(consultation.id) || null,
        unread_count: unreadCountMap.get(consultation.id) || 0,
      }))
      .filter((c) => c.client !== null) // Only include consultations with valid client data

    console.log("[API /lawyer/consultations] Returning result with clients:", result.map(r => ({
      id: r.id,
      client_id: r.client_id,
      has_client: !!r.client,
      client_name: r.client?.full_name,
      client_phone: r.client?.phone
    })))

    return NextResponse.json({ consultations: result })
  } catch (error) {
    console.error("[API /lawyer/consultations] Unexpected error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}
