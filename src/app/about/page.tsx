import Link from 'next/link'
import Image from 'next/image'
import PublicNavbar from '@/components/layout/PublicNavbar'
import PublicFooter from '@/components/layout/PublicFooter'
import { Shield, Globe, Star, BookOpen, Heart, Users } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar />
      <div className="pt-16 flex-1">
        {/* Hero */}
        <div className="bg-hero-gradient py-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 igbo-pattern-bg opacity-30" />
          <div className="relative max-w-3xl mx-auto px-4">
            <div className="relative w-24 h-24 mx-auto mb-6 rounded-full overflow-hidden border-4 border-nuass-gold/60">
              <Image src="/nuass-logo.jpg" alt="NUASS" fill className="object-cover" sizes="96px" />
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mb-3">About NUASS FUTO CHAPTER</h1>
            <div className="w-16 h-1 bg-nuass-gold mx-auto mb-4 rounded" />
            <p className="text-white/80 text-lg">National Union of Anambra State Students Futo Chapter</p>
            <p className="text-nuass-gold-light font-semibold mt-2">Motto: Education is Light</p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
          {/* Mission Vision Objectives */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: 'Our Mission', color: 'bg-green-50 text-nuass-green',
                text: 'To unite all Anambra State indigenes studying at  Federal University of Technology Owerri, fostering academic excellence, cultural pride, and mutual support through structured programs and collective advocacy.' },
              { icon: Globe, title: 'Our Vision', color: 'bg-blue-50 text-blue-600',
                text: 'To be the most impactful, transparent, and student-focused state union in Nigeria — producing future leaders who embody Anambra values and contribute meaningfully to national development.' },
              { icon: Star, title: 'Our Core Values', color: 'bg-amber-50 text-amber-600',
                text: 'Unity in diversity, respect for Igbo heritage and culture, academic excellence, transparency in leadership, collective welfare, and mentorship of the next generation.' },
            ].map((item) => (
              <div key={item.title} className="nuass-card p-8">
                <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center mb-4`}>
                  <item.icon size={22} />
                </div>
                <h3 className="font-display text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed text-sm">{item.text}</p>
              </div>
            ))}
          </div>

          {/* Objectives */}
          <div>
            <h2 className="font-display text-3xl font-bold text-nuass-green mb-2 text-center">Our Objectives</h2>
            <div className="w-16 h-1 bg-nuass-gold mx-auto mb-8 rounded" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: BookOpen, text: 'Promote Igbo culture, traditions, and heritage among students at FUTO' },
                { icon: Heart, text: 'Provide welfare support to members in times of need and challenge' },
                { icon: Users, text: 'Create networking opportunities among Anambra indigenes across faculties' },
                { icon: Shield, text: 'Advocate for the rights and interests of Anambra students on campus' },
                { icon: Star, text: 'Organize educational, cultural, and social programs that enrich student life' },
                { icon: Globe, text: 'Foster unity, discipline, and collective progress among our members' },
              ].map((obj, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-green-50/50 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-nuass-green/10 flex items-center justify-center flex-shrink-0">
                    <obj.icon size={16} className="text-nuass-green" />
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">{obj.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center bg-nuass-green rounded-2xl p-12">
            <div className="relative w-16 h-16 mx-auto mb-4 rounded-full overflow-hidden border-3 border-nuass-gold">
              <Image src="/nuass-logo.jpg" alt="NUASS" fill className="object-cover" sizes="64px" />
            </div>
            <h3 className="font-display text-2xl font-bold text-white mb-3">Join Our Community</h3>
            <p className="text-white/75 text-sm mb-6 max-w-md mx-auto">Become part of a proud Anambra student community committed to education, culture, and mutual progress.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/register" className="btn-gold rounded-xl px-8 py-3 font-bold">Register Now</Link>
              <Link href="/executives" className="inline-flex items-center justify-center px-8 py-3 rounded-xl border-2 border-white/40 text-white font-semibold hover:bg-white/10 transition-all">
                Meet the Executives
              </Link>
            </div>
          </div>
        </div>
      </div>
      <PublicFooter />
    </div>
  )
}
