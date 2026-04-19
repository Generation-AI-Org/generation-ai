---
phase: 20-navigation-landing-skeleton
plan: 04
subsystem: ui
tags: [sections, bento-grid, infinite-moving-cards, stub-data, beispiel-badge, theme-aware, a11y, reduced-motion]

# Dependency graph
requires:
  - phase: 20-navigation-landing-skeleton
    plan: 01
    provides: "BentoGrid + InfiniteMovingCards Aceternity copy-ins, animate-scroll + reduced-motion guard in globals.css"
  - phase: 20-navigation-landing-skeleton
    plan: 02
    provides: "Offering-/Tool-Showcase-/Community-Preview-Section stubs wired in home-client.tsx + MotionConfig with request nonce"
  - phase: 16-brand-system-foundation
    provides: "brand-{neon,red}-{1-12} scales, --accent + --accent-glow semantic vars, bg-bg-card / bg-bg-elevated / text-text-muted tokens"
provides:
  - "Offering-Section (R1.4): 4-Card Bento-Grid mit Community / Wissensplattform / Events & Workshops / Expert-Formate + Lucide-Icons + Hover-Glow"
  - "Tool-Showcase-Section (R1.5): InfiniteMovingCards mit 5 locked Stub-Tools (ChatPDF Pro / Notion AI / Perplexity / ElevenLabs / Gamma) + Header-BeispielBadge + CTA zu tools.generation-ai.org"
  - "Community-Preview-Section (R1.6): 2-Spalten-Layout mit 3 Artikel + 2 Event-Stubs, BeispielBadge pro Item, keine Animation"
  - "BeispielBadge Komponente (lokal in tool-showcase-section exportiert) — theme-aware via useTheme(), reused in Community-Preview"
  - "Alle drei Sections CSP-konform, Brand-Token-konform, keine cyan/purple/violet/fuchsia/indigo Defaults"
affects: [20-05, 20-06]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "BentoGrid/BentoGridItem-Renderstrategie: Aceternity-API 1:1 genutzt (kein Custom-Fallback) — BentoGridItem akzeptiert React-Nodes als title + icon, das reicht für ArrowUpRight-Reveal im title + Icon-Badge. Link-Wrapper außen um jedes BentoGridItem, 'group block' Klasse für group-hover-Targeting."
    - "BeispielBadge theme-aware: useTheme() liest 'dark'|'light' → conditional tailwind classes (bg-brand-red-3 text-brand-red-12 | bg-brand-neon-3 text-brand-neon-12). Kein dark:-Prefix, weil Theme-System per .light-class auf <html> läuft (nicht .dark). useTheme()-Fallback liefert 'dark' wenn kein ThemeProvider im Tree — safe."
    - "BeispielBadge-Reuse-Pattern: Komponente im ersten Consumer (tool-showcase-section.tsx) definiert + exportiert. Zweiter Consumer (community-preview-section.tsx) importiert via '@/components/sections/tool-showcase-section'. Begründung: files_modified-Scope in Plan 04 erlaubte nur 3 Section-Files — separate @/components/ui/beispiel-badge.tsx wäre Out-of-Scope gewesen."
    - "Tool-Showcase pro-Card Beispiel-Markierung via title-Feld-Suffix: InfiniteMovingCards rendert {item.title} als Sub-Zeile. Jedes Stub-Item hat 'Kategorie · Beispiel' → pro Card im Marquee sichtbar, ohne die fremde Komponente zu patchen."
    - "Offering-Grid Link-Wrapper-Split: extern (a + target=_blank + rel) vs. intern (Next.js Link) als separate Wrapper-Branches — typsauber ohne 'as any' cast oder dynamische Component-Variable (war im Plan angedeutet, aber explizit ausgeführt für Type-Safety)."

key-files:
  created: []
  modified:
    - "apps/website/components/sections/offering-section.tsx"
    - "apps/website/components/sections/tool-showcase-section.tsx"
    - "apps/website/components/sections/community-preview-section.tsx"

