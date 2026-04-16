import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@genai/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  const allCookies = cookieStore.getAll()

  // Check for Supabase cookies specifically
  const sbCookies = allCookies.filter(c => c.name.startsWith('sb-'))

  const supabase = await createServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  const { data: { session } } = await supabase.auth.getSession()

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    cookieCount: allCookies.length,
    cookieNames: allCookies.map(c => c.name),
    sbCookieCount: sbCookies.length,
    sbCookieNames: sbCookies.map(c => c.name),
    sbCookieSizes: sbCookies.map(c => ({ name: c.name, size: c.value.length })),
    hasUser: !!user,
    userId: user?.id || null,
    userEmail: user?.email || null,
    hasSession: !!session,
    sessionExpiry: session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : null,
    error: error?.message || null,
    headers: {
      host: request.headers.get('host'),
      cookie: request.headers.get('cookie')?.substring(0, 100) + '...' || null,
    }
  }, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    }
  })
}
