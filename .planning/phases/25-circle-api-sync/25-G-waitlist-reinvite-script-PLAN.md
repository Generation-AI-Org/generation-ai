---
phase: 25
plan: G
slug: waitlist-reinvite-script
type: execute
wave: 3
depends_on:
  - 25-E
files_modified:
  - scripts/waitlist-reinvite.ts
  - packages/emails/src/templates/waitlist-reinvite.tsx
  - packages/emails/src/index.ts
  - docs/CIRCLE-INTEGRATION.md
autonomous: false
requirements:
  - R6.1
must_haves:
  truths:
    - "One-shot Node-Script `scripts/waitlist-reinvite.ts` existiert, wird via `pnpm tsx scripts/waitlist-reinvite.ts` ausgeführt."
    - "Script liest ALLE Rows aus `public.waitlist` WHERE `notified_at IS NULL`, iteriert durch sie + sendet pro Row eine Re-Invite-Mail via Resend."
    - "Re-Invite-Mail-Template `WaitlistReinviteEmail` existiert in `packages/emails/src/templates/waitlist-reinvite.tsx` mit Single-CTA `Jetzt anmelden →` zu `https://generation-ai.org/join?source=waitlist-reinvite` (oder zu einem prefill-Link mit Email/Name/Uni aus Waitlist-Row — je nach Design)."
    - "Nach erfolgreichem Mail-Send: Script setzt `notified_at = now()` auf der Row (idempotent — Re-Run skippt bereits-notified)."
    - "Dry-Run-Modus via `--dry-run` Flag: Script liest Rows + logged was es senden würde, ohne Mails zu versenden."
    - "`--limit N` Flag für Batched-Runs (default: unlimited, aber `--limit 10` für Testing)."
    - "Rate-Limit-Schutz: Sleep 200ms zwischen Mails (Resend hat ~10 Mails/sek Limit, wir fahren 5/sek um puffer zu haben)."
    - "Alle Mail-Fehler werden geloggt + Script continued (kein Abort) — Summary am Ende zählt success/failure."
    - "Script ist **autonomous: false** — Luca triggert es manuell einmalig post-Phase-27-Launch, nicht im CI/automatisch."
    - "Logging: `console.log` per Event + Final-Summary-Count. Kein Sentry (One-Shot, not prod-hot-path)."
    - "`docs/CIRCLE-INTEGRATION.md` dokumentiert wie das Script zu nutzen ist (Commands, Env-Setup, Rollback-Pfad)."
    - "Keine Supabase-Signup-Trigger im Script — das Script sendet **nur Re-Invite-Mails** mit Link zu `/join`. Der Rest passiert wenn User auf `/join` landet + dort durch den Signup-Flow geht (mit `SIGNUP_ENABLED=true` in Phase 27)."
  artifacts:
    - path: "scripts/waitlist-reinvite.ts"
      provides: "One-shot Re-Invite-Mail-Runner für Phase-23-Waitlist-Entries"
      exports: []
    - path: "packages/emails/src/templates/waitlist-reinvite.tsx"
      provides: "React-Email Template: 'Wir sind live — hier ist dein Link'"
      exports: ["default (WaitlistReinviteEmail)", "WaitlistReinviteEmailProps"]
  key_links:
    - from: "scripts/waitlist-reinvite.ts"
      to: "public.waitlist (Supabase)"
      via: "createAdminClient().from('waitlist').select/update"
      pattern: "from\\('waitlist'\\)"
---

<objective>
Waitlist-Entries aus Phase 23 müssen post-Launch informiert werden dass Signup jetzt live ist. Q10 definiert: One-Shot Re-Invite-Mail-Script, kein Auto-Trigger. Script wird von Luca manuell gestartet nachdem Phase 27 `SIGNUP_ENABLED=true` geflippt hat.

Purpose: Q10 umsetzen — saubere Migration der Waitlist-UX zu echtem Signup, ohne doppelte Buchhaltung.
Output: Re-Invite-Mail-Template + CLI-Script + Docs.