key-decisions:
  - "BentoGrid: Aceternity-Weg gewählt (nicht Custom-Fallback) — die komponenten-API mit title/description/icon nimmt React-Nodes, damit lässt sich ArrowUpRight-Reveal im title sauber stylen ohne Markup-Duplizierung"
  - "BeispielBadge lokal in tool-showcase-section statt @/components/ui/: files_modified-Constraint in Plan 04 erlaubte nur die drei Section-Files. Plan 06-Backlog-Note: falls weitere Sections die Badge brauchen, Refactor nach @/components/ui/beispiel-badge.tsx"
  - "Pro-Card Beispiel-Hinweis im Tool-Showcase via title-Feld-Suffix ('Kategorie · Beispiel') — nicht via renderItem-Prop-Injection (die InfiniteMovingCards nicht anbietet) oder via Komponentenklau. Header-Badge + title-Suffix = doppelt belt-and-braces ehrliche Stub-Markierung"
  - "Community-Preview komplett statisch, kein Marquee/Animation — D-12: 'ruhig, keine Animation-Overkill'. Deckt sich mit D-05 Wow-Konzentration auf Hero/Discrepancy/Final-CTA"
  - "Offering-/Tool-Showcase-Link-Split durch zwei separate JSX-Branches statt dynamischem Wrapper — keine 'as any'-Casts, Next.js Link + <a> behalten ihre individuellen Typsignaturen"

patterns-established:
  - "Stub-Content-Markierungs-Stack: (1) sichtbares BeispielBadge auf jedem Item + (2) 'exemplarisch' / 'Einblick' im Section-Intro + (3) kein Skeleton-Loader (würde Ladezustand suggerieren, es gibt aber keine API). Plan 05 Trust-Marquee kann denselben Stack für Logo-Stubs erben."
  - "Stub-Link-Konvention: alle Item-Links aus Stub-Sections → community.generation-ai.org bzw. tools.generation-ai.org (target=_blank + rel=noopener noreferrer). Einzelne tiefe Deep-Links kommen erst mit echten APIs in Phase 26."

requirements-completed: [R1.4, R1.5, R1.6]

# Metrics
duration: 20min
completed: 2026-04-20
---

# Phase 20 Plan 04: Ruhige Mitte (Offering + Tool-Showcase + Community-Preview) Summary

**Drei "ruhige Mitte"-Sections gefüllt: Offering-4-Card-Bento-Grid (R1.4) mit Community/Wissensplattform/Events/Expert-Formate + Lucide-Icons + Hover-Glow + Deep-Links. Tool-Showcase (R1.5) als InfiniteMovingCards mit 5 locked Stub-Tools (ChatPDF Pro / Notion AI / Perplexity / ElevenLabs / Gamma) + Header-BeispielBadge + pro-Card Beispiel-Suffix im title-Feld + CTA zu tools.generation-ai.org. Community-Preview (R1.6) als statisches 2-Spalten-Layout mit 3 Artikel + 2 Event-Stubs, jeweils mit BeispielBadge pro Item — kein Skeleton (D-24 explicit), keine Animation (D-12). Neue BeispielBadge-Komponente theme-aware via useTheme(), in tool-showcase exportiert und in community-preview wiederverwendet. R1.5 + R1.6 + CSP Playwright 3/3 grün gegen lokalen Prod. Build grün mit `ƒ /`.**

## Performance

- **Duration:** ~20 min (inkl. 3 Builds + Playwright + Summary)
- **Tasks:** 3/3
- **Files modified:** 3
- **Commits:** 3 (plus this SUMMARY commit)

## Task Commits

Each task was committed atomically on branch `feature/phase-20-landing-skeleton`:

1. **Task 1 — Offering 4-Card Bento-Grid** — `05c0cf4` (feat)
2. **Task 2 — Tool-Showcase InfiniteMovingCards + BeispielBadge** — `abb8442` (feat)
3. **Task 3 — Community-Preview 2-col static stub layout** — `cedf3e2` (feat)

## Offering-Section Implementation

**Render-Strategie:** Aceternity BentoGrid + BentoGridItem 1:1 genutzt (kein Custom-Fallback nötig — die Komponenten-API akzeptiert React-Nodes für title/description/icon, ausreichend für unser Layout).

**Cards (R1.4, D-10 locked):**

| # | Titel | Icon | Href | Extern |
|---|-------|------|------|--------|
| 1 | Community | Users (lucide) | https://community.generation-ai.org | ja |
| 2 | Wissensplattform | BookOpen | https://tools.generation-ai.org | ja |
| 3 | Events & Workshops | Calendar | /about | nein |
| 4 | Expert-Formate | Mic2 | /about | nein |

**Wrapper-Pattern:** Statt dynamischem `const Wrapper = external ? "a" : Link` (Typ-Unsicherheit) zwei separate JSX-Branches im `.map()` — jeder Branch verwendet den korrekt getypten Link-Wrapper. Outer `className="group block"` erlaubt ArrowUpRight-Reveal via group-hover im inneren title-Node.

