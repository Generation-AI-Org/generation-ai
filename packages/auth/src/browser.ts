import { createBrowserClient, type CookieOptionsWithName } from '@supabase/ssr'

export function createClient(cookieOptionsOverride?: CookieOptionsWithName) {
  const envDomain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN

  const cookieOptions: CookieOptionsWithName = {
    ...(envDomain ? { domain: envDomain } : {}),
    ...(cookieOptionsOverride ?? {}),
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    Object.keys(cookieOptions).length > 0 ? { cookieOptions } : undefined
  )
}
