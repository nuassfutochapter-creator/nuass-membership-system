'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Phone, Lock, ArrowRight } from 'lucide-react'
import PublicNavbar from '@/components/layout/PublicNavbar'

const loginSchema = z.object({
  whatsapp_number: z.string().min(1, 'WhatsApp number is required'),
  password: z.string().min(1, 'Password is required'),
})

type LoginForm = z.infer<typeof loginSchema>

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const justRegistered = searchParams.get('registered') === 'true'
  const nuassId = searchParams.get('nuass_id')

  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await res.json()

      if (!res.ok) {
        toast.error(result.error || 'Login failed. Check your credentials.')
        return
      }

      toast.success(`Welcome back, ${result.full_name}!`)
      router.push('/dashboard')
      router.refresh()
    } catch {
      toast.error('Connection error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/">
            <div className="relative w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden border-4 border-nuass-green shadow-lg hover:shadow-nuass-green/20 transition-shadow cursor-pointer">
              <Image src="/nuass-logo.jpg" alt="NUASS" fill className="object-cover" sizes="80px" />
            </div>
          </Link>
          <h1 className="font-display text-3xl font-bold text-nuass-green">Welcome Back</h1>
          <p className="text-gray-500 text-sm mt-1">Login to your NUASS member portal</p>
        </div>

        {/* Success Banner */}
        {justRegistered && nuassId && (
          <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200">
            <p className="text-green-800 font-semibold text-sm">🎉 Registration successful!</p>
            <p className="text-green-700 text-sm mt-1">Your NUASS ID: <span className="font-bold font-mono">{nuassId}</span></p>
            <p className="text-green-600 text-xs mt-1">Login with your WhatsApp number and password</p>
          </div>
        )}

        {/* Login Card */}
        <div className="nuass-card p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Phone size={14} className="inline mr-1" />
                WhatsApp Number
              </label>
              <input
                {...register('whatsapp_number')}
                className="nuass-input"
                placeholder="e.g. 08012345678"
                type="tel"
              />
              {errors.whatsapp_number && <p className="text-red-500 text-xs mt-1">{errors.whatsapp_number.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Lock size={14} className="inline mr-1" />
                Password
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  className="nuass-input pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary rounded-xl py-3.5 font-bold text-base disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <><span className="spinner" /> Logging in...</>
              ) : (
                <>Login to Portal <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <p className="text-sm text-gray-500">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-nuass-green font-semibold hover:underline">
                Register here
              </Link>
            </p>
            <p className="text-xs text-gray-400">
              Admin?{' '}
              <Link href="/admin/login" className="text-gray-500 hover:text-nuass-green transition-colors">
                Admin Login
              </Link>
            </p>
          </div>
        </div>

        {/* Info note */}
        <div className="mt-4 text-center text-xs text-gray-400 flex items-center justify-center gap-1">
          <Lock size={10} />
          <span>Secure login. Your data is protected.</span>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar />
      <Suspense fallback={<div className="flex-1 flex items-center justify-center"><span className="spinner" /></div>}>
        <LoginContent />
      </Suspense>
    </div>
  )
}
