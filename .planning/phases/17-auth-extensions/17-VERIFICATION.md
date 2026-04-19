---
phase: 17-auth-extensions
verified: 2026-04-19T12:00:00Z
status: human_needed
score: 9/10 must-haves verified
overrides_applied: 0
human_verification:
  - test: "Smoke-test real email delivery in Gmail + Apple Mail"
    expected: "Mail arrives, logo renders (red on light / neon on dark), button reads 'Passwort zurücksetzen', dark-mode swaps background + logo, footer reads 'Generation AI · Die KI-Community für Studierende'"
    why_human: "Email rendering in live clients cannot be verified programmatically. Requires Luca to (1) push website to Vercel so logo PNGs are reachable at generation-ai.org/brand/logos/, (2) paste 6 HTMLs + subjects into Supabase Dashboard per MANUAL-STEPS.md, (3) trigger a password-reset on own account and inspect in Gmail Light/Dark + Apple Mail. Task 3 of Plan 17-05 is the pre-approved stop-gate per CONTEXT.md."
---

# Phase 17: Auth Extensions Verification Report

**Phase Goal:** 6 Supabase email templates unified on React Email. Theme-adaptive via `prefers-color-scheme`. Copy from brand/VOICE.md (Umlauts correct). Token-mapping from brand/tokens.json. Bulletproof Buttons (Outlook VML). HTML export script. Rate-limits documented.
**Verified:** 2026-04-19
**Status:** human_needed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | `@genai/emails` workspace package exists with React Email deps | VERIFIED | `packages/emails/package.json` present; `@react-email/components: ^0.0.31`, `@react-email/render: ^1.0.1`, `react-email: ^3.0.1` confirmed |
| 2 | Shared Layout component with Header (Logo) + children slot + Footer exists | VERIFIED | `packages/emails/src/components/Layout.tsx` renders `<BrandLogo />` in header, `{children}` slot, Hr, two footer Text elements |
| 3 | Token helper exports brand colors + spacing + radius as inline-usable JS values | VERIFIED | `packages/emails/src/tokens.ts` exports `tokens.light.accent = '#F5133B'`, `tokens.dark.accent = '#CEFF32'`, `radius`, `space`, `fontStack` all present as `as const` |
| 4 | Layout adapts to `prefers-color-scheme` via CSS `<style>` block | VERIFIED | `Layout.tsx` contains `@media (prefers-color-scheme: dark)` block covering bg, card, text, muted, footer, divider, button, and logo swap |
| 5 | Bulletproof VML button present in 5 button-template HTMLs | VERIFIED | `<!--[if mso]><v:roundrect ...>` found in confirm-signup, recovery, magic-link, email-change, invite HTML exports. reauth correctly has no button (OTP-only — documented deviation) |
| 6 | All 6 templates exist as React Email components with correct VOICE.md copy and correct Umlauts | VERIFIED | All 6 `.tsx` files verified: "E-Mail bestätigen", "Passwort zurücksetzen", "60 Minuten", "15 Minuten", "Änderung bestätigen", "Account anlegen", "Kurz bestätigen" all present; no `ae/oe/ue` substitutions found |
| 7 | All 6 HTML exports exist in `apps/website/emails/dist/` containing Supabase template variables, dark-mode CSS, and are inline-styled | VERIFIED | 6 HTML files present (7–10 KB each), all contain `{{ .ConfirmationURL }}` or `{{ .Token }}`, all contain `prefers-color-scheme: dark`, no external stylesheet refs |
| 8 | PNG logos exist and are served as public assets | VERIFIED | `apps/website/public/brand/logos/logo-wide-red.png` (142×80 PNG), `logo-wide-neon.png` (142×80 PNG) both confirmed valid. URLs hardcoded in BrandLogo.tsx. Pre-deploy curl check documented in MANUAL-STEPS.md |
| 9 | Export script `pnpm email:export` exists and is reproducible | VERIFIED | `packages/emails/scripts/export.ts` uses `@react-email/render` with `pretty: false`; script registered as `email:export` in package.json; regenerated successfully post review-fix |
| 10 | 6 templates deployed to Supabase Dashboard + smoke-tested in Gmail + Apple Mail | HUMAN NEEDED | Task 3 of Plan 17-05 is the pre-approved stop-gate. Luca must push website, paste HTMLs into Supabase, set subjects, check rate limits, and run smoke-test per MANUAL-STEPS.md |

