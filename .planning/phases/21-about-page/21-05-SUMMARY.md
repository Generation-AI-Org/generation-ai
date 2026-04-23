---
phase: 21
plan: 05
subsystem: website/about
tags: [ui, components, about, cta, mailto]
requires: []
provides: [AboutMitmachCTASection, AboutFinalCTASection]
affects: [apps/website/components/about/]
tech-stack:
  added: []
  patterns: [hero-parity-pill, mailto-cta, ds-tokens]
key-files:
  created:
    - apps/website/components/about/about-mitmach-cta-section.tsx
    - apps/website/components/about/about-final-cta-section.tsx
  modified: []
key-decisions:
  - Primary-Pill-Classes 1:1 aus final-cta-section.tsx übernommen (duration-300, cubic-bezier, background via style) — Hero-Parity wichtiger als DS-Token-Purity
  - Mitmach-CTA als plain <a href="mailto:"> (next/link wirft bei mailto Warnung)
  - Secondary-Zeile mit Middle-Dot-Trenner (Unicode ·), KEIN Popover/Card (UI-SPEC Zeile 255)
  - id="mitmach" auf Mitmach-Section (load-bearing für 4+ andere Plans)
requirements-completed: []
duration: 2 min
completed: 2026-04-24
---

# Phase 21 Plan 05: Mitmach-CTA + Abschluss-CTA Sections Summary

Zwei Client-Components: Mitmach-CTA mit Mailto-Button (`id="mitmach"` load-bearing) und Abschluss-CTA mit Primary /join-Pill plus Secondary-Zeile (Partner + Mitmach Text-Links).

- **Tasks:** 4 (Pattern-Review + Mitmach + Final + Build)
- **Files created:** 2

## Task Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | — | Primary-Pill-Pattern Review aus final-cta-section.tsx |
| 2 | d870300 | AboutMitmachCTASection (mailto + id="mitmach") |
| 3 | c2e675a | AboutFinalCTASection (Primary /join + 2 Secondary-Links) |
| 4 | — | Build-Verify (tsc exit 0) |

## Deviations from Plan

None — plan explicitly permitted "use actual classes from final-cta-section.tsx" which differs slightly from prescribed plan-text classes (duration-300 statt duration-[var(--dur-normal)], background via style). Applied as Plan-permitted Alternative.

## Verification

- `pnpm --filter @genai/website tsc --noEmit` → exit 0
- Mitmach: id="mitmach" gesetzt, mailto verbatim (`info@generation-ai.org?subject=Mitmachen`), H2 verbatim, CTA-Label "Melde dich"
- Final: H2 verbatim, Primary `/join` mit `prefetch={false}`, 2 Secondary-Links ("→ Partner werden" zu /partner, "→ Aktiv mitmachen" zu #mitmach), Middle-Dot als aria-hidden span, prefetch={false} auf beiden `Link`-Komponenten
- Kein `<Popover>`-Komponent oder `<dialog>`-Tag im aktiven Code (nur im Kommentar als "KEIN Popover"-Regel erwähnt)
- Beide H2 nutzen `--fs-h2` (visueller Peak, nicht `--fs-h3` wie Story/Team/Werte/Verein)

## Issues Encountered

None. /partner wird von Phase 22 geliefert — 404 bis dahin ist acceptable per Plan-Notes.

## Next Phase Readiness

Ready for 21-06 (FAQ-Accordion) und 21-07 (Kontakt).
