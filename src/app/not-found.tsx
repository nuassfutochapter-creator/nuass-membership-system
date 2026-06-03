import Link from 'next/link'
import Image from 'next/image'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="relative w-24 h-24 mx-auto mb-6 rounded-full overflow-hidden border-4 border-nuass-green/30">
          <Image src="/nuass-logo.jpg" alt="NUASS" fill className="object-cover opacity-50" sizes="96px" />
        </div>
        <h1 className="font-display text-6xl font-bold text-nuass-green mb-3">404</h1>
        <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">Page Not Found</h2>
        <p className="text-gray-500 text-sm mb-8 max-w-sm mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn-primary rounded-xl px-6 py-3 font-semibold">
            Go Home
          </Link>
          <Link href="/login" className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors">
            Login
          </Link>
        </div>
      </div>
    </div>
  )
}
