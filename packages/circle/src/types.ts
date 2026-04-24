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

/**
 * Response from POST /api/v1/headless/auth_token (Headless Auth API).
 * Verified against live API 2026-04-24 — see debug/phase-25-circle-sso-endpoint.md.
 * Note: numeric IDs are returned as JSON numbers, not strings.
 */
export interface CircleSsoToken {
  access_token: string                 // RS256 JWT, ~1h TTL (server-fixed)
  access_token_expires_at: string      // ISO-8601
  refresh_token: string                // 30d TTL
  refresh_token_expires_at: string     // ISO-8601
  community_member_id: number
  community_id: number
}

/** Input for createMember. Q9: nur Email + Name an Circle, keine Uni/Status/Motivation. */
export interface CreateMemberInput {
  email: string
  name: string
  /** Optional metadata stored on Circle-side. Use sparingly (Q9). */
  metadata?: Record<string, string>
}

/**
 * Input for generateSsoUrl. Circle's Headless `auth_token` endpoint accepts
 * only `community_member_id` — `redirect_path` and `ttl_seconds` are not
 * supported (TTL is server-fixed at ~1h, redirect always lands at community root).
 */
export interface GenerateSsoInput {
  memberId: string
}
