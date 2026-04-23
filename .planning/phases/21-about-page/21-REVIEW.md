---
phase: 21-about-page
reviewed: 2026-04-24T00:00:00Z
depth: standard
files_reviewed: 17
files_reviewed_list:
  - apps/website/app/about/page.tsx
  - apps/website/app/sitemap.ts
  - apps/website/components/about-client.tsx
  - apps/website/components/about/about-faq-section.tsx
  - apps/website/components/about/about-final-cta-section.tsx
  - apps/website/components/about/about-hero-section.tsx
  - apps/website/components/about/about-kontakt-section.tsx
  - apps/website/components/about/about-mitmach-cta-section.tsx
  - apps/website/components/about/about-story-section.tsx
  - apps/website/components/about/about-team-section.tsx
  - apps/website/components/about/about-values-section.tsx
  - apps/website/components/about/about-verein-section.tsx
  - apps/website/components/about/faq-data.ts
  - apps/website/components/about/founder-card.tsx
  - apps/website/components/about/placeholder-avatar.tsx
  - apps/website/components/about/team-data.ts
  - apps/website/components/about/team-member-card.tsx
  - packages/e2e-tools/tests/about.spec.ts
findings:
  critical: 0
  warning: 3
  info: 7
  total: 10
status: issues_found
---

# Phase 21: Code Review Report

**Reviewed:** 2026-04-24
**Depth:** standard
**Files Reviewed:** 17
**Status:** issues_found

## Summary

Die `/about`-Route ist sauber aufgebaut, folgt dem Landing-Blueprint (home-client, kurz-faq-section, final-cta-section) und respektiert den CSP/Nonce-Kontrakt aus LEARNINGS.md (`await headers()` in Server-Component, `MotionConfig nonce` im Client-Wrapper). Keine Security-Issues, kein Prompt-Injection-Risiko, keine hardcoded Secrets.

Gefundene Themen:

- **3 Warnings** — betreffen Robustheit / A11y-Edge-Cases (Placeholder-Avatar bei degenerierten Strings, statische Section-Heading-IDs, fehlende FAQ-Sync-Verifikation).
- **7 Info-Items** — Code-Duplizierung von `fadeIn`- und Eyebrow-Markup über 9 Sections, Copy-Drift-Risiko zwischen `faq-data.ts` und `kurz-faq-section.tsx`, kleinere Style-Inkonsistenzen.

**Keine blockenden Bugs.** Die Seite ist aus Review-Sicht deploy-ready.

**Positive Findings (zum Kontext, nicht gemeldet):**

- CSP/Nonce-Flow korrekt: `await headers()` in `app/about/page.tsx` erzwingt dynamic rendering, `nonce` fließt an `<MotionConfig nonce>` weiter — LEARNINGS.md-konform.
- `rel="noopener noreferrer"` auf External-LinkedIn-Link in `founder-card.tsx` ist gesetzt (Clickjacking-Schutz).
- `faq-data.ts` nutzt saubere discriminated union (`kind: "text" | "link"`) — typesicher, kein `any`.
- `prefers-reduced-motion` in allen 9 Sections konsistent gegatet.
- `useId()` in FAQ-Panels vermeidet ID-Kollisionen bei Multi-Mount.
- E2E-Test-Suite deckt alle 9 Sections, Deep-Linking-Anker, Meta-Tags, FAQ-Accordion-Mechanik, Nav, Skip-Link und CSP-Regression ab.

## Warnings

### WR-01: PlaceholderAvatar kann bei degenerierten Namens-Strings crashen

**File:** `apps/website/components/about/placeholder-avatar.tsx:22-31`
**Issue:** `getInitials()` greift auf `tokens[0][0]` und `tokens[1][0]` ohne Existenz-Check zu. `.trim()` fängt reine Whitespace-Strings ab, aber `split(/\s+/)` kann bei führenden/trailing Whitespaces oder Zero-Width-Chars Leere-Strings als Tokens liefern — dann ist `tokens[0][0]` gleich `undefined` und `.toUpperCase()` wirft. Risiko konkret wenn Luca in Phase 27 echte Namen einpflegt (Emoji-Flags, Non-BMP-Chars, Format-Varianten wie `"A."`).
**Fix:**
```ts
function getInitials(name: string): string {
  const trimmed = name.trim()
  if (!trimmed) return "?"
  const tokens = trimmed.split(/\s+/).filter(Boolean)
  if (tokens.length === 0) return "?"
  if (tokens.length >= 2 && tokens[0][0] && tokens[1][0]) {
    return (tokens[0][0] + tokens[1][0]).toUpperCase()
  }
  const first = tokens[0] ?? ""
  return first.slice(0, 2).toUpperCase() || "?"
}
```

