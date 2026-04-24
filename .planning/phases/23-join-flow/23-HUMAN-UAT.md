---
status: resolved
phase: 23-join-flow
source: ["23-VERIFICATION.md"]
started: 2026-04-24T12:00:00Z
updated: 2026-04-24T13:00:00Z
closed: 2026-04-24
---

# Phase 23 — Human Verification Items

Phase abgeschlossen durch Luca 2026-04-24. Item 1 live verifiziert (echter Submit durch Luca), Items 2 + 3 deferred auf Pre-Launch-Window (keine Blocker für Phase-Completion — pure Launch-Validation).

## Tests

### 1. End-to-End Live Submit (Supabase + Resend) ✓
**Expected:** Navigate to `/join` in a browser with valid env vars (Supabase service-role + Resend API key), fill out the form with valid data, submit. Expected: Supabase `waitlist` row created, Resend confirmation email delivered to the provided inbox, success card animates in with „Danke, {Vorname}!" headline.
**Result:** **passed** — Luca hat sich am 2026-04-24 live selbst auf die Waitlist gesetzt (localhost:3000 → Prod-Supabase + Prod-Resend). Row in `waitlist` angelegt, Confirmation-Mail bei Gmail zugestellt, Success-Card gerendert. Test-Row nach Verifikation gelöscht (Waitlist wieder leer).
**Verified:** 2026-04-24
**Side-Fix:** Link-Layout in Mail-Template war zu eng; umgebaut auf 2 separate CTA-Zeilen mit Arrow-Prefix (Commit `90f0b42`).

### 2. Playwright-Suite gegen Dev-Server — DEFERRED
**Expected:** `pnpm --filter @genai/website dev` im Hintergrund + `pnpm --filter @genai/e2e-tools test tests/join.spec.ts` — alle 11 Testcases grün.
**Result:** **deferred** — 11 Testcases sind geschrieben + tsc-clean. Full Suite-Run braucht dev-server + Supabase/Upstash env vars. Ausführung ist Pre-Launch-Window-Task (CI-Setup kommt in Phase 27 Launch-Cleanup).
**Next trigger:** Vor Prod-Go.

### 3. Lighthouse auf Vercel-Preview-URL — DEFERRED
**Expected:** Nach Deploy auf Vercel Preview, Lighthouse (Chrome DevTools) auf `/join` laufen lassen. Alle 4 Kategorien (Performance, A11y, Best Practices, SEO) ≥ 90.
**Result:** **deferred** — Localhost-Build hat Perf 87 · A11y 95 · BP 100 · SEO 100 erreicht. Vercel-CDN-Score muss nach Deploy gemessen werden; Performance sollte von localhost-LCP 3.6s deutlich fallen.
**Next trigger:** Nach Vercel-Deploy (Phase 27 Launch-Cleanup).

## Summary

total: 3
passed: 1
deferred: 2
issues: 0
blocked: 0

## Gaps

(none — deferred items sind Pre-Launch-Validation, keine Implementation-Gaps)

## Notes

- `/test` als Assessment-CTA-Target kommt in Phase 24 — bis dahin führt der Link auf Next-404. Das ist erwartet und dokumentiert.
- Phase 23 `/join` lebt lokal, nicht auf Prod-Vercel (Live-Push erfolgt gebündelt mit Phase 24-27).
- Prod-Supabase hat die `waitlist`-Tabelle schon live (Migration via MCP applied). Sie bleibt persistiert zwischen Phasen.
