'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About NUASS' },
  { href: '/executives', label: 'Executives' },
  { href: '/register', label: 'Register', highlight: true },
]

export default function PublicNavbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-nuass-green-deep/95 backdrop-blur-md border-b border-nuass-gold/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-nuass-gold/60 group-hover:border-nuass-gold transition-colors">
              <Image
                src="/nuass-logo.jpg"
                alt="NUASS Logo"
                fill
                className="object-cover"
                sizes="40px"
              />
            </div>
            <div className="hidden sm:block">
              <div className="text-white font-display font-bold text-sm leading-tight">NUASS FUTO CHAPTER</div>
              <div className="text-nuass-gold-light text-xs leading-tight">Unity • Culture • Progress</div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  link.highlight
                    ? 'bg-nuass-gold text-nuass-green-deep hover:bg-nuass-gold-light font-semibold'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/login"
              className="ml-2 px-4 py-2 rounded-lg text-sm font-medium text-nuass-gold border border-nuass-gold/40 hover:bg-nuass-gold/10 transition-all duration-200"
            >
              Login
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-nuass-green-dark border-t border-nuass-gold/20">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                  link.highlight
                    ? 'bg-nuass-gold text-nuass-green-deep font-semibold'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                )}
              >
                {link.label}
                <ChevronRight size={16} />
              </Link>
            ))}
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium text-nuass-gold border border-nuass-gold/30 hover:bg-nuass-gold/10"
            >
              Login
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
