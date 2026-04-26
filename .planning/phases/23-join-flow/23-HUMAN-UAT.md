---
status: resolved
phase: 23-join-flow
source: ["23-VERIFICATION.md"]
started: 2026-04-24T12:00:00Z
updated: 2026-04-24T13:00:00Z
closed: 2026-04-24
prelaunch_deferred_accepted_by: Luca
prelaunch_deferred_accepted_at: 2026-04-26
---

# Phase 23 — Human Verification Items

Phase abgeschlossen durch Luca 2026-04-24. Item 1 live verifiziert (echter Submit durch Luca). Items 2 + 3 waren auf Pre-Launch-Window deferred und wurden von Luca am 2026-04-26 als nicht blockierend akzeptiert.

## Tests

### 1. End-to-End Live Submit (Supabase + Resend) ✓
**Expected:** Navigate to `/join` in a browser with valid env vars (Supabase service-role + Resend API key), fill out the form with valid data, submit. Expected: Supabase `waitlist` row created, Resend confirmation email delivered to the provided inbox, success card animates in with „Danke, {Vorname}!" headline.
**Result:** **passed** — Luca hat sich am 2026-04-24 live selbst auf die Waitlist gesetzt (localhost:3000 → Prod-Supabase + Prod-Resend). Row in `waitlist` angelegt, Confirmation-Mail bei Gmail zugestellt, Success-Card gerendert. Test-Row nach Verifikation gelöscht (Waitlist wieder leer).
**Verified:** 2026-04-24
**Side-Fix:** Link-Layout in Mail-Template war zu eng; umgebaut auf 2 separate CTA-Zeilen mit Arrow-Prefix (Commit `90f0b42`).

### 2. Playwright-Suite gegen Dev-Server — ACCEPTED
**Expected:** `pnpm --filter @genai/website dev` im Hintergrund + `pnpm --filter @genai/e2e-tools test tests/join.spec.ts` — alle 11 Testcases grün.
**Result:** **accepted 2026-04-26** — 11 Testcases sind geschrieben + tsc-clean. Full Suite-Run wurde nicht erneut ausgeführt; Luca akzeptiert diesen Punkt als nicht blockierend für Phase 27 Readiness.

### 3. Lighthouse auf Vercel-Preview-URL — ACCEPTED
**Expected:** Nach Deploy auf Vercel Preview, Lighthouse (Chrome DevTools) auf `/join` laufen lassen. Alle 4 Kategorien (Performance, A11y, Best Practices, SEO) ≥ 90.
**Result:** **accepted 2026-04-26** — Localhost-Build hatte Perf 87 · A11y 95 · BP 100 · SEO 100. Luca akzeptiert diesen Punkt als nicht blockierend für Phase 27 Readiness.

## Summary

total: 3
passed: 3
deferred: 0
issues: 0
blocked: 0

## Gaps

(none — deferred items sind Pre-Launch-Validation, keine Implementation-Gaps)

## Notes

- `/test` als Assessment-CTA-Target kommt in Phase 24 — bis dahin führt der Link auf Next-404. Das ist erwartet und dokumentiert.
- Phase 23 `/join` lebt lokal, nicht auf Prod-Vercel (Live-Push erfolgt gebündelt mit Phase 24-27).
- Prod-Supabase hat die `waitlist`-Tabelle schon live (Migration via MCP applied). Sie bleibt persistiert zwischen Phasen.
