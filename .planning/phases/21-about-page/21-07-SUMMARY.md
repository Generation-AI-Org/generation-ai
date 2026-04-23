---
phase: 21
plan: 07
subsystem: website/about
tags: [ui, components, about, kontakt]
requires: []
provides: [AboutKontaktSection]
affects: [apps/website/components/about/]
tech-stack:
  added: []
  patterns: [divide-y-card, mailto-subject-free]
key-files:
  created:
    - apps/website/components/about/about-kontakt-section.tsx
  modified: []
key-decisions:
  - Mailto subject-frei (info@generation-ai.org) — unterscheidet sich vom Mitmach-CTA-Mailto (?subject=Mitmachen)
  - Single-Card mit divide-y statt 3 Sub-Cards (kompakter, UI-SPEC Zeile 270 lässt beides zu)
  - KEIN border-b auf Section (letzte Section vor Footer — Footer bringt eigenen Trenner)
requirements-completed: []
duration: 1 min
completed: 2026-04-24
---

# Phase 21 Plan 07: Kontakt Section Summary

Abschließende Kontakt-Section mit 3 Kontaktzeilen in Single-Card (divide-y): Allgemeine Anfragen (Mailto), Partnerschaften (/partner), Aktiv mitmachen (#mitmach).

- **Tasks:** 2 (Component + Build)
- **Files created:** 1

## Task Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | ed40a5f | AboutKontaktSection (3-row divide-y Card) |
| 2 | — | Build-Verify (tsc exit 0) |

## Deviations from Plan

None — plan executed exactly as written.

## Verification

- `pnpm --filter @genai/website tsc --noEmit` → exit 0
- id="kontakt" gesetzt
- 3 Zeilen-Labels verbatim (Allgemeine Anfragen, Partnerschaften, Aktiv mitmachen)
- 3 Ziele: `mailto:info@generation-ai.org` (subject-frei), `href="/partner"`, `href="#mitmach"`
- 3 Value-Labels mit Pfeil: "Zur Partner-Seite →", "Zum Mitmach-Aufruf →", email-address plain
- Card: `rounded-2xl border border-border bg-bg-card divide-y divide-border`
- Keine `border-b`-Klasse auf Section (strict check mit `\bborder-b\b` → leer)

## Issues Encountered

None.

## Next Phase Readiness

Wave 2 complete. Ready for 21-08 (Route-Mount + Metadata + Playwright-Smoke).
