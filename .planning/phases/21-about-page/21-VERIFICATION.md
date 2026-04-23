---
status: human_needed
phase: 21-about-page
date: 2026-04-24
plans_verified: [21-01, 21-02, 21-03, 21-04, 21-05, 21-06, 21-07, 21-08]
requirements_checked: [R2.1, R2.2, R2.3, R2.4, R2.5, R2.6]
automated_checks_passed: true
---

# Phase 21 — /about Page — Verification Report

## Executive Summary

Alle 8 Pläne erfolgreich executed, alle automatisierten Checks (TypeScript, Lint, Build, Playwright 10/10) grün. Die Must-Haves aus den Plans sind implementiert und grep-verifiziert. Die ROADMAP-Goal-Checks (Gründer/Member gelistet, Nav-Link, Mobile-Responsive) sind automatisiert abgedeckt.

**Status: `human_needed`** — automatisierte Abdeckung vollständig, aber:
- R2.4 (Sparringspartner + Beirat) wurde in der Plan-Phase bewusst descoped (nicht in UI-SPEC enthalten). Luca muss entscheiden ob das als Gap zählt oder als aufgeschoben akzeptiert wird.
- Visueller Review der 9 Sections (Typo-Rhythmus, Copy-Feel, Section-Breathing) ist nur durch menschliche UAT verifizierbar.
- Team-Member-Placeholder-Namen (Mitglied 1-10) und Platzhalter-Nachnamen (Meister/Becker) sind Design-Intent per D-05/D-06, sollten aber durch Luca bestätigt werden.

## Must-Haves Verification (per Plan)

### Plan 21-01 — Team Sub-Components
- [x] 3 Files unter `apps/website/components/about/` erstellt
- [x] Alle Server Components (keine `'use client'` Directive)
- [x] DS-Token-Nutzung (bg-bg-card, bg-bg-elevated, border-border, border-accent, text-text*, font-mono, font-sans)
- [x] LinkedIn-Icon conditional gerendert (D-06), target=_blank + rel=noopener noreferrer
- [x] aria-label auf PlaceholderAvatar-Wrapper
- [x] TypeScript + Lint grün
- [~] Deviation: Inline-SVG-LinkedIn-Glyph statt lucide-react-Icon (Package-Version zu alt — Plan-permitted Alternative)

### Plan 21-02 — Hero + Story Sections
- [x] Beide Section-Files existieren
- [x] H1 "Warum es uns gibt." mit --fs-h1
- [x] Display-Claim "We shape talent for an AI-native future." mit --fs-h2 (UI-SPEC-Flag-Fix, kein neuer 28-36px-Size)
- [x] Story: id="story" Anker, 3 Absätze verbatim, Inline-CTA → #mitmach
- [x] Alle Section-Heads semantisch h2 (kein h3 im DOM für Section-Heads)
- [x] useReducedMotion-Gate auf motion-Komponenten

### Plan 21-03 — Team Section
- [x] AboutTeamSection komponiert FounderCard + TeamMemberCard
- [x] team-data.ts: 2 Founders + 10 Members, linkedinUrl=undefined auf Founders (D-06)
- [x] Anker id="team" für Deep-Link
- [x] Responsive Grids: Founders 1→2 cols, Members 1→2→4 cols
- [x] Copy 1:1 aus UI-SPEC (Eyebrow, H2, Sub-Zeile mit echtem · Unicode)
- [x] Container max-w-5xl (Team-Exception zur Standard-3xl)

### Plan 21-04 — Values + Verein Sections
- [x] 4 Werte-Blöcke vollständig mit verbatim-Copy (Umlaute korrekt)
- [x] Werte-Grid 2×2 Desktop, Stack Mobile
- [x] Verein-Card mit Accent-Hairline oben (2px, opacity 0.6, var(--accent))
- [x] Anker id="werte" und id="verein" (D-09 load-bearing)
- [x] Heading-Struktur: H2 Section-Head, H3 für Werte-Sub-Items (valide)

### Plan 21-05 — Mitmach + Final CTA Sections
- [x] id="mitmach" load-bearing gesetzt (Target für Story/Final/Kontakt/FAQ)
- [x] Mailto exakt: `mailto:info@generation-ai.org?subject=Mitmachen`
- [x] Primary-Pill-Classes 1:1 aus final-cta-section.tsx (Hero-Parity)
- [x] Final-CTA: Primary /join + Secondary-Zeile (→ Partner werden · → Aktiv mitmachen)
- [x] KEIN Popover, KEINE Card-UI für Secondary (UI-SPEC explicit)
- [x] prefetch={false} auf internen Links

