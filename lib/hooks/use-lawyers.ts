"use client"

import useSWR from "swr"
import { createClient } from "@/lib/supabase/client"
import type { LawyerWithProfile, LegalCategory, CourtLevel } from "@/lib/database.types"

interface LawyerFilters {
  category?: LegalCategory | null
  courtLevel?: CourtLevel | null
}

const fetcher = async (filters?: LawyerFilters): Promise<LawyerWithProfile[]> => {
  const supabase = createClient()

  // Fetch active lawyer profiles
  let query = supabase
    .from("lawyer_profiles")
    .select("*")
    .eq("status", "active")
    .eq("is_available", true)
    .order("rating", { ascending: false })

  const { data: lawyerProfiles, error: lawyersError } = await query

  if (lawyersError) {
    console.error("[use-lawyers] Error fetching lawyers:", lawyersError)
    throw lawyersError
  }

  if (!lawyerProfiles || lawyerProfiles.length === 0) {
    console.warn("[use-lawyers] No active lawyers found")
    return []
  }

  // Filter by court level if specified
  let filteredProfiles = lawyerProfiles
  if (filters?.courtLevel) {
    filteredProfiles = lawyerProfiles.filter((lawyer) => {
      const authorizedCourts = lawyer.authorized_courts || ["first_instance"]
      
      // Check if lawyer is authorized for the required court level
      if (filters.courtLevel === "first_instance") {
        // All lawyers can handle first instance
        return true
      } else if (filters.courtLevel === "appeal") {
        // Appeal or supreme court lawyers
        return authorizedCourts.includes("appeal") || authorizedCourts.includes("supreme_court")
      } else if (filters.courtLevel === "supreme_court") {
        // Only supreme court lawyers
        return authorizedCourts.includes("supreme_court")
      } else if (filters.courtLevel === "council_of_state") {
        // Only council of state lawyers
        return authorizedCourts.includes("council_of_state")
      }
      return true
    })
  }

  // Filter by category if specified
  if (filters?.category) {
    filteredProfiles = filteredProfiles.filter((lawyer) => 
      lawyer.specialties.includes(filters.category!)
    )
  }

  // Fetch related profiles separately
  const lawyerIds = filteredProfiles.map((l) => l.id)
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("*")
    .in("id", lawyerIds)

  if (profilesError) {
    console.error("[use-lawyers] Error fetching profiles:", profilesError)
  }

  // Build lookup map
  const profileMap = new Map(profiles?.map((p) => [p.id, p]) || [])

  // Combine data
  return filteredProfiles.map((lawyer) => ({
    ...lawyer,
    profile: profileMap.get(lawyer.id) || null,
  }))
}

export function useLawyers(category?: LegalCategory | null, courtLevel?: CourtLevel | null) {
  const filters: LawyerFilters = { category, courtLevel }
  const cacheKey = `lawyers-${category || "all"}-${courtLevel || "all"}`
  
  const { data, error, isLoading, mutate } = useSWR<LawyerWithProfile[]>(
    cacheKey,
    () => fetcher(filters)
  )

  return {
    lawyers: data || [],
    isLoading,
    isError: error,
    mutate,
  }
}

export function useLawyer(id: string) {
  const fetcher = async (): Promise<LawyerWithProfile | null> => {
    const supabase = createClient()

    const { data: lawyerProfile, error: lawyerError } = await supabase
      .from("lawyer_profiles")
      .select("*")
      .eq("id", id)
      .single()

    if (lawyerError) {
      console.error("[use-lawyer] Error fetching lawyer:", lawyerError)
      return null
    }

    if (!lawyerProfile) return null

    // Fetch profile separately
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", id).single()

    return {
      ...lawyerProfile,
      profile: profile || null,
    }
  }

  const { data, error, isLoading, mutate } = useSWR<LawyerWithProfile | null>(`lawyer-${id}`, fetcher)

  return {
    lawyer: data,
    isLoading,
    isError: error,
    mutate,
  }
}
