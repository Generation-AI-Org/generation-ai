/**
 * Phase 23 — /join Waitlist V1 types
 *
 * Mirrors the `public.waitlist` table schema defined in
 * `supabase/migrations/20260424000001_waitlist.sql`.
 *
 * Used by server action `apps/website/app/actions/waitlist.ts` (Plan 23-03)
 * via `createAdminClient()` from this package.
 *
 * Phase 25 (Circle-API-Sync) will migrate these rows into `auth.users`.
 */

/** Full row as stored in Supabase (read shape). */
export interface WaitlistRow {
  id: string
  email: string
  name: string
  status: WaitlistStatus
  university: string | null
  study_field: string | null
  study_program: string | null
  marketing_opt_in: boolean
  birth_year: number | null
  redirect_after: string | null
  source: string
  created_at: string
  notified_at: string | null
}

/** Insert payload — DB defaults fill in id, source, created_at, notified_at. */
export interface WaitlistInsert {
  email: string
  name: string
  status?: WaitlistStatus
  university?: string | null
  study_field?: string | null
  study_program?: string | null
  birth_year?: number | null
  marketing_opt_in?: boolean
  redirect_after?: string | null
  source?: string
}

export type WaitlistStatus =
  | 'student'
  | 'early_career'
  | 'working'
  | 'alumni'
  | 'other'
