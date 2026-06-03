import Link from 'next/link'
import Image from 'next/image'

export default function PublicFooter() {
  return (
    <footer className="bg-nuass-green-deep text-white border-t border-nuass-gold/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-nuass-gold/60">
                <Image src="/nuass-logo.jpg" alt="NUASS" fill className="object-cover" sizes="48px" />
              </div>
              <div>
                <div className="font-display font-bold text-lg leading-tight">NUASS FUTO CHAPTER</div>
                <div className="text-nuass-gold-light text-xs">Motto: Education is Light</div>
              </div>
            </div>
            <p className="text-white/70 text-sm leading-relaxed">
              National Union of Anambra State Students Futo Chapter. Empowering Anambra indigenes through unity, culture, and academic excellence.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-nuass-gold mb-4 uppercase tracking-wider text-xs">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { href: '/', label: 'Home' },
                { href: '/about', label: 'About NUASS' },
                { href: '/executives', label: 'Executives' },
                { href: '/register', label: 'Register' },
                { href: '/login', label: 'Member Login' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-white/70 hover:text-nuass-gold text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-nuass-gold mb-4 uppercase tracking-wider text-xs">Contact</h3>
            <div className="space-y-2 text-sm text-white/70">
              <p>Federal University of Technology </p>
              <p>Owerri, Imo State, Nigeria</p>
              <p>Email: nuassfutochapter@gmail.com</p>
              <p>
  <strong>Sen. Maximilan C. Obiekwe</strong><br />
  NUASS FUTO Chapter President<br />
  +234 808 714 4465
</p>
<p>
  <strong>🎙️ Comr. Chidebe Lawrence</strong><br />
  NUASS FUTO Chapter P.R.O<br />
  +234 706 102 3906
</p>
              <p className="mt-3 text-nuass-gold-light font-medium">Unity • Culture • Progress</p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/50 text-xs text-center sm:text-left">
            © {new Date().getFullYear()} NUASS. All rights reserved. Built by Godspower 2025/2026 Dir. of Welfare
          </p>
          <div className="flex gap-4 text-xs text-white/50">
            <span>Version 1.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
