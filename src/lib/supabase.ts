import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client-side Supabase client (uses anon key)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side Supabase client (uses service role - NEVER expose to client)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Upload passport photo to Supabase Storage
export async function uploadPassportPhoto(file: File, nuassId: string): Promise<string | null> {
  const fileExt = file.name.split('.').pop()
  const fileName = `${nuassId}-${Date.now()}.${fileExt}`
  const filePath = `passports/${fileName}`

  const { data, error } = await supabase.storage
    .from('member-photos')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    console.error('Upload error:', error)
    return null
  }

  const { data: urlData } = supabase.storage
    .from('member-photos')
    .getPublicUrl(filePath)

  return urlData.publicUrl
}

// Upload executive photo
export async function uploadExecutivePhoto(file: File, executiveId: string): Promise<string | null> {
  const fileExt = file.name.split('.').pop()
  const fileName = `exec-${executiveId}-${Date.now()}.${fileExt}`
  const filePath = `executives/${fileName}`

  const { data, error } = await supabase.storage
    .from('member-photos')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    })

  if (error) {
    console.error('Upload error:', error)
    return null
  }

  const { data: urlData } = supabase.storage
    .from('member-photos')
    .getPublicUrl(filePath)

  return urlData.publicUrl
}
