# Phase 20: Navigation + Landing-Skeleton — Research

**Researched:** 2026-04-20
**Domain:** Next.js 16 App Router / Motion 12 / shadcn-ui / Aceternity / MagicUI — Frontend Animation + Component Architecture
**Confidence:** HIGH (Stack-Kern), MEDIUM (externe Komponenten-Internals)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Motion (ehem. Framer Motion) als Animation-Library
- **D-02:** shadcn/ui als UI-Primitives-Layer (Dropdown-Menu, Sheet)
- **D-03:** 21st.dev / Aceternity / MagicUI per Copy-in, selektiv. Alle Komponenten auf Brand-Tokens umfärben.
- **D-04:** "Creative Technical" Basis-Vibe (Raycast/Supabase/Railway) + "Playful Wärme" als Modulation
- **D-05:** Wow-Momente auf 3 strategische Punkte konzentriert: Hero-BG, Diskrepanz-Section, Final-CTA
- **D-06:** Reduced-Motion-Fallback PFLICHT bei jeder Animation
- **D-07:** Terminal-Splash bleibt unverändert
- **D-08:** Hero — Aurora-Background oder Background-Beams (Aceternity) + Text-Generate-Effect
- **D-09:** Diskrepanz-Section — Custom Bento-Split-Layout, Number-Ticker (MagicUI), Scroll-triggered Divergenz (Motion useScroll)
- **D-10:** 4-Card-Angebot — Bento Grid (Aceternity), Hover-Glow brand-neon-alpha
- **D-11:** Tool-Showcase — Apple-Cards-Carousel oder Infinite-Moving-Cards (Aceternity) + "Beispiel"-Badge
- **D-12:** Community-Preview — zweispaltig, ruhig, keine Animation-Overkill
- **D-13:** Zielgruppen-Split — Studi groß + Primary-CTA, B2B-Streifen dezenter
- **D-14:** Trust — Velocity-Scroll-Marquee (MagicUI), bei reduced-motion statisch
- **D-15:** Final-CTA — Lamp-Effect oder Background-Boxes (Aceternity)
- **D-16:** Footer — klassisch, keine Animation
- **D-17:** Dropdown "Für Partner" via shadcn Dropdown-Menu
- **D-18:** Desktop-Nav: `Tools · Community · Für Partner ▾ · Über uns · [Jetzt beitreten]`
- **D-19:** Mobile-Nav: Hamburger → Full-Screen-Overlay, staggered Motion, Dropdown als Accordion
- **D-20:** Theme-Toggle bleibt im Header
- **D-21:** hero.tsx, sections/features.tsx, sections/target-audience.tsx, sections/signup.tsx komplett löschen
- **D-22:** Bestehender Header/Footer umbauen, nicht neu von Null
- **D-23:** home-client.tsx neu strukturieren — bleibt Client-Wrapper
- **D-24:** Stub-Daten mit sichtbarem "Beispiel"-Badge, kein Skeleton-Loader
- **D-25:** Badge-Styling via brand-neon-3 (dark) / brand-red-3 (light)
- **D-26:** `export const dynamic = "force-dynamic"` im Root-Layout BLEIBT
- **D-27:** Nach Build: alle Landing-Routes müssen `ƒ` sein, kein `○`
- **D-28:** Nach jeder neuen Komponente: lokaler Prod-Check + Playwright-Smoke
- **D-29:** Lighthouse Landing > 90 in allen Kategorien — hard gate
- **D-30:** CLS ≤ 0.1 bei scroll-triggered Animationen
- **D-31:** Release minor — v5.0.0-alpha oder v4.5.0
- **D-32:** User-Override von Komponenten jederzeit möglich ohne Re-Planning-Zwang

### Claude's Discretion
- Section-Mapping D-07 bis D-16: Luca hat Freigabe, Komponenten während Execution zu swappen
- Konkrete Aceternity/MagicUI Komponenten-Wahl (innerhalb der D-Entscheidungen)
- Plan-Struktur und Wave-Einteilung

### Deferred Ideas (OUT OF SCOPE)
- Hero-Claim finales Wording
- Final-CTA finales Wording
- 4-Card-Formulierungen final
- Diskrepanz-Section Intro + Closer Wording
- Zielgruppen-Split Copy
- Social-Proof-Section mit Member-Avataren/Count
- Sparringspartner-Logos (Asset-Delivery durch Luca)
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| R1.1 | Top-Nav mit Tools · Community · Für Partner ▾ · Über uns · [Jetzt beitreten]. Dropdown + externe Links + kein Login-Button | shadcn Dropdown-Menu bereits in components.json konfiguriert; bestehender Header.tsx wird umgebaut |
| R1.2 | Hero-Section — Claim + Subline + Primary CTA (kein Login, keine Zahlen) | Aceternity Aurora-Background (CSS-only Keyframes, CSP-safe), Motion Text-Generate-Effect |
| R1.3 | Diskrepanz-Section — 6 Kernzahlen aus SCOPE.md, Scroll-Animation, Closer-Zeile | Zahlen dokumentiert in SCOPE.md §Landing-Sections; Motion useScroll + useTransform + useInView; MagicUI Number-Ticker via CSS |
| R1.4 | 4-Card-Angebot (Community, Wissensplattform, Events, Expert-Formate) mit Deep-Link | Aceternity Bento Grid (shadcn-kompatibel, kein framer-motion-Pflicht) |
| R1.5 | Tool-Showcase Teaser — 3-5 featured Tools + CTA | Aceternity Infinite-Moving-Cards (CSS @keyframes scroll, kein framer-motion) + "Beispiel"-Badge |
| R1.6 | Community-Preview zweispaltig — Stub-Daten mit Fallback-Pattern | Statisches Layout, kein API-Call in Phase 20, "Beispiel"-Badge |
| R1.7 | Zielgruppen-Split — Studi groß + dezenter B2B-Streifen | Reines Layout, keine externe Komponente nötig |
| R1.8 | Trust — Logo-Strip + Micro-Proof Survey | MagicUI Marquee (CSS [--duration:Xs], CSP-safe) + reduced-motion → statisch |
| R1.9 | Final CTA — Claim + Jetzt-beitreten + Sekundärlink | Aceternity Lamp Effect (Motion whileInView + CSS conic-gradient) |
| R1.10 | Footer — Legal, Sitemap, Social, Kontakt, Copyright | Bestehender Footer.tsx ausbauen |
</phase_requirements>

---

## Phase Summary

