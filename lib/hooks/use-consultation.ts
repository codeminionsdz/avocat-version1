"use client"

import useSWR from "swr"
import { createClient } from "@/lib/supabase/client"
import type { Consultation, Profile, LawyerProfile } from "@/lib/database.types"

interface ConsultationDetails extends Consultation {
  client: Profile
  lawyer: Profile
  lawyer_profile: LawyerProfile
}

export function useConsultation(id: string) {
  const fetcher = async (): Promise<ConsultationDetails | null> => {
    const supabase = createClient()

    // Fetch consultation
    const { data: consultation, error: consultError } = await supabase
      .from("consultations")
      .select("*")
      .eq("id", id)
      .single()

    if (consultError || !consultation) {
      console.error("[useConsultation] Error fetching consultation:", consultError)
      return null
    }

    // Fetch related profiles and lawyer_profile separately
    const { data: clientProfile } = await supabase.from("profiles").select("*").eq("id", consultation.client_id).single()

    const { data: lawyerProfile } = await supabase.from("profiles").select("*").eq("id", consultation.lawyer_id).single()

    const { data: lawyerProfileData } = await supabase
      .from("lawyer_profiles")
      .select("*")
      .eq("id", consultation.lawyer_id)
      .single()

    return {
      ...consultation,
      client: clientProfile || ({} as Profile),
      lawyer: lawyerProfile || ({} as Profile),
      lawyer_profile: lawyerProfileData || ({} as LawyerProfile),
    }
  }

  const { data, error, isLoading, mutate } = useSWR<ConsultationDetails | null>(`consultation-${id}`, fetcher)

  const updateStatus = async (status: string) => {
    const supabase = createClient()
    const { error } = await supabase.from("consultations").update({ status }).eq("id", id)

    if (error) throw error
    mutate()
  }

  return {
    consultation: data,
    isLoading,
    isError: error,
    updateStatus,
    mutate,
  }
}
