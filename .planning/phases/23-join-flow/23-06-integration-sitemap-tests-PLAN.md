---
phase: 23
plan: 06
slug: integration-sitemap-tests
type: execute
wave: 3
depends_on:
  - 23-05
files_modified:
  - apps/website/app/sitemap.ts
  - packages/e2e-tools/tests/join.spec.ts
  - .planning/STATE.md
autonomous: false
requirements:
  - R4.6
  - R4.7
  - R4.8
must_haves:
  truths:
    - "`/join` ist im generierten Sitemap enthalten mit priority 0.8 + changeFrequency monthly"
    - "Playwright-Smoke-Test existiert und passt in der E2E-Suite: Route lädt, Form rendert, Success-Swap nach valid Submit, inline-Error bei invalid Email"
    - "STATE.md reflektiert Phase 23 Completion (Status, Plans, Commits, offene Items)"
    - "Lighthouse /join > 90 (manuell verifiziert, in SUMMARY dokumentiert)"
  artifacts:
    - path: "apps/website/app/sitemap.ts"
      provides: "Sitemap mit /join-Eintrag"
      contains: "/join"
    - path: "packages/e2e-tools/tests/join.spec.ts"
      provides: "Playwright-Smoke-Test Suite für /join"
      min_lines: 80
    - path: ".planning/STATE.md"
      provides: "Project-State-Update mit Phase 23 Completion"
      contains: "Phase 23"
  key_links:
    - from: "apps/website/app/sitemap.ts"
      to: "/join route"
      via: "MetadataRoute.Sitemap entry with url, priority, changeFrequency"
      pattern: "/join"
    - from: "packages/e2e-tools/tests/join.spec.ts"
      to: "/join route"
      via: "page.goto(JOIN_URL)"
      pattern: "goto.*join"
---

<!-- NOTE on `autonomous: false`:
     Task 3 is a `checkpoint:human-verify` task. The gsd-tools plan-structure
     validator enforces the invariant "any checkpoint:* task requires
     autonomous: false", so the frontmatter reflects that. The substantive work
     (Tasks 1, 2, 4) is fully autonomous; Task 3 is a final human-gate before
     Phase-close. -->

<objective>
Phase 23 abschliessen: Sitemap-Eintrag, Playwright-Smoke-Test, STATE.md-Update + Lighthouse-Check.

Purpose: Phase-Gate. Alle Checks die sicherstellen dass /join production-ready ist (modulo 503-Gate das bis Phase 25 stehen bleibt — aber die Waitlist-V1 ist ja live-fähig per D-01).
Output: SEO-Sichtbarkeit, Regression-Guard, dokumentierter Phase-Abschluss.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/23-join-flow/23-CONTEXT.md
@.planning/phases/23-join-flow/23-UI-SPEC.md
@apps/website/app/sitemap.ts
@packages/e2e-tools/tests/partner.spec.ts
@packages/e2e-tools/tests/about.spec.ts

<interfaces>
<!-- Existing apps/website/app/sitemap.ts (before this plan) -->
```typescript
import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://generation-ai.org'
  return [
    { url: baseUrl, lastModified: new Date(), priority: 1, changeFrequency: 'weekly' },
    { url: `${baseUrl}/about`, lastModified: new Date(), priority: 0.8, changeFrequency: 'monthly' },
  ]
}
```
Note: /partner is likely added by Phase 22 plan. Check the current file — if /partner is missing, leave it as-is (out of Phase 23 scope) but DO add /join.

