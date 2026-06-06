import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getAdminSession, getMemberSession } from '@/lib/auth'
import { generateAttendanceCode } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const admin = await getAdminSession()
  const member = await getMemberSession()
  if (!admin && !member) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: meetings, error } = await supabaseAdmin
    .from('meetings')
    .select('*')
    .order('meeting_date', { ascending: false })

  if (error) return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })

  // Hide attendance codes from members
  if (!admin) {
    const sanitized = meetings?.map(({ attendance_code, ...m }) => m)
    return NextResponse.json({ meetings: sanitized })
  }

  return NextResponse.json({ meetings })
}

export async function POST(req: NextRequest) {
  const admin = await getAdminSession()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { meeting_name, meeting_date, description } = await req.json()
  if (!meeting_name?.trim() || !meeting_date) {
    return NextResponse.json({ error: 'Meeting name and date required' }, { status: 400 })
  }

  const attendance_code = generateAttendanceCode()

  const { data, error } = await supabaseAdmin.from('meetings').insert({
    meeting_name: meeting_name.trim(),
    meeting_date,
    description: description?.trim() || null,
    attendance_code,
    created_by: admin.full_name,
    is_active: true,
  }).select().single()

  if (error) return NextResponse.json({ error: 'Failed to create' }, { status: 500 })
  return NextResponse.json({ meeting: data }, { status: 201 })
}

export const dynamic = "force-dynamic"
