import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        domain: '.generation-ai.org', // Leading dot for all subdomains
        path: '/',
        sameSite: 'lax',
        secure: true,
      },
    }
  )
}
