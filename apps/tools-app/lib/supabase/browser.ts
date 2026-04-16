import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null

// Helper to manually save session to cookies
function saveSessionToCookie(session: { access_token: string; refresh_token: string } | null) {
  if (typeof document === 'undefined' || !session) return

  const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL?.match(/\/\/([^.]+)/)?.[1] || 'unknown'
  const cookieName = `sb-${projectRef}-auth-token`

  // Encode session data
  const sessionData = JSON.stringify({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
  })
  const encoded = btoa(sessionData)

  // Set cookie with proper attributes
  const maxAge = 60 * 60 * 24 * 365 // 1 year
  document.cookie = `${cookieName}=${encoded}; path=/; max-age=${maxAge}; SameSite=Lax; Secure`
  console.log('[Supabase] Manually saved session cookie:', cookieName)
}

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
            const cookieStr = `${name}=${value}; path=${options?.path ?? '/'}; max-age=${options?.maxAge ?? 31536000}; SameSite=Lax; Secure`
            console.log('[Supabase] Setting cookie:', name, 'length:', value.length)
            document.cookie = cookieStr
          })
        },
      },
    }
  )

  // Listen for auth changes and manually save to cookies
  client.auth.onAuthStateChange((event, session) => {
    console.log('[Supabase] Auth state changed:', event)
    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
      saveSessionToCookie(session)
    }
    if (event === 'SIGNED_OUT') {
      // Clear auth cookies
      const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL?.match(/\/\/([^.]+)/)?.[1] || 'unknown'
      document.cookie = `sb-${projectRef}-auth-token=; path=/; max-age=0`
      console.log('[Supabase] Cleared session cookie')
    }
  })

  return client
}