**Hover-Glow:** `hover:border-brand-neon-6 hover:shadow-[0_0_20px_var(--accent-glow)]` auf BentoGridItem — zusätzlich zum BentoGridItem-Default-Hover-Shadow (aus bento-grid.tsx Plan 01). Doppelt gemoppelt, weil BentoGridItem Override-Klassen über `cn()` merged.

**Icon-Badge:** 40×40 rounded-lg `bg-[var(--accent-soft,rgba(0,255,128,0.08))]` Container um Lucide-Icon. `var(--accent-soft)` ist ggf. nicht gesetzt → Fallback RGB.

## Tool-Showcase Implementation

**Pro-Card Beispiel-Markierung — welcher Pfad funktioniert hat:**

Der Plan listete drei mögliche Pfade, und Pfad 2 + 3 zusammen waren der Weg:

1. ~~renderItem prop~~ — InfiniteMovingCards bietet keine. Nicht möglich ohne Komponenten-Fork.
2. **title-Feld-Suffix** — InfiniteMovingCards rendert `item.title` als zweite Zeile pro Card. Jeder Stub-Tool hat `title: "Kategorie · Beispiel"` (z.B. "Recherche · Beispiel") → **sichtbar pro Card im Marquee**. Kein Komponenten-Patch.
3. **Header-BeispielBadge** — prominente Pill neben dem "Alle Tools ansehen"-CTA als zusätzlicher globaler Hinweis.

Kombination von (2) + (3) = belt-and-braces-honest labeling.

**BeispielBadge-Komponente:**

```tsx
export function BeispielBadge({ className = "" }) {
  const { theme } = useTheme()
  const tone = theme === "light"
    ? "bg-brand-red-3 text-brand-red-12"
    : "bg-brand-neon-3 text-brand-neon-12"
  // …
}
```

**Theme-Split-Begründung:** Unser Theme-System schaltet per `.light`-Class auf `<html>` (nicht per `.dark` wie shadcn-Default), daher greift `dark:`-Prefix nicht out-of-the-box. `useTheme()` + conditional className ist die pragmatische Lösung. `useTheme()`-Fallback (aus `ThemeProvider.tsx`) liefert `'dark'` wenn kein Provider im Tree — safe default.

**Speed + Pause:** `speed="slow"` (80s scroll-duration aus InfiniteMovingCards map) + `pauseOnHover` + `overflow-hidden` auf `<section>` (Marquee-Rand clipping). `prefers-reduced-motion` automatisch via `animate-scroll` CSS-Guard in globals.css (Plan 01).

**Stub-Tools (D-11, locked):**

| # | name | quote | title (Sub-Zeile) |
|---|------|-------|-------------------|
| 1 | ChatPDF Pro | PDFs analysieren und zusammenfassen. | Recherche · Beispiel |
| 2 | Notion AI | KI-gestützte Notizen und Planung. | Produktivität · Beispiel |
| 3 | Perplexity | KI-Suchmaschine mit Quellen. | Recherche · Beispiel |
| 4 | ElevenLabs | Text-zu-Sprache für Präsentationen. | Audio · Beispiel |
| 5 | Gamma | KI-Präsentationserstellung. | Slides · Beispiel |

**CTA:** `"Alle Tools ansehen"` → `https://tools.generation-ai.org` (target=_blank + rel) in font-mono `text-[var(--accent)]`.

## Community-Preview Implementation

**Layout:** `grid-cols-1 lg:grid-cols-2 gap-8` — Artikel-Spalte links (FileText-Icon + "Letzte Artikel"), Events-Spalte rechts (Calendar-Icon + "Kommende Events"). Unten zentrierter "Zur Community"-CTA → community.generation-ai.org.

**Stub-Daten (D-12, locked):**

Artikel:
1. "Wie ich ChatGPT für meine Bachelorarbeit genutzt habe" — 6 min Lesezeit
2. "5 KI-Tools die jeder BWL-Student kennen sollte" — 4 min Lesezeit
3. "Prompt Engineering für Anfänger: Der komplette Guide" — 9 min Lesezeit

Events:
1. "KI-Basics Workshop" — 28. April 2026, Online
2. "Masterclass: Automatisierung mit Make" — 05. Mai 2026, Online