### WR-02: Statische Section-Heading-IDs — Embed-Risiko ab Phase 22/27

**File:** `apps/website/components/about/about-hero-section.tsx:59`, `about-story-section.tsx:61`, `about-team-section.tsx:65`, `about-values-section.tsx:80`, `about-verein-section.tsx:57`, `about-mitmach-cta-section.tsx:49`, `about-faq-section.tsx:94`, `about-final-cta-section.tsx:41`, `about-kontakt-section.tsx:60`
**Issue:** Alle Section-Heads setzen feste DOM-IDs (`id="about-hero-heading"`, `id="about-story-heading"` usw.). Aktuell unkritisch (Single-Mount /about). Wenn About-Inhalte in Phase 22 (Partner-Page) oder Phase 27 teil-eingebettet werden, produzieren die statischen IDs Duplikate → ungültiges HTML → `aria-labelledby` zeigt auf das erste Element → Screen-Reader springt falsch. FAQ-Panels nutzen bereits `useId()` als Best Practice — Section-Heads sollten das ebenfalls nutzen.
**Fix:** Phase 21: akzeptabel, nicht blockend. Follow-up für Phase 27: Section-Heading-IDs via `useId()` oder Consumer-Prop. Known-Limitation in `21-VERIFICATION.md` vermerken.

### WR-03: FAQ-Sync-Contract nur per Kommentar dokumentiert — kein maschineller Check

**File:** `apps/website/components/about/faq-data.ts:3-7, 51, 68, 77, 86`
**Issue:** Die Datei deklariert: Fragen 3, 5, 6, 7 sollen 1:1-identisch zur Kurz-FAQ auf der Landing (`components/sections/kurz-faq-section.tsx`) sein. Das ist reine Konvention. Beim Copy-Edit auf einer der beiden Seiten kommt es zu stillem Drift — User sehen unterschiedliche Antworten je nach Einstiegsseite. Der E2E-Test in `about.spec.ts` deckt das nicht ab, und `kurz-faq-section.tsx` hält die Copy ebenfalls inline. Konkretes Regressions-Risiko beim Phase-27-Copy-Pass.
**Fix:** Entweder (a) Shared-Source extrahieren, z. B. `components/faq/shared-faq-items.ts` mit den 4 überlappenden Fragen als exportierte Konstanten, die beide Files importieren. Oder (b) E2E-Test, der die Answer-Texte auf beiden Seiten holt und mit `toEqual` vergleicht. Variante (a) ist sauberer, Aufwand ~10 min.

## Info

### IN-01: `fadeIn`-Motion-Objekt 9× wortwörtlich dupliziert

**File:** Alle `about-*-section.tsx` (jeweils ca. Zeilen 20-36) — Hero, Story, Team, Values, Verein, Mitmach, FAQ, FinalCTA, Kontakt.
**Issue:** Der identische `const fadeIn = prefersReducedMotion ? {} : { initial: ..., whileInView: ..., viewport: ..., transition: ... }`-Block steht in allen 9 Sections exakt gleich. Motion-Parameter ändern = 9 parallele Edits. DRY macht hier Sinn, weil die Intent eindeutig und die Duplikation exakt ist.
**Fix:** In `components/about/use-about-fade-in.ts` extrahieren:
```ts
import { useReducedMotion } from "motion/react"

export function useAboutFadeIn() {
  const prefersReducedMotion = useReducedMotion()
  return prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 16 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-10% 0px" },
        transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
      }
}
```
Aufwand ~5 min.

### IN-02: Eyebrow-Markup (Bullet-Dot + Mono-Text) 7× dupliziert

