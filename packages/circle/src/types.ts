/**
 * Phase 25 — Circle-API-Sync types
 *
 * Shapes match Circle Admin-API v2 response bodies as documented in
 * https://api.circle.so/ (verify against live API at execute time).
 */

export interface CircleMember {
  id: string | number     // Circle returns numeric IDs; we stringify defensively
  email: string
  name: string
  community_id: string | number
}

export interface CircleSsoToken {
  sso_url?: string         // one-time-use magic link (primary shape)
  access_token?: string    // alternate response shape — client composes URL
  expires_at: string       // ISO-8601
}

/** Input for createMember. Q9: nur Email + Name an Circle, keine Uni/Status/Motivation. */
export interface CreateMemberInput {
  email: string
  name: string
  /** Optional metadata stored on Circle-side. Use sparingly (Q9). */
  metadata?: Record<string, string>
}

/** Input for generateSsoUrl. TTL defaults to 7 days per Q4. */
export interface GenerateSsoInput {
  memberId: string
  /** Post-login redirect inside Circle (relative path, e.g. `/spaces/welcome`). */
  redirectPath?: string
  /** TTL in seconds. Default = 604800 (7 days, matches Supabase confirm link). */
  ttlSeconds?: number
}
