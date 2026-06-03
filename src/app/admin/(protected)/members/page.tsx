'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Search, Filter, Download, Eye, Edit2, ChevronLeft, ChevronRight } from 'lucide-react'
import { ANAMBRA_LGAS, STUDENT_LEVELS } from '@/types'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

const PAGE_SIZE = 20

export default function AdminMembersPage() {
  const [members, setMembers] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({ status: '', lga: '', level: '', faculty: '' })
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)

  const fetchMembers = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({
      page: String(page),
      limit: String(PAGE_SIZE),
      ...(search && { search }),
      ...(filters.status && { status: filters.status }),
      ...(filters.lga && { lga: filters.lga }),
      ...(filters.level && { level: filters.level }),
    })
    const res = await fetch(`/api/members?${params}`)
    const data = await res.json()
    setMembers(data.members || [])
    setTotal(data.total || 0)
    setLoading(false)
  }, [page, search, filters])

  useEffect(() => { fetchMembers() }, [fetchMembers])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">All Members</h1>
          <p className="text-gray-500 text-sm mt-1">{total.toLocaleString()} total members</p>
        </div>
        <button
          onClick={() => {
            const csv = members.map(m =>
              `${m.nuass_id},${m.full_name},${m.department},${m.level},${m.lga},${m.whatsapp_number},${m.membership_status}`
            ).join('\n')
            const blob = new Blob([`NUASS ID,Name,Department,Level,LGA,WhatsApp,Status\n${csv}`], { type: 'text/csv' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url; a.download = 'nuass-members.csv'; a.click()
          }}
          className="flex items-center gap-2 px-4 py-2 bg-nuass-green text-white rounded-lg text-sm font-medium hover:bg-nuass-green-mid transition-colors"
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>

      {/* Search & Filter */}
      <div className="nuass-card p-4 space-y-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search by name, NUASS ID, WhatsApp..."
              className="nuass-input pl-9 text-sm"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${showFilters ? 'bg-nuass-green/10 border-nuass-green text-nuass-green' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            <Filter size={16} /> Filters
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-gray-100">
            {[
              { key: 'status', label: 'Status', options: ['PENDING', 'VERIFIED', 'SUSPENDED'] },
              { key: 'lga', label: 'LGA', options: [...ANAMBRA_LGAS] },
              { key: 'level', label: 'Level', options: [...STUDENT_LEVELS] },
            ].map(({ key, label, options }) => (
              <select
                key={key}
                value={filters[key as keyof typeof filters]}
                onChange={(e) => { setFilters(f => ({ ...f, [key]: e.target.value })); setPage(1) }}
                className="nuass-input text-sm"
              >
                <option value="">All {label}</option>
                {options.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            ))}
            <button
              onClick={() => { setFilters({ status: '', lga: '', level: '', faculty: '' }); setSearch(''); setPage(1) }}
              className="text-sm text-red-500 hover:text-red-700 font-medium"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="nuass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="nuass-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>NUASS ID</th>
                <th>Department</th>
                <th>Level</th>
                <th>LGA</th>
                <th>WhatsApp</th>
                <th>Status</th>
                <th>Registered</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="text-center py-12"><div className="spinner mx-auto" style={{ borderColor: 'rgba(13,92,46,0.2)', borderTopColor: '#0d5c2e' }} /></td></tr>
              ) : members.length === 0 ? (
                <tr><td colSpan={9} className="text-center text-gray-400 py-12">No members found</td></tr>
              ) : (
                members.map((member) => (
                  <tr key={member.id}>
                    <td className="font-medium text-gray-900 min-w-[160px]">{member.full_name}</td>
                    <td className="font-mono text-xs text-gray-500">{member.nuass_id}</td>
                    <td className="text-xs text-gray-600 max-w-[120px] truncate">{member.department}</td>
                    <td className="text-xs text-gray-600">{member.level}</td>
                    <td className="text-xs text-gray-600">{member.lga}</td>
                    <td className="text-xs font-mono text-gray-500">{member.whatsapp_number}</td>
                    <td>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                        member.membership_status === 'VERIFIED' ? 'bg-green-100 text-green-700' :
                        member.membership_status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {member.membership_status}
                      </span>
                    </td>
                    <td className="text-xs text-gray-400">{formatDate(member.created_at)}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/members/${member.id}`} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title="View">
                          <Eye size={15} className="text-gray-500" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-5 py-4 border-t border-gray-50 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm font-medium text-gray-700">Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
