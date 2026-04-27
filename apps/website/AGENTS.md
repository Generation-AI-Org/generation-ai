<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

## CSP / Proxy / Middleware — PFLICHTLEKTÜRE

**Vor jeder Änderung an `proxy.ts`, `lib/csp.ts`, oder `app/layout.tsx`: erst [../../LEARNINGS.md](../../LEARNINGS.md) lesen.**

Kurzversion der Regeln (siehe LEARNINGS.md für Kontext):

1. Nonce + CSP auf **Request**-Headers setzen (`request.headers.set(...)`), nicht auf Response. Next.js liest den Nonce request-seitig beim SSR.
2. CSP mit Nonce erzwingt **dynamic rendering** — `export const dynamic = "force-dynamic"` im Root-Layout muss bleiben, sonst wird HTML zur Build-Zeit ohne Nonce eingefroren → strict-dynamic blockt alle Scripts → schwarze Seite.
3. Nach Build prüfen: alle relevanten Routes müssen `ƒ` (dynamic) sein, nicht `○` (static).
4. Lokaler Prod-Check ist Pflicht: `pnpm build && NODE_ENV=production pnpm start`, dann Console auf CSP-Errors prüfen.

---

## Page-Framework — Konsistenz über alle Unterseiten

Alle Unterseiten (`/about`, `/partner`, `/join`, … ausser Landing `/`) teilen ein einheitliches Hero- + Section-Framework. Beim Bauen neuer Unterseiten: **kopiere `/about` als Blueprint, nicht die Landing.** Landing (`home-client.tsx`, `sections/hero-section.tsx`) darf abweichen, Unterseiten nicht.

### Header- und Scroll-Standard

Der Marketing-Header ist globaler Website-Standard und muss geometrisch mit der Tools-App identisch bleiben.

- **Komponente:** Immer `Header` aus `components/layout/header.tsx` verwenden. Diese rendert den shared `MarketingHeader` aus `@genai/ui`.
- **Position:** Header bleibt `fixed` über dem Dokument. Keine Unterseite baut einen eigenen sticky/relative Header nach.
- **Main-Offset:** Direkt nach `<Header />` folgt `<main id="main-content" className="min-h-screen pt-20">` bzw. bei Legal/Plain-Content ein äquivalentes `pt-24` inklusive Header-Freiraum.
- **Scroll-Modell:** Die Seite scrollt über das Dokument (`document.scrollingElement`). Keine `h-screen overflow-hidden` App-Shell und kein vertikaler `overflow-y-auto` Main-Container für normale Website-Seiten.
- **Animation:** Header darf nie in Splash-, Page-Transition- oder Motion-Wrappern liegen, die `transform`, `opacity`, `translate` oder Layout-Animationen setzen. Nur Content unterhalb des Headers animieren.
- **Rechte Aktionen:** Zusätzliche Slots wie Tools-Suche reservieren feste Breite in `MarketingHeader`; Logo, Navigation, Theme-Toggle und CTA dürfen dadurch nicht ihre Position ändern.

### Hero-Pattern (alle Unterseiten)

Referenz: [`components/about/about-hero-section.tsx`](components/about/about-hero-section.tsx)

- **Background:** `<LabeledNodes>` (Node-Constellation-Canvas, gleicher Background wie Landing)
- **Wrapper:** `<section className="relative isolate">` mit `min-h-[calc(100vh-5rem)]` Inner-Height
- **Container:** `relative z-10 mx-auto max-w-4xl px-6 py-20 text-center` — breiter als Landing's `max-w-3xl` (Unterseiten-H1s sind oft kürzer → mehr Breathing)
- **Typo-Scale (DS-Tokens, keine Inline-Magic-Numbers!):**
  - H1: `fontSize: var(--fs-display)` + `leading-[1.02]` + `tracking-[-0.03em]`
  - Subhead/Claim (optional): `fontSize: var(--fs-h2)` + `lineHeight: var(--lh-headline)`, `max-w-3xl`
  - Intro-Lede: `text-lg sm:text-xl leading-[1.5]`, `max-w-2xl`
- **Text-Shadows für Lesbarkeit über animiertem Background:**
  - Small (Eyebrow, Lede, Meta): `0 0 10px rgba(var(--bg-rgb), 1), 0 0 4px rgba(var(--bg-rgb), 1)`
  - Large (H1, Claim): `0 0 18px rgba(var(--bg-rgb), 1), 0 0 8px rgba(var(--bg-rgb), 1)`
- **Motion:** `initial/animate` (once-off entry), `duration: 0.7, ease: "easeOut"`, `useReducedMotion`-Gate
- **Scroll-Indicator:** Nur Landing. Unterseiten kriegen keinen.

### DS-Token für Hero-Size

`--fs-display: clamp(40px, 6.5vw, 76px)` in [`packages/config/tailwind/base.css`](../../packages/config/tailwind/base.css) — der kanonische Hero-H1-Size. **Niemals** inline `clamp(…)` im Code für Heros. Bei neuer Hero-Size-Anforderung: Token erweitern, nicht inline erfinden.

### Sections → `<SectionTransition>` statt Borders

**Verboten** auf Unterseiten: `border-b border-border` auf `<section>`-Level.

**Pflicht:** `<SectionTransition variant="soft-fade" />` (Standard) bzw. `variant="signal-echo"` (vor finaler CTA-Cluster) **zwischen** Sections im Client-Wrapper (z.B. `about-client.tsx`). Grund: harte Hairlines zerschneiden den narrativen Flow und wirken weniger clean als die fade/echo-Transitions von Landing. Referenz-Pattern: [`components/home-client.tsx`](components/home-client.tsx) + [`components/about-client.tsx`](components/about-client.tsx).

**Ausnahmen:** Zwischen Hero und erster Content-Section keine Transition (Hero hat eigene Landing-Zone). Zwischen Final-CTA und letzter Section (FAQ/Kontakt) auch keine — der CTA-Cluster schließt visuell selbst ab.

### Client-Wrapper-Pattern

Jede Unterseite hat einen Client-Wrapper analog [`about-client.tsx`](components/about-client.tsx):
- `'use client'` + `MotionConfig nonce={nonce}` (CSP-Pflicht)
- `<Header />` ausserhalb aller Content-Animationen + `<main id="main-content" className="min-h-screen pt-20">` + `<Footer />`
- Sections + SectionTransitions darin
- Server Component in `app/<page>/page.tsx` holt `nonce` via `await headers()` und rendert den Client-Wrapper

### Checkliste bei neuer Unterseite

- [ ] Neue Section-Components unter `components/<page>/<page>-<section>-section.tsx`
- [ ] Client-Wrapper unter `components/<page>-client.tsx` (analog `about-client.tsx`)
- [ ] Server Component `app/<page>/page.tsx` mit `await headers()` für Nonce
- [ ] Hero folgt Hero-Pattern oben (LabeledNodes + `max-w-4xl` + `--fs-display` + textShadows)
- [ ] Keine `border-b border-border` auf Section-Level
- [ ] `<SectionTransition>` zwischen Sections im Client-Wrapper
- [ ] `app/sitemap.ts` erweitern
- [ ] Playwright-Smoke-Test unter `packages/e2e-tools/tests/<page>.spec.ts`
