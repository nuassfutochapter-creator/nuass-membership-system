import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'
import type { MemberSession, AdminSession } from '@/types'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'nuass-default-secret-change-in-production-2026'
)

const MEMBER_COOKIE = 'nuass-member-session'
const ADMIN_COOKIE = 'nuass-admin-session'
const SESSION_DURATION = 60 * 60 * 24 * 7 // 7 days

// Create member JWT token
export async function createMemberToken(session: MemberSession): Promise<string> {
  return await new SignJWT({ ...session })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET)
}

// Create admin JWT token
export async function createAdminToken(session: AdminSession): Promise<string> {
  return await new SignJWT({ ...session })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(JWT_SECRET)
}

// Verify member token
export async function verifyMemberToken(token: string): Promise<MemberSession | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as unknown as MemberSession
  } catch {
    return null
  }
}

// Verify admin token
export async function verifyAdminToken(token: string): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as unknown as AdminSession
  } catch {
    return null
  }
}

// Set member session cookie
export async function setMemberSession(session: MemberSession) {
  const token = await createMemberToken(session)
  const cookieStore = await cookies()
  cookieStore.set(MEMBER_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION,
    path: '/',
  })
}

// Set admin session cookie
export async function setAdminSession(session: AdminSession) {
  const token = await createAdminToken(session)
  const cookieStore = await cookies()
  cookieStore.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8, // 8 hours
    path: '/',
  })
}

// Get member session from cookies
export async function getMemberSession(): Promise<MemberSession | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(MEMBER_COOKIE)?.value
  if (!token) return null
  return await verifyMemberToken(token)
}

// Get admin session from cookies
export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(ADMIN_COOKIE)?.value
  if (!token) return null
  return await verifyAdminToken(token)
}

// Get member session from request (for middleware)
export async function getMemberSessionFromRequest(req: NextRequest): Promise<MemberSession | null> {
  const token = req.cookies.get(MEMBER_COOKIE)?.value
  if (!token) return null
  return await verifyMemberToken(token)
}

// Get admin session from request (for middleware)
export async function getAdminSessionFromRequest(req: NextRequest): Promise<AdminSession | null> {
  const token = req.cookies.get(ADMIN_COOKIE)?.value
  if (!token) return null
  return await verifyAdminToken(token)
}

// Clear member session
export async function clearMemberSession() {
  const cookieStore = await cookies()
  cookieStore.delete(MEMBER_COOKIE)
}

// Clear admin session
export async function clearAdminSession() {
  const cookieStore = await cookies()
  cookieStore.delete(ADMIN_COOKIE)
}

// Generate NUASS ID
export function generateNuassId(count: number): string {
  const year = new Date().getFullYear()
  const padded = String(count).padStart(4, '0')
  return `NUASS-${year}-${padded}`
}

// Generate attendance code
export function generateAttendanceCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = 'ATT-'
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}
