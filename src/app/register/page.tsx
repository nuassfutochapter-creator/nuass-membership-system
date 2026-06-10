'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { User, BookOpen, MapPin, Home, MessageSquare, Upload, Eye, EyeOff, ChevronRight, ChevronLeft } from 'lucide-react'
import PublicNavbar from '@/components/layout/PublicNavbar'
import { ANAMBRA_LGAS, STUDENT_LEVELS } from '@/types'
import { cn } from '@/lib/utils'

const registrationSchema = z.object({
  full_name: z.string().min(3, 'Full name must be at least 3 characters'),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['Male', 'Female']),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  whatsapp_number: z.string().regex(/^(0|\+234)[789][01]\d{8}$/, 'Enter a valid Nigerian phone number'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm_password: z.string(),
  faculty: z.string().min(2, 'Faculty is required'),
  department: z.string().min(2, 'Department is required'),
  level: z.string().min(1, 'Level is required'),
  lga: z.string().min(1, 'LGA is required'),
  town: z.string().min(2, 'Town is required'),
  village: z.string().min(2, 'Village is required'),
  residence: z.string().min(2, 'Residence is required'),
  expectations: z.string().min(20, 'Please write at least 20 characters'),
  contributions: z.string().min(20, 'Please write at least 20 characters'),
  meeting_commitment: z.enum(['Yes', 'No', 'Sometimes']),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ['confirm_password'],
})

type FormData = z.infer<typeof registrationSchema>

const FACULTIES = [
  'School of Electrical Systems & Engineering Technology (SESET)',
  'School of Basic Medical Sciences (SBMS)',
  'College of Medicine (COM)',
  'Ce-Sustainable Procurement, Environmental & Social Standards (CESS)',
  'School of Engineering & Engineering Technology (SEET)',
  'School of Physical Sciences (SPS)',
  'School of Biological Sciences (SBS)',
  'School of Agriculture & Agricultural Technology (SAAT)',
  'School of Information & Communication Technology (SICT)',
  'School of Environmental Sciences (SES)',
  'School of Logistics & Innovation Technology (SLIT)',
  'School of Health Technology (SHT)',
]

const steps = [
  { id: 1, label: 'Personal Info', icon: User },
  { id: 2, label: 'Academic', icon: BookOpen },
  { id: 3, label: 'Origin', icon: MapPin },
  { id: 4, label: 'Residence & Union', icon: Home },
]

