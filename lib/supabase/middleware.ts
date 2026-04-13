import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 保護不要なルート
  const publicPaths = ['/', '/login', '/signup', '/privacy', '/contact', '/sitters', '/auth', '/api', '/forgot-password']
  const isPublic = publicPaths.some((p) => pathname === p || pathname.startsWith(p))

  if (isPublic) {
    return NextResponse.next()
  }

  // セッションCookieが存在するか確認（値の検証はページ側に任せる）
  const cookies = request.cookies.getAll()
  const hasAuthCookie = cookies.some((c) => c.name.includes('auth-token') && c.value.length > 10)

  const protectedPaths = ['/dashboard', '/messages', '/profile', '/bookings', '/admin']
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p))

  if (isProtected && !hasAuthCookie) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}
