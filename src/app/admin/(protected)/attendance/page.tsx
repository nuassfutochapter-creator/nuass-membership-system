'use client'

import { useState, useEffect } from 'react'
import { Calendar, Plus, X, Copy, Users, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatDate, formatDateTime } from '@/lib/utils'

export default function AdminAttendancePage() {
  const [meetings, setMeetings] = useState<any[]>([])
  const [selectedMeeting, setSelectedMeeting] = useState<any | null>(null)
  const [attendees, setAttendees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ meeting_name: '', meeting_date: '', description: '' })
  const [saving, setSaving] = useState(false)

  const fetchMeetings = async () => {
    const res = await fetch('/api/meetings')
    const data = await res.json()
    setMeetings(data.meetings || [])
    setLoading(false)
  }

  const fetchAttendees = async (meetingId: string) => {
    const res = await fetch(`/api/attendance?meeting_id=${meetingId}`)
    const data = await res.json()
    setAttendees(data.attendees || [])
  }

  useEffect(() => { fetchMeetings() }, [])

  const handleSelectMeeting = (meeting: any) => {
    setSelectedMeeting(meeting)
    fetchAttendees(meeting.id)
  }

  const handleCreateMeeting = async () => {
    if (!form.meeting_name.trim() || !form.meeting_date) {
      toast.error('Meeting name and date are required'); return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Failed'); return }
      toast.success('Meeting created!')
      setShowForm(false)
      setForm({ meeting_name: '', meeting_date: '', description: '' })
      fetchMeetings()
    } catch { toast.error('Error') }
    finally { setSaving(false) }
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success('Attendance code copied!')
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar size={24} className="text-nuass-green" /> Attendance
          </h1>
          <p className="text-gray-500 text-sm mt-1">Create meetings and track member attendance</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary rounded-xl flex items-center gap-2 text-sm">
          <Plus size={16} /> Create Meeting
        </button>
      </div>

      {/* Create Meeting Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-gray-900">New Meeting</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-700"><X size={20} /></button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Name *</label>
              <input value={form.meeting_name} onChange={e => setForm(f => ({ ...f, meeting_name: e.target.value }))} className="nuass-input" placeholder="e.g. Monthly General Meeting" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input type="datetime-local" value={form.meeting_date} onChange={e => setForm(f => ({ ...f, meeting_date: e.target.value }))} className="nuass-input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="nuass-input min-h-[80px]" placeholder="Optional meeting description..." />
            </div>
            <p className="text-xs text-gray-500 bg-blue-50 rounded-lg p-3 border border-blue-100">
              ℹ️ An attendance code will be automatically generated. Share it with members to mark attendance.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium text-sm">Cancel</button>
              <button onClick={handleCreateMeeting} disabled={saving} className="flex-1 btn-primary rounded-xl py-2.5 text-sm disabled:opacity-60">
                {saving ? <span className="flex items-center justify-center gap-2"><span className="spinner" /> Creating...</span> : 'Create Meeting'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Meetings List */}
        <div className="nuass-card overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">All Meetings</h3>
          </div>
          {loading ? (
            <div className="p-8 text-center"><div className="spinner mx-auto" style={{ borderColor: 'rgba(13,92,46,0.2)', borderTopColor: '#0d5c2e' }} /></div>
          ) : meetings.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <Calendar size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No meetings yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 max-h-[500px] overflow-y-auto">
              {meetings.map((meeting: any) => (
                <div
                  key={meeting.id}
                  onClick={() => handleSelectMeeting(meeting)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${selectedMeeting?.id === meeting.id ? 'bg-green-50 border-r-2 border-nuass-green' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{meeting.meeting_name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{formatDateTime(meeting.meeting_date)}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 bg-gray-100 rounded-lg px-2 py-1">
                        <code className="text-xs font-mono font-bold text-nuass-green">{meeting.attendance_code}</code>
                        <button
                          onClick={e => { e.stopPropagation(); copyCode(meeting.attendance_code) }}
                          className="ml-1 hover:text-nuass-green"
                        >
                          <Copy size={12} className="text-gray-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                  {meeting.description && (
                    <p className="text-xs text-gray-400 mt-1 line-clamp-1">{meeting.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Attendees Detail */}
        <div className="nuass-card overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">
              {selectedMeeting ? selectedMeeting.meeting_name : 'Select a meeting'}
            </h3>
            {selectedMeeting && (
              <span className="text-xs font-medium text-nuass-green bg-green-50 px-2 py-1 rounded-full">
                {attendees.length} attendees
              </span>
            )}
          </div>
          {!selectedMeeting ? (
            <div className="p-8 text-center text-gray-400">
              <Users size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Click a meeting to see attendees</p>
            </div>
          ) : attendees.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <Check size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No attendance recorded yet</p>
              <p className="text-xs mt-1">Share code: <span className="font-mono font-bold text-nuass-green">{selectedMeeting.attendance_code}</span></p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 max-h-[500px] overflow-y-auto">
              {attendees.map((att: any, idx: number) => (
                <div key={att.id} className="p-3 flex items-center gap-3">
                  <span className="text-xs text-gray-400 w-6 text-right flex-shrink-0">{idx + 1}</span>
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Check size={14} className="text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{att.member?.full_name || 'Unknown'}</p>
                    <p className="text-xs text-gray-400">{att.member?.department} · {att.member?.level}</p>
                  </div>
                  <p className="text-xs text-gray-400 flex-shrink-0">{formatDateTime(att.attendance_time)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
