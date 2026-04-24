import { NextResponse, type NextRequest } from 'next/server'

import { decrypt } from '@/lib/session'

const protectedPrefixes = ['/dashboard', '/admin']
const authPages = ['/login', '/signup']

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('aiproxy_session')?.value
  const session = await decrypt(token)
  const { pathname } = request.nextUrl

  const isProtectedRoute = protectedPrefixes.some(prefix => pathname.startsWith(prefix))
  const isAuthPage = authPages.some(prefix => pathname.startsWith(prefix))

  if (isProtectedRoute && !session?.userId) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isAuthPage && session?.userId) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/login', '/signup'],
}