**Score:** 9/10 truths verified (1 requires human action — pre-approved stop-gate)

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `packages/emails/package.json` | React Email deps, scripts | VERIFIED | `@react-email/components`, `@react-email/render`, `react-email`, `email:export`, `email:dev`, `logos:generate` all present; unused `@react-email/button` removed post-review |
| `packages/emails/src/tokens.ts` | Inline design tokens from brand/tokens.json | VERIFIED | light.accent `#F5133B`, dark.accent `#CEFF32`, radius, space, fontStack exported |
| `packages/emails/src/components/Layout.tsx` | Shared wrapper for all 6 templates | VERIFIED | Header + BrandLogo + children + Hr + Footer; dark-mode media query covers all token classes |
| `packages/emails/src/components/BrandLogo.tsx` | Mail-safe PNG logo with dark/light swap | VERIFIED | Two `<Img>` tags with `email-logo-light` / `email-logo-dark` CSS classes; PNG URLs (no SVG) |
| `packages/emails/src/components/EmailButton.tsx` | Bulletproof CTA button with Outlook VML | VERIFIED | VML `<v:roundrect>` via `dangerouslySetInnerHTML` with `escapeHtml` guard; no `@react-email/button` dependency |
| `packages/emails/src/templates/confirm-signup.tsx` | Signup confirmation template | VERIFIED | `{{ .ConfirmationURL }}`, `{{ .Data.name }}`, "E-Mail bestätigen", "Willkommen bei Generation AI", real Umlauts |
| `packages/emails/src/templates/recovery.tsx` | Reset-password template | VERIFIED | `{{ .ConfirmationURL }}`, "Passwort zurücksetzen", "60 Minuten" |
| `packages/emails/src/templates/magic-link.tsx` | Magic-link login template | VERIFIED | `{{ .ConfirmationURL }}`, "Anmelden", "15 Minuten" (not legacy "24 Stunden") |
| `packages/emails/src/templates/email-change.tsx` | Email-change confirmation template | VERIFIED | `{{ .ConfirmationURL }}`, `{{ .Email }}`, "Änderung bestätigen" |
| `packages/emails/src/templates/reauth.tsx` | Reauthentication OTP template | VERIFIED | `{{ .Token }}`, monospace code block, no EmailButton, "Kurz bestätigen, dass du's bist" |
| `packages/emails/src/templates/invite.tsx` | User-invite template | VERIFIED | `{{ .ConfirmationURL }}`, `{{ .Data.inviter_name }}`, "Account anlegen" |
| `apps/website/emails/dist/confirm-signup.html` | Production HTML for Supabase | VERIFIED | 7149 bytes, `{{ .ConfirmationURL }}`, dark-mode CSS, VML mso markup, both logo PNGs |
| `apps/website/emails/dist/recovery.html` | Production HTML for Supabase | VERIFIED | 7144 bytes, `{{ .ConfirmationURL }}`, dark-mode CSS, VML mso markup |
| `apps/website/emails/dist/magic-link.html` | Production HTML for Supabase | VERIFIED | 7193 bytes, `{{ .ConfirmationURL }}`, dark-mode CSS, VML mso markup |
| `apps/website/emails/dist/email-change.html` | Production HTML for Supabase | VERIFIED | 7224 bytes, `{{ .ConfirmationURL }}`, dark-mode CSS, VML mso markup |
| `apps/website/emails/dist/reauth.html` | Production HTML for Supabase | VERIFIED | 6454 bytes, `{{ .Token }}`, dark-mode CSS, no mso (correct — no button) |
| `apps/website/emails/dist/invite.html` | Production HTML for Supabase | VERIFIED | 7266 bytes, `{{ .ConfirmationURL }}`, dark-mode CSS, VML mso markup |
| `apps/website/public/brand/logos/logo-wide-red.png` | Mail-safe light-theme logo (2x) | VERIFIED | 142×80 PNG, RGBA, valid format |
| `apps/website/public/brand/logos/logo-wide-neon.png` | Mail-safe dark-theme logo (2x) | VERIFIED | 142×80 PNG, RGBA, valid format |
| `packages/emails/scripts/generate-logo-pngs.ts` | Reproducible SVG→PNG script | VERIFIED | Uses sharp, `TARGET_HEIGHT = 80`, `logos:generate` script registered |
| `packages/emails/scripts/export.ts` | HTML render-to-file export script | VERIFIED | Uses `@react-email/render`, `pretty: false`, ESM-safe `__dirname` via `fileURLToPath` |
| `.planning/phases/17-auth-extensions/MANUAL-STEPS.md` | Luca's Supabase Dashboard checklist | VERIFIED | 6-row subjects table, rate-limit table (30/h email, 30/h OTP, 150/5min refresh, 30/h anon), smoke-test steps, pre-deploy curl checks, Outlook-VML-Fallback note |
| `.changeset/phase-17-auth-emails.md` | Patch changeset v4.3.x | VERIFIED | `"@genai/website": patch`, `"@genai/tools-app": patch` |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `Layout.tsx` | `tokens.ts` | `import { fontStack, radius, tokens } from '../tokens'` | VERIFIED | Import confirmed in file |
| `Layout.tsx` | `BrandLogo.tsx` | `<BrandLogo />` in header Section | VERIFIED | Component imported and rendered |
| Template files | `Layout.tsx` | `import { Layout, EmailButton, tokens } from '../index'` | VERIFIED | All 6 templates use Layout wrapper |
| `confirm-signup.tsx` | `{{ .ConfirmationURL }}` | Default prop value on EmailButton href | VERIFIED | `confirmationUrl = '{{ .ConfirmationURL }}'` default renders through |
| `reauth.tsx` | `{{ .Token }}` | Default prop value on Text element | VERIFIED | `token = '{{ .Token }}'` renders in code block |
| `export.ts` | 6 template files | `@react-email/render` + direct imports | VERIFIED | Script imports all 6 components and renders to HTML |
| `BrandLogo.tsx` | `https://generation-ai.org/brand/logos/logo-wide-red.png` | Hardcoded `src` in `<Img>` | VERIFIED (pending deploy) | URL is referenced; PNGs exist in `apps/website/public/brand/logos/`. Must deploy before pasting to Supabase |

