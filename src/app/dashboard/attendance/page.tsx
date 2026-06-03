'use client'

import { useState, useEffect } from 'react'
import { Calendar, CheckCircle, Clock, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatDateTime, formatDate } from '@/lib/utils'

export default function AttendancePage() {
  const [attendance, setAttendance] = useState<any[]>([])
  const [meetings, setMeetings] = useState<any[]>([])
  const [code, setCode] = useState('')
  const [marking, setMarking] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    const [attRes, meetRes] = await Promise.all([
      fetch('/api/attendance'),
      fetch('/api/meetings'),
    ])
    const attData = await attRes.json()
    const meetData = await meetRes.json()
    setAttendance(attData.attendees || [])
    setMeetings(meetData.meetings || [])
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const handleMark = async () => {
    if (!code.trim()) { toast.error('Enter attendance code'); return }
    setMarking(true)
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attendance_code: code.trim().toUpperCase() }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Failed'); return }
      toast.success(`✓ Attendance marked for ${data.meeting_name}!`)
      setCode('')
      fetchData()
    } catch { toast.error('Error') }
    finally { setMarking(false) }
  }

  const attendedIds = new Set(attendance.map((a: any) => a.meeting_id))
  const pct = meetings.length > 0 ? Math.round((attendance.length / meetings.length) * 100) : 0

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Calendar size={24} className="text-nuass-green" /> Attendance
        </h1>
        <p className="text-gray-500 text-sm mt-1">Track your meeting attendance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="nuass-card p-5 text-center">
          <p className="font-display text-3xl font-bold text-nuass-green">{meetings.length}</p>
          <p className="text-xs text-gray-500 mt-1">Total Meetings</p>
        </div>
        <div className="nuass-card p-5 text-center">
          <p className="font-display text-3xl font-bold text-green-600">{attendance.length}</p>
          <p className="text-xs text-gray-500 mt-1">Attended</p>
        </div>
        <div className="nuass-card p-5 text-center">
          <p className={`font-display text-3xl font-bold ${pct >= 70 ? 'text-green-600' : pct >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>{pct}%</p>
          <p className="text-xs text-gray-500 mt-1">Rate</p>
        </div>
      </div>

      {/* Mark Attendance */}
      <div className="nuass-card p-6">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Plus size={18} className="text-nuass-green" /> Mark Attendance
        </h3>
        <p className="text-sm text-gray-500 mb-4">Enter the attendance code shared by the admin during the meeting</p>
        <div className="flex gap-3">
          <input
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            className="nuass-input flex-1 font-mono text-lg tracking-widest uppercase"
            placeholder="ATT-XXXXXX"
            maxLength={10}
          />
          <button
            onClick={handleMark}
            disabled={marking}
            className="btn-primary rounded-xl px-6 disabled:opacity-60 flex items-center gap-2"
          >
            {marking ? <span className="spinner" /> : <CheckCircle size={16} />}
            Submit
          </button>
        </div>
      </div>

      {/* Meetings List */}
      <div className="nuass-card overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">All Meetings</h3>
        </div>
        {loading ? (
          <div className="p-8 text-center"><div className="spinner mx-auto" style={{ borderColor: 'rgba(13,92,46,0.2)', borderTopColor: '#0d5c2e' }} /></div>
        ) : meetings.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <Calendar size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No meetings scheduled yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {meetings.map((m: any) => {
              const attended = attendedIds.has(m.id)
              const attRecord = attendance.find((a: any) => a.meeting_id === m.id)
              return (
                <div key={m.id} className="p-4 flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${attended ? 'bg-green-100' : 'bg-gray-100'}`}>
                    {attended
                      ? <CheckCircle size={20} className="text-green-600" />
                      : <Clock size={20} className="text-gray-400" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">{m.meeting_name}</p>
                    <p className="text-xs text-gray-500">{formatDateTime(m.meeting_date)}</p>
                    {attended && attRecord && (
                      <p className="text-xs text-green-600 mt-0.5">✓ Marked at {formatDateTime(attRecord.attendance_time)}</p>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${attended ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {attended ? 'Present' : 'Absent'}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
