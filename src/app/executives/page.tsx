import Image from 'next/image'
import Link from 'next/link'
import PublicNavbar from '@/components/layout/PublicNavbar'
import PublicFooter from '@/components/layout/PublicFooter'
import { supabaseAdmin } from '@/lib/supabase'
import { User } from 'lucide-react'

async function getExecutives() {
  try {
    const { data } = await supabaseAdmin
      .from('executives')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
    return data || []
  } catch {
    return []
  }
}

const positionColors: Record<string, string> = {
  'President': 'bg-nuass-green text-white',
  'Vice President': 'bg-green-700 text-white',
  'Secretary General': 'bg-nuass-gold text-nuass-green-deep',
  default: 'bg-gray-100 text-gray-700',
}

export default async function ExecutivesPage() {
  const executives = await getExecutives()

  // Placeholder executives when DB is empty
  const placeholders = [
    { id: '1', full_name: 'To Be Announced', position: 'President', department: 'NUASS', level: '—', bio: 'The President of NUASS leads the union with dedication and vision.', photo_url: null },
    { id: '2', full_name: 'To Be Announced', position: 'Vice President', department: 'NUASS', level: '—', bio: 'The Vice President supports the President and oversees union activities.', photo_url: null },
    { id: '3', full_name: 'To Be Announced', position: 'Secretary General', department: 'NUASS', level: '—', bio: 'The Secretary General manages correspondence and record keeping.', photo_url: null },
    { id: '4', full_name: 'To Be Announced', position: 'Treasurer', department: 'NUASS', level: '—', bio: 'The Treasurer manages union finances and accounts.', photo_url: null },
    { id: '5', full_name: 'To Be Announced', position: 'Financial Secretary', department: 'NUASS', level: '—', bio: 'The Financial Secretary handles dues and financial records.', photo_url: null },
    { id: '6', full_name: 'To Be Announced', position: 'PRO', department: 'NUASS', level: '—', bio: 'The PRO manages public relations and communications.', photo_url: null },
    { id: '7', full_name: 'To Be Announced', position: 'Welfare Director', department: 'NUASS', level: '—', bio: 'The Welfare Director attends to member welfare and support needs.', photo_url: null },
    { id: '8', full_name: 'To Be Announced', position: 'PRO 2', department: 'NUASS', level: '—', bio: 'The Social Director organizes events and social activities.', photo_url: null },
  ]

  const displayExecs = executives.length > 0 ? executives : placeholders

  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar />

      <div className="pt-16 flex-1">
        {/* Hero */}
        <div className="bg-hero-gradient py-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 igbo-pattern-bg opacity-30" />
          <div className="relative max-w-3xl mx-auto px-4">
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mb-3">Nuass Resurgent Executives </h1>
            <div className="w-16 h-1 bg-nuass-gold mx-auto mb-4 rounded" />
            <p className="text-white/75 text-lg">The leaders driving NUASS FUTO CHAPTER forward — united in purpose, committed to excellence 2026/2027.</p>
          </div>
        </div>

        {/* Executives Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayExecs.map((exec: any) => (
              <div key={exec.id} className="nuass-card overflow-hidden group hover:shadow-lg transition-all duration-300">
                {/* Photo */}
                <div className="relative h-48 bg-gradient-to-br from-nuass-green-deep to-nuass-green flex items-center justify-center">
                  {exec.photo_url ? (
                    <Image src={exec.photo_url} alt={exec.full_name} fill className="object-cover" sizes="300px" />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
                      <User size={36} className="text-white/60" />
                    </div>
                  )}
                  {/* Position badge */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${positionColors[exec.position] || positionColors.default}`}>
                      {exec.position}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4 text-center">
                  <h3 className="font-display font-bold text-gray-900 text-base leading-tight">{exec.full_name}</h3>
                  <p className="text-nuass-green text-xs font-medium mt-0.5">{exec.department}</p>
                  {exec.level !== '—' && <p className="text-gray-400 text-xs">{exec.level}</p>}
                  {exec.bio && (
                    <p className="text-gray-500 text-xs mt-3 leading-relaxed line-clamp-3">{exec.bio}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gray-50 py-12 text-center border-t border-gray-100">
          <h3 className="font-display text-2xl font-bold text-nuass-green mb-3">Be Part of the Story</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">Join NUASS today and contribute to our growing community of Anambra State students IN futo.</p>
          <Link href="/register" className="btn-primary rounded-xl px-8 py-3 font-bold">Register Now</Link>
        </div>
      </div>

      <PublicFooter />
    </div>
  )
}
