import { createBrowserClient, type CookieOptionsWithName } from '@supabase/ssr'

export function createClient(cookieOptions?: CookieOptionsWithName) {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    cookieOptions ? { cookieOptions } : undefined
  )
}
