/**
 * Supabase Admin Helper for E2E tests.
 * Runs in Node.js context (not browser). Uses SERVICE_ROLE_KEY.
 * Reference: Phase 13 RESEARCH.md "Don't Hand-Roll" + "Code Examples".
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js"

function adminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing in .env.test.local"
    )
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

/**
 * Build the app-side PKCE confirm URL from a hashed token.
 * Use this instead of the raw action_link (which goes to supabase.co and
 * returns the session in a hash fragment that /auth/confirm cannot parse).
 *
 * The /auth/confirm route expects: ?token_hash=...&type=...
 */
function buildConfirmUrl(appConfirmBase: string, hashedToken: string, type: string): string {
  const url = new URL(appConfirmBase)
  url.searchParams.set("token_hash", hashedToken)
  url.searchParams.set("type", type)
  return url.toString()
}

export async function generateMagicLink(email: string, appConfirmUrl?: string) {
  const { data, error } = await adminClient().auth.admin.generateLink({
    type: "magiclink",
    email,
    options: appConfirmUrl ? { redirectTo: appConfirmUrl } : undefined,
  })
  if (error) throw error
  const hashedToken = data.properties.hashed_token as string
  return {
    // actionLink goes to supabase.co/auth/v1/verify — use confirmUrl for app-side PKCE flow
    actionLink: appConfirmUrl
      ? buildConfirmUrl(appConfirmUrl, hashedToken, "magiclink")
      : (data.properties.action_link as string),
    hashedToken,
  }
}

export async function generateRecoveryLink(email: string, appConfirmUrl?: string) {
  const { data, error } = await adminClient().auth.admin.generateLink({
    type: "recovery",
    email,
    options: appConfirmUrl ? { redirectTo: appConfirmUrl } : undefined,
  })
  if (error) throw error
  const hashedToken = data.properties.hashed_token as string
  return {
    // actionLink goes to supabase.co/auth/v1/verify — use confirmUrl for app-side PKCE flow
    actionLink: appConfirmUrl
      ? buildConfirmUrl(appConfirmUrl, hashedToken, "recovery")
      : (data.properties.action_link as string),
    hashedToken,
  }
}

export async function ensureTestUser(email: string, password: string) {
  const admin = adminClient()
  const { data: list, error: listErr } = await admin.auth.admin.listUsers()
  if (listErr) throw listErr
  const existing = list.users.find((u) => u.email === email)
  if (existing) return existing
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })
  if (error) throw error
  return data.user
}
