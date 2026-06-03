import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getMemberSession } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { Bell, Users, Calendar, ExternalLink, User, CheckCircle, Clock, AlertCircle, MapPin } from 'lucide-react'
import { formatDate, formatRelativeTime } from '@/lib/utils'

async function getMemberData(id: string) {
  const { data } = await supabaseAdmin
    .from('members')
    .select('*')
    .eq('id', id)
    .single()
  return data
}

async function getRecentAnnouncements() {
  const { data } = await supabaseAdmin
    .from('announcements')
    .select('id, title, content, created_at, is_pinned')
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(5)
  return data || []
}

async function getAttendanceStats(studentId: string) {
  const { count: total } = await supabaseAdmin
    .from('meetings').select('*', { count: 'exact', head: true })
  const { count: attended } = await supabaseAdmin
    .from('attendance').select('*', { count: 'exact', head: true }).eq('student_id', studentId)
  return { total: total || 0, attended: attended || 0 }
}

async function getLgaMates(lga: string, memberId: string) {
  const { data } = await supabaseAdmin
    .from('members')
    .select('id, full_name, department, level')
    .eq('lga', lga)
    .eq('membership_status', 'VERIFIED')
    .neq('id', memberId)
    .limit(5)
  return data || []
}

export default async function DashboardPage() {
  const session = await getMemberSession()
  if (!session) redirect('/login')

  const [member, announcements, attendanceStats, lgaMates] = await Promise.all([
    getMemberData(session.id),
    getRecentAnnouncements(),
    getAttendanceStats(session.id),
    getMemberData(session.id).then(m => m ? getLgaMates(m.lga, session.id) : []),
  ])

  if (!member) redirect('/login')

  const isVerified = member.membership_status === 'VERIFIED'
  const attendancePct = attendanceStats.total > 0
    ? Math.round((attendanceStats.attended / attendanceStats.total) * 100)
    : 0

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Status Banner */}
      {!isVerified && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
          <Clock size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-yellow-800 text-sm">Membership Pending Verification</p>
            <p className="text-yellow-700 text-xs mt-0.5">Your registration is under review. You&apos;ll be notified once verified by an admin.</p>
          </div>
        </div>
      )}

      {isVerified && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
          <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-green-800 text-sm">🎉 Congratulations — Your membership has been verified!</p>
            <p className="text-green-700 text-xs mt-0.5">You now have full access to all NUASS benefits.</p>
          </div>
        </div>
      )}

      {/* Profile Card + Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile */}
        <div className="nuass-card p-6 lg:col-span-1">
          <div className="text-center">
            <div className="relative w-24 h-24 mx-auto mb-3">
              {member.passport_url ? (
                <Image src={member.passport_url} alt={member.full_name} fill className="object-cover rounded-full border-4 border-nuass-green/20" sizes="96px" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-nuass-green/10 flex items-center justify-center border-4 border-nuass-green/20">
                  <User size={36} className="text-nuass-green/40" />
                </div>
              )}
              <div className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-2 border-white ${isVerified ? 'bg-green-500' : 'bg-yellow-400'}`} />
            </div>
            <h2 className="font-display font-bold text-gray-900 text-lg leading-tight">{member.full_name}</h2>
            <p className="text-nuass-green font-mono text-sm font-semibold mt-1">{member.nuass_id}</p>
            <span className={`inline-flex items-center mt-2 px-3 py-1 rounded-full text-xs font-semibold border ${
              isVerified ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'
            }`}>
              {isVerified ? '✓ Verified Member' : '⏳ Pending Verification'}
            </span>
          </div>
          <div className="mt-4 space-y-2 text-sm">
            {[
              ['Faculty', member.faculty],
              ['Department', member.department],
              ['Level', member.level],
              ['LGA', member.lga],
              ['Gender', member.gender],
              ['Registered', formatDate(member.registration_date || member.created_at)],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between py-1.5 border-b border-gray-50 last:border-0">
                <span className="text-gray-500">{label}</span>
                <span className="text-gray-800 font-medium text-right max-w-[60%] truncate">{value}</span>
              </div>
            ))}
          </div>
          <Link href="/dashboard/profile" className="mt-4 block text-center text-nuass-green text-xs font-medium hover:underline">
            View full profile →
          </Link>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="stat-card">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Meetings Attended</p>
              <p className="font-display text-3xl font-bold text-nuass-green mt-1">{attendanceStats.attended}<span className="text-base font-normal text-gray-400">/{attendanceStats.total}</span></p>
              <p className="text-xs text-gray-400 mt-1">{attendancePct}% attendance rate</p>
            </div>
            <div className="stat-card">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">LGA Mates</p>
              <p className="font-display text-3xl font-bold text-nuass-green mt-1">{lgaMates.length}+</p>
              <p className="text-xs text-gray-400 mt-1">From {member.lga}</p>
            </div>
          </div>

          {/* WhatsApp Group Access */}
          <div className={`nuass-card p-5 ${isVerified ? 'border-green-200 bg-green-50/30' : ''}`}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Official NUASS WhatsApp Group</p>
                {isVerified
                  ? <p className="text-green-600 text-xs">✓ You have access as a verified member</p>
                  : <p className="text-gray-500 text-xs">Verify your membership to access</p>
                }
              </div>
            </div>
            {isVerified ? (
              <a
                href="#whatsapp-link"
                className="inline-flex items-center gap-2 mt-2 bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-600 transition-colors"
              >
                Join WhatsApp Group <ExternalLink size={14} />
              </a>
            ) : (
              <p className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3 border border-gray-100">
                🔒 Verify your membership to access the official NUASS WhatsApp group.
              </p>
            )}
          </div>

          {/* LGA Mates Preview */}
          {lgaMates.length > 0 && (
            <div className="nuass-card p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                  <MapPin size={16} className="text-nuass-green" />
                  Students from {member.lga} LGA
                </h3>
                <Link href="/dashboard/directory" className="text-xs text-nuass-green hover:underline">View all</Link>
              </div>
              <div className="space-y-2">
                {lgaMates.map((mate: any) => (
                  <div key={mate.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                    <div className="w-8 h-8 rounded-full bg-nuass-green/10 flex items-center justify-center flex-shrink-0">
                      <User size={14} className="text-nuass-green/60" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{mate.full_name}</p>
                      <p className="text-xs text-gray-400">{mate.department} · {mate.level}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Announcements */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-gray-900 text-xl flex items-center gap-2">
            <Bell size={20} className="text-nuass-green" />
            Recent Announcements
          </h2>
          <Link href="/dashboard/announcements" className="text-nuass-green text-sm font-medium hover:underline">View all</Link>
        </div>
        {announcements.length === 0 ? (
          <div className="nuass-card p-8 text-center text-gray-400">
            <Bell size={32} className="mx-auto mb-2 opacity-30" />
            <p>No announcements yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {announcements.map((ann: any) => (
              <div key={ann.id} className="nuass-card p-5 hover:shadow-sm transition-shadow">
                <div className="flex items-start gap-3">
                  {ann.is_pinned && <span className="text-nuass-gold text-xs font-bold mt-1 flex-shrink-0">📌</span>}
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm">{ann.title}</h4>
                    <p className="text-gray-500 text-sm mt-1 line-clamp-2 leading-relaxed">{ann.content}</p>
                    <p className="text-xs text-gray-400 mt-2">{formatRelativeTime(ann.created_at)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