**Diese Phase legt Code an, führt ihn NICHT aus.** Execution ist Phase-27-post-Launch-HUMAN-Step.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/25-circle-api-sync/25-CONTEXT.md
@packages/emails/src/templates/waitlist-confirmation.tsx
@packages/emails/src/index.ts
@packages/auth/src/waitlist.ts
@supabase/migrations/20260424000001_waitlist.sql
@apps/website/app/actions/waitlist.ts

<interfaces>
```typescript
// scripts/waitlist-reinvite.ts
// Usage:
//   pnpm tsx scripts/waitlist-reinvite.ts --dry-run
//   pnpm tsx scripts/waitlist-reinvite.ts --limit 10
//   pnpm tsx scripts/waitlist-reinvite.ts  (real run, unlimited)

// Expected ENV: SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SUPABASE_URL, RESEND_API_KEY

// packages/emails/src/templates/waitlist-reinvite.tsx
export interface WaitlistReinviteEmailProps {
  name?: string
  joinUrl?: string   // e.g. https://generation-ai.org/join?source=waitlist-reinvite&email=...
}

export default function WaitlistReinviteEmail(props): React.ReactElement
```
</interfaces>

<environment_notes>
- Das Script läuft **lokal** auf Luca's Rechner (oder in einer eigenen Vercel-Function wenn gewünscht — aber für One-Shot ist local simpler).
- Benötigte ENV: service_role-Key + Resend-Key. Script liest aus `.env.local` oder Shell.
- Waitlist-Row-Schema (aus Phase 23):
  ```
  id, email, name, university, study_program, marketing_opt_in,
  redirect_after, source, created_at, notified_at
  ```
- Das `notified_at`-Feld wird als Idempotenz-Marker genutzt — Re-Run nach Crash safe.
- Mail-Volume: ~50-200 Entries erwartet (ermittelt via `supabase sql SELECT count(*) FROM waitlist` vor Execution). Bei <500 Mails: one-shot, kein Queueing nötig.
</environment_notes>
</context>

<threat_model>
**Asset:** Waitlist-Email-Adressen (PII) + Mail-Broadcast-Privilege.

**Threats (ASVS L1):**

1. **Unintended Mass-Mail (Double-Send wenn Script 2x läuft).**
   - Mitigation: `notified_at IS NULL` Filter + UPDATE `notified_at = now()` nach success. Idempotent — Re-Run skippt bereits-sent.

2. **Leak von Waitlist-Emails im Log.**
   - Mitigation: Script logged `[OK] 5/50 sent` (count), nicht `[OK] sent to user@mail.com`. Optional `--verbose` Flag (nicht default) wenn Luca debugging braucht.

3. **Service-Role-Key-Exposure.**
   - Mitigation: Script läuft lokal, Key aus `.env.local`. Script ist git-tracked, Key nicht. `.env.local` ist git-ignored.

4. **Resend-Abuse via Bug.**
   - Mitigation: `--dry-run` zum Testen. `--limit` für kleinen Run first. Sleep 200ms zwischen Mails (max 18k Mails/h auch wenn unintended infinite loop).

**Block on:** BLOCKER (no dry-run, kein notified_at-Update nach success, emails in logs).
**Residual:** Wenn Luca das Script mit `--dry-run` accidentally nicht nutzt und eine Woche später merkt dass Mail-Template Bug hatte — alle Waitlist-Entries sind schon notified. Mitigation: Test erst mit `--limit 1` an Luca's Email.
</threat_model>

<tasks>

<task type="auto">
  <name>Task G1: Re-Invite-Mail-Template</name>
  <files>packages/emails/src/templates/waitlist-reinvite.tsx, packages/emails/src/index.ts</files>
  <read_first>
    - `packages/emails/src/templates/waitlist-confirmation.tsx` (Struktur + Tokens + Layout 1:1)
    - `brand/VOICE.md` (Ton: "du", locker)
  </read_first>
  <action>
Erstelle `packages/emails/src/templates/waitlist-reinvite.tsx`:

