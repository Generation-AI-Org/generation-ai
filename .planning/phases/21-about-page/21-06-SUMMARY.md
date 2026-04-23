---
phase: 21
plan: 06
subsystem: website/about
tags: [ui, components, about, faq, accordion, a11y]
requires: []
provides: [AboutFaqSection, faqs, FaqItem, FaqAnswerNode]
affects: [apps/website/components/about/]
tech-stack:
  added: []
  patterns: [accordion-multi-open, aria-expanded-controls, animate-presence-height, sync-locked-copy]
key-files:
  created:
    - apps/website/components/about/faq-data.ts
    - apps/website/components/about/about-faq-section.tsx
  modified: []
key-decisions:
  - Accordion-Mechanik 1:1 kopiert aus kurz-faq-section.tsx (Plan 20.6-09). Extraction nach packages/ui ist Phase-27-Cleanup, zu früh jetzt
  - answerNodes als FaqAnswerNode[] (tagged union text|link) erlaubt inline-Links ohne dangerouslySetInnerHTML
  - 4 Answer-Strings (Q3/5/6/7) sind sync-gelockt mit kurz-faq-section.tsx — Maintenance-Invariante
  - id="faq" LOAD-BEARING: Target vom Landing-Kurz-FAQ-Footer-Link
requirements-completed: []
duration: 2 min
completed: 2026-04-24
---

# Phase 21 Plan 06: 10-Fragen FAQ Accordion Summary

10-Fragen-Accordion mit Multi-Open-State, `#faq`-Anker load-bearing. 4 Fragen sync-gelockt zum Landing-Kurz-FAQ (identische Answer-Copy). Inline-Anker-Links in Q8/9/10 zu `#team`, `#verein`, `#mitmach`.

- **Tasks:** 3 (faq-data + AboutFaqSection + Build/Sync-Check)
- **Files created:** 2

## Task Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | c2d2e3c | faq-data.ts (10 Items, tagged union AnswerNode, sync-comments) |
| 2 | 42d9519 | AboutFaqSection (Accordion-Mechanik + AnswerNode-Renderer) |
| 3 | — | Build-Verify + Sync-Check (alle 4 Sync-Strings OK) |

## Deviations from Plan

None — plan executed exactly as written.

## Verification

- `pnpm --filter @genai/website tsc --noEmit` → exit 0
- faq-data: 10 Items, 10 `q:`-Starts, 10 `^  {`-Objekt-Anfänge; 3 `a(` Inline-Links (Q8/9/10 → #team, #verein, #mitmach)
- Section: id="faq" gesetzt, Eyebrow/H2 verbatim, `useState<Set<number>>` Multi-Open, 4 aria-Attribute (aria-expanded + aria-controls), role="region", AnimatePresence + useReducedMotion, Plus→Cross Rotate, Index-Label Logic für 10+
- Sync-Check: alle 4 Phrasen beidseitig present in kurz-faq-section.tsx UND faq-data.ts (SYNC OK für alle 4)
- Kein Footer-Link "Mehr Fragen" (self-referential weggelassen)
- 3 `AnswerNode`-Referenzen (Component-Def + 2 usages inkl. map)

## Issues Encountered

None.

## Next Phase Readiness

Ready for 21-07 (Kontakt) und 21-08 (Route-Mount + Playwright-Smoke).
