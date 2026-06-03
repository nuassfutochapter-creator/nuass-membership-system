'use client'

import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Users, MapPin, BookOpen, Layers } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts'

const COLORS = ['#0d5c2e', '#d4a017', '#166534', '#f0c040', '#14532d', '#ffd700', '#15803d', '#b8860b']

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/analytics').then(r => r.json()).then(d => {
      setAnalytics(d)
      setLoading(false)
    })
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="spinner" style={{ borderColor: 'rgba(13,92,46,0.2)', borderTopColor: '#0d5c2e', width: 32, height: 32, borderWidth: 3 }} />
    </div>
  )

  const statusData = [
    { name: 'Verified', value: analytics?.verified_members || 0, color: '#0d5c2e' },
    { name: 'Pending', value: analytics?.pending_members || 0, color: '#d4a017' },
    { name: 'Suspended', value: analytics?.suspended_members || 0, color: '#dc2626' },
  ]

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart3 size={24} className="text-nuass-green" /> Analytics
        </h1>
        <p className="text-gray-500 text-sm mt-1">Membership statistics and insights</p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Members', value: analytics?.total_members || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Verified', value: analytics?.verified_members || 0, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Pending', value: analytics?.pending_members || 0, icon: Layers, color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { label: 'Verification Rate', value: `${analytics?.total_members ? Math.round((analytics.verified_members / analytics.total_members) * 100) : 0}%`, icon: BarChart3, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((s) => (
          <div key={s.label} className="nuass-card p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-500 font-medium">{s.label}</p>
              <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center`}>
                <s.icon size={16} className={s.color} />
              </div>
            </div>
            <p className={`font-display text-3xl font-bold ${s.color}`}>{typeof s.value === 'number' ? s.value.toLocaleString() : s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Membership Status Pie */}
        <div className="nuass-card p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Membership Status</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(value: any) => [value, 'Members']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Registrations by Month */}
        <div className="nuass-card p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-nuass-green" /> Registrations Per Month
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={analytics?.registrations_by_month || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#0d5c2e" strokeWidth={2.5} dot={{ fill: '#0d5c2e', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Members by Faculty */}
        <div className="nuass-card p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen size={18} className="text-nuass-green" /> Members by Faculty
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={(analytics?.members_by_faculty || []).slice(0, 8)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis dataKey="faculty" type="category" tick={{ fontSize: 9 }} width={120} />
              <Tooltip />
              <Bar dataKey="count" fill="#0d5c2e" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Members by LGA */}
        <div className="nuass-card p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin size={18} className="text-nuass-green" /> Members by LGA
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={(analytics?.members_by_lga || []).slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="lga" tick={{ fontSize: 9 }} angle={-45} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {(analytics?.members_by_lga || []).slice(0, 10).map((_: any, i: number) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Members by Level */}
      <div className="nuass-card p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Members by Level</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={analytics?.members_by_level || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="level" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="count" fill="#d4a017" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