---

### Data-Flow Trace (Level 4)

N/A — this phase produces static email HTML artifacts, not dynamic UI rendering components with live data sources.

---

### Behavioral Spot-Checks

| Behavior | Result | Status |
|----------|--------|--------|
| All 6 HTML files present in `apps/website/emails/dist/` | 6 files confirmed | PASS |
| Supabase `{{ .ConfirmationURL }}` in 5 button templates | Count ≥1 in all 5 | PASS |
| Supabase `{{ .Token }}` in reauth.html | Count = 1 | PASS |
| `prefers-color-scheme: dark` in all 6 HTMLs | Count = 1 per file | PASS |
| VML `mso` conditional comments in 5 button templates | Count = 2 per file (open + close) | PASS |
| reauth.html has no `mso` (no button — correct) | Count = 0 | PASS |
| Both logo PNGs in confirm-signup.html | Count = 2 each | PASS |
| HTML files are inline-styled (no external CSS refs) | No `link rel=stylesheet` found | PASS |
| File sizes > 2 KB | Range: 6454–7266 bytes | PASS |
| `escapeHtml` guard in EmailButton.tsx | Function present at line 17, used at lines 48–49 | PASS |
| `pretty: false` in export.ts | Confirmed at line 35 | PASS |
| Unused `@react-email/button` dep removed | Not present in package.json | PASS |

---

### Requirements Coverage

| Requirement | Source Plan | Status |
|-------------|------------|--------|
| AUTH-EMAIL-01: React Email package scaffold | 17-01 | SATISFIED |
| AUTH-EMAIL-02: Shared Layout + tokens | 17-01 | SATISFIED |
| AUTH-EMAIL-03: Mail-safe PNG logo assets | 17-02 | SATISFIED |
| AUTH-EMAIL-04: confirm-signup template | 17-03 | SATISFIED |
| AUTH-EMAIL-05: recovery template | 17-03 | SATISFIED |
| AUTH-EMAIL-06: magic-link template | 17-03 | SATISFIED |
| AUTH-EMAIL-07: email-change template | 17-04 | SATISFIED |
| AUTH-EMAIL-08: reauth template | 17-04 | SATISFIED |
| AUTH-EMAIL-09: invite template | 17-04 | SATISFIED |
| AUTH-EMAIL-10: HTML export script + 6 dist HTMLs | 17-05 | SATISFIED |
| AUTH-EMAIL-11: MANUAL-STEPS.md + changeset | 17-05 | SATISFIED — MANUAL-STEPS.md includes subjects table, rate-limit table, smoke-test, pre-deploy curl checks, Outlook-VML-Fallback note |

