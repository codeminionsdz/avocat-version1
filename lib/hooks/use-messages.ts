"use client"

import useSWR from "swr"
import { createClient } from "@/lib/supabase/client"
import type { Message } from "@/lib/database.types"

export function useMessages(consultationId: string) {
  const fetcher = async (): Promise<Message[]> => {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("consultation_id", consultationId)
      .order("created_at", { ascending: true })

    if (error) throw error
    return data || []
  }

  const { data, error, isLoading, mutate } = useSWR<Message[]>(`messages-${consultationId}`, fetcher, {
    refreshInterval: 3000, // Poll every 3 seconds for new messages
  })

  const sendMessage = async (content: string) => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error("Not authenticated")

    const { error } = await supabase.from("messages").insert({
      consultation_id: consultationId,
      sender_id: user.id,
      content,
    })

    if (error) throw error
    mutate()
  }

  return {
    messages: data || [],
    isLoading,
    isError: error,
    sendMessage,
    mutate,
  }
}
