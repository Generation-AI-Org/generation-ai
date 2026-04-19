import type { User } from '@supabase/supabase-js'

/**
 * Phase 19: First-Login-Prompt-Entscheidung anhand tri-state user_metadata.has_password.
 *
 * - `true`  → User hat explizit ein Passwort gesetzt → kein Prompt.
 * - `false` → User hat "Später setzen" geklickt → kein Re-Prompt.
 * - sonst   → Alt-User oder frischer Account, First-Login-Prompt zeigen.
 *
 * Pure function, client- und server-safe. Wird von `/auth/confirm/route.ts` (server)
 * und `/auth/callback/page.tsx` (client) aufgerufen — damit tri-state an einer Stelle
 * lebt und nicht 3× dupliziert wird.
 */
export function needsFirstLoginPrompt(user: Pick<User, 'user_metadata'> | null | undefined): boolean {
  if (!user) return false
  const flag = user.user_metadata?.has_password
  return flag !== true && flag !== false
}