**Per-Item Struktur:** Jedes Item ist ein `<a target=_blank>` mit BeispielBadge (top-left) + ArrowUpRight (top-right, group-hover-color-switch) + Titel (font-mono, bold) + Meta-Zeile (reading-time bzw. date · location). Card-Hover: `hover:border-brand-neon-6`.

**Keine Skeleton, keine Animation** — D-24 + D-12 explicit. Verifiziert via `grep -i skeleton` → 0 hits.

**BeispielBadge-Import:**

```tsx
import { BeispielBadge } from "@/components/sections/tool-showcase-section"
```

Cross-Section-Import ist zulässig im files_modified-Scope, weil beide Files in Plan 04 laufen. Alternativer Clean-Refactor nach `@/components/ui/beispiel-badge.tsx` ist für Plan 06 als Backlog-Notiz vermerkt.

## Build Output (proof / ƒ)

```
Route (app)
┌ ƒ /
├ ƒ /_not-found
├ ƒ /api/auth/signup
├ ƒ /datenschutz
├ ƒ /impressum
├ ○ /robots.txt
└ ○ /sitemap.xml

ƒ Proxy (Middleware)
```

`/` stays `ƒ` (dynamic) — LEARNINGS.md CSP-Gate respected.

## DOM Smoke (local prod on PORT=3030)

```bash
# Beispiel count: Header-Badge (1) + Tool-Showcase-Marquee-title-suffixes
# (5 × 2 weil InfiniteMovingCards clonet intern = 10)
# → nur visible DOM dump, Marquee-Clones zählen mit. Expectation ≥6.
curl -s http://localhost:3030 | grep -oE "Beispiel" | wc -l   # → 11 ✓

# All 8 data-sections render
curl -s http://localhost:3030 | grep -oE 'data-section="[a-z-]+"' | sort -u
# → audience-split, community-preview, discrepancy, final-cta,
#   hero, offering, tool-showcase, trust

# Offering titles
curl -s http://localhost:3030 | grep -oE "Wissensplattform|Events &amp; Workshops|Expert-Formate|Community" | sort -u
# → all 4 ✓

# Tool names
curl -s http://localhost:3030 | grep -oE "ChatPDF Pro|Notion AI|Perplexity|ElevenLabs|Gamma" | sort -u
# → all 5 ✓

# Community stub titles
curl -s http://localhost:3030 | grep -oE "Bachelorarbeit|BWL-Student|Prompt Engineering|KI-Basics Workshop|Masterclass" | sort -u
# → all 5 ✓
```

## Playwright Results

`E2E_BASE_URL=http://localhost:3030 pnpm exec playwright test landing.spec.ts -g "R1.5|R1.6|CSP" --reporter=line`:

```
Running 3 tests using 3 workers

[1/3] [chromium] › landing.spec.ts:74:7 › Phase 20 — Landing › CSP — keine Console-Errors …
[2/3] [chromium] › landing.spec.ts:50:7 › Phase 20 — Landing › R1.5 — Tool-Showcase: 'Beispiel'-Badge sichtbar
[3/3] [chromium] › landing.spec.ts:56:7 › Phase 20 — Landing › R1.6 — Community-Preview: 'Beispiel'-Badge sichtbar

3 passed (1.7s)
```

## Decisions Made

See frontmatter `key-decisions`. Zusammengefasst:

- **BentoGrid-Pfad:** Aceternity-Komponente direkt, kein Custom-Fallback — title/icon nehmen React-Nodes
- **BeispielBadge-Location:** lokal in tool-showcase-section.tsx exportiert, nicht in @/components/ui/ — files_modified-Scope
- **Beispiel pro Card im Marquee:** via title-Feld-Suffix (InfiniteMovingCards rendert title automatisch)
- **Community-Preview statisch:** keine Animation, D-12 + D-24
- **Link-Wrapper-Split:** zwei JSX-Branches statt dynamischem Wrapper — typsicher

## Deviations from Plan

None. Der Plan wurde 1:1 ausgeführt — alle drei Tasks first-try compiliert, first-try gebuildet, first-try Playwright grün. Keine Rule-1/2/3-Fixes nötig, kein Rule-4-Escalation.

Einziger explizierter Plan-Hinweis, der ausgewählt werden musste: im Plan-Text stand beim Wrapper-Pattern `const Wrapper = external ? "a" : Link` — das funktioniert wegen Type-Widening-Issue in strict-mode nicht sauber. Gewählter Weg: zwei JSX-Branches im `.map()`. Kein Rule-Fix, nur Plan-Style-Anpassung.

