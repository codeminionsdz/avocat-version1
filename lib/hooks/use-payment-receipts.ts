"use client"

import useSWR from "swr"
import { createClient } from "@/lib/supabase/client"
import type { PaymentReceipt, Subscription, Profile } from "@/lib/database.types"

interface PaymentReceiptWithDetails extends PaymentReceipt {
  subscription: Subscription | null
  lawyer: Profile | null
}

const fetcher = async (): Promise<PaymentReceiptWithDetails[]> => {
  const supabase = createClient()

  // Try direct query first (will work if RLS allows)
  const { data, error } = await supabase
    .from("payment_receipts")
    .select(`
      *,
      subscriptions!payment_receipts_subscription_id_fkey(
        id,
        lawyer_id,
        plan,
        amount,
        status,
        created_at
      ),
      profiles!payment_receipts_lawyer_id_fkey(
        id,
        full_name,
        phone,
        city,
        role
      )
    `)
    .eq("status", "pending")
    .order("created_at", { ascending: false })

  // If RLS blocks (admin case), fall back to API endpoint with service role
  if (error) {
    console.warn("[use-payment-receipts] Direct query blocked, using API:", error)
    
    try {
      const response = await fetch("/api/admin/payments?status=pending")
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      const apiData = await response.json()
      return apiData.data?.data || []
    } catch (apiError) {
      console.error("[use-payment-receipts] API fallback failed:", apiError)
      throw apiError
    }
  }

  if (!data) {
    console.warn("[use-payment-receipts] No data returned")
    return []
  }

  return data.map((receipt: any) => ({
    id: receipt.id,
    subscription_id: receipt.subscription_id,
    lawyer_id: receipt.lawyer_id,
    receipt_url: receipt.receipt_url,
    status: receipt.status,
    admin_notes: receipt.admin_notes,
    reviewed_at: receipt.reviewed_at,
    created_at: receipt.created_at,
    subscription: receipt.subscriptions || null,
    lawyer: receipt.profiles || null,
  }))
}

export function usePaymentReceipts() {
  const { data, error, isLoading, mutate } = useSWR<PaymentReceiptWithDetails[]>("payment-receipts", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  })

  return {
    receipts: data || [],
    isLoading,
    isError: error,
    mutate,
  }
}