```tsx
import { Heading, Section, Text } from '@react-email/components'
import React from 'react'
import { EmailButton, Layout, tokens } from '../index'
import { fontStack } from '../tokens'

export interface WaitlistReinviteEmailProps {
  name?: string
  joinUrl?: string
}

/**
 * Waitlist Re-Invite email (Phase 25 post-launch).
 *
 * Sent ONCE per waitlist-entry when SIGNUP_ENABLED flips to true.
 * Not a Supabase-template — sent directly via Resend from scripts/waitlist-reinvite.ts.
 */
export default function WaitlistReinviteEmail({
  name = 'Freund der Community',
  joinUrl = 'https://generation-ai.org/join?source=waitlist-reinvite',
}: WaitlistReinviteEmailProps): React.ReactElement {
  return (
    <Layout preview="Wir sind live — dein Platz wartet.">
      <Heading
        style={{
          fontFamily: fontStack.sans,
          fontSize: '24px',
          fontWeight: 700,
          color: tokens.light.text,
          margin: '0 0 16px 0',
        }}
      >
        Hey {name} 👋
      </Heading>

      <Text
        style={{
          fontSize: '16px',
          lineHeight: 1.65,
          color: tokens.light.text,
          margin: '0 0 16px 0',
        }}
      >
        Kurze Sache: Die Anmeldung für Generation AI ist jetzt offen.
      </Text>

      <Text
        style={{
          fontSize: '16px',
          lineHeight: 1.65,
          color: tokens.light.text,
          margin: '0 0 32px 0',
        }}
      >
        Du standest auf unserer Warteliste — jetzt kannst du direkt loslegen. Ein Klick, kurz bestätigen, und du bist in der Community.
      </Text>

      <Section style={{ textAlign: 'center', margin: '32px 0' }}>
        <EmailButton href={joinUrl} variant="primary">
          Jetzt anmelden →
        </EmailButton>
      </Section>

      <Text
        style={{
          fontSize: '14px',
          lineHeight: 1.5,
          color: tokens.light.textMuted,
          margin: '32px 0 0 0',
        }}
      >
        Falls du doch nicht mehr willst: einfach ignorieren, wir schreiben dich nicht nochmal an.
      </Text>
    </Layout>
  )
}
```

Dann in `packages/emails/src/index.ts` Export ergänzen (nach den existierenden Template-Exports):

```typescript
export { default as WaitlistReinviteEmail } from './templates/waitlist-reinvite'
export type { WaitlistReinviteEmailProps } from './templates/waitlist-reinvite'
```

VOICE.md-Check: "du", "loslegen", "Kurze Sache", "Hey" — passt zum Generation-AI-Ton.
  </action>
  <verify>
    <automated>test -f packages/emails/src/templates/waitlist-reinvite.tsx && grep -q "Jetzt anmelden" packages/emails/src/templates/waitlist-reinvite.tsx && grep -q "export default function WaitlistReinviteEmail" packages/emails/src/templates/waitlist-reinvite.tsx && grep -q "WaitlistReinviteEmail" packages/emails/src/index.ts && pnpm --filter @genai/emails exec tsc --noEmit 2>&1 | tail -5</automated>
  </verify>
  <acceptance_criteria>
    - Template-File existiert + default export
    - CTA-Label "Jetzt anmelden →" (Single-CTA)
    - Props: `name`, `joinUrl`
    - Re-exported via `@genai/emails`
    - tsc clean
  </acceptance_criteria>
  <done>Template ready.</done>
</task>

<task type="auto">
  <name>Task G2: CLI-Script für Re-Invite-Run</name>
  <files>scripts/waitlist-reinvite.ts, package.json (pnpm script-Eintrag)</files>
  <read_first>
    - `packages/auth/src/waitlist.ts` (WaitlistRow-Shape)
    - `supabase/migrations/20260424000001_waitlist.sql` (notified_at Semantik)
    - `apps/website/app/actions/waitlist.ts` (Resend-Send-Pattern)
    - Bestehende Scripts in `scripts/` (falls vorhanden) für Style-Referenz
  </read_first>
  <action>
Erstelle `scripts/waitlist-reinvite.ts`:

