import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getAdminSession, getMemberSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const limit = parseInt(searchParams.get('limit') || '20')

  const { data: announcements, error } = await supabaseAdmin
    .from('announcements')
    .select('*')
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  return NextResponse.json({ announcements })
}

export async function POST(req: NextRequest) {
  const admin = await getAdminSession()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { title, content, is_pinned } = await req.json()
  if (!title?.trim() || !content?.trim()) {
    return NextResponse.json({ error: 'Title and content required' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin.from('announcements').insert({
    title: title.trim(),
    content: content.trim(),
    is_pinned: is_pinned || false,
    created_by: admin.full_name,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }).select().single()

  if (error) return NextResponse.json({ error: 'Failed to create' }, { status: 500 })
  return NextResponse.json({ announcement: data }, { status: 201 })
}

export async function PUT(req: NextRequest) {
  const admin = await getAdminSession()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, title, content, is_pinned } = await req.json()
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

  const { data, error } = await supabaseAdmin.from('announcements').update({
    title: title.trim(), content: content.trim(), is_pinned, updated_at: new Date().toISOString(),
  }).eq('id', id).select().single()

  if (error) return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  return NextResponse.json({ announcement: data })
}

export async function DELETE(req: NextRequest) {
  const admin = await getAdminSession()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

  const { error } = await supabaseAdmin.from('announcements').delete().eq('id', id)
  if (error) return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  return NextResponse.json({ success: true })
}