Phase 20 baut das komplette visuelle Gerüst der neuen Generation-AI-Landing aus. Kernaufgabe: bestehenden One-Pager (Hero → Features → TargetAudience → Signup) gegen 10 neue Sections austauschen und die Top-Nav mit Dropdown und Mobile-Overlay ausstatten. Alle Sections liefern Stub-Daten mit sichtbarem "Beispiel"-Badge — echte API-Daten (Tool-Showcase, Community-Preview) kommen erst in Phase 26.

Die grösste technische Herausforderung ist die Kombination aus: (1) Motion-Animationen in einer nonce-basierten CSP-Umgebung, (2) externe Aceternity/MagicUI-Komponenten die teils framer-motion verwenden und per Copy-in auf unsere Brand-Tokens umgefärbt werden müssen, (3) Lighthouse > 90 als hard gate trotz drei Wow-Effekt-Sections. Die gute Nachricht: die CSP ist weniger restriktiv als erwartet — `style-src 'unsafe-inline'` ist bereits in `lib/csp.ts` erlaubt, das löst das Motion-inline-styles-Problem grundsätzlich.

**Primary recommendation:** Motion 12 installieren via `pnpm add motion --filter @genai/website`. Aceternity-Komponenten via shadcn-CLI (`npx shadcn@latest add @aceternity/...`) oder manuell copy-in. MagicUI-Komponenten ebenfalls via shadcn-CLI (`pnpm dlx shadcn@latest add @magicui/...`). Alle externen Komponenten nach Copy-in sofort auf brand-Tokens umfärben (kein fremdes cyan/purple im Code).

---

## Stack-Setup

### Core

| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| motion | 12.38.0 | Scroll-Animationen, useInView, useReducedMotion, Mobile-Nav-Stagger | NEU installieren |
| shadcn/ui | latest | Dropdown-Menu, Button-Primitives | components.json bereits konfiguriert; kein shadcn bisher installiert |
| tw-animate-css | ^1.4.0 | Basis-Animationen für Tailwind v4 | BEREITS installiert |
| lucide-react | ^1.8.0 | Icons für Nav, Cards, Footer | BEREITS installiert |

[VERIFIED: npm registry — motion@12.38.0 ist latest]

### shadcn Setup — WICHTIG: Bereits `components.json` in `apps/website/`

Die `apps/website/components.json` existiert bereits und ist korrekt konfiguriert:
- `style: "base-nova"`, `rsc: true`, `tsx: true`
- Aliases: `@/components`, `@/lib/utils`, `@/components/ui`
- Aceternity registry bereits eingetragen: `"@aceternity": "https://ui.aceternity.com/registry/{name}.json"`
- Icon library: `lucide`
- Tailwind config leer (korrekt für v4)

[VERIFIED: gelesen aus `apps/website/components.json`]

shadcn-Komponenten werden in `apps/website/components/ui/` installiert (nicht in `packages/ui/` — das ist die `@genai/ui`-Bibliothek für Logo etc., nicht shadcn).

[ASSUMED: shadcn-Monorepo-Strategie: wir nutzen die "install in app" Variante, nicht die packages/ui-Variante, weil components.json in apps/website liegt und @genai/ui bereits separat existiert]

### Install-Commands

```bash
# Motion installieren
pnpm add motion --filter @genai/website

# shadcn Dropdown-Menu (für Nav)
cd apps/website && pnpm dlx shadcn@latest add dropdown-menu

# shadcn Sheet (für Mobile-Nav-Overlay)
cd apps/website && pnpm dlx shadcn@latest add sheet

# Aceternity Komponenten (via shadcn-Registry in components.json)
cd apps/website && pnpm dlx shadcn@latest add @aceternity/aurora-background
cd apps/website && pnpm dlx shadcn@latest add @aceternity/background-beams
cd apps/website && pnpm dlx shadcn@latest add @aceternity/bento-grid
cd apps/website && pnpm dlx shadcn@latest add @aceternity/infinite-moving-cards
cd apps/website && pnpm dlx shadcn@latest add @aceternity/lamp

# MagicUI Komponenten
cd apps/website && pnpm dlx shadcn@latest add @magicui/number-ticker
cd apps/website && pnpm dlx shadcn@latest add @magicui/marquee
```

[ASSUMED: shadcn-CLI-Befehle für @aceternity und @magicui — Aceternity-Registry ist in components.json eingetragen, MagicUI nutzt dasselbe shadcn-Ökosystem. Pfad könnte `@magicui/...` oder `magicui/...` sein — beim Executor testen.]

### Tailwind v4 Kompatibilität shadcn

shadcn/ui ist vollständig Tailwind-v4-kompatibel (Februar 2025). Alle Komponenten nutzen `data-slot`-Attribute. `tw-animate-css` ersetzt `tailwindcss-animate` (bereits installiert). shadcn-Tokens (`--color-primary`, `--color-background` etc.) sind bereits in `apps/website/app/globals.css` gemappt auf unsere Brand-Tokens.

[VERIFIED: shadcn docs changelog Feb 2025 + gelesen aus globals.css]

---

## CSP & Performance Gates

### Kritischer Befund: `style-src 'unsafe-inline'` bereits erlaubt

Die aktuelle `lib/csp.ts` enthält:
```
"style-src 'self' 'unsafe-inline'"
```

**Bedeutung:** Motion-Animationen (die inline style-Attribute setzen) und Aurora-Background (CSS custom properties über inline styles) sind damit bereits CSP-konform. `'unsafe-inline'` in `style-src` erlaubt inline `style=""` Attribute auf Elementen — das ist der Mechanismus den Motion für Animationen nutzt.

[VERIFIED: gelesen aus `apps/website/lib/csp.ts`]

### Was MUSS trotzdem verifiziert werden

| Gate | Was prüfen | Wie prüfen |
|------|-----------|------------|
| **script-src ist nonce-strict** | Keine externe Komponente darf `<script>`-Tags oder `eval()` verwenden | Playwright console-error capture nach Komponenten-Integration |
| **force-dynamic bleibt aktiv** | Neue Sections dürfen `export const dynamic = "force-dynamic"` im Root-Layout nicht brechen | `pnpm build` output: alle Landing-Routes müssen `ƒ` sein |
| **CLS ≤ 0.1** | Animationen die layout-shift verursachen | Lighthouse Run nach jeder Wave |
| **Lighthouse > 90** | Bundle-Size durch Motion + Aceternity | Lighthouse Run nach Wave 3 (Final-Check) |