```typescript
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
 *
 * Requires: SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SUPABASE_URL, RESEND_API_KEY
 * in .env.local or shell env.
 */

import { Resend } from 'resend'
import { render } from '@react-email/render'
import { createClient } from '@supabase/supabase-js'
import { WaitlistReinviteEmail } from '@genai/emails'

// -- CLI flags --------------------------------------------------------------
const args = process.argv.slice(2)
const DRY_RUN = args.includes('--dry-run')
const LIMIT = (() => {
  const idx = args.indexOf('--limit')
  if (idx >= 0 && args[idx + 1]) {
    const n = parseInt(args[idx + 1]!, 10)
    if (!Number.isNaN(n) && n > 0) return n
  }
  return null  // unlimited
})()
const VERBOSE = args.includes('--verbose')

// -- Env-Check -------------------------------------------------------------
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const RESEND_KEY = process.env.RESEND_API_KEY
if (!SUPABASE_URL || !SUPABASE_KEY || !RESEND_KEY) {
  console.error('Missing env: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / RESEND_API_KEY')
  process.exit(1)
}

const SUPABASE_CONFIRMED = SUPABASE_URL as string
const SUPABASE_KEY_CONFIRMED = SUPABASE_KEY as string

const supabase = createClient(SUPABASE_CONFIRMED, SUPABASE_KEY_CONFIRMED, {
  auth: { autoRefreshToken: false, persistSession: false },
})
const resend = new Resend(RESEND_KEY)

// -- Sleep helper ----------------------------------------------------------
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

// -- Main ------------------------------------------------------------------
async function main() {
  console.log(`Mode: ${DRY_RUN ? 'DRY-RUN' : 'LIVE'}${LIMIT ? ` (limit: ${LIMIT})` : ''}`)
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
  if (!entries || entries.length === 0) {
    console.log('Nothing to do — 0 un-notified entries.')
    return
  }

  console.log(`Found ${entries.length} entries.`)

  let success = 0
  let failure = 0

  for (const entry of entries) {
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
        console.error(`  [WARN] mail sent but DB update failed for ${idLabel}:`, updErr.message)
      } else {
        console.log(`  [OK] sent → ${idLabel}`)
      }
      success++
    } catch (err) {
      console.error(`  [FAIL] ${idLabel}:`, err instanceof Error ? err.message : err)
      failure++
    }

    // Resend rate-limit safety: 5 mails/sec
    await sleep(200)
  }

  console.log('\n----- Summary -----')
  console.log(`Success: ${success}`)
  console.log(`Failure: ${failure}`)
  console.log(`Total: ${entries.length}`)
}

main().catch((err) => {
  console.error('Fatal:', err)
  process.exit(1)
})
```

Falls noch keine `scripts/`-Directory existiert: `mkdir -p scripts` vorher.

Optional: Eintrag in Root-`package.json`:
```json
{
  "scripts": {
    "waitlist:reinvite": "tsx scripts/waitlist-reinvite.ts",
    "waitlist:reinvite:dry": "tsx scripts/waitlist-reinvite.ts --dry-run"
  }
}
```

**Wichtig:**
- Kein `autonomous: true` — dieses Script soll **nicht** in CI laufen. Luca ruft manuell.
- Der Executor dieses Plans schreibt nur Code. Running the script = HUMAN-UAT-Item in Plan I bzw. post-Phase-27-Launch-Step.
  </action>
  <verify>
    <automated>test -f scripts/waitlist-reinvite.ts && grep -q "notified_at" scripts/waitlist-reinvite.ts && grep -q "DRY_RUN" scripts/waitlist-reinvite.ts && grep -q "WaitlistReinviteEmail" scripts/waitlist-reinvite.ts && grep -q "sleep(200)" scripts/waitlist-reinvite.ts && (grep -q "waitlist:reinvite" package.json || echo "no pnpm script, manual tsx OK")</automated>
  </verify>
  <acceptance_criteria>
    - Script existiert + shebang
    - Parsed `--dry-run`, `--limit N`, `--verbose` flags
    - Fetched rows WHERE `notified_at IS NULL`
    - Updated `notified_at` nach success (idempotent)
    - Sleep 200ms between mails
    - Final summary-count logged
    - Email-Addresses NICHT im default-log-output (nur in --verbose)
  </acceptance_criteria>
  <done>Script ready — Luca kann es post-Launch ausführen.</done>
