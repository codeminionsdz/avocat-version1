// Database types for Supabase tables

export type LegalCategory = "criminal" | "family" | "civil" | "commercial" | "administrative" | "labor" | "immigration"

export type InsightCategory = "criminal" | "family" | "civil" | "commercial" | "administrative" | "labor" | "real_estate" | "intellectual_property" | "tax" | "other"

export type InsightRating = "helpful" | "not_helpful"

export type CourtLevel = "first_instance" | "appeal" | "supreme_court" | "council_of_state"

export type LawyerType = "regular" | "appeal" | "supreme_court" | "council_of_state"

export type UserRole = "client" | "lawyer"

export type LawyerStatus = "pending" | "active" | "inactive"

export type SubscriptionPlan = "annual"

export type SubscriptionStatus = "pending" | "active" | "expired" | "cancelled"

export type PaymentReceiptStatus = "pending" | "approved" | "rejected"

export type ConsultationStatus = "pending" | "accepted" | "declined" | "completed" | "cancelled" | "rescheduled"

export type ConsultationType = "chat" | "call" | "in_person"

export type ConsultationDuration = 15 | 30

export type CourtLevelRequestStatus = "pending" | "approved" | "rejected"

export interface Profile {
  id: string
  role: UserRole
  full_name: string
  email?: string
  phone: string | null
  city: string | null
  created_at: string
  updated_at: string
}

export interface LawyerProfile {
  id: string
  bar_number: string
  specialties: LegalCategory[]
  bio: string | null
  years_of_experience: number
  rating: number
  consultations_count: number
  is_available: boolean
  status: LawyerStatus
  authorized_courts: CourtLevel[]
  latitude: number | null
  longitude: number | null
  location_visibility: boolean
  office_address: string | null
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  lawyer_id: string
  plan: SubscriptionPlan
  amount: number
  status: SubscriptionStatus
  starts_at: string | null
  ends_at: string | null
  created_at: string
  updated_at: string
}

export interface PaymentReceipt {
  id: string
  subscription_id: string
  lawyer_id: string
  receipt_url: string
  status: PaymentReceiptStatus
  admin_notes: string | null
  reviewed_at: string | null
  created_at: string
}

export interface Consultation {
  id: string
  client_id: string
  lawyer_id: string
  category: LegalCategory
  description: string
  status: ConsultationStatus
  consultation_type: ConsultationType
  requested_duration: ConsultationDuration
  requested_time?: string | null
  confirmed_time?: string | null
  lawyer_notes?: string | null
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  consultation_id: string
  sender_id: string
  content: string
  is_read: boolean
  created_at: string
}

// Joined types for queries
export interface LawyerWithProfile extends LawyerProfile {
  profile: Profile
}

export interface ConsultationWithLawyer extends Consultation {
  lawyer_profile: LawyerProfile
  lawyer: Profile
}

export interface ConsultationWithClient extends Consultation {
  client: Profile
  last_message?: Message | null
  unread_count?: number
}

export interface CourtLevelRequest {
  id: string
  lawyer_id: string
  requested_level: CourtLevel
  status: CourtLevelRequestStatus
  justification?: string | null
  admin_notes?: string | null
  reviewed_by?: string | null
  reviewed_at?: string | null
  created_at: string
  updated_at: string
}

export interface LegalInsight {
  id: string
  lawyer_id: string
  title: string
  content: string
  category: InsightCategory
  ai_tags: string[]
  quality_score: number
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface LegalInsightRating {
  id: string
  insight_id: string
  user_id: string
  rating: InsightRating
  created_at: string
}

export interface LegalInsightWithStats extends LegalInsight {
  lawyer_name: string
  specialization: LegalCategory | null
  wilaya: string | null
  helpful_count: number
  not_helpful_count: number
  total_ratings: number
  user_rating?: InsightRating | null
}

export interface LegalInsightWithLawyer extends LegalInsight {
  lawyer: Profile
  lawyer_profile?: LawyerProfile
}