### Motion + CSP Nonce (optional, aber sauber)

Motion 12 bietet `<MotionConfig nonce="...">` an, das den Nonce an Motion-generierte `<style>`-Blöcke weitergibt. Da `style-src 'unsafe-inline'` bereits erlaubt ist, ist das kein Muss. Aber für maximale CSP-Sauberkeit: Nonce aus dem Request-Header lesen und an `<MotionConfig>` weitergeben.

```tsx
// In layout.tsx oder dem Landing-Client-Wrapper
import { headers } from "next/headers"
import { MotionConfig } from "motion/react"

// Nonce aus dem x-nonce Header lesen (wird von proxy.ts gesetzt)
const nonce = (await headers()).get("x-nonce") ?? ""

// ...
<MotionConfig nonce={nonce}>
  {children}
</MotionConfig>
```

**WICHTIG:** `await headers()` macht diese Komponente automatisch dynamic — das ist kein Problem da `force-dynamic` ohnehin im Root-Layout gesetzt ist.

[VERIFIED: Motion docs motion.dev/docs/react-motion-config — MotionConfig nonce prop für style-src]
[CITED: https://motion.dev/docs/react-motion-config]

### Aceternity/MagicUI CSP-Analyse per Komponente

| Komponente | Animation-Technik | Script-Injection? | Inline-Styles? | CSP-Risk |
|-----------|-------------------|-------------------|----------------|---------|
| Aurora Background | CSS Keyframes in globals.css (`@keyframes aurora`) | Nein | CSS-classes + gradient | KEINE — reines CSS |
| Background Beams | SVG-Pfad Animation | Nein | SVG inline | KEINE |
| Bento Grid | CSS Tailwind-classes + Hover | Nein | Minimal | KEINE |
| Infinite Moving Cards | CSS `@keyframes scroll` in globals.css | Nein | CSS-classes | KEINE |
| Lamp Effect | Motion `whileInView` + CSS conic-gradient | Nein | Motion inline styles | OK — `style-src unsafe-inline` |
| MagicUI Marquee | CSS `[--duration:Xs]` custom property | Nein | CSS-classes | KEINE |
| MagicUI Number-Ticker | Intersection Observer + requestAnimationFrame oder CSS counter | Nein | Minimal | KEINE |
| Motion (Nav-Stagger, Diskrepanz) | Web Animations API / JS | Nein | Inline style attrs | OK — `style-src unsafe-inline` |

[VERIFIED: Aurora — Aceternity docs (CSS keyframes only); Infinite Moving Cards — Aceternity docs (CSS @keyframes scroll); MagicUI Marquee — docs (CSS custom properties)]
[ASSUMED: Bento Grid, Number-Ticker internals — Aceternity/MagicUI sind bekannt für Copy-paste-Komponenten ohne externe JS-Runtimes außer motion]

---

## Architecture Patterns

### Empfohlene Projekt-Struktur nach Phase 20

```
apps/website/
├── app/
│   ├── layout.tsx           # force-dynamic bleibt, MotionConfig wrapper hier
│   └── page.tsx             # rendert HomeClient
├── components/
│   ├── layout/
│   │   ├── header.tsx       # UMBAU: + Nav-Links, Dropdown, Mobile-Menu
│   │   └── footer.tsx       # UMBAU: + Sitemap, Social, Copyright
│   ├── home-client.tsx      # UMBAU: neue Section-Imports, bleibt 'use client'
│   ├── terminal-splash.tsx  # UNVERÄNDERT
│   ├── ThemeProvider.tsx    # UNVERÄNDERT
│   ├── sections/
│   │   ├── hero-section.tsx          # NEU (ersetzt hero.tsx)
│   │   ├── discrepancy-section.tsx   # NEU (D-09, custom)
│   │   ├── offering-section.tsx      # NEU (D-10, Bento Grid)
│   │   ├── tool-showcase-section.tsx # NEU (D-11, Infinite Cards)
│   │   ├── community-preview-section.tsx # NEU (D-12, statisch)
│   │   ├── audience-split-section.tsx    # NEU (D-13)
│   │   ├── trust-section.tsx         # NEU (D-14, Marquee)
│   │   └── final-cta-section.tsx     # NEU (D-15, Lamp Effect)
│   └── ui/
│       ├── button.tsx           # BEREITS vorhanden
│       ├── signal-grid.tsx      # BEREITS vorhanden
│       ├── dropdown-menu.tsx    # NEU via shadcn
│       ├── sheet.tsx            # NEU via shadcn
│       ├── aurora-background.tsx      # NEU via shadcn @aceternity
│       ├── bento-grid.tsx             # NEU via shadcn @aceternity
│       ├── infinite-moving-cards.tsx  # NEU via shadcn @aceternity
│       ├── lamp.tsx                   # NEU via shadcn @aceternity
│       ├── number-ticker.tsx          # NEU via shadcn @magicui
│       └── marquee.tsx                # NEU via shadcn @magicui
```

### Pattern 1: Client/Server-Split für Sections

Landing ist aktuell vollständig `'use client'` via `home-client.tsx`. Das bleibt so wegen:
1. TerminalSplash benötigt Client-State (`useState`)
2. `useTheme()` ist ein Client-Hook
3. Motion-Animationen benötigen `'use client'`

**Einzelne Server-Sections sind möglich** aber für Phase 20 nicht nötig (keine echten API-Calls). Alle Sections als Client-Components — erst in Phase 26 relevant wenn Circle-API-Daten.

### Pattern 2: Motion Client-Components

```tsx
// Jede animierte Section braucht 'use client' am Anfang
'use client'
import { motion, useScroll, useTransform, useInView } from "motion/react"

// Reduced-Motion-Pattern (PFLICHT):
import { useReducedMotion } from "motion/react"

function AnimatedSection() {
  const prefersReducedMotion = useReducedMotion()
  // Source: motion.dev/docs/react-use-reduced-motion
  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
      whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* ... */}
    </motion.div>
  )
}
```

[CITED: https://motion.dev/docs/react-use-reduced-motion]

### Pattern 3: useScroll für Diskrepanz-Divergenz

```tsx
'use client'
import { useRef } from "react"
import { motion, useScroll, useTransform } from "motion/react"
// Source: motion.dev/docs/react-use-scroll

function DiscrepancySection() {
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  })
  
  // Links-Panel schiebt sich nach links
  const leftX = useTransform(scrollYProgress, [0.2, 0.8], ["0%", "-3%"])
  // Rechts-Panel schiebt sich nach rechts  
  const rightX = useTransform(scrollYProgress, [0.2, 0.8], ["0%", "3%"])
  
  return (
    <section ref={containerRef}>
      <motion.div style={{ x: leftX }}>
        {/* Was Wirtschaft will */}
      </motion.div>
      <motion.div style={{ x: rightX }}>
        {/* Was Studis mitbringen */}
      </motion.div>
    </section>
  )
}
```

[CITED: https://motion.dev/docs/react-use-scroll]

### Pattern 4: useInView für Number-Ticker-Trigger

```tsx
const ref = useRef(null)
const isInView = useInView(ref, { once: true, amount: 0.3 })
// Source: motion.dev/docs/react-use-in-view

// Number Ticker nur starten wenn in Viewport
<div ref={ref}>
  {isInView && <NumberTicker value={75} />}
</div>
```

[CITED: https://motion.dev/docs/react-use-in-view]

### Anti-Patterns zu vermeiden

- **Globale Motion-Wrapper ohne `once: true`:** Animation triggert bei jedem In/Out-Viewport-Wechsel → nervt User
- **`whileInView` ohne reduced-motion-Check:** Verletzt D-06 und WCAG 2.1 SC 2.3.3
- **Framer-Motion importieren statt Motion:** `from "framer-motion"` ist deprecated; korrekt: `from "motion/react"`
- **Aurora-Keyframes vergessen in globals.css:** Aurora Background benötigt expliziten `@keyframes aurora` Block in globals.css
- **Infinite Moving Cards Keyframes vergessen:** CSS `@keyframes scroll` muss zu globals.css hinzugefügt werden

---

## Component Recipes

### D-08: Hero — Aurora Background

**URL:** https://ui.aceternity.com/components/aurora-background
**Install:** `cd apps/website && pnpm dlx shadcn@latest add @aceternity/aurora-background`
**Animation-Technik:** Reines CSS — `@keyframes aurora` mit `background-position` Shift. Kein framer-motion.
**CSP-Risk:** KEINE (nur CSS)
**Reduced-Motion:** Aurora-Keyframe läuft weiter, aber subtle genug. Für strikte Compliance: CSS `@media (prefers-reduced-motion)` auf der Animation-Klasse.

**Globals.css Addition (Pflicht):**
```css
@theme inline {
  --animate-aurora: aurora 60s linear infinite;
  @keyframes aurora {
    from { background-position: 50% 50%, 50% 50%; }
    to { background-position: 350% 50%, 350% 50%; }
  }
}
```

**Token-Mapping (von Cyan/Purple auf Brand):**
- Aceternity Standard: `from-[#ff1493]`, `via-[#7b2ff7]` — ersetzen durch:
- Dark: `from-brand-blue-5/30 via-brand-neon-4/20 to-transparent`
- Light: `from-brand-pink-5/30 via-brand-red-4/20 to-transparent`

**Alternativ: Background Beams** (`@aceternity/background-beams`) — SVG-Pfad-Animation, ebenfalls reines CSS/SVG, kein framer-motion. Empfehlung für Executor: Aurora Background ist dezenter und besser auf "90% Raycast-Vibe" ausgerichtet.

---

### D-09: Diskrepanz-Section — Custom (keine externe Komponente)

Keine externe Komponente notwendig — das ist Custom-Code mit Motion-Hooks.

**Dependencies:** `motion` (D-01), `number-ticker` (MagicUI)

**Die 6 Kernzahlen** (aus SCOPE.md §Landing-Sections, verified):

| Seite | Zahl | Kontext |
|-------|------|---------|
| Was Wirtschaft will | **7×** | Nachfrage nach KI-Talent (2023→2025) |
| Was Wirtschaft will | **56%** | Lohnaufschlag für KI-Kompetenz |
| Was Wirtschaft will | **73%** | Unternehmen können KI nicht ausschöpfen |
| Was Studis mitbringen | **83,5%** | Auf Anfänger-Level |
| Was Studis mitbringen | **75%** | "Studium bereitet mich nicht vor" |
| Was Studis mitbringen | **6,4%** | Intensive KI-Lehre im Studium |

[VERIFIED: gelesen aus `.planning/research/v4-scoping/SCOPE.md`]

**MagicUI Number-Ticker:** Install via `pnpm dlx shadcn@latest add @magicui/number-ticker`. Nutzt CSS/Intersection Observer (kein framer-motion Pflicht). Props: `value`, `direction`, `delay`, `decimalPlaces`.

**Skeleton der Diskrepanz-Section:**
```tsx
'use client'
// Bento-Split: 2-col grid (lg:grid-cols-2), < lg: stacked
// Linke Spalte: bg-brand-blue-2 / dark, Zahlen in brand-neon-9
// Rechte Spalte: bg-brand-red-2 / light-ish, Zahlen in brand-red-9
// Scroll-Divergenz via useScroll + useTransform (siehe Pattern 3)
// Number-Ticker via useInView(ref, { once: true })
// Closer-Zeile: "Generation AI schließt diese Lücke." — Text-Reveal via motion.span whileInView
```

---

### D-10: 4-Card-Angebot — Bento Grid (Aceternity)

**URL:** https://ui.aceternity.com/components/bento-grid
**Install:** `cd apps/website && pnpm dlx shadcn@latest add @aceternity/bento-grid`
**Animation-Technik:** CSS Tailwind-classes + Hover-States. Kein framer-motion-Pflicht.
**CSP-Risk:** KEINE
**Reduced-Motion:** Hover-Glow via CSS — automatisch kein Problem.

**Token-Mapping:**
- Hover-Glow: `shadow-[0_0_20px_var(--accent-glow)]` (bestehende Brand-Variable)
- Card-BG: `bg-bg-card` / `bg-bg-elevated`
- Border: `border-border` → `hover:border-brand-neon-6`
- Icon-Container: `bg-accent/10` → `hover:bg-accent/20`

**4 Cards:**
1. Community — Icon: `Users` (lucide), Link: `community.generation-ai.org`
2. Wissensplattform — Icon: `BookOpen`, Link: `tools.generation-ai.org`
3. Events & Workshops — Icon: `Calendar`, Link: `/about#events` (Platzhalter)
4. Expert-Formate — Icon: `Mic2`, Link: `/about#expert` (Platzhalter)

---

### D-11: Tool-Showcase — Infinite Moving Cards (Aceternity)

**URL:** https://ui.aceternity.com/components/infinite-moving-cards
**Install:** `cd apps/website && pnpm dlx shadcn@latest add @aceternity/infinite-moving-cards`
**Animation-Technik:** CSS `@keyframes scroll` — kein framer-motion.
**CSP-Risk:** KEINE

**Globals.css Addition (Pflicht):**
```css
@keyframes scroll {
  to { transform: translate(calc(-50% - 0.5rem)); }
}
/* Reduced-Motion: Animation pausieren */
@media (prefers-reduced-motion: reduce) {
  .animate-scroll { animation-play-state: paused; }
}
```

**Token-Mapping:**
- Standard-Gradient (Dark-Purple auf Aceternity): ersetzen durch `from-bg to-transparent`
- Card-BG: `bg-bg-card border-border`

**"Beispiel"-Badge (D-24/D-25):**
```tsx
// Sichtbarer Stub-Hinweis
<span className="absolute top-2 right-2 text-[11px] font-mono font-bold 
  bg-brand-neon-3 text-brand-neon-12 dark:block hidden rounded-full px-2 py-0.5">
  Beispiel
</span>
<span className="absolute top-2 right-2 text-[11px] font-mono font-bold 
  bg-brand-red-3 text-brand-red-12 dark:hidden block rounded-full px-2 py-0.5">
  Beispiel
</span>
```

**Stub-Daten (3-5 realistisch klingende Tools):**
- "ChatPDF Pro" — PDFs analysieren und zusammenfassen
- "Notion AI" — KI-gestützte Notizen und Planung
- "Perplexity" — KI-Suchmaschine mit Quellen
- "ElevenLabs" — Text-zu-Sprache für Präsentationen
- "Gamma" — KI-Präsentationserstellung

---

### D-12: Community-Preview — Statisches Layout (Phase 20)

**Keine externe Komponente.** Reines zweispaltiges Layout.
**Animation-Technik:** Keine (D-12: "ruhig, keine Animation-Overkill")
**CSP-Risk:** KEINE

**"Beispiel"-Badge:** Globale Pill-Komponente pro Stub-Card.

**Stub-Daten Links (Artikel):**
- "Wie ich ChatGPT für meine Bachelorarbeit genutzt habe"
- "5 KI-Tools die jeder BWL-Student kennen sollte"
- "Prompt Engineering für Anfänger: Der komplette Guide"

**Stub-Daten Rechts (Events):**
- "KI-Basics Workshop — 28. April 2026, Online"
- "Masterclass: Automatisierung mit Make — 05. Mai 2026"

---

### D-13: Zielgruppen-Split

**Keine externe Komponente.** Reines Layout + Typo.

**Studi-Section:** Volle Breite, H2, kurze Beschreibung, Primary-Button "Jetzt beitreten" → `/join`
**B2B-Streifen:** Dezent — kleinere Typo, weniger Höhe, sekundärer Stil, Link "Für Unternehmen & Partner" → `/partner`

---

### D-14: Trust — MagicUI Marquee

**URL:** https://magicui.design/docs/components/marquee
**Install:** `cd apps/website && pnpm dlx shadcn@latest add @magicui/marquee`
**Animation-Technik:** CSS Custom Property `[--duration:30s]` steuert Geschwindigkeit. Kein framer-motion.
**CSP-Risk:** KEINE

**Reduced-Motion-Fallback (D-06):**
```tsx
const prefersReducedMotion = useReducedMotion()
// Bei true: statisches Flex-Layout statt Marquee
if (prefersReducedMotion) return <StaticLogoStrip logos={logos} />
return <Marquee ... />
```

**Logo-Placeholder:** SVG-Platzhalter-Rechtecke (grau, gerundet) bis Luca Logos liefert. Text-Labels als Fallback.

**Micro-Proof:** `"N=109 · März 2026"` als Caption unterhalb des Strips.

---

### D-15: Final-CTA — Lamp Effect (Aceternity)

**URL:** https://ui.aceternity.com/components/lamp-effect
**Install:** `cd apps/website && pnpm dlx shadcn@latest add @aceternity/lamp`
**Animation-Technik:** Motion `motion.div` mit `whileInView` + `initial` + CSS conic-gradient.
**Dependencies:** Benötigt `motion` (D-01) — bereits installiert.
**CSP-Risk:** Motion inline styles — OK wegen `style-src 'unsafe-inline'`

**Token-Mapping:**
- Standard-Accent (Aceternity: Cyan): ersetzen durch `brand-neon-9` (Dark) / `brand-red-9` (Light)
- Conic-gradient: `from-[var(--neon-9)]` Dark, `from-[var(--red-9)]` Light
- Blur: `bg-brand-blue-5/60` Dark, `bg-brand-pink-5/60` Light

**Reduced-Motion:** `whileInView`-Animation via `useReducedMotion()` deaktivieren (statische Darstellung mit vollem Gradient).

---

## Custom Diskrepanz-Section — Implementation-Skizze

Das zentrale Wow-Stück (D-09). Custom-Code, keine Bibliothek-Komponente.

### Struktur

```
<section ref={sectionRef} className="min-h-screen relative">
  
  {/* Intro-Headline */}
  <motion.h2 whileInView={{ opacity: 1 }} initial={{ opacity: 0 }}>
    "Die KI-Diskrepanz"
  </motion.h2>
  
  {/* Bento-Split: zwei Panels */}
  <div className="grid lg:grid-cols-2 gap-0">
    
    {/* Linkes Panel: "Was Wirtschaft will" */}
    <motion.div
      style={{ x: leftX }}  // useTransform von useScroll
      className="bg-brand-blue-2 dark:bg-slate-2 border-r border-slate-6"
    >
      <h3>"Was Wirtschaft will"</h3>
      {wirtschaft.map(stat => (
        <div>
          <NumberTicker value={stat.value} /> {stat.unit}
          <p>{stat.label}</p>
        </div>
      ))}
    </motion.div>
    
    {/* Rechtes Panel: "Was Studis mitbringen" */}
    <motion.div
      style={{ x: rightX }}  // gegenläufig
      className="bg-brand-red-2 dark:bg-slate-2"
    >
      <h3>"Was Studis mitbringen"</h3>
      {/* gleiche Struktur */}
    </motion.div>
    
  </div>
  
  {/* Closer-Zeile: Text-Reveal */}
  <motion.p
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.4, duration: 0.8 }}
    className="text-center font-mono text-2xl"
  >
    "Generation AI schließt diese Lücke."
  </motion.p>

</section>
```

### Scroll-Offsets für Divergenz

```tsx
const { scrollYProgress } = useScroll({
  target: containerRef,
  offset: ["start 80%", "end 20%"]
})
// Panels divergieren sichtbar zwischen 20% und 80% des Section-Scrolls
const leftX = useTransform(scrollYProgress, [0, 1], ["0%", "-4%"])
const rightX = useTransform(scrollYProgress, [0, 1], ["0%", "4%"])
```

4% Divergenz ist subtil genug um keine CLS-Probleme zu verursachen (transform, kein layout).

### Number-Ticker Trigger

```tsx
const tickerRef = useRef(null)
const isInView = useInView(tickerRef, { once: true, amount: 0.3 })

// Übergabe an NumberTicker
<div ref={tickerRef}>
  {isInView ? <NumberTicker value={83.5} decimalPlaces={1} /> : "0"}
</div>
```

### Performance-Hinweise für Diskrepanz-Section

- `useTransform` + `style={{ x }}` nutzen CSS `transform` — kein Layout-Trigger → CLS-sicher
- `useInView` mit `once: true` — kein Re-Trigger beim Scroll-Out
- Number-Ticker nur rendern wenn in Viewport (conditional rendering verhindert JS-Animation-Loop off-screen)

---

## Validation Architecture

**nyquist_validation ist aktiviert** (kein explizites `false` in `.planning/config.json`).

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest + @testing-library/react (Unit/Component) |
| E2E | Playwright (packages/e2e-tools) |
| Config (Unit) | `apps/website/vitest.config.mts` |
| Config (E2E) | `packages/e2e-tools/playwright.config.ts` |
| Quick run (unit) | `pnpm test --filter @genai/website` |
| E2E run | `pnpm exec playwright test --project=website` oder via packages/e2e-tools |

### Phase Requirements → Test-Map

| Req ID | Behavior | Test-Typ | Automated Command | Datei |
|--------|----------|----------|-------------------|-------|
| R1.1 | Nav-Dropdown "Für Partner" öffnet per Click und Keyboard | Playwright E2E | `playwright test landing.spec.ts::dropdown` | Wave 0 Gap |
| R1.1 | Mobile-Nav-Overlay öffnet/schließt | Playwright E2E | `playwright test landing.spec.ts::mobile-nav` | Wave 0 Gap |
| R1.2 | Hero-Section rendert, CTA-Link zu /join | Playwright E2E | `playwright test landing.spec.ts::hero` | Wave 0 Gap |
| R1.3 | Diskrepanz-Zahlen sichtbar, kein CLS > 0.1 | Playwright + Lighthouse | `lhci autorun` nach Wave 2 | Wave 0 Gap |
| R1.5 | Tool-Showcase-Badge "Beispiel" sichtbar | Playwright E2E | `playwright test landing.spec.ts::tool-showcase` | Wave 0 Gap |
| R1.8 | Trust-Marquee pausiert bei reduced-motion | Playwright E2E | `playwright test landing.spec.ts::reduced-motion` | Wave 0 Gap |
| D-27 | Alle Landing-Routes `ƒ` (dynamic) | Build-Check | `pnpm build && grep "○" build-output` | Pro Wave |
| D-28 | Keine CSP-Violations in Console | Playwright CSP-Smoke | bestehender `smoke.spec.ts` erweitern | BEREITS |
| D-29 | Lighthouse > 90 alle Kategorien | Lighthouse CI | `pnpm dlx @lhci/cli autorun` | Wave 3 |
| D-30 | CLS ≤ 0.1 | Lighthouse CLS metric | Im Lighthouse-Report | Wave 3 |

### Sampling Rate

- **Pro Task/Commit:** `pnpm build --filter @genai/website` (Build-Output `ƒ` prüfen)
- **Pro Wave-Merge:** Playwright CSP-Smoke (`smoke.spec.ts` — bereits vorhanden)
- **Phase Gate:** Lighthouse > 90 + CLS ≤ 0.1 vor Verification

### Wave 0 Gaps

- [ ] `packages/e2e-tools/tests/landing.spec.ts` — deckt R1.1 (Nav/Dropdown), R1.2 (Hero), R1.5 (Badge), R1.8 (reduced-motion)
- [ ] `smoke.spec.ts` erweitern: URL `https://generation-ai.org` landet auf neue Landing, nicht auf altem One-Pager

*(Existing `smoke.spec.ts` testet bereits CSP-Violations — wird für Phase-20-Gate weiterverwendet)*

---

## Testing Strategy

### Playwright Tests (Phase 20 neu)

**Datei:** `packages/e2e-tools/tests/landing.spec.ts`

```typescript
// Pattern aus smoke.spec.ts übernehmen (CSP-Error-Capture)
// Zusätzliche Tests:

test("Nav-Dropdown Für Partner — click öffnet Menü", ...)
test("Nav-Dropdown — Keyboard: Enter öffnet, Escape schließt", ...)
test("Mobile-Nav — Hamburger öffnet Overlay", ...)
test("Mobile-Nav — Overlay schließt per X-Button", ...)
test("Hero CTA Link → /join", ...)
test("Tool-Showcase badge 'Beispiel' sichtbar", ...)
test("Reduced-Motion: Marquee ist statisch bei prefers-reduced-motion", ...)
test("Kein CSP-Fehler auf Landing (erweitert smoke.spec)", ...)
```

**Reduced-Motion-Test Pattern:**
```typescript
await page.emulateMedia({ reducedMotion: 'reduce' })
await page.goto('https://generation-ai.org')
// Prüfen: Marquee hat animation-play-state: paused oder ist statisch
```

### Lighthouse-CI

**Noch nicht eingerichtet** (kein `lighthouse-prod/` Verzeichnis gefunden). Für Phase-20-Verification:

```bash
# One-off Lighthouse gegen Prod (lokal)
pnpm dlx lighthouse https://generation-ai.org --output=json --output-path=./lh-report.json

# Oder: @lhci/cli Setup
pnpm dlx @lhci/cli autorun --config=lighthouserc.json
```

**lighthouserc.json (Vorschlag, Wave 0 Gap):**
```json
{
  "ci": {
    "collect": { "url": ["https://generation-ai.org"] },
    "assert": {
      "assertions": {
        "categories:performance": ["error", {"minScore": 0.9}],
        "categories:accessibility": ["error", {"minScore": 0.9}],
        "categories:best-practices": ["error", {"minScore": 0.9}],
        "categories:seo": ["error", {"minScore": 0.9}]
      }
    }
  }
}
```

### Build-Verification (pro Wave)

```bash
pnpm --filter @genai/website build
# Output-Check: Alle Landing-Routes müssen ƒ sein
# Kritisch: / (Homepage) darf NICHT ○ (static) sein → wäre CSP-Incident-2.0
```

---

## Plan-Structure Suggestion

**7 Plans in 3 Waves:**

### Wave 0 — Setup & Teardown (Plan 01)
- Motion installieren (`pnpm add motion --filter @genai/website`)
- shadcn Dropdown-Menu + Sheet installieren
- Aceternity + MagicUI Komponenten alle auf einmal installieren (CLI)
- Bestehende Sections löschen: `hero.tsx`, `sections/features.tsx`, `sections/target-audience.tsx`, `sections/signup.tsx` (D-21)
- `landing.spec.ts` Wave-0-Gerüst anlegen (Test-Datei mit Stubs)
- `globals.css`: Aurora-Keyframes + Scroll-Keyframes hinzufügen
- Build-Verify: Keine Compile-Errors nach Deletes

### Wave 1 — Navigation (Plan 02)
- `header.tsx` umbauen: Desktop-Nav (Links + Dropdown), Mobile-Hamburger + Sheet-Overlay, Theme-Toggle-Position
- `footer.tsx` ausbauen: Sitemap, Social (LinkedIn), Kontakt-Mail admin@, Copyright
- `home-client.tsx` Grundstruktur (leere Section-Imports, `<main>` ohne Inhalt)
- CSP-Smoke + Build-Verify nach Plan

### Wave 2 — Sections (Plans 03-05, parallel möglich)

**Plan 03: Hero + Diskrepanz (Wow-Peak 1 + 2)**
- Hero-Section mit Aurora-Background, Text-Generate-Effect, CTA
- Diskrepanz-Section custom (useScroll, Number-Ticker, Split-Layout)

**Plan 04: Angebot + Trust + Showcase (Ruhige Sections)**
- 4-Card-Angebot (Bento Grid)
- Tool-Showcase (Infinite Moving Cards + "Beispiel"-Badge)
- Community-Preview (statisch + "Beispiel"-Badge)

**Plan 05: Zielgruppen + Final-CTA (Wow-Peak 3)**
- Zielgruppen-Split (reines Layout)
- Trust-Section (Marquee + reduced-motion Fallback)
- Final-CTA (Lamp Effect + Buttons)

### Wave 3 — Polish & Verify (Plans 06-07)

**Plan 06: Token-Audit + Reduced-Motion-Audit**
- Alle Komponenten auf Brand-Tokens prüfen (kein fremdes cyan/purple/violet)
- Alle Animationen auf `useReducedMotion()`-Fallback prüfen
- Mobile-Responsiveness Check (< 768px)
- Playwright-Tests vervollständigen

**Plan 07: Performance Gate**
- Lokaler Prod-Check: `pnpm build && NODE_ENV=production pnpm start`
- Playwright-Smoke gegen Local-Prod (CSP-Violations = Blocker)
- Lighthouse Run (> 90 alle Kategorien = Gate)
- CLS-Check (≤ 0.1 = Gate)
- Changeset erstellen (v5.0.0-alpha oder v4.5.0)

---

## Open Questions / Risks

### OQ-1: shadcn Aceternity-Registry CLI-Syntax
**Was wir wissen:** `components.json` hat `"@aceternity"` Registry eingetragen.
**Unklar:** Ob `pnpm dlx shadcn@latest add @aceternity/aurora-background` so direkt funktioniert, oder ob man zuerst `npx shadcn@latest init` braucht (components.json existiert bereits).
**Empfehlung:** Executor testet `pnpm dlx shadcn@latest add @aceternity/aurora-background` als erstes im Wave-0-Plan. Bei Fehler: manuelles Copy-Paste aus ui.aceternity.com als Fallback (D-32 erlaubt Swap).

### OQ-2: MagicUI Marquee vs Velocity Scroll
**Was wir wissen:** CONTEXT.md D-14 nennt "Velocity-Scroll-Marquee (MagicUI)". MagicUI hat zwei separate Komponenten: `marquee` (CSS-based, horizontal loop) und `velocity-scroll` (scroll-speed-linked velocity).
**Empfehlung:** Marquee (CSS, einfacher, reduced-motion-freundlich) für Trust-Strip. Velocity-Scroll ist scroll-speed-linked — komplexer und kann bei fast-scroll störend sein.
**Action:** Executor entscheidet und implementiert (D-32 — keine Re-Planning nötig).

### OQ-3: Lamp Effect framer-motion Import-Pfad
**Was wir wissen:** Lamp Effect verwendet `motion.div` mit `whileInView`. Aceternity-Code nutzt `"framer-motion"` als Import.
**Risiko:** Import muss auf `"motion/react"` geändert werden — `"framer-motion"` ist bei uns nicht installiert und wird auch nicht installiert.
**Action:** Nach Copy-in sofort alle `from "framer-motion"` durch `from "motion/react"` ersetzen (pro Komponente als Standard-Schritt).

### OQ-4: Aurora Background vs Background Beams für Hero
**Was wir wissen:** Beide sind CSP-safe, keine framer-motion Pflicht. Aurora = CSS-only, subtile Bewegung. Background Beams = SVG-Pfade, mehr Tech-Look.
**Empfehlung:** Aurora Background für Hero (subtiler, besser zu "ruhig zwischen Wow-Peaks"). Background Beams als Alternative wenn Executor es besser findet (D-32 erlaubt Swap).

### OQ-5: CLS bei Diskrepanz-Section
**Risiko:** `useTransform` mit `x`-Wert auf Container-Level könnte bei falschen Werten overflow verursachen → horizontales Scrolling oder Layout-Shift.
**Mitigation:** `overflow-hidden` auf dem Section-Container. Transform `x` maximal ±4% — innerhalb der Section-Breite. `will-change: transform` auf den animierten Panels.

### OQ-6: Next.js 16 `'use client'` für home-client.tsx
**Was wir wissen:** home-client.tsx ist aktuell `'use client'` und bleibt so (D-23). Alle importierten Sections werden damit ebenfalls client-seitig ausgeführt.
**Kein Problem für Phase 20** (Stub-Daten, kein Server-Fetch). Aber: Das bedeutet auch, dass Motion-Hooks direkt in den Section-Komponenten genutzt werden können ohne extra 'use client' Wrapper auf Root-Level.
**Hinweis für Executor:** Jede Section-Datei braucht `'use client'` am Anfang wenn sie Motion-Hooks verwendet — auch wenn sie von home-client.tsx importiert wird (Next.js 16 Konvention).

[ASSUMED: Next.js 16 'use client' Boundary-Propagation — basierend auf Next.js 15/16 Docs-Wissen. Executor soll dies beim ersten Build-Lauf verifizieren.]

### OQ-7: Bundle-Size Motion vs Lighthouse-Gate
**Risiko:** Motion 12 ist ~37kb minified+gzipped (Paket-Kern). Aceternity + MagicUI addieren weitere Komponenten-Größe.
**Mitigation:** Tree-Shaking funktioniert — nur importierte APIs werden gebundelt. Nur Section-spezifische Hooks importieren (nicht `import * from "motion/react"`). Lighthouse misst das tatsächliche Bundle — Wave-3-Plan hat Lighthouse-Gate.
[ASSUMED: Motion 12 Bundle-Size ~37kb — Schätzung aus Training, nicht frisch verifiziert. Lighthouse-Gate in Plan 07 ist die Verifikation.]

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js / pnpm | Build, Install | ✓ | pnpm workspace | — |
| Next.js 16 | Framework | ✓ | 16.2.3 (catalog) | — |
| Tailwind v4 | Styling | ✓ | ^4 (catalog) | — |
| motion (npm) | Animationen | ✗ (nicht installiert) | 12.38.0 verfügbar | — |
| shadcn CLI | Komponenten-Install | ✓ (via pnpm dlx) | latest | manueller Copy-Paste |
| Playwright | E2E Tests | ✓ | packages/e2e-tools | — |
| Lighthouse CLI | Performance Gate | ✗ (nicht installiert) | pnpm dlx verfügbar | manuell im Browser |

**Missing, kein Fallback:**
- `motion` — muss installiert werden (Wave 0, Plan 01, erster Schritt)

**Missing, mit Fallback:**
- Lighthouse CLI — kann via `pnpm dlx @lhci/cli autorun` ohne Install genutzt werden

---

## Assumptions Log

| # | Claim | Abschnitt | Risiko wenn falsch |
|---|-------|-----------|-------------------|
| A1 | shadcn CLI-Syntax `pnpm dlx shadcn@latest add @aceternity/...` funktioniert mit components.json | Stack-Setup | Executor muss manuell copy-pasten — kein Blocker da D-32 Swap erlaubt |
| A2 | MagicUI install-Syntax ist `@magicui/number-ticker` | Stack-Setup | Falscher Package-Name → shadcn-Error → manueller Copy-Paste |
| A3 | Motion 12 inline style attributes (nicht style tags) für Animationen — keine script-injection | CSP-Analysis | Wenn Motion script-tags injiziert: script-src ist nonce-strict → CSP-Violation. Mitigiert durch MotionConfig nonce + Playwright-Test |
| A4 | Alle Aceternity/MagicUI Copy-in-Komponenten nutzen `"framer-motion"` als Import statt `"motion/react"` | Component Recipes | Import schlägt fehl beim Build (framer-motion nicht installiert) → Fix: alle Imports anpassen |
| A5 | Motion 12 Bundle-Impact ≈ 37kb gzipped | Open Questions OQ-7 | Wenn größer: Lighthouse-Performance-Gate unter 90 → Lazy-Loading-Strategie nötig |
| A6 | Next.js 16 'use client' Propagation: Section-Dateien brauchen eigenes 'use client' | Architecture Patterns | Wenn Next.js 16 anders propagiert → Build-Warnings aber kein Blocker |

---

## Sources

### Primary (HIGH confidence)
- `apps/website/lib/csp.ts` — CSP-Direktiven (style-src 'unsafe-inline' bestätigt)
- `apps/website/components.json` — shadcn-Setup, Aceternity-Registry eingetragen
- `apps/website/app/globals.css` — shadcn-Token-Mapping auf Brand-Tokens bestätigt
- `.planning/research/v4-scoping/SCOPE.md` — 6 Diskrepanz-Zahlen verifiziert
- `LEARNINGS.md` — CSP-Incident Rules (non-negotiable)
- [motion.dev/docs/react-use-scroll](https://motion.dev/docs/react-use-scroll) — useScroll API
- [motion.dev/docs/react-use-in-view](https://motion.dev/docs/react-use-in-view) — useInView API
- [motion.dev/docs/react-use-reduced-motion](https://motion.dev/docs/react-use-reduced-motion) — useReducedMotion API
- [motion.dev/docs/react-motion-config](https://motion.dev/docs/react-motion-config) — MotionConfig nonce
- npm registry — motion@12.38.0 latest verifiziert

### Secondary (MEDIUM confidence)
- [ui.aceternity.com/components/aurora-background](https://ui.aceternity.com/components/aurora-background) — Aurora Keyframes + Tailwind v4 Setup
- [ui.aceternity.com/components/infinite-moving-cards](https://ui.aceternity.com/components/infinite-moving-cards) — CSS @keyframes scroll bestätigt
- [magicui.design/docs/components/marquee](https://magicui.design/docs/components/marquee) — CSS custom property [--duration]
- [ui.shadcn.com/docs/monorepo](https://ui.shadcn.com/docs/monorepo) — Monorepo-Setup (apps vs packages)
- [ui.shadcn.com/docs/tailwind-v4](https://ui.shadcn.com/docs/tailwind-v4) — Tailwind v4 Kompatibilität

### Tertiary (LOW confidence, flagged)
- WebSearch zu Aceternity Lamp Effect / Bento Grid Internals — Dokumentation zu spärlich für direkte Verifikation

---

## Metadata

**Confidence breakdown:**
- Standard Stack: HIGH — Motion npm-version verifiziert, shadcn/CSP live im Code gelesen
- Architecture: HIGH — Codebase direkt untersucht, bestehende Patterns dokumentiert
- Component Recipes: MEDIUM — Aceternity/MagicUI Internals teils nicht vollständig dokumentiert
- CSP Analysis: HIGH — csp.ts live gelesen, Motion-Docs zu MotionConfig verifiziert
- Diskrepanz-Zahlen: HIGH — direkt aus SCOPE.md gelesen

**Research date:** 2026-04-20
**Valid until:** 2026-05-20 (30 Tage — Motion/shadcn stabil, Aceternity-Komponenten könnten sich ändern)
