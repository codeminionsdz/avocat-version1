"use client"

import useSWR from "swr"
import { createClient } from "@/lib/supabase/client"
import type { ConsultationWithLawyer, ConsultationWithClient } from "@/lib/database.types"

// For clients - get their consultations with lawyer info
export function useClientConsultations() {
  const fetcher = async (): Promise<ConsultationWithLawyer[]> => {
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return []

    // Fetch consultations for this client
    const { data: consultations, error: consultError } = await supabase
      .from("consultations")
      .select("*")
      .eq("client_id", user.id)
      .order("created_at", { ascending: false })

    if (consultError) {
      console.error("[useClientConsultations] Error fetching consultations:", consultError)
      throw consultError
    }

    if (!consultations || consultations.length === 0) {
      return []
    }

    // Fetch lawyer profiles separately
    const lawyerIds = consultations.map((c) => c.lawyer_id).filter(Boolean)
    const { data: lawyerProfiles } = await supabase.from("lawyer_profiles").select("*").in("id", lawyerIds)

    const { data: profiles } = await supabase.from("profiles").select("*").in("id", lawyerIds)

    // Build lookup maps
    const lawyerProfileMap = new Map(lawyerProfiles?.map((lp) => [lp.id, lp]) || [])
    const profileMap = new Map(profiles?.map((p) => [p.id, p]) || [])

    return consultations.map((consultation) => ({
      ...consultation,
      lawyer_profile: lawyerProfileMap.get(consultation.lawyer_id) || null,
      lawyer: profileMap.get(consultation.lawyer_id) || null,
    }))
  }

  const { data, error, isLoading, mutate } = useSWR<ConsultationWithLawyer[]>("client-consultations", fetcher, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    refreshInterval: 5000, // Auto-refresh every 5 seconds
  })

  return {
    consultations: data || [],
    isLoading,
    isError: error,
    mutate,
  }
}

// For lawyers - get consultations assigned to them
export function useLawyerConsultations(status?: string) {
  const fetcher = async (): Promise<ConsultationWithClient[]> => {
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    
    console.log("[useLawyerConsultations] User ID:", user?.id)
    
    if (!user) return []

    // Fetch consultations directly from Supabase
    try {
      let query = supabase
        .from("consultations")
        .select(`
          *
        `)
        .eq("lawyer_id", user.id)
        .order("updated_at", { ascending: false })

      if (status) {
        query = query.eq("status", status)
      } else {
        // If no status filter, show accepted, completed, and cancelled
        query = query.in("status", ["accepted", "completed", "cancelled"])
      }

      const { data: consultations, error } = await query

      if (error) {
        console.error("[useLawyerConsultations] Supabase error:", error)
        return []
      }

      console.log("[useLawyerConsultations] Consultations from DB:", consultations)

      if (!consultations || consultations.length === 0) {
        return []
      }

      // Fetch client profiles separately
      const clientIds = [...new Set(consultations.map(c => c.client_id).filter(Boolean))]
      
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .in("id", clientIds)

      if (profileError) {
        console.error("[useLawyerConsultations] Profile error:", profileError)
      }

      console.log("[useLawyerConsultations] Profiles:", profiles)

      // Create profile map
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || [])

      // Fetch messages for each consultation
      if (consultations && consultations.length > 0) {
        const consultationIds = consultations.map(c => c.id)
        
        const { data: messages } = await supabase
          .from("messages")
          .select("*")
          .in("consultation_id", consultationIds)
          .order("created_at", { ascending: false })

        // Build maps
        const lastMessageMap = new Map()
        const unreadCountMap = new Map()

        consultations.forEach((c) => {
          const consultationMessages = messages?.filter((m) => m.consultation_id === c.id) || []
          if (consultationMessages.length > 0) {
            lastMessageMap.set(c.id, consultationMessages[0])
          }
          const unreadCount = consultationMessages.filter((m) => !m.is_read && m.sender_id !== user.id).length
          unreadCountMap.set(c.id, unreadCount)
        })

        // Add profile and message info to consultations
        return consultations.map(c => ({
          ...c,
          client: profileMap.get(c.client_id) || null,
          last_message: lastMessageMap.get(c.id) || null,
          unread_count: unreadCountMap.get(c.id) || 0,
        }))
      }

      return consultations.map(c => ({
        ...c,
        client: profileMap.get(c.client_id) || null,
        last_message: null,
        unread_count: 0,
      }))
    } catch (error) {
      console.error("[useLawyerConsultations] Error:", error)
      return []
    }
  }

  const { data, error, isLoading, mutate } = useSWR<ConsultationWithClient[]>(
    `lawyer-consultations-${status || "all"}`,
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      refreshInterval: 5000, // Auto-refresh every 5 seconds
    },
  )

  return {
    consultations: data || [],
    isLoading,
    isError: error,
    mutate,
  }
}

// Get single consultation with client/lawyer info
export function useConsultation(consultationId: string) {
  const fetcher = async () => {
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    
    console.log("[useConsultation] Fetching consultation:", consultationId, "for user:", user?.id)
    
    if (!user) return null

    // Fetch consultation
    const { data: consultation, error } = await supabase
      .from("consultations")
      .select("*")
      .eq("id", consultationId)
      .single()

    console.log("[useConsultation] Consultation query result:", { consultation, error })

    if (error || !consultation) {
      console.error("[useConsultation] Error or no consultation:", error)
      return null
    }

    // Determine if user is lawyer or client
    const isLawyer = consultation.lawyer_id === user.id
    const isClient = consultation.client_id === user.id
    
    console.log("[useConsultation] User role:", { isLawyer, isClient })
    
    if (!isLawyer && !isClient) {
      console.error("[useConsultation] User is not part of this consultation")
      return null
    }

    const otherUserId = isLawyer ? consultation.client_id : consultation.lawyer_id

    // Fetch profile of the other user via API to bypass RLS
    try {
      const profileResponse = await fetch(`/api/profiles/${otherUserId}`)
      if (!profileResponse.ok) {
        console.error("[useConsultation] Failed to fetch profile via API")
        return {
          ...consultation,
          client: isLawyer ? { id: otherUserId, full_name: "عميل", phone: null, role: "client", created_at: "", updated_at: "" } : null,
          lawyer: !isLawyer ? { id: otherUserId, full_name: "محامي", phone: null, role: "lawyer", created_at: "", updated_at: "" } : null,
          lawyer_profile: null,
        }
      }
      
      const profile = await profileResponse.json()
      console.log("[useConsultation] Fetched profile:", profile)

      // If client viewing lawyer, also fetch lawyer_profile
      let lawyerProfile = null
      if (!isLawyer && consultation.lawyer_id) {
        const { data: lp } = await supabase.from("lawyer_profiles").select("*").eq("id", consultation.lawyer_id).single()
        lawyerProfile = lp
      }

      return {
        ...consultation,
        client: isLawyer ? profile : null,
        lawyer: !isLawyer ? profile : null,
        lawyer_profile: lawyerProfile,
      }
    } catch (err) {
      console.error("[useConsultation] Error fetching profile:", err)
      return {
        ...consultation,
        client: isLawyer ? { id: otherUserId, full_name: "عميل", phone: null, role: "client", created_at: "", updated_at: "" } : null,
        lawyer: !isLawyer ? { id: otherUserId, full_name: "محامي", phone: null, role: "lawyer", created_at: "", updated_at: "" } : null,
        lawyer_profile: null,
      }
    }
  }

  const { data, error, isLoading, mutate } = useSWR(`consultation-${consultationId}`, fetcher)

  return {
    consultation: data || null,
    isLoading,
    isError: error,
    mutate,
  }
}
