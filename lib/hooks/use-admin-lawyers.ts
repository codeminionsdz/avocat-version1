"use client"

import useSWR from "swr"
import { createClient } from "@/lib/supabase/client"
import type { LawyerProfile, Profile } from "@/lib/database.types"

interface LawyerWithProfile extends LawyerProfile {
  profile: Profile | null
}

const createFetcher = (filterStatus?: string | null) => {
  return async (): Promise<LawyerWithProfile[]> => {
    const supabase = createClient()

    // First, try direct query (will work for lawyers viewing their own)
    let query = supabase
      .from("lawyer_profiles")
      .select(`
        *,
        profiles(*)
      `)
      .order("created_at", { ascending: false })

    if (filterStatus && filterStatus !== "all") {
      query = query.eq("status", filterStatus)
    }

    const { data, error } = await query

    // If RLS blocks (admin case), use API endpoint
    if (error) {
      console.warn("[use-admin-lawyers] Direct query blocked, using API:", error)
      
      try {
        const statusParam = filterStatus && filterStatus !== "all" ? `?status=${filterStatus}` : ""
        const response = await fetch(`/api/admin/lawyers${statusParam}`)
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }
        const apiData = await response.json()
        return apiData.data || []
      } catch (apiError) {
        console.error("[use-admin-lawyers] API fallback failed:", apiError)
        throw apiError
      }
    }

    return (data || []).map((item: any) => ({
      id: item.id,
      bar_number: item.bar_number,
      specialties: item.specialties,
      bio: item.bio,
      years_of_experience: item.years_of_experience,
      rating: item.rating,
      consultations_count: item.consultations_count,
      is_available: item.is_available,
      status: item.status,
      created_at: item.created_at,
      updated_at: item.updated_at,
      profile: item.profiles || null,
    }))
  }
}

export function useAdminLawyers(filterStatus?: string | null) {
  const cacheKey = filterStatus && filterStatus !== "all" ? `admin-lawyers-${filterStatus}` : "admin-lawyers"

  const { data, error, isLoading, mutate } = useSWR<LawyerWithProfile[]>(cacheKey, createFetcher(filterStatus), {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  })

  return {
    lawyers: data || [],
    isLoading,
    isError: error,
    mutate,
  }
}

export function useAdminLawyer(id: string) {
  const fetcher = async (): Promise<LawyerWithProfile | null> => {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("lawyer_profiles")
      .select(`
        *,
        profile:profiles(*)
      `)
      .eq("id", id)
      .single()

    if (error) return null

    return {
      ...data,
      profile: data.profile as Profile | null,
    }
  }

  const { data, error, isLoading, mutate } = useSWR<LawyerWithProfile | null>(`admin-lawyer-${id}`, fetcher)

  return {
    lawyer: data,
    isLoading,
    isError: error,
    mutate,
  }
}
