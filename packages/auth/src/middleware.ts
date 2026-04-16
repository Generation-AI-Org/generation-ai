import { createServerClient, type CookieOptionsWithName } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Refreshes the Supabase session on every request.
 * Call from proxy.ts (Next.js 16) or middleware.ts (older Next.js).
 *
 * Pattern: https://supabase.com/docs/guides/auth/server-side/nextjs
 *
 * Critical rules:
 * - Call `supabase.auth.getUser()` before returning the response
 * - Return the `supabaseResponse` instance (not a new NextResponse)
 * - Do not read or modify cookies manually
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const envDomain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN
  const cookieOptions: CookieOptionsWithName | undefined = envDomain
    ? { domain: envDomain }
    : undefined

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
      ...(cookieOptions ? { cookieOptions } : {}),
    }
  )

  // Refresh the session if expired. Required for server-side auth to work.
  // Do NOT remove or move this call.
  await supabase.auth.getUser()

  return supabaseResponse
}
