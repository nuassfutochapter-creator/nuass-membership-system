import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getAdminSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

async function uploadPhoto(file: File, id: string): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `exec-${id}-${Date.now()}.${fileExt}`
    const filePath = `executives/${fileName}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { data, error } = await supabaseAdmin.storage
      .from('member-photos')
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: true,
      })

    if (error) {
      console.error('Storage upload error:', error)
      return null
    }

    const { data: urlData } = supabaseAdmin.storage
      .from('member-photos')
      .getPublicUrl(filePath)

    return urlData.publicUrl
  } catch (err) {
    console.error('Upload exception:', err)
    return null
  }
}

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
    console.log('Uploading photo for:', exec.id, 'Size:', photoFile.size)
    const photo_url = await uploadPhoto(photoFile, exec.id)
    console.log('Photo URL:', photo_url)
    if (photo_url) {
      await supabaseAdmin.from('executives').update({ photo_url }).eq('id', exec.id)
      exec.photo_url = photo_url
    }
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
    console.log('Uploading photo for update:', id, 'Size:', photoFile.size)
    const photo_url = await uploadPhoto(photoFile, id)
    console.log('Photo URL:', photo_url)
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
