// ============================================
// LOCALIZATION HELPER TYPES
// ============================================

export interface LocalizedString {
  UA?: string
  PL?: string
  EN?: string
}

export interface LocalizedObject {
  UA: string
  PL: string
  EN: string
}

export type Lang = 'UA' | 'PL' | 'EN'

// ============================================
// USER & AUTH TYPES
// ============================================

export type Role = 'STUDENT' | 'COUNSELOR' | 'ADMIN'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  xp: number
  tokens: number
  seatsAvailable: number
  avatar?: string | null
}

export interface AuthUser extends User {}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
}

export interface AuthResponse {
  user: User
}

// ============================================
// ASSESSMENT (SAAS) TYPES
// ============================================

export type QuestionType = 'SINGLE_CHOICE' | 'MULTI_CHOICE' | 'SCALE' | 'TEXT'
export type SessionStatus = 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED'

export interface AssessmentResponsePayload {
  questionId: string
  selectedOptions?: string[]
  scaleValue?: number
  textValue?: string
}

export interface AssessmentSubmitRequest {
  responses: AssessmentResponsePayload[]
}

// ============================================
// B2B COUNSELOR TYPES
// ============================================

export interface GenerateAccessCodeRequest {
  maxUses: number
}

export interface RedeemAccessCodeRequest {
  code: string
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiError {
  error: string
  details?: unknown
}

export interface ApiSuccess<T = unknown> {
  data: T
  message?: string
}

// ============================================
// TRANSLATION TYPES
// ============================================

export interface TranslationJson {
  UA: string
  PL: string
  EN: string
}

export type PartialTranslationJson = Partial<TranslationJson>

export function getTranslation(
  json: TranslationJson | PartialTranslationJson | null | undefined,
  lang: Lang,
  fallback: string = ''
): string {
  if (!json) return fallback
  return json[lang] ?? json['EN'] ?? fallback
}

// ============================================
// VALIDATION CONSTANTS
// ============================================

export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 100,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  EMAIL_MAX_LENGTH: 255,
  SLUG_MAX_LENGTH: 100,
  CONTENT_MAX_LENGTH: 50000,
  URL_MAX_LENGTH: 2000,
} as const

// ============================================
// SECURITY TYPES
// ============================================

export interface CsrfTokenResponse {
  csrfToken: string
}