<!-- Blueprint for Playwright test — partner.spec.ts already uses this pattern -->
```typescript
import { test, expect } from '@playwright/test'
const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:3000'
const JOIN_URL = `${BASE_URL}/join`

test.describe('/join page', () => {
  test('loads successfully with correct title', async ({ page }) => { ... })
})
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Sitemap um /join erweitern</name>
  <files>apps/website/app/sitemap.ts</files>
  <read_first>
    - `apps/website/app/sitemap.ts` (current state — andere Phasen haben evtl. schon weitere Routes added)
  </read_first>
  <action>
Lies die aktuelle `apps/website/app/sitemap.ts`. Füge einen Eintrag für `/join` hinzu mit:
- `url: ${baseUrl}/join`
- `priority: 0.8`
- `changeFrequency: 'monthly'`
- `lastModified: new Date()`

Analog zum `/about`-Eintrag. Platziere den Eintrag sortiert (Landing → /about → /join → /partner falls existent).

Wenn beim Lesen der Datei /partner oder andere Routes fehlen die in Phase 22 geadded sein sollten: NICHT anfassen — nur /join addieren und im SUMMARY notieren falls Abweichung auffällt.

Example final shape:
```typescript
import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://generation-ai.org'
  return [
    { url: baseUrl, lastModified: new Date(), priority: 1, changeFrequency: 'weekly' },
    { url: `${baseUrl}/about`, lastModified: new Date(), priority: 0.8, changeFrequency: 'monthly' },
    { url: `${baseUrl}/join`, lastModified: new Date(), priority: 0.8, changeFrequency: 'monthly' },
    // ... weitere Routes
  ]
}
```
  </action>
  <verify>
    <automated>grep -q "/join" apps/website/app/sitemap.ts && grep -A2 "/join" apps/website/app/sitemap.ts | grep -q "0.8" && pnpm --filter @genai/website exec tsc --noEmit 2>&1 | tail -5</automated>
  </verify>
  <acceptance_criteria>
    - `apps/website/app/sitemap.ts` enthält `/join`-Entry
    - Priority `0.8`, changeFrequency `monthly`
    - Andere Einträge (Landing, /about, ggf. /partner) unverändert
    - tsc clean
  </acceptance_criteria>
  <done>`/join` wird in Next.js-generierter sitemap.xml indexiert.</done>
</task>

<task type="auto">
  <name>Task 2: Playwright-Smoke-Test packages/e2e-tools/tests/join.spec.ts</name>
  <files>packages/e2e-tools/tests/join.spec.ts</files>
  <read_first>
    - `packages/e2e-tools/tests/partner.spec.ts` (Blueprint — BASE_URL pattern, test.describe structure)
    - `packages/e2e-tools/tests/about.spec.ts` (Blueprint — hero-heading assertion pattern)
    - `.planning/phases/23-join-flow/23-UI-SPEC.md` (alle Copy-Assertions kommen aus UI-SPEC Copywriting Contract)
  </read_first>
  <action>
Erstelle `packages/e2e-tools/tests/join.spec.ts`:

```typescript
import { test, expect } from '@playwright/test'

const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:3000'
const JOIN_URL = `${BASE_URL}/join`

// Hilfsfunktion: eindeutige Email pro Testlauf, um unique-Index-Kollisionen zu vermeiden
function testEmail() {
  return `e2e-join+${Date.now()}-${Math.random().toString(36).slice(2, 8)}@generation-ai.test`
}

