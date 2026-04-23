---
phase: 21-about-page
fixed_at: 2026-04-24T00:00:00Z
review_path: .planning/phases/21-about-page/21-REVIEW.md
iteration: 1
findings_in_scope: 3
fixed: 3
skipped: 0
status: all_fixed
---

# Phase 21: Code Review Fix Report

**Fixed at:** 2026-04-24
**Source review:** `.planning/phases/21-about-page/21-REVIEW.md`
**Iteration:** 1

**Summary:**
- Findings in scope (Critical + Warning): 3
- Fixed: 3
- Skipped: 0

Info-Items (IN-01 bis IN-07) waren per Scope `critical_warning` ausgeschlossen und wurden nicht bearbeitet.

## Fixed Issues

### WR-01: PlaceholderAvatar kann bei degenerierten Namens-Strings crashen

**Files modified:** `apps/website/components/about/placeholder-avatar.tsx`
**Commit:** `e245bf3`
**Applied fix:** `getInitials()` filtert Leerstrings aus der Split-Tokenisierung raus und guardet den Two-Letter-Pfad gegen `undefined`. Bei Zero-Width-Tokens, leading/trailing Whitespace oder Format-Varianten wie `"A."` fällt die Funktion jetzt sauber auf den Single-Token-Pfad bzw. den `"?"`-Fallback zurück, statt `TypeError: undefined.toUpperCase()` zu werfen. Tier-2-Verifikation: `pnpm --filter @genai/website lint` grün (0 errors), `tsc --noEmit` grün.

### WR-02: Statische Section-Heading-IDs — Embed-Risiko ab Phase 22/27

**Files modified:** `.planning/phases/21-about-page/21-VERIFICATION.md`
**Commit:** `8f7ff3b`
**Applied fix:** Per REVIEW-Anweisung ("Phase 21: akzeptabel, nicht blockend. Follow-up für Phase 27") als Known-Limitation in `21-VERIFICATION.md` dokumentiert. Kein Code-Change — die statischen IDs sind für Single-Mount `/about` aktuell korrekt. Neuer Abschnitt "Known Limitations (Follow-ups)" verweist explizit auf Phase 22 (Partner-Page) und Phase 27 als Risikofenster und nennt `useId()` / Consumer-Prop als Fix-Pattern.

### WR-03: FAQ-Sync-Contract nur per Kommentar dokumentiert — kein maschineller Check

**Files modified:**
- `apps/website/components/faq/shared-faq-answers.ts` (neu)
- `apps/website/components/about/faq-data.ts`
- `apps/website/components/sections/kurz-faq-section.tsx`

**Commit:** `369d436`
**Applied fix:** REVIEW-Variante (a) umgesetzt. Neues Modul `components/faq/shared-faq-answers.ts` exportiert `SHARED_FAQ_ANSWERS` mit den 4 überlappenden Answer-Strings als benannte Konstanten (`kosten`, `vorwissen`, `uni`, `zeit`). Beide Consumer — `about/faq-data.ts` (Items 3, 5, 6, 7) und `sections/kurz-faq-section.tsx` (Items 1-4) — referenzieren jetzt die Shared-Source statt Inline-Strings. Copy-Drift zwischen Landing und About ist damit strukturell unmöglich, Edit an genau einer Stelle zieht beide Seiten mit. Frage-Wordings bleiben bewusst unterschiedlich (SPEC-konform). Tier-2-Verifikation: Lint + `tsc --noEmit` grün.

## Skipped Issues

Keine.

---

_Fixed: 2026-04-24_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
