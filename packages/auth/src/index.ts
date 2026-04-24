// Client-safe barrel.
//
// Server-only helpers use `next/headers` / `NextRequest` and must be imported
// directly from their subpath to avoid bundling them into client components:
//   - @genai/auth/server      — createClient with cookies() (route handlers, server components)
//   - @genai/auth/helpers     — getUser, getSession
//   - @genai/auth/middleware  — updateSession (for proxy.ts)
export { createClient as createBrowserClient } from './browser'
export { createAdminClient } from './admin'
export { needsFirstLoginPrompt } from './password'

// Phase 23 — /join Waitlist types
export type { WaitlistRow, WaitlistInsert } from './waitlist'
