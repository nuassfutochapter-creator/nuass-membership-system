import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'dd MMM yyyy')
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), 'dd MMM yyyy, hh:mm a')
}

export function formatRelativeTime(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function formatWhatsAppNumber(number: string): string {
  // Normalize Nigerian phone numbers
  const cleaned = number.replace(/\D/g, '')
  if (cleaned.startsWith('234')) return '+' + cleaned
  if (cleaned.startsWith('0')) return '+234' + cleaned.slice(1)
  return '+234' + cleaned
}

export function maskWhatsAppNumber(number: string): string {
  if (number.length < 8) return number
  return number.slice(0, 4) + '****' + number.slice(-4)
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'VERIFIED': return 'text-green-600 bg-green-50 border-green-200'
    case 'PENDING': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    case 'SUSPENDED': return 'text-red-600 bg-red-50 border-red-200'
    default: return 'text-gray-600 bg-gray-50 border-gray-200'
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(key: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): boolean {
  const now = Date.now()
  const record = rateLimitStore.get(key)

  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (record.count >= maxAttempts) {
    return false
  }

  record.count++
  return true
}