</task>

<task type="auto">
  <name>Task G3: Runbook in CIRCLE-INTEGRATION.md</name>
  <files>docs/CIRCLE-INTEGRATION.md</files>
  <read_first>
    - `docs/CIRCLE-INTEGRATION.md` (nach Plan C — ergänzen, nicht überschreiben)
  </read_first>
  <action>
In `docs/CIRCLE-INTEGRATION.md` neuen Abschnitt `## Waitlist Re-Invite (Q10)` anhängen:

```markdown
## Waitlist Re-Invite (Q10)

Nach dem Phase-27-Flip von `SIGNUP_ENABLED=true` müssen die Phase-23-Waitlist-Entries informiert werden. One-Shot-Runbook:

### Pre-Check

```bash
# Count un-notified entries
psql "$DATABASE_URL" -c "SELECT count(*) FROM waitlist WHERE notified_at IS NULL;"
```

Oder via Supabase-MCP `execute_sql`: `SELECT count(*) FROM public.waitlist WHERE notified_at IS NULL;`

### Dry-Run (always first)

```bash
pnpm tsx scripts/waitlist-reinvite.ts --dry-run
```

Prüfen:
- Zählt das Script die richtigen Entries?
- Keine Errors beim Fetching?

### Kleiner Testlauf

```bash
pnpm tsx scripts/waitlist-reinvite.ts --limit 1
```

Landet in deinem Postfach? (Voraussetzung: dein Email ist in der Waitlist.)

### Real Run

```bash
pnpm tsx scripts/waitlist-reinvite.ts
```

Abwarten. Summary zeigt success/failure.

### Post-Check

```sql
SELECT count(*) FILTER (WHERE notified_at IS NOT NULL) AS sent,
       count(*) FILTER (WHERE notified_at IS NULL) AS pending
FROM waitlist;
```

`pending` sollte 0 sein (oder nur die failed-mails). `pending > 0 && failure == 0` ist impossible state — bug.

### Rollback

Kein echter Rollback möglich (Mail ist raus). Aber wenn Mail-Template kaputt war:
1. `SELECT * FROM waitlist WHERE notified_at > now() - interval '1 hour';`
2. In Resend-Dashboard nach Mail-Sends filtern, Message-IDs sammeln.
3. **Nicht** `UPDATE waitlist SET notified_at = NULL` — das würde Re-Run auslösen.
4. Stattdessen: Korrektur-Mail manuell senden an die falsch-angeschriebenen Adressen.

### Env für Script

Script liest aus `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`

Nie service-role-Key committen.
```
  </action>
  <verify>
    <automated>grep -q "Waitlist Re-Invite (Q10)" docs/CIRCLE-INTEGRATION.md && grep -q "waitlist-reinvite.ts" docs/CIRCLE-INTEGRATION.md && grep -q "dry-run" docs/CIRCLE-INTEGRATION.md && grep -q "notified_at" docs/CIRCLE-INTEGRATION.md</automated>
  </verify>
  <acceptance_criteria>
    - Runbook-Sektion in CIRCLE-INTEGRATION.md
    - Pre-Check + Dry-Run + Small-Run + Real-Run + Post-Check + Rollback
    - Env-Vars dokumentiert
  </acceptance_criteria>
  <done>Luca hat klare Anleitung für Phase-27-Launch-Step.</done>
</task>

</tasks>

<verification>
**Automated:** tsc clean, grep-gates in tasks.

**Manual (HUMAN-UAT, post-Launch):**
- Dry-Run zeigt plausible Zahl
- Test-Limit-1-Run landet in Luca's Inbox
- Full-Run-Summary stimmt
</verification>

<must_haves>
Siehe `must_haves` im Frontmatter oben.
</must_haves>