export default function RegisterPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [passportFile, setPassportFile] = useState<File | null>(null)
  const [passportPreview, setPassportPreview] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, formState: { errors }, trigger, getValues } = useForm<FormData>({
    resolver: zodResolver(registrationSchema),
    mode: 'onBlur',
  })

  const handlePassportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB')
      return
    }
    setPassportFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setPassportPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const stepFields: Record<number, (keyof FormData)[]> = {
    1: ['full_name', 'date_of_birth', 'gender', 'email', 'whatsapp_number', 'password', 'confirm_password'],
    2: ['faculty', 'department', 'level'],
    3: ['lga', 'town', 'village'],
    4: ['residence', 'expectations', 'contributions', 'meeting_commitment'],
  }

  const handleNext = async () => {
    const valid = await trigger(stepFields[currentStep])
    if (valid) setCurrentStep((s) => s + 1)
  }

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      Object.entries(data).forEach(([k, v]) => {
        if (v) formData.append(k, v as string)
      })
      if (passportFile) formData.append('passport', passportFile)

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        body: formData,
      })

      const result = await res.json()

      if (!res.ok) {
        toast.error(result.error || 'Registration failed')
        return
      }

      toast.success('Registration successful! Welcome to NUASS!')
      router.push(`/login?registered=true&nuass_id=${result.nuass_id}`)
    } catch (err) {
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputCls = (error?: any) => cn(
    'nuass-input',
    error && 'border-red-400 focus:border-red-500'
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNavbar />
      
      <div className="pt-16 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="relative w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden border-4 border-nuass-green shadow-lg">
              <Image src="/nuass-logo.jpg" alt="NUASS" fill className="object-cover" sizes="80px" />
            </div>
            <h1 className="font-display text-3xl font-bold text-nuass-green">Join NUASS</h1>
            <p className="text-gray-500 text-sm mt-1">Complete your registration to become a member</p>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-center mb-8">
            {steps.map((step, i) => (
              <div key={step.id} className="flex items-center">
                <div className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-full border-2 text-sm font-semibold transition-all',
                  currentStep === step.id ? 'bg-nuass-green border-nuass-green text-white' :
                  currentStep > step.id ? 'bg-nuass-gold border-nuass-gold text-white' :
                  'bg-white border-gray-300 text-gray-400'
                )}>
                  {currentStep > step.id ? '✓' : step.id}
                </div>
                <div className="hidden sm:block ml-2 mr-4">
                  <p className={cn('text-xs font-medium', currentStep >= step.id ? 'text-nuass-green' : 'text-gray-400')}>
                    {step.label}
                  </p>
                </div>
                {i < steps.length - 1 && (
                  <div className={cn('w-8 h-px mx-1 sm:mx-0', currentStep > step.id ? 'bg-nuass-gold' : 'bg-gray-200')} />
                )}
              </div>
            ))}
          </div>

          {/* Form Card */}
          <div className="nuass-card p-6 sm:p-8">
            <form onSubmit={handleSubmit(onSubmit)}>
              
              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <div className="space-y-5">
                  <h2 className="font-display text-xl font-bold text-gray-900 flex items-center gap-2">
                    <User size={20} className="text-nuass-green" />
                    Personal Information
                  </h2>

                  {/* Passport Photo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Passport Photograph</label>
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 overflow-hidden flex items-center justify-center bg-gray-50">
                        {passportPreview
                          ? <img src={passportPreview} alt="Preview" className="w-full h-full object-cover" />
                          : <Upload size={20} className="text-gray-400" />
                        }
                      </div>
                      <div>
                        <label className="cursor-pointer btn-primary text-sm px-4 py-2 rounded-lg">
                          <span>Choose Photo</span>
                          <input type="file" accept="image/*" onChange={handlePassportChange} className="hidden" />
                        </label>
                        <p className="text-xs text-gray-500 mt-1">Max 2MB, JPG/PNG</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input {...register('full_name')} className={inputCls(errors.full_name)} placeholder="Enter your full name" />
                    {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
                      <input {...register('date_of_birth')} type="date" className={inputCls(errors.date_of_birth)} />
                      {errors.date_of_birth && <p className="text-red-500 text-xs mt-1">{errors.date_of_birth.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                      <select {...register('gender')} className={inputCls(errors.gender)}>
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                      {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender.message}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number *</label>
                    <input {...register('whatsapp_number')} className={inputCls(errors.whatsapp_number)} placeholder="e.g. 08012345678" />
                    {errors.whatsapp_number && <p className="text-red-500 text-xs mt-1">{errors.whatsapp_number.message}</p>}
                    <p className="text-xs text-gray-500 mt-1">This will be used as your login username</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address (Optional)</label>
                    <input {...register('email')} type="email" className={inputCls(errors.email)} placeholder="your@email.com" />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                    <div className="relative">
                      <input {...register('password')} type={showPassword ? 'text' : 'password'} className={cn(inputCls(errors.password), 'pr-10')} placeholder="Min. 8 characters" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
                    <div className="relative">
                      <input {...register('confirm_password')} type={showConfirmPassword ? 'text' : 'password'} className={cn(inputCls(errors.confirm_password), 'pr-10')} placeholder="Repeat password" />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {errors.confirm_password && <p className="text-red-500 text-xs mt-1">{errors.confirm_password.message}</p>}
                  </div>
                </div>
              )}

              {/* Step 2: Academic Information */}
              {currentStep === 2 && (
                <div className="space-y-5">
                  <h2 className="font-display text-xl font-bold text-gray-900 flex items-center gap-2">
                    <BookOpen size={20} className="text-nuass-green" />
                    Academic Information
                  </h2>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Faculty *</label>
                    <select {...register('faculty')} className={inputCls(errors.faculty)}>
                      <option value="">Select your faculty</option>
                      {FACULTIES.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                    {errors.faculty && <p className="text-red-500 text-xs mt-1">{errors.faculty.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                    <input {...register('department')} className={inputCls(errors.department)} placeholder="e.g. Computer Science" />
                    {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Level *</label>
                    <select {...register('level')} className={inputCls(errors.level)}>
                      <option value="">Select your level</option>
                      {STUDENT_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                    {errors.level && <p className="text-red-500 text-xs mt-1">{errors.level.message}</p>}
                  </div>
                </div>
              )}

              {/* Step 3: Anambra Origin */}
              {currentStep === 3 && (
                <div className="space-y-5">
                  <h2 className="font-display text-xl font-bold text-gray-900 flex items-center gap-2">
                    <MapPin size={20} className="text-nuass-green" />
                    Anambra Origin
                  </h2>
                  <p className="text-sm text-gray-500">Confirm your Anambra State identity and connect with students from your area.</p>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Local Government Area (LGA) *</label>
                    <select {...register('lga')} className={inputCls(errors.lga)}>
                      <option value="">Select your LGA</option>
                      {ANAMBRA_LGAS.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                    {errors.lga && <p className="text-red-500 text-xs mt-1">{errors.lga.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Town *</label>
                    <input {...register('town')} className={inputCls(errors.town)} placeholder="e.g. Awka" />
                    {errors.town && <p className="text-red-500 text-xs mt-1">{errors.town.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Village *</label>
                    <input {...register('village')} className={inputCls(errors.village)} placeholder="Your village name" />
                    {errors.village && <p className="text-red-500 text-xs mt-1">{errors.village.message}</p>}
                  </div>
                </div>
              )}

              {/* Step 4: Residence & Union */}
              {currentStep === 4 && (
                <div className="space-y-5">
                  <h2 className="font-display text-xl font-bold text-gray-900 flex items-center gap-2">
                    <MessageSquare size={20} className="text-nuass-green" />
                    Residence & Union Questions
                  </h2>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">School Residence *</label>
                    <input {...register('residence')} className={inputCls(errors.residence)} placeholder="e.g. Hostel Block A, or Off-campus - Ifite" />
                    {errors.residence && <p className="text-red-500 text-xs mt-1">{errors.residence.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">What do you expect from NUASS? *</label>
                    <textarea {...register('expectations')} className={cn(inputCls(errors.expectations), 'min-h-[100px] resize-y')} placeholder="Share your expectations from the union..." />
                    {errors.expectations && <p className="text-red-500 text-xs mt-1">{errors.expectations.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">What can you contribute to NUASS? *</label>
                    <textarea {...register('contributions')} className={cn(inputCls(errors.contributions), 'min-h-[100px] resize-y')} placeholder="Skills, ideas, leadership experience..." />
                    {errors.contributions && <p className="text-red-500 text-xs mt-1">{errors.contributions.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Are you willing to attend meetings regularly? *</label>
                    <div className="flex gap-4">
                      {['Yes', 'No', 'Sometimes'].map((opt) => (
                        <label key={opt} className="flex items-center gap-2 cursor-pointer">
                          <input {...register('meeting_commitment')} type="radio" value={opt} className="accent-nuass-green w-4 h-4" />
                          <span className="text-sm text-gray-700">{opt}</span>
                        </label>
                      ))}
                    </div>
                    {errors.meeting_commitment && <p className="text-red-500 text-xs mt-1">{errors.meeting_commitment.message}</p>}
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
                {currentStep > 1 ? (
                  <button type="button" onClick={() => setCurrentStep(s => s - 1)} className="flex items-center gap-2 text-gray-600 hover:text-nuass-green font-medium transition-colors">
                    <ChevronLeft size={18} />
                    Back
                  </button>
                ) : (
                  <Link href="/login" className="text-gray-500 hover:text-gray-700 text-sm">Already registered? Login</Link>
                )}

                {currentStep < 4 ? (
                  <button type="button" onClick={handleNext} className="btn-primary rounded-lg flex items-center gap-2">
                    Continue <ChevronRight size={18} />
                  </button>
                ) : (
                  <button type="submit" disabled={isSubmitting} className="btn-gold rounded-lg font-bold px-8 disabled:opacity-60 disabled:cursor-not-allowed">
                    {isSubmitting ? (
                      <span className="flex items-center gap-2"><span className="spinner" /> Submitting...</span>
                    ) : (
                      'Complete Registration'
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
