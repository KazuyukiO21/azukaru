// ユーザー種別
export type UserRole = 'owner' | 'sitter' | 'both'

// ペット種別
export type PetType = 'dog' | 'cat' | 'small_animal' | 'bird' | 'reptile' | 'other'

// サービス種別
export type ServiceType = 'boarding' | 'daycare' | 'walking' | 'drop_in' | 'grooming'

// 予約ステータス
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'

// 支払いステータス
export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed'

export interface Profile {
  id: string
  user_id: string
  display_name: string
  avatar_url: string | null
  bio: string | null
  role: UserRole
  prefecture: string | null
  city: string | null
  phone: string | null
  created_at: string
  updated_at: string
}

export interface SitterProfile {
  id: string
  user_id: string
  profile: Profile
  services: ServiceType[]
  pet_types: PetType[]
  price_per_night: number | null
  price_per_day: number | null
  price_per_walk: number | null
  price_drop_in: number | null
  max_pets: number
  home_type: string | null
  has_yard: boolean
  accepts_unvaccinated: boolean
  experience_years: number | null
  certifications: string[]
  gallery_urls: string[]
  rating: number
  review_count: number
  is_active: boolean
  stripe_account_id: string | null
  stripe_onboarding_complete: boolean
  created_at: string
  updated_at: string
}

export interface Booking {
  id: string
  owner_id: string
  sitter_id: string
  pet_name: string
  pet_type: PetType
  service_type: ServiceType
  start_date: string
  end_date: string
  message: string | null
  status: BookingStatus
  payment_status: PaymentStatus
  total_amount: number
  platform_fee: number
  sitter_amount: number
  stripe_payment_intent_id: string | null
  created_at: string
  updated_at: string
  owner?: Profile
  sitter?: SitterProfile
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  is_read: boolean
  created_at: string
  sender?: Profile
}

export interface Conversation {
  id: string
  owner_id: string
  sitter_id: string
  booking_id: string | null
  last_message_at: string
  created_at: string
  owner?: Profile
  sitter?: SitterProfile
  messages?: Message[]
  unread_count?: number
}

export interface Review {
  id: string
  booking_id: string
  reviewer_id: string
  reviewee_id: string
  rating: number
  comment: string | null
  created_at: string
  reviewer?: Profile
}

// 検索フィルター
export interface SitterSearchFilter {
  service_type?: ServiceType
  pet_type?: PetType
  prefecture?: string
  city?: string
  max_price?: number
  date_from?: string
  date_to?: string
}
