import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, uploadExecutivePhoto } from '@/lib/supabase'
import { getAdminSession } from '@/lib/auth'

export async function GET() {
  const { data: executives, error } = await supabaseAdmin
    .from('executives')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  if (error) return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  return NextResponse.json({ executives })
}

export async function POST(req: NextRequest) {
  const admin = await getAdminSession()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const full_name = formData.get('full_name') as string
  const position = formData.get('position') as string
  const department = formData.get('department') as string
  const level = formData.get('level') as string
  const bio = formData.get('bio') as string
  const display_order = parseInt(formData.get('display_order') as string || '0')
  const photoFile = formData.get('photo') as File | null

  if (!full_name || !position || !department) {
    return NextResponse.json({ error: 'Name, position, and department required' }, { status: 400 })
  }

  const { data: exec, error } = await supabaseAdmin.from('executives').insert({
    full_name, position, department, level, bio, display_order, is_active: true,
  }).select().single()

  if (error) return NextResponse.json({ error: 'Failed to create' }, { status: 500 })

  if (photoFile && photoFile.size > 0) {
    const photo_url = await uploadExecutivePhoto(photoFile, exec.id)
    if (photo_url) await supabaseAdmin.from('executives').update({ photo_url }).eq('id', exec.id)
  }

  return NextResponse.json({ executive: exec }, { status: 201 })
}

export async function PUT(req: NextRequest) {
  const admin = await getAdminSession()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const id = formData.get('id') as string
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

  const updates: any = {
    full_name: formData.get('full_name'),
    position: formData.get('position'),
    department: formData.get('department'),
    level: formData.get('level'),
    bio: formData.get('bio'),
    display_order: parseInt(formData.get('display_order') as string || '0'),
  }

  const photoFile = formData.get('photo') as File | null
  if (photoFile && photoFile.size > 0) {
    const photo_url = await uploadExecutivePhoto(photoFile, id)
    if (photo_url) updates.photo_url = photo_url
  }

  const { data, error } = await supabaseAdmin.from('executives').update(updates).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  return NextResponse.json({ executive: data })
}

export async function DELETE(req: NextRequest) {
  const admin = await getAdminSession()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

  const { error } = await supabaseAdmin.from('executives').update({ is_active: false }).eq('id', id)
  if (error) return NextResponse.json({ error: 'Failed to remove' }, { status: 500 })
  return NextResponse.json({ success: true })
}
