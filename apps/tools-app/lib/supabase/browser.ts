import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null

export function createClient() {
  if (client) return client

  client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          if (typeof document === 'undefined') return []
          const cookies = document.cookie.split(';').map(c => {
            const [name, ...rest] = c.trim().split('=')
            return { name, value: rest.join('=') }
          }).filter(c => c.name)
          console.log('[Supabase] getAll cookies:', cookies.length)
          return cookies
        },
        setAll(cookiesToSet) {
          if (typeof document === 'undefined') return
          console.log('[Supabase] setAll cookies:', cookiesToSet.length, cookiesToSet.map(c => c.name))
          cookiesToSet.forEach(({ name, value, options }) => {
            const cookieStr = `${name}=${value}; path=${options?.path ?? '/'}; max-age=${options?.maxAge ?? 31536000}; SameSite=Lax`
            console.log('[Supabase] Setting cookie:', name, 'length:', value.length)
            document.cookie = cookieStr
          })
        },
      },
    }
  )

  return client
}
