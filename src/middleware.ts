import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getMemberSessionFromRequest, getAdminSessionFromRequest } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect member portal routes
  if (pathname.startsWith('/dashboard')) {
    const session = await getMemberSessionFromRequest(request)
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Protect admin routes (except /admin/login)
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const session = await getAdminSessionFromRequest(request)
    if (!session) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  // Redirect authenticated members away from login/register
  if (pathname === '/login' || pathname === '/register') {
    const memberSession = await getMemberSessionFromRequest(request)
    if (memberSession) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/login',
    '/register',
  ],
}
