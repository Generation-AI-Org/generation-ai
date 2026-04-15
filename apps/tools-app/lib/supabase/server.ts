import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const cookieOptions = {
  domain: '.generation-ai.org',
  path: '/',
  sameSite: 'lax' as const,
  secure: true,
}

export async function createClient() {
  const cookieStore = await cookies()

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
              cookieStore.set(name, value, { ...cookieOptions, ...options })
            )
          } catch {
            // Server Components cannot set cookies — ignore
            // This is expected when called from Server Components
          }
        },
      },
    }
  )
}
