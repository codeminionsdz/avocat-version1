"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export function useUnreadMessages() {
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    const fetchUnreadCount = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setIsLoading(false)
        return
      }

      // Get all consultations where user is involved
      const { data: consultations } = await supabase
        .from("consultations")
        .select("id")
        .or(`client_id.eq.${user.id},lawyer_id.eq.${user.id}`)

      if (!consultations) {
        setIsLoading(false)
        return
      }

      const consultationIds = consultations.map((c) => c.id)

      // Count unread messages in those consultations
      const { count } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .in("consultation_id", consultationIds)
        .eq("is_read", false)
        .neq("sender_id", user.id) // Only messages from others

      setUnreadCount(count || 0)
      setIsLoading(false)
    }

    fetchUnreadCount()

    // Subscribe to new messages
    const channel = supabase
      .channel("unread_messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        () => {
          fetchUnreadCount()
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
        },
        () => {
          fetchUnreadCount()
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [])

  return { unreadCount, isLoading }
}

export function useUnreadConsultations() {
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    const fetchUnreadCount = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setIsLoading(false)
        return
      }

      // Count pending consultation requests for lawyers
      const { count } = await supabase
        .from("consultations")
        .select("*", { count: "exact", head: true })
        .eq("lawyer_id", user.id)
        .eq("status", "pending")

      setUnreadCount(count || 0)
      setIsLoading(false)
    }

    fetchUnreadCount()

    // Subscribe to new consultations
    const channel = supabase
      .channel("unread_consultations")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "consultations",
        },
        () => {
          fetchUnreadCount()
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [])

  return { unreadCount, isLoading }
}
