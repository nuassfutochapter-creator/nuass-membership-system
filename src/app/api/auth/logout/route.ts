import { NextResponse } from 'next/server'
import { clearMemberSession, clearAdminSession } from '@/lib/auth'

export async function POST() {
  await clearMemberSession()
  await clearAdminSession()
  return NextResponse.json({ success: true })
}

export const dynamic = "force-dynamic"
