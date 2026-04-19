---
phase: 17-auth-extensions
plan: "05"
subsystem: emails
tags: [react-email, html-export, supabase, email-templates, vml, outlook]
dependency_graph:
  requires: ["@genai/emails package (17-01)", "all 6 templates (17-03, 17-04)"]
  provides: ["6 production HTML files for Supabase Dashboard", "export script", "MANUAL-STEPS.md", "patch changeset"]
  affects: [apps/website/emails/dist, packages/emails/scripts, .changeset]
tech_stack:
  added: []
  patterns: ["@react-email/render for server-side HTML export", "VML bulletproof button via dangerouslySetInnerHTML", "gitignore negation for committed build artifacts"]
key_files:
  created:
    - packages/emails/scripts/export.ts
    - apps/website/emails/dist/confirm-signup.html
    - apps/website/emails/dist/recovery.html
    - apps/website/emails/dist/magic-link.html
    - apps/website/emails/dist/email-change.html
    - apps/website/emails/dist/reauth.html
    - apps/website/emails/dist/invite.html
    - apps/website/emails/dist/.gitkeep
    - .planning/phases/17-auth-extensions/MANUAL-STEPS.md
    - .changeset/phase-17-auth-emails.md
  modified:
    - packages/emails/src/components/EmailButton.tsx
    - .gitignore
decisions:
  - "EmailButton rewritten from @react-email/button@0.0.10 to hand-written VML via dangerouslySetInnerHTML — React 19 forwardRef incompatibility caused SSR crash; VML output is identical"
  - "reauth excluded from mso/VML check — OTP-only template has no button by design (17-04 decision)"
  - "apps/website/emails/dist/ negated in root .gitignore so HTML artifacts are committed as Supabase paste targets"
metrics:
  duration_minutes: 15
  completed_date: "2026-04-19"
  tasks_completed: 2
  tasks_total: 3
  files_created: 10
  files_modified: 2
---

# Phase 17 Plan 05: HTML Export + Handoff Summary

**One-liner:** Export script renders 6 React Email templates to production HTML, VML button rewritten for React 19 compat, MANUAL-STEPS.md gives Luca a zero-ambiguity Supabase Dashboard checklist.

---

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Write export script + generate 6 HTML files | 11edaed | scripts/export.ts, dist/*.html, EmailButton.tsx, .gitignore |
| 2 | Write MANUAL-STEPS.md and add changeset | 2c980b8 | MANUAL-STEPS.md, .changeset/phase-17-auth-emails.md |

---

## What Was Built

### `packages/emails/scripts/export.ts`
Export script that imports all 6 template components, calls `@react-email/render()` with `{ pretty: true }`, and writes HTML files to `apps/website/emails/dist/`. Reproducible via `pnpm -F @genai/emails run email:export`.

### `apps/website/emails/dist/*.html`
6 production-ready HTML files:
- `confirm-signup.html` — {{ .ConfirmationURL }}, {{ .Data.name }}
- `recovery.html` — {{ .ConfirmationURL }}, {{ .Data.name }}
- `magic-link.html` — {{ .ConfirmationURL }}, {{ .Data.name }}
- `email-change.html` — {{ .ConfirmationURL }}, {{ .Email }}
- `reauth.html` — {{ .Token }} (OTP only, no button)
- `invite.html` — {{ .ConfirmationURL }}, {{ .Data.inviter_name }}

All 6: dark-mode adaptive via `prefers-color-scheme: dark`, light/dark PNG logos, 9–10KB each.
5 button templates: VML roundrect bulletproof button for Outlook Desktop.

### `EmailButton.tsx` (fixed)
Replaced `@react-email/button@0.0.10` (React 19 SSR crash via forwardRef) with direct VML markup using `dangerouslySetInnerHTML`. Output is semantically equivalent: `<!--[if mso]><v:roundrect>...<![endif]-->` for Outlook + `<a>` for modern clients.

### `.planning/phases/17-auth-extensions/MANUAL-STEPS.md`
Copy-pasteable checklist with:
- 6-row table: Supabase field → local HTML file → exact Subject string
- Rate-limit table (30/h email, 30/h OTP, 150/5min refresh, 30/h anon)
- Smoke-test steps (Gmail Light/Dark, Apple Mail, Outlook Desktop)
- Outlook-VML-Fallback mechanism explanation
- Troubleshooting section for common paste-in issues

### `.changeset/phase-17-auth-emails.md`
Patch bump for `@genai/website` + `@genai/tools-app` documenting the React Email template unification.

---

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] @react-email/button@0.0.10 incompatible with React 19 SSR**
- **Found during:** Task 1 (first export run)
- **Issue:** `@react-email/button@0.0.10` uses `React.forwardRef` and passes `ref: forwardedRef` directly to `<a>` via `jsx-runtime`. React 19's SSR renderer interprets this as an invalid React element object child, triggering `"Objects are not valid as a React child"` and falling back to broken client rendering. The generated HTML contained error markup instead of email content.
- **Fix:** Rewrote `EmailButton.tsx` to emit VML markup directly via `dangerouslySetInnerHTML`. The `<!--[if mso]><v:roundrect>...<![endif]-->` pattern is functionally identical to what `@react-email/button@0.0.10` generated — Outlook Desktop sees the VML, all other clients see the `<a>` anchor. No change to visual output.
- **Files modified:** `packages/emails/src/components/EmailButton.tsx`
- **Commit:** 11edaed

**2. [Plan inconsistency noted] reauth VML check skipped — OTP-only by design**
- **Found during:** Task 1 verification
- **Issue:** Plan acceptance criteria require `mso` in all 6 HTMLs. `reauth.html` has no button (OTP code block only — 17-04 decision: no phishing vector for OTP flows).
- **Resolution:** VML check applied to 5 button templates only. Documented in MANUAL-STEPS.md notes section. `reauth.html` passes all other checks (dark mode, Supabase variables, > 2KB).

---

## Known Stubs

None. All Supabase Go-template variables are present in generated HTMLs and will be resolved by Supabase at send time.

---

## Checkpoint Status

**Task 3 (checkpoint:human-verify) is pending.** Luca needs to:
1. Push website to Vercel (so logo PNGs are reachable at generation-ai.org/brand/logos/)
2. Paste 6 HTMLs into Supabase Dashboard → Auth → Email Templates + set Subjects
3. Set Rate Limits to Supabase defaults
4. Run smoke-test (Password Reset email → Gmail + Apple Mail)
5. Reply "approved" to trigger SUMMARY finalization

See `.planning/phases/17-auth-extensions/MANUAL-STEPS.md` for exact steps.

---

## Self-Check: PASSED

Files exist:
- packages/emails/scripts/export.ts — FOUND
- apps/website/emails/dist/confirm-signup.html — FOUND
- apps/website/emails/dist/recovery.html — FOUND
- apps/website/emails/dist/magic-link.html — FOUND
- apps/website/emails/dist/email-change.html — FOUND
- apps/website/emails/dist/reauth.html — FOUND
- apps/website/emails/dist/invite.html — FOUND
- .planning/phases/17-auth-extensions/MANUAL-STEPS.md — FOUND
- .changeset/phase-17-auth-emails.md — FOUND

Commits exist:
- 11edaed (Task 1) — FOUND
- 2c980b8 (Task 2) — FOUND