test.describe('/join page', () => {
  test('loads successfully with correct title', async ({ page }) => {
    const response = await page.goto(JOIN_URL)
    expect(response?.status()).toBe(200)
    await expect(page).toHaveTitle(/Jetzt beitreten · Generation AI/)
  })

  test('renders hero with correct H1 + eyebrow + benefit row', async ({ page }) => {
    await page.goto(JOIN_URL)
    const h1 = page.locator('h1')
    await expect(h1).toBeVisible()
    await expect(h1).toContainText('2 Minuten')
    await expect(h1).toContainText('dann bist du dabei')

    // Eyebrow
    await expect(page.getByText('// jetzt beitreten', { exact: false })).toBeVisible()

    // 3 Benefit items
    for (const label of ['Kostenlos', 'Keine Verpflichtung', 'In 2 Minuten']) {
      await expect(page.getByText(label, { exact: false }).first()).toBeVisible()
    }
  })

  test('renders form with all required fields', async ({ page }) => {
    await page.goto(JOIN_URL)

    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('input[name="name"]')).toBeVisible()
    await expect(page.locator('input[name="university"]')).toBeVisible()
    await expect(page.locator('input[name="study_program"]')).toBeVisible()
    await expect(page.locator('input[name="consent"]')).toBeVisible()
    await expect(page.locator('input[name="marketing_opt_in"]')).toBeVisible()

    // Honeypot should exist but be sr-only
    const honeypot = page.locator('input[name="website"]')
    await expect(honeypot).toHaveCount(1)

    // Submit button
    await expect(page.getByRole('button', { name: 'Kostenlos beitreten' })).toBeVisible()
  })

  test('shows inline error on invalid email', async ({ page }) => {
    await page.goto(JOIN_URL)
    const emailInput = page.locator('input[name="email"]')
    await emailInput.fill('not-an-email')
    await emailInput.blur()

    await expect(page.getByText('Hmm, die Mail-Adresse passt noch nicht ganz.')).toBeVisible()
  })

  test('shows inline error when consent is missing', async ({ page }) => {
    await page.goto(JOIN_URL)
    await page.locator('input[name="email"]').fill(testEmail())
    await page.locator('input[name="name"]').fill('Test User')
    await page.locator('input[name="university"]').fill('Test Uni')
    // consent deliberately not checked
    await page.getByRole('button', { name: 'Kostenlos beitreten' }).click()
    await expect(page.getByText('Du musst der Datenschutzerklärung zustimmen, um fortzufahren.')).toBeVisible()
  })

  test('uni combobox accepts free-text input', async ({ page }) => {
    await page.goto(JOIN_URL)
    const uni = page.locator('input[name="university"]')
    await uni.click()
    await uni.fill('Meine Spezial-Akademie XYZ')
    await uni.blur()
    await expect(uni).toHaveValue('Meine Spezial-Akademie XYZ')
  })

  test('uni combobox keyboard navigation + select', async ({ page }) => {
    await page.goto(JOIN_URL)
    const uni = page.locator('input[name="university"]')
    await uni.click()
    await uni.fill('LMU')
    // Wait for filtered dropdown to render
    await expect(page.getByRole('listbox')).toBeVisible()
    await uni.press('ArrowDown')
    await uni.press('Enter')
    await expect(uni).toHaveValue(/LMU/i)
  })

  test('redirect_after query param is passed through as hidden input', async ({ page }) => {
    await page.goto(`${JOIN_URL}?redirect_after=%2Fevents%2Fsample`)
    const hidden = page.locator('input[name="redirect_after"]')
    await expect(hidden).toHaveCount(1)
    await expect(hidden).toHaveValue('/events/sample')
  })

  test('valid submit swaps form for success card', async ({ page }) => {
    await page.goto(JOIN_URL)
    await page.locator('input[name="email"]').fill(testEmail())
    await page.locator('input[name="name"]').fill('Max Mustermann')
    await page.locator('input[name="university"]').fill('LMU München')
    await page.locator('input[name="consent"]').check()
    await page.getByRole('button', { name: 'Kostenlos beitreten' }).click()

    // Success card should appear
    await expect(page.getByText(/Danke, Max! Wir melden uns/)).toBeVisible({ timeout: 10_000 })
    await expect(page.getByRole('link', { name: /Jetzt Level testen/ })).toHaveAttribute('href', '/test')
    await expect(page.getByText('Später im Dashboard')).toBeVisible()
  })

  test('form state survives page reload via sessionStorage', async ({ page }) => {
    await page.goto(JOIN_URL)
    // Fill fields and wait for debounced sessionStorage write (300ms per Plan 23-05 Blocker 2)
    await page.locator('input[name="email"]').fill('reload-test@generation-ai.test')
    await page.locator('input[name="name"]').fill('Reload User')
    await page.locator('input[name="university"]').fill('TU Berlin')
    await page.waitForTimeout(500)

    // Reload page
    await page.reload()

    // Verify state was restored from sessionStorage
    await expect(page.locator('input[name="email"]')).toHaveValue('reload-test@generation-ai.test')
    await expect(page.locator('input[name="name"]')).toHaveValue('Reload User')
    await expect(page.locator('input[name="university"]')).toHaveValue('TU Berlin')
  })

  test('no CSP violations on page load', async ({ page }) => {
    const violations: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error' && /Content Security Policy|CSP/i.test(msg.text())) {
        violations.push(msg.text())
      }
    })
    await page.goto(JOIN_URL)
    // Wait for any async scripts to settle
    await page.waitForLoadState('networkidle')
    expect(violations).toEqual([])
  })
})
```

Hinweise:
- Der `valid submit swaps for success card` Test erwartet dass Upstash + Resend + Supabase konfiguriert sind ODER der Rate-Limit gracefully failed open ist. Wenn der Test gegen Prod-Supabase läuft wird er eine echte Row schreiben — das ist okay, die Waitlist-Table akzeptiert Test-Einträge.
- Der `form state survives page reload` Test verifiziert R4.7 (SessionStorage-Persistence) aus Plan 23-05 Blocker-2-Fix.
- Für CI-Umgebung ohne DB-Access kann der submit-Test via Playwright-Mock umgangen werden, aber das ist out of scope hier — wenn CI ihn skippt, ist das okay.
- `networkidle` ist bei Next.js mit Speed-Insights teils flaky; alternativ `await page.waitForTimeout(500)` verwenden.
  </action>
  <verify>
    <automated>test -f packages/e2e-tools/tests/join.spec.ts && grep -q "test.describe('/join page'" packages/e2e-tools/tests/join.spec.ts && grep -q "2 Minuten" packages/e2e-tools/tests/join.spec.ts && grep -q "redirect_after" packages/e2e-tools/tests/join.spec.ts && grep -q "Jetzt Level testen" packages/e2e-tools/tests/join.spec.ts && grep -q "CSP" packages/e2e-tools/tests/join.spec.ts && grep -q "sessionStorage" packages/e2e-tools/tests/join.spec.ts</automated>
  </verify>
  <acceptance_criteria>
    - File existiert mit `test.describe('/join page'`
    - ≥10 test cases: loads, hero, form fields, email error, consent error, uni free-text, uni keyboard, redirect_after, valid submit swap, sessionStorage reload, CSP
    - BASE_URL Pattern `process.env.E2E_BASE_URL ?? 'http://localhost:3000'` (konsistent mit partner.spec.ts)
    - Copy-Assertions verbatim aus UI-SPEC (keine freien Formulierungen)
    - CSP-Violation-Check enthalten
    - SessionStorage-Reload-Check enthalten (R4.7 Guard)
  </acceptance_criteria>
  <done>Regression-Guard für /join etabliert. Test-Suite kann lokal oder in CI laufen.</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 3: Lokaler Lighthouse-Check + manuelle UX-Verifikation</name>
  <what-built>
    - /join Route ist live auf localhost
    - Sitemap enthält /join
    - Playwright-Smoke existiert
  </what-built>
  <how-to-verify>
    Luca (oder Claude im Autonomous-Mode) führt folgende Checks durch:

    1. Starte Dev-Server: `pnpm dev:website`

    2. Browser öffnen auf `http://localhost:3000/join`

    3. **Visuelle Checks (UI-SPEC-Matching):**
       - [ ] Hero zeigt Eyebrow `// jetzt beitreten` mit Dot-Accent
       - [ ] H1 `2 Minuten — dann bist du dabei.` in Geist Mono, text-balance
       - [ ] Lede `Kostenlos. Für alle Fachrichtungen. Keine Haken.` unter H1
       - [ ] 3 Benefit-Items mit Dot-Separators `Kostenlos · Keine Verpflichtung · In 2 Minuten`
       - [ ] Hero-Höhe ~60vh (nicht full-screen)
       - [ ] Form-Card direkt unter Hero sichtbar (kein Scroll auf Desktop nötig)
       - [ ] Form-Card hat subtle border + shadow, rounded-2xl, max-w-lg
       - [ ] 6 Felder rendern korrekt, alle ≥44px hoch
       - [ ] Submit-Button `Kostenlos beitreten` in Accent-Farbe (Neon-Grün dark / Rot light)
       - [ ] LabeledNodes-Background im Hero animiert (oder prefers-reduced-motion static)

    4. **Flow-Checks:**
       - [ ] Invalid Email blur → inline Fehler `Hmm, die Mail-Adresse passt noch nicht ganz.`
       - [ ] Submit ohne Consent → Fehler `Du musst der Datenschutzerklärung zustimmen, um fortzufahren.`
       - [ ] UniCombobox Typing → Dropdown mit Matches öffnet sich
       - [ ] Arrow-Down + Enter → Option wird ausgewählt
       - [ ] Escape → Dropdown schliesst
       - [ ] Freitext "Meine Akademie" → als "Andere: Meine Akademie übernehmen" erscheint in Dropdown
       - [ ] Valid Submit → Success-Card erscheint mit `Danke, {Vorname}!`
       - [ ] Success-Card hat CTA `Jetzt Level testen (2 min)` → /test Link
       - [ ] `?redirect_after=/events/foo` in URL → hidden input enthält diesen Wert
       - [ ] Reload mid-fill → Email/Name/Uni werden aus SessionStorage wiederhergestellt (R4.7)

    5. **CSP-Check:**
       - [ ] Browser-Console offen: KEINE CSP-Violations

    6. **Lighthouse (Chrome DevTools → Lighthouse Tab, Mobile):**
       - [ ] Performance ≥ 90
       - [ ] Accessibility ≥ 90
       - [ ] Best Practices ≥ 90
       - [ ] SEO ≥ 90

    7. **Prod-Build-Check:**
       ```bash
       pnpm --filter @genai/website build 2>&1 | grep "/join"
       ```
       Erwartung: `ƒ /join` (dynamic, nicht `○`)

    Wenn alles passt: approved.
    Wenn etwas abweicht: Abweichung melden — Claude fixt.
  </how-to-verify>
  <resume-signal>Type "approved" or describe issues (e.g. "lighthouse perf 72, hero text shadow schwach")</resume-signal>
</task>

<task type="auto">
  <name>Task 4: STATE.md updaten + Phase 23 als DONE markieren</name>
  <files>.planning/STATE.md</files>
  <read_first>
    - `.planning/STATE.md` (aktueller Stand — wir appenden ans bestehende, nicht umschreiben)
  </read_first>
  <action>
Update `.planning/STATE.md` (kein kompletter Rewrite — nur relevante Abschnitte):

1. **Top-Level `status:` + `last_updated:`** bleiben (werden vom nächsten /gsd-discuss-phase aktualisiert)

2. **Phase-Counter** im frontmatter:
   - `completed_phases`: +1
   - `total_plans`: +6
   - `completed_plans`: +6

3. **Current Status** Section:
   - "Phase:" updaten auf nächste geplante Phase (22.5 falls das noch der Plan ist — siehe aktueller STATE.md line 24)
   - Last Updated: heute
   - Kurze Zeile: "Phase 23 /join Fragebogen-Flow (Waitlist V1) ✅ DONE — 6/6 Plans"

4. **Phase 23 Progress** Section (neu anhängen nach bestehenden Phase-Progress-Sections, analog zu bestehender "Phase 20.6 Progress"-Struktur):

   ```markdown
   ### Phase 23 Progress

   **Status:** DONE {date}. Waitlist V1 live-fähig (Backend bleibt 503 bis Phase 25, Waitlist-Insert + Confirmation-Mail laufen).

   - Plan 23-01 DONE — Supabase `waitlist`-Table + RLS (service_role only) + TypeScript types in @genai/auth. Migration `supabase/migrations/20260424000001_waitlist.sql` via MCP applied.
   - Plan 23-02 DONE — React-Email-Template `WaitlistConfirmationEmail` in @genai/emails (Blueprint: partner-inquiry-confirmation).
   - Plan 23-03 DONE — Server-Action `submitJoinWaitlist` mit Zod-Validation + Upstash-Rate-Limit (5/15min/IP) + Supabase-Insert + Resend-Mail. Interface stabil für Phase 25 Swap (D-10).
   - Plan 23-04 DONE — UniCombobox-Komponente + Universities-Liste (40 DE-Hochschulen + 4 Fallback-Options). ARIA-combobox-Pattern, Keyboard-Nav, Freitext-Accept.
   - Plan 23-05 DONE — /join Route komplett: Server-Component + Client-Wrapper + Hero (`min-h-[60vh]`) + Form-Card (Hero+FormSection in Task 1a, FormCard+SuccessCard mit SessionStorage in Task 1b) + Success-Card mit Inline-Swap. Unterseiten-Blueprint-konform. CSP/Nonce intakt.
   - Plan 23-06 DONE — Sitemap-Eintrag `/join`, Playwright-Smoke `join.spec.ts` mit 10+ Testcases. Lighthouse /join > 90 verifiziert. STATE.md updated.

   **Requirements completed:** R4.1, R4.2, R4.3, R4.4, R4.5, R4.6, R4.7, R4.8 (alle R4.*) — R4.1–R4.4 als-revidiert umgesetzt (Single-Page Waitlist statt Multi-Step-Wizard, per D-17/D-18/D-15/D-01).

   **Offen (bewusst, Phase 25):**
   - Live-Signup bleibt 503 (D-01, Luca-Go abhängig)
   - Assessment-CTA verlinkt auf `/test` (404 bis Phase 24 die Seite baut)
   - Phase 25 swapped Waitlist-Insert gegen echten Supabase-Signup + Circle-API-Sync
   ```

5. **Falls die "Next Session Start Here" Section aktualisiert werden sollte:** Zielphase auf die nächste laut Pfad A (nach 22.7 + 22.5 + 24 + 25 + 26 + 27 — Reihenfolge laut STATE-Sektion "Revidierte Roadmap-Reihenfolge (Pfad A)").

Das Datum `{date}` durch aktuelles ISO-Datum ersetzen (z.B. `2026-04-24` oder der Ausführungstag).

Wichtig: Nur die genannten Sections anfassen. Alle anderen STATE.md-Inhalte (Milestone v1/v2/v3 Details) unverändert lassen.
  </action>
  <verify>
    <automated>grep -q "Phase 23 Progress" .planning/STATE.md && grep -q "Plan 23-01 DONE" .planning/STATE.md && grep -q "Plan 23-06 DONE" .planning/STATE.md && grep -q "R4.1.*R4.8" .planning/STATE.md</automated>
  </verify>
  <acceptance_criteria>
    - STATE.md enthält "Phase 23 Progress" Section mit allen 6 Plans als DONE
    - Frontmatter `completed_phases` + 1
    - Frontmatter `total_plans` + 6, `completed_plans` + 6
    - Alle R4.*-Requirements als completed markiert
    - "Offen (Phase 25)" Notes über 503-Gate + Assessment-CTA-Dependency
    - Andere STATE.md-Inhalte unverändert (git diff zeigt nur Phase 23 + frontmatter)
  </acceptance_criteria>
  <done>Project State spiegelt Phase 23 Completion.</done>
</task>

</tasks>

<verification>
- Sitemap enthält /join
- Playwright-Suite läuft (mindestens lokal gegen Dev-Server)
- Lighthouse ≥ 90 (alle 4 Kategorien)
- STATE.md zeigt Phase 23 DONE
- Phase-Gate approved durch Human-Verify
</verification>

<success_criteria>
- /join ist production-ready V1
- Waitlist-Inserts + Confirmation-Mails funktionieren
- Regression-Guard via Playwright etabliert
- Phase-Gate signed off
</success_criteria>

<output>
Create `.planning/phases/23-join-flow/23-06-SUMMARY.md` with:
- Sitemap-Diff
- Playwright-Test-Count + Runtime
- Lighthouse-Scores (Perf/A11y/BP/SEO)
- Human-Verify-Approval
- Link zu Phase 24 (/test Assessment) als Next Step
- `23-SUMMARY.md` (Phase-Level Summary) erstellen analog `20.5-SUMMARY.md` mit:
  - Alle 6 Plans mit Artefakten
  - Decisions D-01..D-22 Mapping
  - Offene Items für Phase 25 (Circle-API-Sync swap)
</output>
