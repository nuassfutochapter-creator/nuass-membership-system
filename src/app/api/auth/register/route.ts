import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { supabaseAdmin, uploadPassportPhoto } from '@/lib/supabase'
import { generateNuassId } from '@/lib/auth'
import { checkRateLimit } from '@/lib/utils'

export async function POST(req: NextRequest) {
  // Rate limiting
  const ip = req.headers.get('x-forwarded-for') || 'unknown'
  if (!checkRateLimit(`register:${ip}`, 5, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many registration attempts. Try again later.' }, { status: 429 })
  }

  try {
    const formData = await req.formData()

    const whatsapp_number = formData.get('whatsapp_number') as string
    const password = formData.get('password') as string
    const full_name = formData.get('full_name') as string
    const date_of_birth = formData.get('date_of_birth') as string
    const gender = formData.get('gender') as string
    const email = formData.get('email') as string | null
    const faculty = formData.get('faculty') as string
    const department = formData.get('department') as string
    const level = formData.get('level') as string
    const lga = formData.get('lga') as string
    const town = formData.get('town') as string
    const village = formData.get('village') as string
    const residence = formData.get('residence') as string
    const expectations = formData.get('expectations') as string
    const contributions = formData.get('contributions') as string
    const meeting_commitment = formData.get('meeting_commitment') as string
    const passportFile = formData.get('passport') as File | null

    // Validate required fields
    if (!whatsapp_number || !password || !full_name || !faculty || !department || !level || !lga) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if WhatsApp number already registered
    const { data: existing } = await supabaseAdmin
      .from('members')
      .select('id')
      .eq('whatsapp_number', whatsapp_number)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'This WhatsApp number is already registered.' }, { status: 409 })
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 12)

    // Generate NUASS ID
    const { count } = await supabaseAdmin.from('members').select('*', { count: 'exact', head: true })
    const nuass_id = generateNuassId((count || 0) + 1)

    // Insert member (without passport first)
    const { data: member, error: insertError } = await supabaseAdmin
      .from('members')
      .insert({
        nuass_id,
        full_name: full_name.trim(),
        date_of_birth,
        gender,
        email: email || null,
        whatsapp_number,
        password_hash,
        faculty,
        department,
        level,
        lga,
        town,
        village,
        residence,
        expectations,
        contributions,
        meeting_commitment,
        membership_status: 'PENDING',
        registration_date: new Date().toISOString(),
      })
      .select('id, nuass_id')
      .single()

    if (insertError) {
      console.error('Insert error:', insertError)
      return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 500 })
    }

    // Upload passport photo if provided
    if (passportFile && passportFile.size > 0) {
      const passport_url = await uploadPassportPhoto(passportFile, nuass_id)
      if (passport_url) {
        await supabaseAdmin.from('members').update({ passport_url }).eq('id', member.id)
      }
    }

    return NextResponse.json({ success: true, nuass_id: member.nuass_id }, { status: 201 })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
