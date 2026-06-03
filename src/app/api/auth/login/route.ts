import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { supabaseAdmin } from '@/lib/supabase'
import { setMemberSession } from '@/lib/auth'
import { checkRateLimit } from '@/lib/utils'

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown'
  if (!checkRateLimit(`login:${ip}`, 10, 15 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many login attempts. Please wait 15 minutes.' }, { status: 429 })
  }

  try {
    const { whatsapp_number, password } = await req.json()

    if (!whatsapp_number || !password) {
      return NextResponse.json({ error: 'WhatsApp number and password are required' }, { status: 400 })
    }

    // Find member by WhatsApp number
    const { data: member, error } = await supabaseAdmin
      .from('members')
      .select('id, nuass_id, full_name, password_hash, membership_status, whatsapp_number')
      .eq('whatsapp_number', whatsapp_number)
      .single()

    if (error || !member) {
      return NextResponse.json({ error: 'Invalid WhatsApp number or password' }, { status: 401 })
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, member.password_hash)
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Invalid WhatsApp number or password' }, { status: 401 })
    }

    // Create session
    await setMemberSession({
      id: member.id,
      nuass_id: member.nuass_id,
      full_name: member.full_name,
      membership_status: member.membership_status,
      role: 'member',
    })

    return NextResponse.json({
      success: true,
      full_name: member.full_name,
      nuass_id: member.nuass_id,
      membership_status: member.membership_status,
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
