import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getAdminSession, getMemberSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const admin = await getAdminSession()
  const member = await getMemberSession()
  if (!admin && !member) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const meeting_id = searchParams.get('meeting_id')
  const student_id = searchParams.get('student_id')

  let query = supabaseAdmin.from('attendance').select(`
    id, student_id, meeting_id, attendance_time,
    member:members(full_name, nuass_id, department, level),
    meeting:meetings(meeting_name, meeting_date)
  `)

  if (meeting_id) query = query.eq('meeting_id', meeting_id)
  if (student_id) query = query.eq('student_id', student_id)
  else if (member && !admin) query = query.eq('student_id', member.id)

  query = query.order('attendance_time', { ascending: false })

  const { data: attendees, error } = await query
  if (error) return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  return NextResponse.json({ attendees })
}

export async function POST(req: NextRequest) {
  const member = await getMemberSession()
  if (!member) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { attendance_code } = await req.json()
  if (!attendance_code) return NextResponse.json({ error: 'Attendance code required' }, { status: 400 })

  // Find meeting by code
  const { data: meeting, error: meetingError } = await supabaseAdmin
    .from('meetings')
    .select('id, meeting_name, meeting_date, is_active')
    .eq('attendance_code', attendance_code.toUpperCase())
    .single()

  if (meetingError || !meeting) {
    return NextResponse.json({ error: 'Invalid attendance code' }, { status: 404 })
  }

  if (!meeting.is_active) {
    return NextResponse.json({ error: 'This meeting is no longer active' }, { status: 400 })
  }

  // Check if already marked
  const { data: existing } = await supabaseAdmin
    .from('attendance')
    .select('id')
    .eq('student_id', member.id)
    .eq('meeting_id', meeting.id)
    .single()

  if (existing) {
    return NextResponse.json({ error: 'Attendance already marked for this meeting' }, { status: 409 })
  }

  // Mark attendance
  const { error: insertError } = await supabaseAdmin.from('attendance').insert({
    student_id: member.id,
    meeting_id: meeting.id,
    attendance_time: new Date().toISOString(),
  })

  if (insertError) return NextResponse.json({ error: 'Failed to mark attendance' }, { status: 500 })
  return NextResponse.json({ success: true, meeting_name: meeting.meeting_name })
}

export const dynamic = "force-dynamic"
