/**
 * Phase 25 — Admin-Auth-Helper für Admin-Routes.
 *
 * Strategie: Magic-Link-Session + ADMIN_EMAIL_ALLOWLIST.
 *
 * Do not trust `user_metadata.role` here. Supabase user metadata is writable by
 * the authenticated user and must not grant service-role admin access.
 *
 * Usage:
 * ```ts
 * const auth = await checkAdminAuth(request)
 * if (!auth.ok) return NextResponse.json({ error: auth.reason }, { status: auth.status })
 * // auth.userId + auth.email verfügbar
 * ```
 */

import { createClient } from '@genai/auth/server'

export type AdminAuthResult =
  | { ok: true; userId: string; email: string }
  | { ok: false; status: 401 | 403; reason: string }

function getAllowlist(): string[] {
  const raw = process.env.ADMIN_EMAIL_ALLOWLIST
  if (!raw) return []
  return raw
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
}

/**
 * REVIEW LO-02 — CSRF defence via `Origin` allowlist on admin routes.
 *
 * Admin routes are POST-only and high-impact (service-role mutations).
 * Browsers always send `Origin` on cross-origin POSTs, so an explicit
 * allowlist closes the cross-site-POST vector without depending on custom
 * tokens. Same-origin requests (no `Origin` header, as some same-origin
 * POSTs omit it) are allowed — session-cookie-auth already gates those.
 */
function getAllowedOrigins(): string[] {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://generation-ai.org'
  const origins = new Set<string>([
    siteUrl,
    'https://generation-ai.org',
    'https://www.generation-ai.org',
  ])
  // Vercel preview / local dev convenience — the service-role key must still
  // be present, so this doesn't broaden the attack surface in prod.
  if (process.env.NODE_ENV !== 'production') {
    origins.add('http://localhost:3000')
  }
  return [...origins]
}

export async function checkAdminAuth(request: Request): Promise<AdminAuthResult> {
  // LO-02: Only enforce cross-origin block when `Origin` is present.
  // Some same-origin POSTs (e.g. from curl tests, older clients) omit it.
  // Session-cookie-auth below still gates those requests.
  const origin = request.headers.get('origin')
  if (origin && !getAllowedOrigins().includes(origin)) {
    return { ok: false, status: 403, reason: 'Cross-origin request denied' }
  }

  // Route-Handler liest Session via Cookies (via @genai/auth/server createClient).
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user || !user.email) {
    return { ok: false, status: 401, reason: 'Not authenticated' }
  }

  const emailLower = user.email.toLowerCase()
  const allowlist = getAllowlist()
  const isAllowlisted = allowlist.includes(emailLower)
  if (!isAllowlisted) {
    return { ok: false, status: 403, reason: 'Not authorized (admin only)' }
  }

  return { ok: true, userId: user.id, email: user.email }
}