**File:** `about-hero-section.tsx:41-54`, `about-story-section.tsx:42-56`, `about-team-section.tsx:47-60`, `about-values-section.tsx:62-75`, `about-verein-section.tsx:38-52`, `about-faq-section.tsx:76-89`, `about-kontakt-section.tsx:42-55`
**Issue:** Der `motion.div` mit Bullet + Mono-Eyebrow-Label steht 7× identisch, inklusive Inline-Style `boxShadow: "0 0 8px var(--accent-glow)"`. Eine Design-Änderung = 7 Files anfassen.
**Fix:** `<AboutEyebrow text="// unsere story" />` Component extrahieren. Spart Dominoeffekt bei späteren Phasen (22, 27).

### IN-03: `mailto:`-Subject-Param nicht URL-encoded

**File:** `apps/website/components/about/about-mitmach-cta-section.tsx:68`
**Issue:** `href="mailto:info@generation-ai.org?subject=Mitmachen"` — Subject ist momentan simples ASCII, funktioniert. Wenn der Subject-Text später ergänzt wird (Leerzeichen, Umlaute, Satzzeichen), parsen manche Mail-Clients (älterer Outlook, manche Android-Clients) das fehlerhaft.
**Fix:** Vorsorglich encodieren:
```tsx
const MITMACH_MAILTO = `mailto:info@generation-ai.org?subject=${encodeURIComponent("Mitmachen")}`
```
Aufwand 2 min, nicht blockend.

### IN-04: Inkonsistentes `prefetch`-Flag auf internen Links

**File:**
- Kein `prefetch`: `about-story-section.tsx:93` (Anker `#mitmach`), `about-kontakt-section.tsx:104-106` (Anker `#mitmach`), `about-final-cta-section.tsx:86-88` (Anker `#mitmach`)
- `prefetch={false}`: `about-final-cta-section.tsx:60` (`/join`), `about-kontakt-section.tsx:90-92` (`/partner`)

**Issue:** Same-page-Anker-Links triggern bei Next.js `Link` sowieso keinen Prefetch — technisch kein Bug. Aber die Inkonsistenz macht Wartung schwieriger (warum mal mit, mal ohne?).
**Fix:** Konvention festlegen: entweder überall `prefetch={false}` oder nur auf echten Routen. Kommentar-Zeile erklärt's.

### IN-05: Alle 10 Member-Kacheln haben identische Initialen „MI"

**File:** `apps/website/components/about/team-data.ts:38-49`
**Issue:** Die Platzhalter-Namen "Mitglied 1" bis "Mitglied 10" geben alle die Initialen "MI" — die Team-Grid sieht im Render visuell flach aus (10× identisches Kästchen). Funktional korrekt, aber in Screenshots für Stakeholder potenziell als "kaputt" interpretiert.
**Fix:** Bis Phase-27-Copy-Pass temporär unterschiedliche Platzhalter-Namen ("Anna B.", "Ben K.", "Chris L.", …), die verschiedene Initialen erzeugen. Alternativ sofort finale Namen einpflegen sobald verfügbar.

### IN-06: `prefetch={false}` auf `/partner` muss bei Phase-22-Launch entfernt werden

**File:** `apps/website/components/about/about-final-cta-section.tsx:61`, `about-kontakt-section.tsx:92`
**Issue:** `/partner` ist Phase 22 — noch nicht existent. `prefetch={false}` verhindert aktuell 404-Spam in Logs. Bei Live-Gang der Partner-Page sollte das Flag entfernt werden, damit Users schnelle Navigation bekommen.
**Fix:** Kommentar direkt am Link: `// prefetch={false} bis Phase 22 /partner live ist — danach entfernen`. TODO in `.planning/STATE.md` bzw. Phase-22-PLAN-Depedencies aufnehmen.

### IN-07: Kein konkreter Bug — Doku-Hinweis für Visual-Audit

**File:** `apps/website/components/about/about-hero-section.tsx:35, 59` und alle weiteren `<section aria-labelledby=...>`-Kombinationen
**Issue:** Das Pattern `<section aria-labelledby="…">` + `<motion.h1 id="…">` ist korrekt. Da alle Sections Client-Components sind, gibt's keinen SSR-Hydration-Mismatch. Nur als Known-Good für den Phase-27-Screen-Reader-Visual-Audit notiert — nichts zu fixen.
**Fix:** Keine Änderung. In `21-VERIFICATION.md` als verifiziert markieren.

---

_Reviewed: 2026-04-24_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
