import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getAdminSession, getMemberSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  // Check if admin or member
  const adminSession = await getAdminSession()
  const memberSession = await getMemberSession()

  if (!adminSession && !memberSession) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const search = searchParams.get('search') || ''
  const status = searchParams.get('status') || ''
  const lga = searchParams.get('lga') || ''
  const level = searchParams.get('level') || ''
  const faculty = searchParams.get('faculty') || ''

  const offset = (page - 1) * limit

  let query = supabaseAdmin
    .from('members')
    .select('id, nuass_id, full_name, department, level, faculty, lga, whatsapp_number, email, membership_status, created_at, passport_url, gender, date_of_birth, town, village, residence, expectations, contributions, meeting_commitment, registration_date', { count: 'exact' })

  // Only admins can see all; members see only verified in directory
  if (!adminSession && memberSession) {
    query = query.eq('membership_status', 'VERIFIED')
  }

  if (status) query = query.eq('membership_status', status)
  if (lga) query = query.eq('lga', lga)
  if (level) query = query.eq('level', level)
  if (faculty) query = query.eq('faculty', faculty)

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,nuass_id.ilike.%${search}%,whatsapp_number.ilike.%${search}%,department.ilike.%${search}%`)
  }

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 })
  }

  return NextResponse.json({ members: data, total: count || 0, page, limit })
}

export const dynamic = "force-dynamic"
