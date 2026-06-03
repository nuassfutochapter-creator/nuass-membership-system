import { redirect } from 'next/navigation'
import Image from 'next/image'
import { getMemberSession } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { User, Phone, Mail, MapPin, BookOpen, Calendar, Home } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default async function ProfilePage() {
  const session = await getMemberSession()
  if (!session) redirect('/login')

  const { data: member } = await supabaseAdmin
    .from('members')
    .select('*')
    .eq('id', session.id)
    .single()

  if (!member) redirect('/login')

  const isVerified = member.membership_status === 'VERIFIED'

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="font-display text-2xl font-bold text-gray-900">My Profile</h1>

      {/* ID Card */}
      <div className="id-card p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="w-20 h-24 rounded-xl overflow-hidden border-2 border-nuass-gold flex-shrink-0 bg-nuass-green-dark flex items-center justify-center">
            {member.passport_url
              ? <Image src={member.passport_url} alt={member.full_name} width={80} height={96} className="object-cover w-full h-full" />
              : <User size={32} className="text-white/40" />
            }
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-nuass-gold/60 flex-shrink-0">
                <Image src="/nuass-logo.jpg" alt="NUASS" width={32} height={32} className="object-cover" />
              </div>
              <p className="text-nuass-gold-light text-xs font-semibold uppercase tracking-widest">NUASS Member Card</p>
            </div>
            <h2 className="font-display text-xl font-bold leading-tight">{member.full_name}</h2>
            <p className="font-mono text-nuass-gold font-bold text-lg mt-0.5">{member.nuass_id}</p>
            <div className="mt-2 flex items-center gap-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                isVerified ? 'bg-green-500/30 text-green-300 border border-green-400/40' : 'bg-yellow-500/30 text-yellow-300 border border-yellow-400/40'
              }`}>
                {isVerified ? '✓ Verified Member' : '⏳ Pending Verification'}
              </span>
            </div>
            <p className="text-white/50 text-xs mt-2">Registered: {formatDate(member.registration_date || member.created_at)}</p>
          </div>
        </div>
      </div>

      {/* Profile Sections */}
      {[
        {
          title: 'Personal Information',
          icon: User,
          fields: [
            ['Full Name', member.full_name],
            ['Date of Birth', member.date_of_birth ? formatDate(member.date_of_birth) : 'N/A'],
            ['Gender', member.gender],
            ['WhatsApp', member.whatsapp_number],
            ['Email', member.email || 'Not provided'],
          ]
        },
        {
          title: 'Academic Information',
          icon: BookOpen,
          fields: [
            ['Faculty', member.faculty],
            ['Department', member.department],
            ['Level', member.level],
          ]
        },
        {
          title: 'Anambra Origin',
          icon: MapPin,
          fields: [
            ['LGA', member.lga],
            ['Town', member.town],
            ['Village', member.village],
          ]
        },
        {
          title: 'Residence & Commitment',
          icon: Home,
          fields: [
            ['School Residence', member.residence],
            ['Meeting Commitment', member.meeting_commitment],
          ]
        },
      ].map(section => (
        <div key={section.title} className="nuass-card p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <section.icon size={18} className="text-nuass-green" />
            {section.title}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {section.fields.map(([label, value]) => (
              <div key={label}>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{label}</p>
                <p className="text-gray-800 font-medium text-sm mt-0.5">{value}</p>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Expectations & Contributions */}
      <div className="nuass-card p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Union Questionnaire</h3>
        <div className="space-y-4">
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">My Expectations from NUASS</p>
            <p className="text-gray-700 text-sm leading-relaxed bg-gray-50 rounded-xl p-4">{member.expectations}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">My Contributions to NUASS</p>
            <p className="text-gray-700 text-sm leading-relaxed bg-gray-50 rounded-xl p-4">{member.contributions}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
