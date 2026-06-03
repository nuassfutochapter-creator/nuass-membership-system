'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Bell, Users, Calendar, LogOut, X, Menu, UserCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MemberSession } from '@/types'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/announcements', label: 'Announcements', icon: Bell },
  { href: '/dashboard/directory', label: 'Member Directory', icon: Users },
  { href: '/dashboard/attendance', label: 'Attendance', icon: Calendar },
  { href: '/dashboard/profile', label: 'My Profile', icon: UserCircle },
]

interface Props {
  session: MemberSession
}

export default function PortalSidebar({ session }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-nuass-gold/60 flex-shrink-0">
            <Image src="/nuass-logo.jpg" alt="NUASS" fill className="object-cover" sizes="40px" />
          </div>
          <div>
            <div className="text-white font-display font-bold text-sm leading-tight">NUASS FUTO CHAPTER</div>
            <div className="text-nuass-gold-light text-xs">Member Portal</div>
          </div>
        </Link>
      </div>

      {/* Member Info */}
      <div className="px-4 py-4 border-b border-white/10">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
          <div className="w-10 h-10 rounded-full bg-nuass-gold/20 flex items-center justify-center flex-shrink-0">
            <UserCircle size={20} className="text-nuass-gold" />
          </div>
          <div className="overflow-hidden">
            <p className="text-white font-medium text-sm truncate">{session.full_name}</p>
            <p className="text-white/50 text-xs font-mono">{session.nuass_id}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = item.href === '/dashboard' 
            ? pathname === '/dashboard' 
            : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-nuass-gold text-nuass-green-deep font-semibold'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              )}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="px-4 py-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/10 w-full text-sm font-medium transition-all"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-nuass-green-deep flex-col min-h-screen flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-nuass-green rounded-xl flex items-center justify-center shadow-lg"
      >
        <Menu size={20} className="text-white" />
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-72 bg-nuass-green-deep flex flex-col">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 text-white/60 hover:text-white"
            >
              <X size={20} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  )
}
