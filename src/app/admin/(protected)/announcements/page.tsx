'use client'

import { useState, useEffect } from 'react'
import { Megaphone, Plus, Edit2, Trash2, Pin, X, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatDateTime } from '@/lib/utils'

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<any | null>(null)
  const [form, setForm] = useState({ title: '', content: '', is_pinned: false })
  const [saving, setSaving] = useState(false)

  const fetch_ = async () => {
    const res = await fetch('/api/announcements?admin=true')
    const data = await res.json()
    setAnnouncements(data.announcements || [])
    setLoading(false)
  }

  useEffect(() => { fetch_() }, [])

  const openCreate = () => {
    setEditItem(null)
    setForm({ title: '', content: '', is_pinned: false })
    setShowForm(true)
  }

  const openEdit = (ann: any) => {
    setEditItem(ann)
    setForm({ title: ann.title, content: ann.content, is_pinned: ann.is_pinned })
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      toast.error('Title and content are required')
      return
    }
    setSaving(true)
    try {
      const method = editItem ? 'PUT' : 'POST'
      const body = editItem ? { ...form, id: editItem.id } : form
      const res = await fetch('/api/announcements', {
        method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Failed'); return }
      toast.success(editItem ? 'Announcement updated!' : 'Announcement created!')
      setShowForm(false)
      fetch_()
    } catch { toast.error('Error saving') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this announcement?')) return
    const res = await fetch(`/api/announcements?id=${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Deleted'); fetch_() }
    else toast.error('Delete failed')
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Megaphone size={24} className="text-nuass-green" /> Announcements
          </h1>
          <p className="text-gray-500 text-sm mt-1">Create and manage announcements for all members</p>
        </div>
        <button onClick={openCreate} className="btn-primary rounded-xl flex items-center gap-2 text-sm">
          <Plus size={16} /> New Announcement
        </button>
      </div>

      {/* Create/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-gray-900">
                {editItem ? 'Edit Announcement' : 'New Announcement'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-700 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="nuass-input"
                placeholder="Announcement title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
              <textarea
                value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                className="nuass-input min-h-[120px] resize-y"
                placeholder="Write the announcement content..."
              />
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setForm(f => ({ ...f, is_pinned: !f.is_pinned }))}
                className={`w-10 h-6 rounded-full transition-colors ${form.is_pinned ? 'bg-nuass-green' : 'bg-gray-200'} relative`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.is_pinned ? 'translate-x-5' : 'translate-x-1'}`} />
              </div>
              <span className="text-sm font-medium text-gray-700">Pin this announcement</span>
            </label>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving} className="flex-1 btn-primary rounded-xl py-2.5 text-sm disabled:opacity-60">
                {saving ? <span className="flex items-center justify-center gap-2"><span className="spinner" /> Saving...</span> : (editItem ? 'Update' : 'Publish')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="text-center py-12"><div className="spinner mx-auto" style={{ borderColor: 'rgba(13,92,46,0.2)', borderTopColor: '#0d5c2e' }} /></div>
      ) : announcements.length === 0 ? (
        <div className="nuass-card p-12 text-center text-gray-400">
          <Megaphone size={48} className="mx-auto mb-3 opacity-20" />
          <p>No announcements yet. Create one!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((ann: any) => (
            <div key={ann.id} className={`nuass-card p-5 ${ann.is_pinned ? 'border-nuass-gold/40 bg-amber-50/30' : ''}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {ann.is_pinned && <Pin size={14} className="text-nuass-gold flex-shrink-0" />}
                    <h3 className="font-semibold text-gray-900 truncate">{ann.title}</h3>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">{ann.content}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    Posted by <span className="font-medium">{ann.created_by}</span> · {formatDateTime(ann.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => openEdit(ann)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Edit">
                    <Edit2 size={15} className="text-gray-500" />
                  </button>
                  <button onClick={() => handleDelete(ann.id)} className="p-2 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                    <Trash2 size={15} className="text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
