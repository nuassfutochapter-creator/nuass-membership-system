import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getAdminSession } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { Users, CheckCircle, Clock, AlertCircle, ShieldCheck, Megaphone, ArrowRight } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'

async function getAdminStats() {
  const [
    { count: total },
    { count: verified },
    { count: pending },
    { count: suspended },
  ] = await Promise.all([
    supabaseAdmin.from('members').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('members').select('*', { count: 'exact', head: true }).eq('membership_status', 'VERIFIED'),
    supabaseAdmin.from('members').select('*', { count: 'exact', head: true }).eq('membership_status', 'PENDING'),
    supabaseAdmin.from('members').select('*', { count: 'exact', head: true }).eq('membership_status', 'SUSPENDED'),
  ])
  return { total: total || 0, verified: verified || 0, pending: pending || 0, suspended: suspended || 0 }
}

async function getRecentMembers() {
  const { data } = await supabaseAdmin
    .from('members')
    .select('id, nuass_id, full_name, department, level, membership_status, created_at')
    .order('created_at', { ascending: false })
    .limit(8)
  return data || []
}

async function getRecentVerifications() {
  const { data } = await supabaseAdmin
    .from('verification_logs')
    .select('*')
    .order('verification_time', { ascending: false })
    .limit(5)
  return data || []
}

export default async function AdminDashboardPage() {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')

  const [stats, recentMembers, recentVerifications] = await Promise.all([
    getAdminStats(),
    getRecentMembers(),
    getRecentVerifications(),
  ])

  const statCards = [
    { label: 'Total Members', value: stats.total, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Verified Members', value: stats.verified, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Pending Verification', value: stats.pending, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Suspended', value: stats.suspended, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
  ]

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Manage NUASS membership, announcements, and more.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{card.label}</p>
              <div className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center`}>
                <card.icon size={16} className={card.color} />
              </div>
            </div>
            <p className={`font-display text-3xl font-bold ${card.color}`}>{card.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { href: '/admin/verification', label: 'Verify Members', icon: ShieldCheck, badge: stats.pending },
          { href: '/admin/members', label: 'All Members', icon: Users, badge: null },
          { href: '/admin/announcements', label: 'Announcements', icon: Megaphone, badge: null },
          { href: '/admin/analytics', label: 'View Analytics', icon: ArrowRight, badge: null },
        ].map((action) => (
          <Link key={action.href} href={action.href} className="nuass-card p-4 hover:shadow-md transition-all text-center group">
            <div className="relative inline-block mb-2">
              <div className="w-10 h-10 rounded-xl bg-nuass-green/10 group-hover:bg-nuass-green flex items-center justify-center mx-auto transition-colors">
                <action.icon size={20} className="text-nuass-green group-hover:text-white transition-colors" />
              </div>
              {action.badge !== null && action.badge > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {action.badge}
                </span>
              )}
            </div>
            <p className="text-sm font-medium text-gray-700 group-hover:text-nuass-green transition-colors">{action.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Registrations */}
        <div className="nuass-card overflow-hidden">
          <div className="p-5 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Recent Registrations</h3>
            <Link href="/admin/members" className="text-xs text-nuass-green font-medium hover:underline">View all</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="nuass-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>NUASS ID</th>
                  <th>Department</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentMembers.length === 0 ? (
                  <tr><td colSpan={4} className="text-center text-gray-400 py-8">No members yet</td></tr>
                ) : (
                  recentMembers.map((member: any) => (
                    <tr key={member.id}>
                      <td className="font-medium text-gray-900 max-w-[120px] truncate">{member.full_name}</td>
                      <td className="font-mono text-xs text-gray-500">{member.nuass_id}</td>
                      <td className="text-xs text-gray-500 max-w-[100px] truncate">{member.department}</td>
                      <td>
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                          member.membership_status === 'VERIFIED' ? 'bg-green-100 text-green-700' :
                          member.membership_status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {member.membership_status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Verification Activity */}
        <div className="nuass-card overflow-hidden">
          <div className="p-5 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Verification Activity</h3>
            <Link href="/admin/verification" className="text-xs text-nuass-green font-medium hover:underline">Verify members</Link>
          </div>
          {recentVerifications.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <ShieldCheck size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No verification activity yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentVerifications.map((log: any) => (
                <div key={log.id} className="p-4 flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    log.action === 'VERIFIED' ? 'bg-green-500' : 'bg-yellow-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{log.student_name}</p>
                    <p className="text-xs text-gray-500 font-mono">{log.nuass_id}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {log.action} by <span className="font-medium">{log.verified_by}</span> ({log.admin_role})
                    </p>
                  </div>
                  <p className="text-xs text-gray-400 flex-shrink-0">{formatDateTime(log.verification_time)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
