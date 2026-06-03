import Link from 'next/link'
import Image from 'next/image'
import { Users, CheckCircle, Clock, ArrowRight, BookOpen, Globe, Star, Shield } from 'lucide-react'
import PublicNavbar from '@/components/layout/PublicNavbar'
import PublicFooter from '@/components/layout/PublicFooter'
import { supabaseAdmin } from '@/lib/supabase'

async function getStats() {
  try {
    const { count: total } = await supabaseAdmin
      .from('members')
      .select('*', { count: 'exact', head: true })

    const { count: verified } = await supabaseAdmin
      .from('members')
      .select('*', { count: 'exact', head: true })
      .eq('membership_status', 'VERIFIED')

    const { count: pending } = await supabaseAdmin
      .from('members')
      .select('*', { count: 'exact', head: true })
      .eq('membership_status', 'PENDING')

    return { total: total || 0, verified: verified || 0, pending: pending || 0 }
  } catch {
    return { total: 0, verified: 0, pending: 0 }
  }
}

async function getLatestAnnouncements() {
  try {
    const { data } = await supabaseAdmin
      .from('announcements')
      .select('id, title, content, created_at, is_pinned')
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(3)
    return data || []
  } catch {
    return []
  }
}

export default async function HomePage() {
  const [stats, announcements] = await Promise.all([getStats(), getLatestAnnouncements()])

  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center bg-hero-gradient overflow-hidden pt-16">
        {/* Geometric background shapes */}
        <div className="hero-shape w-96 h-96 top-10 -right-20 opacity-50" />
        <div className="hero-shape w-64 h-64 bottom-20 -left-10 opacity-30" />
        <div className="absolute inset-0 igbo-pattern-bg opacity-40" />

        {/* Decorative Uli-inspired lines */}
        <div className="absolute top-1/4 right-0 w-px h-48 bg-gradient-to-b from-transparent via-nuass-gold/40 to-transparent" />
        <div className="absolute bottom-1/4 left-0 w-px h-48 bg-gradient-to-b from-transparent via-nuass-gold/30 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            {/* Text Content */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-nuass-gold/20 border border-nuass-gold/40 rounded-full px-4 py-2 mb-6 animate-fade-in-up">
                <Star size={14} className="text-nuass-gold-light fill-nuass-gold-light" />
                <span className="text-nuass-gold-light text-sm font-medium">Official Student Union Portal</span>
              </div>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4 animate-fade-in-up animate-delay-100">
                National Union of
                <span className="block text-nuass-gold">Anambra State</span>
                Students Futo Chapter
              </h1>

              <div className="flex items-center justify-center lg:justify-start gap-3 mb-6 animate-fade-in-up animate-delay-200">
                <div className="w-8 h-px bg-nuass-gold/60" />
                <p className="text-nuass-gold-light font-semibold tracking-[0.2em] text-sm uppercase">
                  Unity • Culture • Progress
                </p>
                <div className="w-8 h-px bg-nuass-gold/60" />
              </div>

              <p className="text-white/75 text-lg leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0 animate-fade-in-up animate-delay-300">
                Join thousands of Anambra indigenes in our thriving student community. 
                Access exclusive benefits, connect with fellow students, and build lasting connections.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in-up animate-delay-400">
                <Link href="/register" className="btn-gold text-base px-8 py-4 font-bold rounded-xl">
                  Register Now
                  <ArrowRight size={18} className="ml-2" />
                </Link>
                <Link href="/login" className="inline-flex items-center justify-center px-8 py-4 rounded-xl border-2 border-white/30 text-white font-semibold hover:bg-white/10 hover:border-white/50 transition-all duration-200 text-base">
                  Member Login
                </Link>
              </div>

              {/* Motto tag */}
              <div className="mt-8 inline-flex items-center gap-2 text-white/50 text-sm animate-fade-in-up animate-delay-500">
                <BookOpen size={14} />
                <span>Motto: Education is Light</span>
              </div>
            </div>

            {/* Logo Display */}
            <div className="flex-shrink-0 animate-fade-in-up animate-delay-200">
              <div className="relative w-64 h-64 sm:w-80 sm:h-80">
                {/* Gold ring */}
                <div className="absolute inset-0 rounded-full border-4 border-nuass-gold/40 animate-pulse" />
                <div className="absolute inset-3 rounded-full border-2 border-nuass-gold/20" />
                <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-nuass-gold shadow-2xl shadow-nuass-gold/20">
                  <Image
                    src="/nuass-logo.jpg"
                    alt="NUASS - National Union of Anambra State Students"
                    fill
                    className="object-cover"
                    priority
                    sizes="320px"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-12 sm:h-16">
            <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="#f9fafb" />
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: Users, label: 'Total Members', value: stats.total, color: 'text-nuass-green' },
              { icon: CheckCircle, label: 'Verified Members', value: stats.verified, color: 'text-green-600' },
              { icon: Clock, label: 'Pending Verification', value: stats.pending, color: 'text-yellow-600' },
            ].map((stat, i) => (
              <div key={i} className="nuass-card p-8 text-center group hover:shadow-md transition-shadow">
                <div className="flex justify-center mb-3">
                  <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-green-50 flex items-center justify-center transition-colors">
                    <stat.icon size={24} className={stat.color} />
                  </div>
                </div>
                <div className={`font-display text-4xl font-bold ${stat.color} mb-1`}>{stat.value.toLocaleString()}</div>
                <div className="text-gray-500 text-sm font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-nuass-green mb-3">About NUASS FUTO CHAPTER </h2>
            <div className="w-16 h-1 bg-nuass-gold mx-auto rounded" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: 'Our Mission',
                text: 'To unite all Anambra State indigenes in FUTO, fostering academic excellence, cultural pride, and student welfare through structured programs and advocacy.',
              },
              {
                icon: Globe,
                title: 'Our Vision',
                text: 'To be the most impactful state student union in Nigeria, producing future leaders who embody Anambra values and contribute to national development.',
              },
              {
                icon: Star,
                title: 'Our Objectives',
                text: 'Promote Igbo culture and heritage, support members academically, provide welfare services, foster networking, and advocate for Anambra student interests.',
              },
            ].map((item, i) => (
              <div key={i} className="nuass-card p-8 hover:shadow-md transition-all duration-300 group">
                <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center mb-4 group-hover:bg-nuass-green group-hover:text-white transition-all">
                  <item.icon size={22} className="text-nuass-green group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-display text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed text-sm">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Announcements Preview */}
      {announcements.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-nuass-green mb-2">Latest Announcements</h2>
                <div className="w-16 h-1 bg-nuass-gold rounded" />
              </div>
              <Link href="/login" className="text-nuass-green font-medium text-sm hover:underline flex items-center gap-1">
                View all <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {announcements.map((ann: any) => (
                <div key={ann.id} className="nuass-card p-6 hover:shadow-md transition-shadow">
                  {ann.is_pinned && (
                    <span className="inline-flex items-center gap-1 text-nuass-gold text-xs font-semibold uppercase tracking-wider mb-3">
                      <Star size={10} className="fill-nuass-gold" /> Pinned
                    </span>
                  )}
                  <h3 className="font-semibold text-gray-900 mb-2 leading-tight">{ann.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed line-clamp-3">{ann.content}</p>
                  <p className="text-xs text-gray-400 mt-3">
                    {new Date(ann.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-nuass-green">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="relative w-20 h-20 mx-auto mb-6 rounded-full overflow-hidden border-3 border-nuass-gold">
            <Image src="/nuass-logo.jpg" alt="NUASS" fill className="object-cover" sizes="80px" />
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Join Our Community?
          </h2>
          <p className="text-white/75 text-lg mb-8">
            Register today and become part of the NUASS FUTO CHAPTER family. Access exclusive benefits, connect with fellow Anambra students.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="btn-gold text-base px-8 py-4 font-bold rounded-xl">
              Register Now — It&apos;s Free
            </Link>
            <Link href="/executives" className="inline-flex items-center justify-center px-8 py-4 rounded-xl border-2 border-white/40 text-white font-semibold hover:bg-white/10 transition-all duration-200">
              Meet the Executives
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
