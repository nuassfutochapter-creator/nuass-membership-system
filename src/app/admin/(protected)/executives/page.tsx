'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Crown, Plus, Edit2, Trash2, X, User } from 'lucide-react'
import toast from 'react-hot-toast'
import { EXECUTIVE_POSITIONS } from '@/types'

export default function AdminExecutivesPage() {
  const [executives, setExecutives] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<any | null>(null)
  const [form, setForm] = useState({ full_name: '', position: '', department: '', level: '', bio: '', display_order: 0 })
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState('')
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const fetch_ = async () => {
    const res = await fetch('/api/executives')
    const data = await res.json()
    setExecutives(data.executives || [])
    setLoading(false)
  }

  useEffect(() => { fetch_() }, [])

  const openCreate = () => {
    setEditItem(null)
    setForm({ full_name: '', position: '', department: '', level: '', bio: '', display_order: 0 })
    setPhotoFile(null)
    setPhotoPreview('')
    setShowForm(true)
  }

  const openEdit = (exec: any) => {
    setEditItem(exec)
    setForm({ full_name: exec.full_name, position: exec.position, department: exec.department, level: exec.level || '', bio: exec.bio || '', display_order: exec.display_order || 0 })
    setPhotoFile(null)
    setPhotoPreview(exec.photo_url || '')
    setShowForm(true)
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 3 * 1024 * 1024) { toast.error('Image too large (max 3MB)'); return }
    setPhotoFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setPhotoPreview(reader.result as string)
    reader.readAsDataURL(file)
    toast.success('Photo ready: ' + file.name)
  }

  const handleSave = async () => {
    if (!form.full_name.trim() || !form.position || !form.department.trim()) {
      toast.error('Name, position, and department are required')
      return
    }
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('full_name', form.full_name.trim())
      fd.append('position', form.position)
      fd.append('department', form.department.trim())
      fd.append('level', form.level)
      fd.append('bio', form.bio)
      fd.append('display_order', String(form.display_order))
      if (editItem) fd.append('id', editItem.id)
      if (photoFile) {
        fd.append('photo', photoFile)
        console.log('Photo attached:', photoFile.name, photoFile.size)
      }
      const res = await fetch('/api/executives', { method: editItem ? 'PUT' : 'POST', body: fd })
      const data = await res.json()
      console.log('Response:', data)
      if (!res.ok) { toast.error(data.error || 'Failed'); return }
      toast.success(editItem ? 'Executive updated!' : 'Executive added!')
      setShowForm(false)
      setPhotoFile(null)
      setPhotoPreview('')
      fetch_()
    } catch (err) {
      console.error(err)
      toast.error('Error saving')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this executive?')) return
    const res = await fetch(`/api/executives?id=${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Removed'); fetch_() }
    else toast.error('Delete failed')
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Crown size={24} className="text-nuass-green" /> Executive Council
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage NUASS executive members displayed on the public website</p>
        </div>
        <button onClick={openCreate} className="btn-primary rounded-xl flex items-center gap-2 text-sm">
          <Plus size={16} /> Add Executive
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4 my-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-gray-900">{editItem ? 'Edit Executive' : 'Add Executive'}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-700"><X size={20} /></button>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300 flex-shrink-0">
                {photoPreview
                  ? <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  : <User size={28} className="text-gray-400" />}
              </div>
              <div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="bg-nuass-green text-white text-sm px-4 py-2 rounded-lg hover:bg-nuass-green-mid transition-colors"
                >
                  {photoFile ? '✓ ' + photoFile.name.substring(0, 20) : 'Choose Photo'}
                </button>
                {photoFile && (
                  <p className="text-xs text-green-600 mt-1">
                    Size: {Math.round(photoFile.size / 1024)}KB
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1">Max 3MB, JPG/PNG</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input value={form.full_name} onChange={e => setForm(f => ({...f, full_name: e.target.value}))} className="nuass-input" placeholder="Executive full name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Position *</label>
              <select value={form.position} onChange={e => setForm(f => ({...f, position: e.target.value}))} className="nuass-input">
                <option value="">Select position</option>
                {EXECUTIVE_POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                <input value={form.department} onChange={e => setForm(f => ({...f, department: e.target.value}))} className="nuass-input" placeholder="Department" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                <input value={form.level} onChange={e => setForm(f => ({...f, level: e.target.value}))} className="nuass-input" placeholder="400 Level" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea value={form.bio} onChange={e => setForm(f => ({...f, bio: e.target.value}))} className="nuass-input min-h-[80px] resize-y" placeholder="Short bio..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
              <input type="number" value={form.display_order} onChange={e => setForm(f => ({...f, display_order: Number(e.target.value)}))} className="nuass-input" />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium text-sm">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 btn-primary rounded-xl py-2.5 text-sm disabled:opacity-60">
                {saving ? <span className="flex items-center justify-center gap-2"><span className="spinner" /> Saving...</span> : (editItem ? 'Update' : 'Add Executive')}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12"><div className="spinner mx-auto" style={{borderColor: 'rgba(13,92,46,0.2)', borderTopColor: '#0d5c2e'}} /></div>
      ) : executives.length === 0 ? (
        <div className="nuass-card p-12 text-center text-gray-400"><Crown size={48} className="mx-auto mb-3 opacity-20" /><p>No executives added yet.</p></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {executives.map((exec: any) => (
            <div key={exec.id} className="nuass-card p-4 flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center">
                {exec.photo_url
                  ? <Image src={exec.photo_url} alt={exec.full_name} width={56} height={56} className="object-cover w-full h-full" />
                  : <User size={20} className="text-gray-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">{exec.full_name}</p>
                <p className="text-nuass-green text-xs font-medium">{exec.position}</p>
                <p className="text-gray-400 text-xs truncate">{exec.department}</p>
              </div>
              <div className="flex flex-col gap-1">
                <button onClick={() => openEdit(exec)} className="p-1.5 hover:bg-gray-100 rounded-lg"><Edit2 size={13} className="text-gray-500" /></button>
                <button onClick={() => handleDelete(exec.id)} className="p-1.5 hover:bg-red-50 rounded-lg"><Trash2 size={13} className="text-red-500" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
