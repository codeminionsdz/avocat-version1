// ============================================
// BACKEND-READY API TYPES
// ============================================

// Base entity types
export type UserRole = "client" | "lawyer" | "admin"
export type LawyerStatus = "inactive" | "pending" | "active"
export type ConsultationStatus = "pending" | "accepted" | "rejected" | "completed" | "cancelled"
export type SubscriptionStatus = "inactive" | "pending" | "active" | "expired"
export type PaymentReceiptStatus = "pending" | "approved" | "rejected"
export type LegalCategory = "criminal" | "family" | "civil" | "commercial" | "administrative" | "labor" | "immigration"

// ============================================
// ENTITY MODELS
// ============================================

export interface User {
  id: string
  email: string
  passwordHash: string // bcrypt hashed password
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

export interface ClientProfile {
  id: string
  userId: string
  name: string
  phone?: string
  city?: string
  createdAt: Date
  updatedAt: Date
}

export interface LawyerProfile {
  id: string
  userId: string
  name: string
  phone?: string
  city: string
  bio: string
  specialties: LegalCategory[]
  status: LawyerStatus
  isAvailable: boolean
  rating: number
  consultationsCount: number
  barRegistrationNumber?: string
  authorizedCourts?: string[]
  createdAt: Date
  updatedAt: Date
}

export interface Subscription {
  id: string
  lawyerId: string
  status: SubscriptionStatus
  plan: "monthly" | "yearly"
  amount: number // in DZD
  startDate?: Date
  endDate?: Date
  createdAt: Date
  updatedAt: Date
}

export interface PaymentReceipt {
  id: string
  subscriptionId: string
  lawyerId: string
  receiptUrl: string
  amount: number
  status: PaymentReceiptStatus
  reviewedBy?: string // admin userId
  reviewedAt?: Date
  rejectionReason?: string
  submittedAt: Date
  createdAt: Date
}

export interface Consultation {
  id: string
  clientId: string
  lawyerId: string
  category: LegalCategory
  summary: string
  aiClassification?: string
  status: ConsultationStatus
  scheduledAt?: Date
  completedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface ChatMessage {
  id: string
  consultationId: string
  senderId: string
  senderRole: UserRole
  content: string
  isRead: boolean
  createdAt: Date
}

// ============================================
// API REQUEST/RESPONSE TYPES
// ============================================

// Auth
export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user: Omit<User, "passwordHash">
  profile: ClientProfile | LawyerProfile | null
}

export interface RegisterClientRequest {
  email: string
  password: string
  name: string
  phone?: string
  city?: string
}

export interface RegisterLawyerRequest {
  email: string
  password: string
  name: string
  phone?: string
  city: string
  bio: string
  specialties: LegalCategory[]
  barRegistrationNumber?: string
}

export interface AdminLoginRequest {
  password: string
}

// Lawyer Management
export interface UpdateLawyerStatusRequest {
  lawyerId: string
  status: LawyerStatus
  reason?: string
}

export interface UpdateLawyerAvailabilityRequest {
  isAvailable: boolean
}

// Payment Receipts
export interface SubmitPaymentReceiptRequest {
  subscriptionId: string
  receiptUrl: string
  amount: number
}

export interface ReviewPaymentReceiptRequest {
  receiptId: string
  status: "approved" | "rejected"
  rejectionReason?: string
}

// Consultations
export interface CreateConsultationRequest {
  lawyerId: string
  category: LegalCategory
  summary: string
  aiClassification?: string
}

export interface UpdateConsultationStatusRequest {
  consultationId: string
  status: ConsultationStatus
}

// Chat
export interface SendMessageRequest {
  consultationId: string
  content: string
}

// Pagination
export interface PaginatedRequest {
  page?: number
  limit?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// API Error
export interface ApiError {
  code: string
  message: string
  details?: Record<string, string[]>
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: ApiError
}