---

### Anti-Patterns Found

All medium/low/info findings from 17-REVIEW.md were resolved in 17-REVIEW-FIX.md (commit 6089d96, d5820d9, 5c01abf, d66580b, ea93319):

| Finding | Severity | Resolution |
|---------|----------|------------|
| MD-01: No HTML escaping in EmailButton `dangerouslySetInnerHTML` | Medium | Fixed — `escapeHtml()` helper added |
| MD-02: Unused `@react-email/button` dep | Medium | Fixed — removed from package.json |
| LO-01: Empty `BrandLogoProps` interface | Low | Fixed — interface and unused prop removed |
| LO-02: `pretty: true` could break VML conditional comments | Low | Fixed — changed to `pretty: false` |
| LO-03: `__dirname` not ESM-safe | Low | Fixed — `fileURLToPath(import.meta.url)` pattern |
| IN-01: Logo paths assume generation-ai.org is live | Info | Mitigated — pre-deploy curl check added to MANUAL-STEPS.md |
| IN-02: Dark-mode depends on client support | Info | Documented — expected behaviour noted in MANUAL-STEPS.md |
| IN-03: Dead `borderRadius` constant in EmailButton | Info | Fixed — constant removed |
| IN-04: Mixed quote styles in tokens.ts | Info | Accepted — no project-wide Prettier rule |

No blockers or new anti-patterns found in current code state.

**Notable design decision:** `EmailButton.tsx` uses `dangerouslySetInnerHTML` with hand-written VML instead of the original plan's `@react-email/button pX/pY props`. This is correct — the official React Email Button component (v0.0.10) is incompatible with React 19 SSR (forwardRef crash). The hand-written VML produces functionally identical Outlook output. Documented in 17-05-SUMMARY.md and MANUAL-STEPS.md.

---

### Human Verification Required

#### 1. Supabase Dashboard: Paste templates + set subjects + verify rate limits

**Test:** Follow `.planning/phases/17-auth-extensions/MANUAL-STEPS.md` Section 1, 2, and 3 in order:
- First: run `curl -I https://generation-ai.org/brand/logos/logo-wide-red.png` — must return 200 (requires website deployed to Vercel)
- Then: paste each of the 6 HTMLs from `apps/website/emails/dist/*.html` into the matching Supabase Auth Email Template field + set the correct Subject per the subjects table
- Then: check Auth → Rate Limits and reset to Supabase defaults if Phase 13 test values are still active

**Expected:** All 6 templates saved in Supabase Dashboard without error, subjects correctly set

**Why human:** Supabase Dashboard is an external web service — no programmatic API available for pasting template content

#### 2. Smoke-test: Email delivery in Gmail and Apple Mail

**Test:** Trigger a password-reset on Luca's own account (Login page → "Passwort vergessen"). Check the received email in:
- Gmail Light Mode
- Gmail Dark Mode
- Apple Mail Light + Dark

**Expected:**
- Mail arrives within 1 minute
- Subject reads "Neues Passwort für Generation AI"
- Logo appears (red on light background, neon-green on dark)
- Body copy: "klick auf den Button, um ein neues Passwort zu setzen. Der Link gilt 60 Minuten."
- CTA button reads "Passwort zurücksetzen"
- Footer reads "Generation AI · Die KI-Community für Studierende"
- Dark-mode in Gmail web swaps background colour + logo

**Why human:** Email client rendering (dark-mode adaptation, logo image loading, VML button rendering) cannot be verified without sending a real email and visually inspecting it in live clients. This is the pre-approved stop-gate from CONTEXT.md §Pre-Approved für Autonomous-Run.

---

## Gaps Summary

No blocking gaps. All automated checks passed. The single pending item (Truth 10) is the intentional human stop-gate documented in CONTEXT.md and Plan 17-05 Task 3.

The phase is code-complete. Luca needs to:
1. Deploy website to Vercel (so logo PNGs are reachable)
2. Paste 6 HTMLs into Supabase Dashboard + set subjects
3. Verify rate limits
4. Run smoke-test in Gmail + Apple Mail
5. Reply "approved" to finalize the phase

---

_Verified: 2026-04-19_
_Verifier: Claude (gsd-verifier)_
