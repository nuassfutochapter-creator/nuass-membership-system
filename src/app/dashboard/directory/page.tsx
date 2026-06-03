'use client'

import { useState, useEffect, useCallback } from 'react'
import { Users, Search, Filter, User } from 'lucide-react'
import { ANAMBRA_LGAS, STUDENT_LEVELS } from '@/types'
import { cn } from '@/lib/utils'

export default function DirectoryPage() {
  const [members, setMembers] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({ lga: '', level: '' })
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  const fetchMembers = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({
      page: String(page), limit: '24',
      ...(search && { search }),
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

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Users size={24} className="text-nuass-green" /> Member Directory
        </h1>
        <p className="text-gray-500 text-sm mt-1">{total.toLocaleString()} verified members</p>
      </div>

      {/* Search & Filter */}
      <div className="nuass-card p-4 space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search by name, department..."
            className="nuass-input pl-9 text-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <select value={filters.lga} onChange={e => { setFilters(f => ({ ...f, lga: e.target.value })); setPage(1) }} className="nuass-input text-sm">
            <option value="">All LGAs</option>
            {ANAMBRA_LGAS.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <select value={filters.level} onChange={e => { setFilters(f => ({ ...f, level: e.target.value })); setPage(1) }} className="nuass-input text-sm">
            <option value="">All Levels</option>
            {STUDENT_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      </div>

      {/* Members Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="nuass-card p-4 animate-pulse">
              <div className="w-12 h-12 rounded-full bg-gray-200 mx-auto mb-3" />
              <div className="h-3 bg-gray-200 rounded mx-auto w-3/4 mb-2" />
              <div className="h-2 bg-gray-100 rounded mx-auto w-1/2" />
            </div>
          ))}
        </div>
      ) : members.length === 0 ? (
        <div className="nuass-card p-12 text-center text-gray-400">
          <Users size={48} className="mx-auto mb-3 opacity-20" />
          <p>No members found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {members.map((m: any) => (
            <div key={m.id} className="nuass-card p-4 text-center hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-full overflow-hidden bg-nuass-green/10 flex items-center justify-center mx-auto mb-3">
                {m.passport_url
                  ? <img src={m.passport_url} alt={m.full_name} className="w-full h-full object-cover" />
                  : <User size={20} className="text-nuass-green/40" />
                }
              </div>
              <p className="font-semibold text-gray-900 text-sm truncate">{m.full_name}</p>
              <p className="text-nuass-green text-xs font-medium truncate">{m.department}</p>
              <p className="text-gray-400 text-xs">{m.level}</p>
              <p className="text-gray-400 text-xs mt-0.5">{m.lga}</p>
            </div>
          ))}
        </div>
      )}

      {total > 24 && (
        <div className="flex justify-center gap-3">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 rounded-lg border border-gray-200 text-sm disabled:opacity-40 hover:bg-gray-50">Previous</button>
          <span className="px-4 py-2 text-sm text-gray-600">Page {page}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={members.length < 24} className="px-4 py-2 rounded-lg border border-gray-200 text-sm disabled:opacity-40 hover:bg-gray-50">Next</button>
        </div>
      )}
    </div>
  )
}
