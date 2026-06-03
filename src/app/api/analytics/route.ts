import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getAdminSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const admin = await getAdminSession()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const [
      { count: total },
      { count: verified },
      { count: pending },
      { count: suspended },
      { data: allMembers },
    ] = await Promise.all([
      supabaseAdmin.from('members').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('members').select('*', { count: 'exact', head: true }).eq('membership_status', 'VERIFIED'),
      supabaseAdmin.from('members').select('*', { count: 'exact', head: true }).eq('membership_status', 'PENDING'),
      supabaseAdmin.from('members').select('*', { count: 'exact', head: true }).eq('membership_status', 'SUSPENDED'),
      supabaseAdmin.from('members').select('faculty, lga, level, created_at').order('created_at', { ascending: true }),
    ])

    // Group by faculty
    const facultyMap: Record<string, number> = {}
    const lgaMap: Record<string, number> = {}
    const levelMap: Record<string, number> = {}
    const monthMap: Record<string, number> = {}

    allMembers?.forEach((m) => {
      // Faculty
      if (m.faculty) facultyMap[m.faculty] = (facultyMap[m.faculty] || 0) + 1
      // LGA
      if (m.lga) lgaMap[m.lga] = (lgaMap[m.lga] || 0) + 1
      // Level
      if (m.level) levelMap[m.level] = (levelMap[m.level] || 0) + 1
      // Month
      const month = new Date(m.created_at).toLocaleDateString('en-NG', { year: 'numeric', month: 'short' })
      monthMap[month] = (monthMap[month] || 0) + 1
    })

    return NextResponse.json({
      total_members: total || 0,
      verified_members: verified || 0,
      pending_members: pending || 0,
      suspended_members: suspended || 0,
      members_by_faculty: Object.entries(facultyMap)
        .map(([faculty, count]) => ({ faculty: faculty.replace('Faculty of ', ''), count }))
        .sort((a, b) => b.count - a.count),
      members_by_lga: Object.entries(lgaMap)
        .map(([lga, count]) => ({ lga, count }))
        .sort((a, b) => b.count - a.count),
      members_by_level: Object.entries(levelMap)
        .map(([level, count]) => ({ level, count }))
        .sort((a, b) => a.level.localeCompare(b.level)),
      registrations_by_month: Object.entries(monthMap)
        .map(([month, count]) => ({ month, count }))
        .slice(-12),
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
