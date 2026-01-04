"use client"

import useSWR from "swr"
import { createClient } from "@/lib/supabase/client"
import type { LawyerProfile, Profile, Subscription } from "@/lib/database.types"

interface LawyerData {
  profile: Profile | null
  lawyerProfile: LawyerProfile | null
  subscription: Subscription | null
}

export function useLawyerProfile() {
  const fetcher = async (): Promise<LawyerData> => {
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { profile: null, lawyerProfile: null, subscription: null }
    }

    const [profileRes, lawyerProfileRes, subscriptionRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("lawyer_profiles").select("*").eq("id", user.id).single(),
      supabase
        .from("subscriptions")
        .select("*")
        .eq("lawyer_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single(),
    ])

    return {
      profile: profileRes.data,
      lawyerProfile: lawyerProfileRes.data,
      subscription: subscriptionRes.data,
    }
  }

  const { data, error, isLoading, mutate } = useSWR<LawyerData>("lawyer-profile", fetcher)

  const updateAvailability = async (isAvailable: boolean) => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    await supabase.from("lawyer_profiles").update({ is_available: isAvailable }).eq("id", user.id)

    mutate()
  }

  return {
    profile: data?.profile || null,
    lawyerProfile: data?.lawyerProfile || null,
    subscription: data?.subscription || null,
    isLoading,
    isError: error,
    updateAvailability,
    mutate,
  }
}
