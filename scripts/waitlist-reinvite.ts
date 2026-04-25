#!/usr/bin/env node
/**
 * Phase 25 — Waitlist Re-Invite Runner (Q10)
 *
 * One-shot script: sends re-invite mails to all waitlist entries that haven't
 * been notified yet. Idempotent — safe to re-run after crash.
 *
 * Usage:
 *   pnpm tsx scripts/waitlist-reinvite.ts --dry-run
 *   pnpm tsx scripts/waitlist-reinvite.ts --limit 10
 *   pnpm tsx scripts/waitlist-reinvite.ts               # real, unlimited
 *   pnpm tsx scripts/waitlist-reinvite.ts --verbose     # logs emails (debug)
 *
 * Requires in env (.env.local or shell):
 *   SUPABASE_SERVICE_ROLE_KEY
 *   NEXT_PUBLIC_SUPABASE_URL
 *   RESEND_API_KEY
 *
 * NOT run automatically — Luca triggers this once after Phase-27 flips
 * SIGNUP_ENABLED=true.
 */

import { Resend } from 'resend'
import { render } from '@react-email/render'
import { createClient } from '@supabase/supabase-js'
import { WaitlistReinviteEmail } from '@genai/emails'

// -- CLI flags --------------------------------------------------------------
const args = process.argv.slice(2)
const DRY_RUN = args.includes('--dry-run')
const VERBOSE = args.includes('--verbose')
const LIMIT = (() => {
  const idx = args.indexOf('--limit')
  if (idx >= 0 && args[idx + 1]) {
    const n = parseInt(args[idx + 1]!, 10)
    if (!Number.isNaN(n) && n > 0) return n
  }
  return null // unlimited
})()

// -- Env check --------------------------------------------------------------
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const RESEND_KEY = process.env.RESEND_API_KEY
if (!SUPABASE_URL || !SUPABASE_KEY || !RESEND_KEY) {
  console.error(
    'Missing env: need NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY + RESEND_API_KEY',
  )
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})
const resend = new Resend(RESEND_KEY)

// -- Helpers ---------------------------------------------------------------
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

interface WaitlistEntry {
  id: string
  email: string
  name: string
  university: string | null
}

// -- Main ------------------------------------------------------------------
async function main(): Promise<void> {
  console.log(
    `Mode: ${DRY_RUN ? 'DRY-RUN' : 'LIVE'}${LIMIT ? ` (limit: ${LIMIT})` : ' (unlimited)'}`,
  )
  console.log('Fetching waitlist entries where notified_at IS NULL...')

  let query = supabase
    .from('waitlist')
    .select('id, email, name, university')
    .is('notified_at', null)
    .order('created_at', { ascending: true })
  if (LIMIT) query = query.limit(LIMIT)

  const { data: entries, error } = await query
  if (error) {
    console.error('Failed to fetch waitlist:', error)
    process.exit(1)
  }
  const rows = (entries ?? []) as WaitlistEntry[]
  if (rows.length === 0) {
    console.log('Nothing to do — 0 un-notified entries.')
    return
  }

  console.log(`Found ${rows.length} entries.`)

  let success = 0
  let failure = 0

  for (const entry of rows) {
    const joinUrl = `https://generation-ai.org/join?source=waitlist-reinvite&email=${encodeURIComponent(entry.email)}`
    const idLabel = VERBOSE ? entry.email : `id=${entry.id.slice(0, 8)}`

    if (DRY_RUN) {
      console.log(`  [DRY] would send → ${idLabel}`)
      success++
      continue
    }

    try {
      const html = await render(WaitlistReinviteEmail({ name: entry.name, joinUrl }))
      await resend.emails.send({
        from: 'noreply@generation-ai.org',
        to: entry.email,
        subject: 'Wir sind live — dein Platz wartet 🎉',
        html,
      })
      const { error: updErr } = await supabase
        .from('waitlist')
        .update({ notified_at: new Date().toISOString() })
        .eq('id', entry.id)
      if (updErr) {
        console.error(
          `  [WARN] mail sent but DB update failed for ${idLabel}:`,
          updErr.message,
        )
      } else {
        console.log(`  [OK] sent → ${idLabel}`)
      }
      success++
    } catch (err) {
      console.error(
        `  [FAIL] ${idLabel}:`,
        err instanceof Error ? err.message : err,
      )
      failure++
    }

    // Resend rate-limit safety: 5 mails/sec
    await sleep(200)
  }

  console.log('\n----- Summary -----')
  console.log(`Success: ${success}`)
  console.log(`Failure: ${failure}`)
  console.log(`Total:   ${rows.length}`)
}

main().catch((err) => {
  console.error('Fatal:', err)
  process.exit(1)
})