### Plan 21-06 — FAQ Accordion
- [x] 10 Fragen in faq-data.ts, 4 Answer-Strings SYNC-OK zu kurz-faq-section.tsx
- [x] AboutFaqSection mit Multi-Open Set<number>-State (D-03)
- [x] aria-expanded/aria-controls/role=region Pairing
- [x] Plus→Cross Rotation, AnimatePresence height:0→auto, useReducedMotion-Gate
- [x] id="faq" LOAD-BEARING (Target vom Landing-Kurz-FAQ-Footer-Link)
- [x] Inline-Links in Q8/9/10 → #team, #verein, #mitmach
- [x] Index-Label `// 01`..`// 10` mit Zero-Padding-Logic
- [x] Kein Footer-Link "Mehr Fragen" (self-referential)

### Plan 21-07 — Kontakt Section
- [x] id="kontakt" Anker gesetzt
- [x] 3 Zeilen-Labels verbatim aus UI-SPEC (Allgemeine Anfragen, Partnerschaften, Aktiv mitmachen)
- [x] 3 Targets: Mailto (subject-frei), /partner, #mitmach
- [x] Single-Card mit divide-y Trennern
- [x] Responsive: Mobile stack, Desktop side-by-side
- [x] Keine Section-Border-Bottom (letzte Section)

### Plan 21-08 — Route + Metadata + Smoke-Test
- [x] /about Route gemountet, 9 Sections in korrekter Reihenfolge
- [x] Metadata: Title "Über uns · Generation AI" (absolute), Description aus UI-SPEC, Canonical, OG, Twitter
- [x] `<main id="main-content">` Skip-Link-Target
- [x] Route dynamic (`ƒ` im Build-Log) — CSP-Nonce-Flow intakt
- [x] 10 Playwright-Tests, alle green gegen NODE_ENV=production Build
- [x] Sitemap.ts: /about mit priority 0.8
- [~] Deviation: AboutClient-Wrapper nötig (Plan ging von globalem Header aus, der ist aber in home-client.tsx) — gefixt + dokumentiert

## Requirements Traceability (R2.x)

| Req | Description | Impl | Location | Status |
|-----|-------------|------|----------|--------|
| R2.1 | Mission + Vision | Hero-H1 + Display-Claim + Intro + Values-Section | about-hero-section.tsx, about-values-section.tsx | ✓ |
| R2.2 | Story "Warum gegründet" | Story-Section mit 3 Absätzen | about-story-section.tsx | ✓ |
| R2.3 | Team-Section (Gründer + ≥6 Mitglieder) | 2 Founders + 10 Members | about-team-section.tsx + team-data.ts | ✓ (10 statt 6, Placeholder-Namen per D-05) |
| **R2.4** | **Sparringspartner + Beirat** | **—** | **—** | **✗ descoped** |
| R2.5 | Verein-Block (e.V., Gemeinnützigkeit) | Verein-Section mit 3 Absätzen + Accent-Hairline | about-verein-section.tsx | ✓ |
| R2.6 | CTA am Ende (Beitreten + Kontakt) | Mitmach + Final-CTA + Kontakt Sections | about-mitmach-cta-section.tsx, about-final-cta-section.tsx, about-kontakt-section.tsx | ✓ |

**R2.4 (Sparringspartner + Beirat):**
- NICHT implementiert. UI-SPEC definiert nur 9 Sections ohne Sparringspartner/Beirat-Section. Phase-Planer (CONTEXT/UI-SPEC) haben R2.4 implizit descoped — weder als Section noch als Bestandteil einer anderen Section umgesetzt.
- Luca muss entscheiden: (a) als Gap behandeln und Gap-Closure-Plan erstellen, (b) akzeptieren (e.V. noch nicht gegründet → Beirat existiert noch nicht formal), oder (c) nachziehen in Phase 27 Copy-Pass.

## ROADMAP Success Criteria

| Criterion | Status | Evidence |
|-----------|--------|----------|
| Alle Gründer + aktive Mitglieder mit korrekten Rollen gelistet | ✓ (Placeholder) | 2 Founders (Janna, Simon) mit role='Co-Founder', 10 Placeholder-Members. Echte Namen nachziehen per D-05 in Phase 27 |
| Nav-Link "Über uns" zeigt auf /about | ✓ | Playwright-Test "Nav-Link 'Über uns' im Header führt zu /about" green |
| Responsive auf Mobile (Team-Grid bricht um) | ✓ | `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` im Members-Grid, `grid-cols-1 sm:grid-cols-2` bei Founders |

