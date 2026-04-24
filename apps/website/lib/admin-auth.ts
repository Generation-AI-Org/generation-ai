/**
 * Phase 25 — Admin-Auth-Helper für Admin-Routes.
 *
 * Strategie (Q6): Magic-Link-Session + Role-Check ODER Allowlist.
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

export async function checkAdminAuth(_request: Request): Promise<AdminAuthResult> {
  // Route-Handler liest Session via Cookies (via @genai/auth/server createClient).
  // _request wird derzeit nicht genutzt, bleibt aber in Signatur für zukünftige
  // CSRF-Token-Prüfung + Content-Type-Guards.
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
  const hasAdminRole =
    (user.user_metadata as Record<string, unknown> | null)?.role === 'admin'

  if (!isAllowlisted && !hasAdminRole) {
    return { ok: false, status: 403, reason: 'Not authorized (admin only)' }
  }

  return { ok: true, userId: user.id, email: user.email }
}
