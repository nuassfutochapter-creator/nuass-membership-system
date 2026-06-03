import { Bell } from 'lucide-react'
import type { MemberSession } from '@/types'
import { getStatusColor } from '@/lib/utils'

interface Props {
  session: MemberSession
}

export default function PortalHeader({ session }: Props) {
  return (
    <header className="bg-white border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between sticky top-0 z-40">
      <div className="lg:hidden w-10" /> {/* Spacer for mobile hamburger */}
      
      <div className="flex-1 lg:flex-none">
        <h1 className="text-gray-800 font-semibold text-sm sm:text-base">
          Welcome, <span className="text-nuass-green">{session.full_name.split(' ')[0]}</span>
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <span className={`hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
          session.membership_status === 'VERIFIED' 
            ? 'text-green-700 bg-green-50 border-green-200' 
            : 'text-yellow-700 bg-yellow-50 border-yellow-200'
        }`}>
          {session.membership_status === 'VERIFIED' ? '✓ Verified' : '⏳ Pending'}
        </span>
        <div className="w-8 h-8 rounded-full bg-nuass-green/10 flex items-center justify-center">
          <Bell size={16} className="text-nuass-green" />
        </div>
      </div>
    </header>
  )
}
