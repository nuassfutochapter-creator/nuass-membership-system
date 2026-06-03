'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, ShieldCheck, Megaphone, Crown, 
  BarChart3, Calendar, LogOut, X, Menu, Settings
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AdminSession } from '@/types'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/members', label: 'All Members', icon: Users },
  { href: '/admin/verification', label: 'Verification', icon: ShieldCheck },
  { href: '/admin/announcements', label: 'Announcements', icon: Megaphone },
  { href: '/admin/executives', label: 'Executives', icon: Crown },
  { href: '/admin/attendance', label: 'Attendance', icon: Calendar },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
]

interface Props { session: AdminSession }

export default function AdminSidebar({ session }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/admin/login'
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-nuass-gold/60">
            <Image src="/nuass-logo.jpg" alt="NUASS" fill className="object-cover" sizes="40px" />
          </div>
          <div>
            <div className="text-white font-display font-bold text-sm">NUASS Admin</div>
            <div className="text-nuass-gold-light text-xs">{session.role}</div>
          </div>
        </div>
      </div>

      <div className="px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-2 p-2 rounded-xl bg-red-900/30 border border-red-500/20">
          <Settings size={14} className="text-red-400" />
          <div className="text-xs">
            <p className="text-white/70">Logged in as</p>
            <p className="text-white font-medium truncate">{session.full_name}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = item.href === '/admin' 
            ? pathname === '/admin' 
            : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
                isActive
                  ? 'bg-nuass-gold text-nuass-green-deep font-semibold'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              )}
            >
              <item.icon size={17} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="px-4 py-4 border-t border-white/10">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/50 hover:text-white hover:bg-white/10 w-full text-sm font-medium transition-all mb-1"
        >
          ← Public Site
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-900/20 w-full text-sm font-medium transition-all"
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </div>
  )

  return (
    <>
      <aside className="hidden lg:flex w-64 bg-nuass-green-deep flex-col min-h-screen flex-shrink-0">
        <SidebarContent />
      </aside>

      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-nuass-green rounded-xl flex items-center justify-center shadow-lg"
      >
        <Menu size={20} className="text-white" />
      </button>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-72 bg-nuass-green-deep flex flex-col">
            <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 text-white/60 hover:text-white">
              <X size={20} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  )
}
