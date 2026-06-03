import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { supabaseAdmin } from '@/lib/supabase'
import { setAdminSession } from '@/lib/auth'
import { checkRateLimit } from '@/lib/utils'

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown'
  if (!checkRateLimit(`admin-login:${ip}`, 5, 15 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 })
  }

  try {
    const { email, password } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    const { data: admin, error } = await supabaseAdmin
      .from('admins')
      .select('id, full_name, role, email, phone, password_hash, is_active')
      .eq('email', email.toLowerCase())
      .single()

    if (error || !admin) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    if (!admin.is_active) {
      return NextResponse.json({ error: 'Admin account is deactivated' }, { status: 403 })
    }

    const passwordMatch = await bcrypt.compare(password, admin.password_hash)
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    await setAdminSession({
      id: admin.id,
      full_name: admin.full_name,
      role: admin.role,
      email: admin.email,
      type: 'admin',
    })

    return NextResponse.json({ success: true, full_name: admin.full_name, role: admin.role })
  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
