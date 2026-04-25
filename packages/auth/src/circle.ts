/**
 * Phase 25 — Circle-API-Sync types
 *
 * Mirrors the `public.user_circle_links` table schema defined in
 * `supabase/migrations/20260425000001_circle_profile_fields.sql`.
 *
 * Also documents the shape of Circle-related keys stored in
 * `auth.users.raw_user_meta_data` (JSONB, untyped in DB) written by
 * the server action `apps/website/app/actions/signup.ts` (Plan 25-E)
 * and read by `apps/website/app/auth/confirm/route.ts` (Plan 25-D).
 */

/** Full row as stored in Supabase (read shape). */
export interface UserCircleLink {
  user_id: string
  circle_member_id: string
  circle_provisioned_at: string | null
  last_error: string | null
  last_error_at: string | null
  created_at: string
}

/** Insert payload — DB fills created_at. */
export interface UserCircleLinkInsert {
  user_id: string
  circle_member_id: string
  circle_provisioned_at?: string | null
  last_error?: string | null
  last_error_at?: string | null
}

/**
 * Keys we write into auth.users.raw_user_meta_data during signup.
 * Not enforced by the DB (JSONB), documented here for TypeScript consumers.
 */
export interface CircleUserMetadata {
  /** Carried from /join Step 1 payload */
  status?: 'student' | 'pre-studium' | 'early-career'
  uni?: string
  motivation?: string
  level?: number
  full_name?: string

  /** Set when Circle provisioning succeeded at signup time (D-07). */
  circle_member_id?: string
  /** ISO-8601 timestamp of last successful Circle provision. */
  circle_provisioned_at?: string
}
