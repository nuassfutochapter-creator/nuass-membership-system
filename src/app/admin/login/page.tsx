'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Shield, ArrowRight } from 'lucide-react'

const schema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(1, 'Password required'),
})
type Form = z.infer<typeof schema>

export default function AdminLoginPage() {
  const router = useRouter()
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: Form) => {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await res.json()
      if (!res.ok) { toast.error(result.error || 'Login failed'); return }
      toast.success(`Welcome, ${result.full_name}!`)
      router.push('/admin')
      router.refresh()
    } catch { toast.error('Connection error') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-nuass-green-deep flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="relative w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden border-4 border-nuass-gold/60 shadow-2xl">
            <Image src="/nuass-logo.jpg" alt="NUASS" fill className="object-cover" sizes="80px" />
          </div>
          <h1 className="font-display text-3xl font-bold text-white">Admin Portal</h1>
          <p className="text-white/60 text-sm mt-1 flex items-center justify-center gap-1">
            <Shield size={14} /> Secure Admin Access
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">Admin Email</label>
              <input {...register('email')} type="email" className="nuass-input bg-white/10 border-white/20 text-white placeholder-white/40" placeholder="admin@nuass.org" />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">Password</label>
              <div className="relative">
                <input {...register('password')} type={showPw ? 'text' : 'password'} className="nuass-input bg-white/10 border-white/20 text-white placeholder-white/40 pr-10" placeholder="Admin password" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>
            <button type="submit" disabled={loading} className="w-full btn-gold rounded-xl py-3.5 font-bold text-base disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? <><span className="spinner" style={{ borderColor: 'rgba(0,0,0,0.2)', borderTopColor: '#062a14' }} /> Logging in...</> : <>Admin Login <ArrowRight size={18} /></>}
            </button>
          </form>
          <div className="mt-6 text-center">
            <Link href="/login" className="text-white/40 hover:text-white/70 text-xs transition-colors">← Back to Member Login</Link>
          </div>
        </div>

        <p className="text-center text-white/30 text-xs mt-6">
          Unauthorized access is prohibited and monitored.
        </p>
      </div>
    </div>
  )
}