## Automated Checks (all green)

- TypeScript: `pnpm --filter @genai/website tsc --noEmit` → exit 0
- Lint: `pnpm --filter @genai/website lint` → 0 errors, 4 pre-existing warnings (keine in components/about/ oder app/about/)
- Build: `pnpm --filter @genai/website build` → exit 0, /about als `ƒ` (dynamic)
- Playwright (10 Tests gegen lokalen Prod-Build):
  - ✓ Route /about lädt mit HTTP 200 und rendert alle 9 Sections
  - ✓ Meta-Tags korrekt gesetzt
  - ✓ Anker #team, #verein, #mitmach, #faq, #kontakt existieren
  - ✓ Story-Anker #story und Werte-Anker #werte existieren
  - ✓ FAQ-Accordion öffnet bei Klick auf Trigger
  - ✓ FAQ-Multi-Open: 2 Panels gleichzeitig geöffnet (D-03)
  - ✓ Deep-Link /about#faq scrollt zur FAQ-Section
  - ✓ Nav-Link 'Über uns' im Header führt zu /about
  - ✓ Skip-Link 'Zum Inhalt springen' funktioniert auf /about
  - ✓ Keine Console-Errors auf /about (CSP-Regression-Check)
- FAQ-Sync-Check: 4 Answer-Strings beidseitig in kurz-faq-section.tsx UND faq-data.ts (SYNC OK)
- Schema Drift Check: keine Drift detected

## Human Verification Items

Die folgenden Items erfordern eine manuelle Prüfung durch Luca:

1. **R2.4 Scope-Entscheidung:** Ist das Descoping von "Sparringspartner + Beirat" akzeptabel für Phase-21-Abschluss oder sollte ein Gap-Closure-Plan entstehen?
2. **Visueller Review /about:** Typografie-Rhythmus, Copy-Feel, Section-Breathing auf allen 9 Sections im Browser prüfen (lokal: `pnpm dev` → http://localhost:3000/about).
3. **Mobile-Check:** Team-Grid-Umbruch 4→2→1, FAQ-Accordion-Touch-Handling, Sticky-Header-Kollision bei Anker-Scroll auf Mobile testen.
4. **Dark/Light Theme:** Accent-Hairline auf Verein-Card + LinkedIn-Inline-SVG in beiden Themes prüfen.
5. **Deep-Link-UX:** /about#faq + /about#team + /about#verein + /about#mitmach + /about#kontakt aus externen Links (z.B. Mail) testen — landet der User sichtbar auf der Section (scroll-offset unter fixed Header)?
6. **Placeholder-Namen-Bestätigung:** Sind "Janna Meister" + "Simon Becker" als Platzhalter-Nachnamen OK bis zur Phase-27-Copy-Pass, oder direkt korrigieren?
7. **Copy-Pass-Feel:** Ist die Story-Copy (3 Absätze), Werte-Blöcke (4) und FAQ-Antworten (10) im Voice konsistent mit `brand/VOICE.md`?
8. **Partner-Link-404-Awareness:** "→ Partner werden" im Abschluss-CTA und "Zur Partner-Seite →" im Kontakt führen aktuell zu 404 (Phase 22 fehlt noch). Acceptable oder kurzfristig Fallback?

## Known Limitations (Follow-ups)

Diese Punkte sind für Phase 21 bewusst nicht gefixt, sollten aber bei späteren Phasen berücksichtigt werden:

- **Statische Section-Heading-IDs (Review WR-02):** Alle `about-*-section.tsx`-Components setzen feste DOM-IDs auf ihre H2-Elements (z. B. `id="about-hero-heading"`, `id="about-story-heading"`). Aktuell unkritisch, weil `/about` Single-Mount ist. Sobald About-Inhalte in Phase 22 (Partner-Page) oder Phase 27 teil-eingebettet werden, produzieren die statischen IDs Duplikate → ungültiges HTML + `aria-labelledby` zeigt auf das erste Element. Follow-up für Phase 27: Section-Heading-IDs via `useId()` oder Consumer-Prop. FAQ-Panels nutzen `useId()` bereits als Best-Practice-Referenz.
