import { redirect, notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getAdminSession } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { ArrowLeft, User, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { formatDate, formatDateTime } from '@/lib/utils'
import VerifyMemberButton from './VerifyMemberButton'

async function getMember(id: string) {
  const { data } = await supabaseAdmin.from('members').select('*').eq('id', id).single()
  return data
}

async function getMemberAttendance(id: string) {
  const { data } = await supabaseAdmin
    .from('attendance')
    .select('id, attendance_time, meeting:meetings(meeting_name, meeting_date)')
    .eq('student_id', id)
    .order('attendance_time', { ascending: false })
  return data || []
}

export default async function MemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')

 const { id } = await params
  const [member, attendance] = await Promise.all([
    getMember(id),
    getMemberAttendance(id),
  ])

  if (!member) notFound()

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link href="/admin/members" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">{member.full_name}</h1>
          <p className="text-gray-500 text-sm font-mono">{member.nuass_id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Photo + status */}
        <div className="nuass-card p-6 text-center">
          <div className="relative w-28 h-28 mx-auto mb-4">
            {member.passport_url ? (
              <Image src={member.passport_url} alt={member.full_name} fill className="object-cover rounded-full border-4 border-gray-100" sizes="112px" />
            ) : (
              <div className="w-28 h-28 rounded-full bg-gray-100 flex items-center justify-center border-4 border-gray-100">
                <User size={40} className="text-gray-400" />
              </div>
            )}
          </div>
          <h2 className="font-display font-bold text-gray-900 text-lg">{member.full_name}</h2>
          <p className="font-mono text-nuass-green text-sm font-semibold">{member.nuass_id}</p>
          
          <div className="mt-3">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${
              member.membership_status === 'VERIFIED' ? 'bg-green-100 text-green-700' :
              member.membership_status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {member.membership_status === 'VERIFIED' ? <CheckCircle size={14} /> :
               member.membership_status === 'PENDING' ? <Clock size={14} /> : <AlertCircle size={14} />}
              {member.membership_status}
            </span>
          </div>

          <p className="text-xs text-gray-400 mt-3">Registered {formatDate(member.created_at)}</p>

          {/* Quick verify action */}
          <div className="mt-4 space-y-2">
            <VerifyMemberButton memberId={member.id} currentStatus={member.membership_status} adminName={session.full_name} adminRole={session.role} />
          </div>
        </div>

        {/* Right: Details */}
        <div className="lg:col-span-2 space-y-4">
          <div className="nuass-card p-5">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wider text-gray-500">Personal</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ['Gender', member.gender],
                ['Date of Birth', member.date_of_birth ? formatDate(member.date_of_birth) : 'N/A'],
                ['WhatsApp', member.whatsapp_number],
                ['Email', member.email || 'Not provided'],
              ].map(([label, val]) => (
                <div key={label}>
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className="font-medium text-gray-800 mt-0.5">{val}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="nuass-card p-5">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wider text-gray-500">Academic</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ['Faculty', member.faculty],
                ['Department', member.department],
                ['Level', member.level],
              ].map(([label, val]) => (
                <div key={label}>
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className="font-medium text-gray-800 mt-0.5">{val}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="nuass-card p-5">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wider text-gray-500">Anambra Origin & Residence</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ['LGA', member.lga],
                ['Town', member.town],
                ['Village', member.village],
                ['Residence', member.residence],
                ['Meeting Commitment', member.meeting_commitment],
              ].map(([label, val]) => (
                <div key={label}>
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className="font-medium text-gray-800 mt-0.5">{val}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="nuass-card p-5">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wider text-gray-500">Expectations</h3>
            <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 rounded-lg p-3">{member.expectations}</p>
            <h3 className="font-semibold text-gray-900 mb-3 mt-4 text-sm uppercase tracking-wider text-gray-500">Contributions</h3>
            <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 rounded-lg p-3">{member.contributions}</p>
          </div>
        </div>
      </div>

      {/* Attendance History */}
      <div className="nuass-card overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Attendance History ({attendance.length} meetings)</h3>
        </div>
        {attendance.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">No attendance recorded</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="nuass-table">
              <thead><tr><th>Meeting</th><th>Meeting Date</th><th>Marked At</th></tr></thead>
              <tbody>
                {attendance.map((att: any) => (
                  <tr key={att.id}>
                    <td className="font-medium">{att.meeting?.meeting_name || 'Unknown'}</td>
                    <td className="text-xs text-gray-500">{att.meeting?.meeting_date ? formatDate(att.meeting.meeting_date) : 'N/A'}</td>
                    <td className="text-xs text-gray-400">{formatDateTime(att.attendance_time)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
