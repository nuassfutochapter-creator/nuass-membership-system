// Database Types for NUASS Membership System

export type MembershipStatus = 'PENDING' | 'VERIFIED' | 'SUSPENDED'
export type Gender = 'Male' | 'Female'
export type MeetingCommitment = 'Yes' | 'No' | 'Sometimes'
export type AdminRole = 'President' | 'Secretary General' | 'Assistant Secretary' | 'ICT Director' | 'Super Admin'

export interface Member {
  id: string
  nuass_id: string
  full_name: string
  date_of_birth: string
  gender: Gender
  passport_url: string | null
  email: string | null
  whatsapp_number: string
  password_hash: string
  faculty: string
  department: string
  level: string
  lga: string
  town: string
  village: string
  residence: string
  expectations: string
  contributions: string
  meeting_commitment: MeetingCommitment
  membership_status: MembershipStatus
  registration_date: string
  created_at: string
}

export interface Admin {
  id: string
  full_name: string
  role: AdminRole
  email: string
  phone: string
  password_hash: string
  is_active: boolean
  created_at: string
}

export interface Executive {
  id: string
  full_name: string
  position: string
  department: string
  level: string
  photo_url: string | null
  bio: string
  display_order: number
  is_active: boolean
  created_at: string
}

export interface Announcement {
  id: string
  title: string
  content: string
  is_pinned: boolean
  created_by: string
  created_at: string
  updated_at: string
}

export interface Meeting {
  id: string
  meeting_name: string
  meeting_date: string
  attendance_code: string
  description: string | null
  created_by: string
  is_active: boolean
  created_at: string
}

export interface Attendance {
  id: string
  student_id: string
  meeting_id: string
  attendance_time: string
  member?: Pick<Member, 'full_name' | 'nuass_id' | 'department' | 'level'>
  meeting?: Pick<Meeting, 'meeting_name' | 'meeting_date'>
}

export interface VerificationLog {
  id: string
  student_id: string
  student_name: string
  nuass_id: string
  verified_by: string
  admin_role: string
  verification_time: string
  action: 'VERIFIED' | 'SUSPENDED' | 'PENDING'
}

// Session types
export interface MemberSession {
  id: string
  nuass_id: string
  full_name: string
  membership_status: MembershipStatus
  role: 'member'
}

export interface AdminSession {
  id: string
  full_name: string
  role: AdminRole
  email: string
  type: 'admin'
}

// Form types
export interface RegistrationForm {
  full_name: string
  date_of_birth: string
  gender: Gender
  email?: string
  whatsapp_number: string
  password: string
  confirm_password: string
  faculty: string
  department: string
  level: string
  lga: string
  town: string
  village: string
  residence: string
  expectations: string
  contributions: string
  meeting_commitment: MeetingCommitment
  passport_file?: File
}

export interface LoginForm {
  whatsapp_number: string
  password: string
}

// Analytics types
export interface AnalyticsData {
  total_members: number
  verified_members: number
  pending_members: number
  suspended_members: number
  registrations_by_month: { month: string; count: number }[]
  members_by_faculty: { faculty: string; count: number }[]
  members_by_lga: { lga: string; count: number }[]
  members_by_level: { level: string; count: number }[]
}

// Anambra LGAs
export const ANAMBRA_LGAS = [
  'Aguata', 'Anambra East', 'Anambra West', 'Anaocha', 'Awka North',
  'Awka South', 'Ayamelum', 'Dunukofia', 'Ekwusigo', 'Idemili North',
  'Idemili South', 'Ihiala', 'Njikoka', 'Nnewi North', 'Nnewi South',
  'Ogbaru', 'Onitsha North', 'Onitsha South', 'Orumba North', 'Orumba South',
  'Oyi'
] as const

export const STUDENT_LEVELS = ['100 Level', '200 Level', '300 Level', '400 Level', '500 Level', '600 Level', 'Postgraduate'] as const

export const EXECUTIVE_POSITIONS = [
  'President', 'Vice President', 'Secretary General', 'Assistant Secretary',
  'Treasurer', 'Financial Secretary', 'PRO', 'Welfare Director', 'Social Director'
] as const
