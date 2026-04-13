// lib/supabase.ts
// Supabase clients using validated environment variables
// Source: lib/env.ts for type-safe validation

import { createClient } from '@supabase/supabase-js'
import { env } from './env'

// Browser client (read-only, RLS enforced)
// Uses validated public env vars (safe to expose)
export const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Server client (service role, bypasses RLS)
// Only use in Server Components / API Routes
// Service role key is validated but never exposed to client
export function createServerClient() {
  return createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY
  )
}
