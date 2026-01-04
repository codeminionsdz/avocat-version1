export type UserRole = "client" | "lawyer" | "admin"

export type LawyerStatus = "pending" | "active" | "inactive"

export type ConsultationStatus = "pending" | "accepted" | "rejected" | "completed"

export type LegalCategory = "criminal" | "family" | "civil" | "commercial" | "administrative" | "labor" | "immigration"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
  createdAt: Date
}

export interface Lawyer extends User {
  specialty: LegalCategory[]
  city: string
  bio: string
  status: LawyerStatus
  isAvailable: boolean
  rating: number
  consultationsCount: number
  paymentReceiptUrl?: string
}

export interface Client extends User {
  consultations: Consultation[]
}

export interface Consultation {
  id: string
  clientId: string
  lawyerId: string
  category: LegalCategory
  summary: string
  status: ConsultationStatus
  createdAt: Date
  messages: Message[]
}

export interface Message {
  id: string
  senderId: string
  content: string
  createdAt: Date
  isAI?: boolean
}

export interface AIQuestion {
  id: string
  question: string
  options: string[]
}
