'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X, RotateCcw } from 'lucide-react'
import toast from 'react-hot-toast'

interface Props {
  memberId: string
  currentStatus: string
  adminName: string
  adminRole: string
}

export default function VerifyMemberButton({ memberId, currentStatus, adminName, adminRole }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const handleAction = async (action: 'VERIFIED' | 'SUSPENDED' | 'PENDING') => {
    setLoading(action)
    try {
      const res = await fetch('/api/verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ member_id: memberId, action }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Action failed'); return }
      toast.success(
        action === 'VERIFIED' ? '✓ Member verified!' :
        action === 'SUSPENDED' ? 'Member suspended' :
        'Status reset to pending'
      )
      router.refresh()
    } catch { toast.error('Error') }
    finally { setLoading(null) }
  }

  return (
    <div className="space-y-2">
      {currentStatus !== 'VERIFIED' && (
        <button
          onClick={() => handleAction('VERIFIED')}
          disabled={!!loading}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-nuass-green text-white font-semibold text-sm hover:bg-nuass-green-mid transition-colors disabled:opacity-60"
        >
          {loading === 'VERIFIED' ? <span className="spinner w-4 h-4" /> : <Check size={16} />}
          Verify Member
        </button>
      )}
      {currentStatus !== 'SUSPENDED' && (
        <button
          onClick={() => handleAction('SUSPENDED')}
          disabled={!!loading}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-200 text-red-600 font-semibold text-sm hover:bg-red-50 transition-colors disabled:opacity-60"
        >
          {loading === 'SUSPENDED' ? <span className="spinner w-4 h-4" style={{ borderColor: 'rgba(220,38,38,0.2)', borderTopColor: '#dc2626' }} /> : <X size={16} />}
          Suspend
        </button>
      )}
      {currentStatus !== 'PENDING' && (
        <button
          onClick={() => handleAction('PENDING')}
          disabled={!!loading}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-yellow-200 text-yellow-700 font-semibold text-sm hover:bg-yellow-50 transition-colors disabled:opacity-60"
        >
          {loading === 'PENDING' ? <span className="spinner w-4 h-4" style={{ borderColor: 'rgba(234,179,8,0.2)', borderTopColor: '#ca8a04' }} /> : <RotateCcw size={16} />}
          Reset to Pending
        </button>
      )}
    </div>
  )
}
