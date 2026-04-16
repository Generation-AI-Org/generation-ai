import { createServerClient, type CookieOptionsWithName } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  const envDomain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN
  const cookieOptions: CookieOptionsWithName | undefined = envDomain
    ? { domain: envDomain }
    : undefined

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Components cannot set cookies — ignored.
            // Session refresh happens in middleware (proxy.ts) instead.
          }
        },
      },
      ...(cookieOptions ? { cookieOptions } : {}),
    }
  )
}
