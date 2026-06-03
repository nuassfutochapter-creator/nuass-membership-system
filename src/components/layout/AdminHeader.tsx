import type { AdminSession } from '@/types'

interface Props { session: AdminSession }

export default function AdminHeader({ session }: Props) {
  return (
    <header className="bg-white border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between sticky top-0 z-40">
      <div className="lg:hidden w-10" />
      <div className="flex-1 lg:flex-none">
        <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold">Admin Panel</p>
        <h1 className="text-gray-900 font-semibold text-sm">
          {session.full_name} — <span className="text-nuass-green">{session.role}</span>
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
          Admin Access
        </span>
      </div>
    </header>
  )
}
