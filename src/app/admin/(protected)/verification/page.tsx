'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { ShieldCheck, X, Check, User, Search, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatDate, formatDateTime } from '@/lib/utils'

export default function VerificationPage() {
  const [pending, setPending] = useState<any[]>([])
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedMember, setSelectedMember] = useState<any | null>(null)
  const [verifying, setVerifying] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    const [pendingRes, logsRes] = await Promise.all([
      fetch('/api/members?status=PENDING&limit=50'),
      fetch('/api/verification?limit=20'),
    ])
    const pendingData = await pendingRes.json()
    const logsData = await logsRes.json()
    setPending(pendingData.members || [])
    setLogs(logsData.logs || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleVerify = async (memberId: string, action: 'VERIFIED' | 'SUSPENDED') => {
    setVerifying(memberId)
    try {
      const res = await fetch('/api/verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ member_id: memberId, action }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Action failed')
        return
      }
      toast.success(action === 'VERIFIED' ? '✓ Member verified!' : 'Member suspended')
      setSelectedMember(null)
      fetchData()
    } catch {
      toast.error('An error occurred')
    } finally {
      setVerifying(null)
    }
  }

  const filtered = pending.filter(m =>
    m.full_name.toLowerCase().includes(search.toLowerCase()) ||
    m.nuass_id?.toLowerCase().includes(search.toLowerCase()) ||
    m.whatsapp_number.includes(search)
  )

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ShieldCheck size={24} className="text-nuass-green" />
          Member Verification
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Review and verify pending member registrations. <span className="font-semibold text-yellow-600">{pending.length} pending</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending List */}
        <div className="nuass-card overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search pending members..."
                className="nuass-input pl-9 text-sm"
              />
            </div>
          </div>

          <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center"><div className="spinner mx-auto" style={{ borderColor: 'rgba(13,92,46,0.2)', borderTopColor: '#0d5c2e' }} /></div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <ShieldCheck size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No pending members</p>
              </div>
            ) : (
              filtered.map(member => (
                <div
                  key={member.id}
                  onClick={() => setSelectedMember(member)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors flex items-center gap-3 ${selectedMember?.id === member.id ? 'bg-green-50 border-r-2 border-nuass-green' : ''}`}
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                    {member.passport_url ? (
                      <Image src={member.passport_url} alt={member.full_name} width={40} height={40} className="object-cover w-full h-full" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><User size={16} className="text-gray-400" /></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{member.full_name}</p>
                    <p className="text-xs text-gray-500">{member.department} · {member.level}</p>
                    <p className="text-xs font-mono text-gray-400">{member.nuass_id}</p>
                  </div>
                  <p className="text-xs text-gray-400">{formatDate(member.created_at)}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Detail View */}
        <div className="nuass-card p-6">
          {!selectedMember ? (
            <div className="h-full flex items-center justify-center text-gray-400">
              <div className="text-center">
                <ShieldCheck size={48} className="mx-auto mb-3 opacity-20" />
                <p className="text-sm">Select a member to review</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Photo & Basic */}
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                  {selectedMember.passport_url ? (
                    <Image src={selectedMember.passport_url} alt={selectedMember.full_name} width={80} height={80} className="object-cover w-full h-full" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><User size={28} className="text-gray-300" /></div>
                  )}
                </div>
                <div>
                  <h3 className="font-display font-bold text-gray-900 text-lg leading-tight">{selectedMember.full_name}</h3>
                  <p className="font-mono text-nuass-green text-sm font-semibold">{selectedMember.nuass_id}</p>
                  <p className="text-gray-500 text-xs mt-0.5">Registered {formatDateTime(selectedMember.created_at)}</p>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-3 text-sm bg-gray-50 rounded-xl p-4">
                {[
                  ['Gender', selectedMember.gender],
                  ['Date of Birth', selectedMember.date_of_birth ? formatDate(selectedMember.date_of_birth) : 'N/A'],
                  ['Faculty', selectedMember.faculty],
                  ['Department', selectedMember.department],
                  ['Level', selectedMember.level],
                  ['LGA', selectedMember.lga],
                  ['Town', selectedMember.town],
                  ['Village', selectedMember.village],
                  ['Residence', selectedMember.residence],
                  ['WhatsApp', selectedMember.whatsapp_number],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-xs text-gray-400 font-medium">{label}</p>
                    <p className="text-gray-800 font-medium text-xs mt-0.5 truncate">{value}</p>
                  </div>
                ))}
              </div>

              {/* Expectations */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Expectations</p>
                <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-3 leading-relaxed">{selectedMember.expectations}</p>
              </div>

              {/* Contributions */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Contributions</p>
                <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-3 leading-relaxed">{selectedMember.contributions}</p>
              </div>

              <p className="text-xs text-gray-500">Meeting commitment: <span className="font-semibold">{selectedMember.meeting_commitment}</span></p>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => handleVerify(selectedMember.id, 'VERIFIED')}
                  disabled={!!verifying}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-nuass-green text-white font-bold hover:bg-nuass-green-mid transition-colors disabled:opacity-60"
                >
                  {verifying === selectedMember.id ? <span className="spinner" /> : <Check size={18} />}
                  Verify Member
                </button>
                <button
                  onClick={() => handleVerify(selectedMember.id, 'SUSPENDED')}
                  disabled={!!verifying}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-red-50 text-red-600 border border-red-200 font-semibold hover:bg-red-100 transition-colors disabled:opacity-60"
                >
                  <X size={18} />
                  Reject
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Verification Logs */}
      <div className="nuass-card overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Verification Log</h3>
          <p className="text-xs text-gray-500 mt-0.5">Complete audit trail of all verification actions</p>
        </div>
        <div className="overflow-x-auto">
          <table className="nuass-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>NUASS ID</th>
                <th>Action</th>
                <th>Verified By</th>
                <th>Admin Role</th>
                <th>Date & Time</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr><td colSpan={6} className="text-center text-gray-400 py-8">No verification logs yet</td></tr>
              ) : (
                logs.map((log: any) => (
                  <tr key={log.id}>
                    <td className="font-medium text-gray-900">{log.student_name}</td>
                    <td className="font-mono text-xs text-gray-500">{log.nuass_id}</td>
                    <td>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                        log.action === 'VERIFIED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>{log.action}</span>
                    </td>
                    <td className="text-sm">{log.verified_by}</td>
                    <td className="text-xs text-gray-500">{log.admin_role}</td>
                    <td className="text-xs text-gray-400">{formatDateTime(log.verification_time)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