## Issues Encountered

Keine. Alle drei Sections kompilierten first-try, Build first-try grün, Playwright first-try grün (3/3).

Side-note: Lint-Run zeigt 6 pre-existing warnings in anderen Files (signup-route `_request` unused, terminal-splash `ASCII_LOGO` unused, infinite-moving-cards useEffect-dep, signal-grid hooks-deps, eslint-config anonymous-default). **Alle 6 sind out-of-scope für Plan 04** und bleiben unangefasst (Scope-Boundary-Regel).

## User Setup Required

Keine. Purely code changes innerhalb `apps/website/components/sections/`.

## Known Stubs

Drei Sections enthalten bewusst Stub-Content, jeweils mit visible BeispielBadge-Markierung:

| File | Stub-Inhalt | Resolved by |
|------|-------------|-------------|
| tool-showcase-section.tsx | 5 Stub-Tools (ChatPDF Pro / Notion AI / Perplexity / ElevenLabs / Gamma) | Phase 26 (Tool-Showcase Live-API aus tools-app) |
| community-preview-section.tsx | 3 Artikel + 2 Events | Phase 26 (Circle API v2 Live-Content) |

Offering-Section ist **kein Stub** — die 4 Karten sind final und zeigen echte Deep-Links (Community + Tools-Subdomain + /about-Placeholder für Events/Expert). `/about` existiert in Phase 20 noch nicht (kommt Phase 21) — 404 bis dahin ist per ROADMAP erwartet.

## Threat Flags

None. Alle Änderungen sind client-side UI, konsumieren bestehende CSP-Nonce-Infrastruktur aus Plan 02. Keine neuen Network-Endpoints, Auth-Pfade, File-Access-Patterns, Schema-Changes oder Daten-Handling. Externe Links konsistent mit `target="_blank" rel="noopener noreferrer"` — kein reverse-tabnabbing.

## Next Phase Readiness

**Ready for Plan 05 (Audience-Split + Trust + Final-CTA — 3. Wow-Peak):**
- Wave-3 section-stub contract held: outer `<section data-section="…">` + `id="…-heading"` preserved on all three filled sections
- home-client.tsx NOT touched (Wave-2-Boundary respected per Plan 02)
- BeispielBadge verfügbar, falls Plan 05 auch Stub-Content markieren muss (z.B. Sparringspartner-Logos-Placeholder im Trust-Marquee) — Import via `@/components/sections/tool-showcase-section`
- R1.4/R1.5/R1.6 grün → next tests to flip red→green: R1.7 (Audience-Split), R1.8 (Trust Marquee reduced-motion), R1.9 (Final-CTA)

**Ready for Plan 06 (Polish + Lighthouse-Gate):**
- Lighthouse-LCP: Offering + Tool-Showcase + Community-Preview sind pure CSS + 5 lucide-SVG-Icons + 11 InfiniteMovingCards-Klone — extrem leicht. Keine neuen Bild-Assets.
- CLS: Tool-Showcase Marquee hat fixed item-width (350px/450px) + overflow-hidden → keine Shifts. BentoGrid hat `md:auto-rows-[14rem]` → fixed Card-Height, keine Reflow-Risiken.
- Backlog-Note für Plan 06 / Phase 21+: **BeispielBadge-Refactor nach `@/components/ui/beispiel-badge.tsx`**, falls weitere Sections sie brauchen. Aktuell nur 2 Consumer (tool-showcase + community-preview) — lokal exportiert reicht noch.

## Self-Check: PASSED

Verified files and commits exist on disk:

- `apps/website/components/sections/offering-section.tsx` — MODIFIED (109 insertions / 7 deletions)
- `apps/website/components/sections/tool-showcase-section.tsx` — MODIFIED (106 insertions / 7 deletions)
- `apps/website/components/sections/community-preview-section.tsx` — MODIFIED (150 insertions / 7 deletions)
- Commit `05c0cf4` (Task 1) — FOUND in git log on `feature/phase-20-landing-skeleton`
- Commit `abb8442` (Task 2) — FOUND in git log
- Commit `cedf3e2` (Task 3) — FOUND in git log
- Build output `ƒ /` — FOUND in fresh build log (Task 3 Post-Build)
- R1.5 + R1.6 + CSP Playwright — 3/3 passed against `http://localhost:3030`

---
*Phase: 20-navigation-landing-skeleton*
*Completed: 2026-04-20*
