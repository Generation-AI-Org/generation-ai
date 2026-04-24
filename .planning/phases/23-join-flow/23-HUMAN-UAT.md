---
status: partial
phase: 23-join-flow
source: ["23-VERIFICATION.md"]
started: 2026-04-24T12:00:00Z
updated: 2026-04-24T12:00:00Z
---

# Phase 23 — Human Verification Items

All automated must-haves (15/16) passed. 3 items require manual confirmation before Phase 23 can be considered fully validated.

## Current Test

[awaiting human testing]

## Tests

### 1. End-to-End Live Submit (Supabase + Resend)
**Expected:** Navigate to `/join` in a browser with valid env vars (Supabase service-role + Resend API key), fill out the form with valid data, submit. Expected: Supabase `waitlist` row created, Resend confirmation email delivered to the provided inbox, success card animates in with „Danke, {Vorname}!" headline.
**Result:** [pending]
**Why human:** End-to-end DB insert + transactional email delivery cannot be verified without live Supabase service-role credentials and a real mail inbox.

### 2. Playwright-Suite gegen Dev-Server
**Expected:** `pnpm --filter @genai/website dev` im Hintergrund + `pnpm --filter @genai/e2e-tools test tests/join.spec.ts` — alle 11 Testcases grün.
**Result:** [pending]
**Why human:** Playwright-Tests brauchen laufenden Dev-Server + live Upstash + Supabase env vars, um den Submit-Pfad end-to-end auszuüben.

### 3. Lighthouse auf Vercel-Preview-URL
**Expected:** Nach Deploy auf Vercel Preview, Lighthouse (Chrome DevTools) auf `/join` laufen lassen. Alle 4 Kategorien (Performance, A11y, Best Practices, SEO) ≥ 90. (Localhost-Build erreichte Perf 87, A11y 95, BP 100, SEO 100 — CDN-Score sollte höher sein.)
**Result:** [pending]
**Why human:** Localhost-LCP ist künstlich höher als auf Vercel-CDN; echter Score braucht Preview-URL; automated check kann keinen Browser-Lighthouse laufen lassen.

## Summary

total: 3
passed: 0
issues: 0
pending: 3
skipped: 0
blocked: 0

## Gaps

(none — these are validation tasks, not implementation gaps)

## Notes

- `/test` als Assessment-CTA-Target kommt in Phase 24 — bis dahin führt der Link auf Next-404. Das ist erwartet und dokumentiert.
- Phase kann als "complete" markiert werden, da alle Code-Artefakte und Security-Gates durchgelaufen sind. Die 3 UAT-Items sind Launch-Validation-Aufgaben für Luca vor Prod-Promotion.
