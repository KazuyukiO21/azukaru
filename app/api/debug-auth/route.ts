import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const cookieStore = cookies()
  const allCookies = cookieStore.getAll()

  const authCookie = allCookies.find((c) => c.name.includes('auth-token'))
  let cookieValueInfo = null
  if (authCookie) {
    const val = authCookie.value
    cookieValueInfo = {
      length: val.length,
      first30: val.substring(0, 30),
      looksLikeBase64: /^[A-Za-z0-9+/=_-]+$/.test(val.substring(0, 20)),
      looksLikeJSON: val.startsWith('{') || val.startsWith('['),
    }
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
    {
      cookies: {
        getAll() {
          return allCookies
        },
        setAll() {},
      },
    }
  )

  const { data: { session }, error } = await supabase.auth.getSession()

  return NextResponse.json({
    hasSession: !!session,
    sessionError: error?.message ?? null,
    cookieCount: allCookies.length,
    cookieNames: allCookies.map((c) => c.name),
    authCookieInfo: cookieValueInfo,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 40),
  })
}
