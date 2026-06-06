import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getAdminSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const admin = await getAdminSession()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const limit = parseInt(searchParams.get('limit') || '50')

  const { data: logs, error } = await supabaseAdmin
    .from('verification_logs')
    .select('*')
    .order('verification_time', { ascending: false })
    .limit(limit)

  if (error) return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 })
  return NextResponse.json({ logs })
}

export async function POST(req: NextRequest) {
  const admin = await getAdminSession()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { member_id, action } = await req.json()

    if (!member_id || !['VERIFIED', 'SUSPENDED', 'PENDING'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    // Get member info
    const { data: member, error: memberError } = await supabaseAdmin
      .from('members')
      .select('id, full_name, nuass_id')
      .eq('id', member_id)
      .single()

    if (memberError || !member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Update status
    const { error: updateError } = await supabaseAdmin
      .from('members')
      .update({ membership_status: action })
      .eq('id', member_id)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
    }

    // Log verification
    await supabaseAdmin.from('verification_logs').insert({
      student_id: member.id,
      student_name: member.full_name,
      nuass_id: member.nuass_id,
      verified_by: admin.full_name,
      admin_role: admin.role,
      verification_time: new Date().toISOString(),
      action,
    })

    return NextResponse.json({ success: true, action, member_name: member.full_name })
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export const dynamic = "force-dynamic"
