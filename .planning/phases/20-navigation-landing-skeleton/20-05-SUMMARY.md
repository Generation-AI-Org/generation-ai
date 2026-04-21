---
phase: 20-navigation-landing-skeleton
plan: 05
subsystem: ui
tags: [sections, audience-split, marquee, lamp-effect, wow-peak, reduced-motion, a11y]

# Dependency graph
requires:
  - phase: 20-navigation-landing-skeleton
    plan: 01
    provides: "Marquee + LampContainer copy-ins, animate-marquee keyframes + reduced-motion guard in globals.css"
  - phase: 20-navigation-landing-skeleton
    plan: 02
    provides: "AudienceSplit-/Trust-/FinalCTA-Section stubs wired in home-client.tsx + MotionConfig with request nonce"
  - phase: 16-brand-system-foundation
    provides: "--accent + --accent-glow + --text-on-accent semantic vars, bg-bg-elevated / bg-bg-card / text-text-muted / text-text-secondary tokens"
provides:
  - "Audience-Split-Section (R1.7): dominante Studi-Section (H2 text-3xl→5xl + Primary-CTA → /join + secondary → tools.generation-ai.org) + dezenter B2B-Streifen (text-xs/sm + bg-bg-elevated + /partner link)"
  - "Trust-Section (R1.8): MagicUI Marquee mit 6 Stub-Partner-Tiles + Microproof 'N=109 · März 2026' + doppelter reduced-motion-Guard (CSS + JS)"
  - "Final-CTA-Section (R1.9, Wow-Peak 3): Aceternity LampContainer + motion.div Content-Layer mit useReducedMotion-Gate + Primary-CTA → /join + Sekundär-Link → tools.generation-ai.org"
  - "Alle drei Sections CSP-konform, Brand-Token-konform, keine cyan/purple/violet/fuchsia/indigo Defaults"
affects: [20-06]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Audience-Split visual hierarchy: zwei explizit getrennte <div>-Bereiche innerhalb einer <section> — primärer Block py-24 sm:py-32 mit text-3xl/4xl/5xl H2, sekundärer B2B-Streifen py-8 mit text-xs/sm, getrennt durch border-t + bg-bg-elevated-Wechsel. Keine 2-col-Grid, keine gleiche visuelle Gewichtung"
    - "Trust reduced-motion Doppel-Guard: (1) globals.css @media prefers-reduced-motion pausiert .animate-marquee !important (aus Plan 01); (2) JS-side useReducedMotion() setzt `[&_.animate-marquee]:![animation-play-state:paused]` als Tailwind-arbitrary-selector am Marquee-Wrapper — erreicht über cn-merge die inner-Div-Animation ohne die Komponente zu patchen. Marquee bleibt IMMER im DOM (Test-Robustness: R1.8 Playwright prüft animationPlayState auf .animate-marquee-Element)"
    - "Final-CTA LampContainer-Mount: min-h-[70vh] override reduziert die Default min-h-screen auf sinnvolle Section-Höhe; eigene motion.div mit useReducedMotion-Gate übernimmt den Content-Layer (initial=false + whileInView=undefined bei reduced-motion). LampContainer-interne Motion läuft bei reduced-motion trotzdem — das Polish-Feintuning bleibt Plan 06"
    - "Primary-CTA Pattern konsistent mit Hero + Audience-Split + Final-CTA: `bg-[var(--accent)] text-[var(--text-on-accent)] rounded-full px-6 py-3 font-mono font-bold hover:shadow-[0_0_20px_var(--accent-glow)] hover:scale-[1.03]` — canonical gemäß packages/config/tailwind/base.css § Component Standards"

key-files:
  created: []
  modified:
    - "apps/website/components/sections/audience-split-section.tsx"
    - "apps/website/components/sections/trust-section.tsx"
    - "apps/website/components/sections/final-cta-section.tsx"

key-decisions:
  - "Marquee bleibt immer im DOM (kein JS-Conditional zum static Fallback) — R1.8 Playwright-Test erwartet `.animate-marquee` im DOM und prüft animationPlayState. Ein JS-Pfad, der statt Marquee ein statisches Layout rendert, würde den Test brechen. Die Doppel-Sicherung (CSS-Guard + JS-Tailwind-Override) ist robuster"
  - "Claim-Wording als substantive Placeholder ('Bereit, KI ernst zu nehmen?' + 'Komm in die Community. Kostenlos, ohne Bullshit.') statt TODO/Lorem — Deferred per CONTEXT.md Deferred-Ideas, aber Preview soll als echte Landing lesbar sein (Plan 03 Muster)"
  - "Stub-Partner als Text-Pills (font-mono uppercase) mit border + bg-bg-card — klar erkennbar als Platzhalter, aber visuell aktiv genug für die Marquee-Mechanik. BeispielBadge wurde bewusst NICHT benutzt (D-23): Sparringspartner-Assets sind Deferred (nicht Stub-Data), der 'Im Sparring mit'-Kicker + Platzhalter-Text machen das klar"
  - "LampContainer min-h-[70vh] (nicht min-h-screen wie Default) — Section muss nicht den ganzen Viewport füllen, visueller Peak reicht mit ~70vh. Kein CLS-Risiko, weil min-h statt height"

patterns-established:
  - "Reduced-motion Dual-Layer-Pattern für Looping-Animations: CSS-Guard in globals.css pausiert die Keyframes über Utility-Class-Selektoren (.animate-marquee, .animate-aurora etc.) — funktioniert für alle Instanzen ohne JS. JS-side useReducedMotion() als Ergänzung wo ein Feintuning nötig ist (z.B. Motion whileInView entry-animations). Pattern etabliert in Plan 03 (Hero/Discrepancy) + hier in Plan 05 (Trust/Final-CTA)"
  - "Wow-Peak Content-Layer-Trennung: LampContainer ist ein reiner visueller Wrapper, der Content-Layer ist eine eigene motion.div innerhalb — so kann der Content reduced-motion-aware gemacht werden, ohne die Aceternity-Komponente zu patchen. Derselbe Split gilt für Aurora (Plan 03) + Lamp (Plan 05)"
  - "CTA-Pair-Pattern für Landing-Peaks: Primary-Button (pill, bg-accent) + secondary-Link (pfeil, text-muted → tools-subdomain). Einsatz in Audience-Split Studi-Block + Final-CTA — konsistent, User lernt das Muster"

requirements-completed: [R1.7, R1.8, R1.9]

# Metrics
duration: 8min
completed: 2026-04-20
---

# Phase 20 Plan 05: Audience-Split + Trust + Final-CTA (Wow-Peak 3) Summary

**Drei Sections gefüllt: Audience-Split (R1.7) mit dominanter Studi-Section + dezentem B2B-Streifen, klare visuelle Hierarchie via Typo + BG-Wechsel. Trust (R1.8) als MagicUI Marquee mit 6 Stub-Partner-Tiles + locked Microproof 'N=109 · März 2026' + doppeltem reduced-motion-Guard (CSS via globals.css + JS via useReducedMotion Tailwind-Override). Final-CTA (R1.9) als 3. Wow-Peak mit Aceternity LampContainer + motion.div Content-Layer + substantive Claim-Placeholder + Primary-CTA → /join + Sekundär-Link → tools.generation-ai.org. Alle 8 Playwright-Tests grün (R1.1×3, R1.2, R1.5, R1.6, R1.8, CSP) gegen lokalen Prod auf PORT=3031. Build grün mit `ƒ /`. Wave-2-Boundary respektiert — home-client.tsx nicht angefasst.**

## Performance

- **Duration:** ~8 min (inkl. 3 Builds + lokaler Prod-Smoke + Full-Playwright + Summary)
- **Tasks:** 3/3
- **Files modified:** 3
- **Commits:** 3 (plus this SUMMARY commit)

## Task Commits

Each task was committed atomically on branch `feature/phase-20-landing-skeleton`:

1. **Task 1 — Audience-Split (Studi primär + B2B dezent)** — `c7575c6` (feat)
2. **Task 2 — Trust-Section (Marquee + N=109 + reduced-motion)** — `e8a8860` (feat)
3. **Task 3 — Final-CTA (Lamp Effect + CTA-Pair, Wow-Peak 3)** — `333c977` (feat)

## Audience-Split Implementation

**Hierarchie-Entscheidung (D-13 + D-22 + D-23):** zwei `<div>`-Bereiche innerhalb einer `<section>`, nicht eine 2-col-Grid:

| Block | Padding | H-Typo | BG | Kontrast |
|-------|---------|--------|-----|----------|
| Studi (primary) | `py-24 sm:py-32` | H2 `text-3xl sm:text-4xl lg:text-5xl` + font-bold | `bg-bg` | Primary-CTA-Button + kicker mono-caps |
| B2B (subdued) | `py-8` | kicker `text-xs` + Copy `text-sm` | `bg-bg-elevated` + border-t | nur secondary-Link mit Pfeil |

Verhältnis `py-24/32` zu `py-8` → Primary-Block ist visuell mehr als 2× höher als B2B-Strip. Zusätzlicher Kontrast durch BG-Wechsel (`bg-bg` → `bg-bg-elevated`) erzeugt die optische Trennung.

**CTAs:**
- Primary → `/join` ("Jetzt beitreten", pill, bg-accent)
- Secondary (Studi) → `https://tools.generation-ai.org` ("Erst mal umschauen", target=_blank + rel)
- B2B → `/partner` ("Für Partner", pfeil, text-muted)

**Copy (substantive Platzhalter, final-Wording Deferred per CONTEXT.md):**
- Studi H2: "Du fängst gerade an oder steckst mittendrin?"
- Studi Sub: "Hol dir die Tools, das Wissen und die Community, die im Studium fehlen — kostenlos."
- B2B Kicker: "Für Unternehmen, Stiftungen, Hochschulen"
- B2B Copy: "Kooperation statt Standard — wir sprechen über Masterclasses, Talent-Zugang und Förderung."

## Trust Implementation

**Marquee-API-Notiz:** Die kopierte MagicUI-Komponente (`apps/website/components/ui/marquee.tsx`) hat die Signatur:

```ts
interface MarqueeProps extends ComponentPropsWithoutRef<"div"> {
  className?: string
  reverse?: boolean
  pauseOnHover?: boolean
  children: React.ReactNode
  vertical?: boolean
  repeat?: number  // default 4
}
```

`className` wird auf den outer Div gemerged, die inner-Divs tragen `animate-marquee`. Das heißt `style={{ animationPlayState: "paused" }}` auf dem Marquee-Wrapper würde NICHT die inner-Div-Animationen pausieren. Stattdessen wurde ein Tailwind-arbitrary-child-selector auf den outer-className gesetzt:

```tsx
className={`[--duration:40s] ${prefersReducedMotion ? "[&_.animate-marquee]:![animation-play-state:paused]" : ""}`}
```

Der `[&_.animate-marquee]:!…`-Selektor targeted descendants mit `.animate-marquee` und setzt animation-play-state mit `!important`. Das klappt zusammen mit dem CSS-Guard in globals.css (Plan 01) als Doppel-Sicherung.

**Stub-Strategie (D-14 + Deferred):** 6 Text-Pills ("Sparringspartner 1..6") statt Logos. Klar erkennbar als Platzhalter, visuell aktiv genug für die Marquee-Mechanik. Sparringspartner-Logos sind per CONTEXT.md "Deferred Ideas" out-of-Phase-20-scope (Asset-Delivery durch Luca).

**Microproof (locked):** "N=109 · März 2026" — exakte String-Match gemäß R1.8 + Trust-Section-Test.

**Reduced-Motion-Doppelschutz:**
1. globals.css: `@media (prefers-reduced-motion) { .animate-marquee { animation-play-state: paused !important } }` (Plan 01)
2. JS: `useReducedMotion()` → `[&_.animate-marquee]:![animation-play-state:paused]` am Marquee-Wrapper

## Final-CTA Implementation

**Lamp-Container Export-Name:** Die kopierte Datei `apps/website/components/ui/lamp.tsx` exportiert:
- `default export`: `LampDemo` (Aceternity-Beispiel, ungenutzt)
- `named export`: `LampContainer` — genutzt hier

Signatur: `{ children: React.ReactNode, className?: string }`. Default `min-h-screen bg-bg overflow-hidden` — override via `className="min-h-[70vh] bg-bg"` um die Section nicht den ganzen Viewport einnehmen zu lassen.

**Content-Layer-Pattern:** eigene `motion.div` innerhalb der LampContainer-children mit `useReducedMotion`-Gate:

```tsx
<motion.div
  initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
  whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
  viewport={{ once: true, amount: 0.4 }}
  transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
>
```

Bei reduced-motion → initial=false (kein Start-State) + whileInView=undefined (keine Transition) → Inhalt rendert statisch.

**LampContainer-interne Motion:** läuft bei reduced-motion weiter (Aceternity-intern hat keinen `useReducedMotion`-Gate). Aus Plan-Sicht akzeptiert, Polish-Feintuning bleibt Plan 06 falls visuell störend. Der Haupt-Wow-Effekt (conic-gradient + Blur-Balls) ist entry-only (whileInView, once) — passiert einmal beim Scroll-in.

**Claim + CTA (R1.9):**
- H2: "Bereit, KI ernst zu nehmen?" (substantive Platzhalter, final-Wording Deferred)
- Subline: "Komm in die Community. Kostenlos, ohne Bullshit."
- Primary → `/join` ("Jetzt beitreten", pill, bg-accent)
- Secondary → `https://tools.generation-ai.org` (full-URL sichtbar, target=_blank + rel)

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

## DOM Smoke (local prod on PORT=3031)

```bash
# All 8 data-sections present
curl -s http://localhost:3031 | grep -oE 'data-section="[a-z-]+"' | sort -u
# → audience-split, community-preview, discrepancy, final-cta,
#   hero, offering, tool-showcase, trust

# /join href count → 5 (Header-Nav + Hero-CTA + AudienceSplit + FinalCTA + Footer-Sitemap)
curl -s http://localhost:3031 | grep -oE 'href="/join"' | wc -l
# → 5 ✓

# /partner href count → 2 (Header-Dropdown + AudienceSplit)
curl -s http://localhost:3031 | grep -oE 'href="/partner"' | wc -l
# → 2 ✓

# N=109 microproof present
curl -s http://localhost:3031 | grep -c "N=109"
# → 1 ✓

# Für Studierende kicker present
curl -s http://localhost:3031 | grep -c "Für Studierende"
# → 1 ✓

# Final-CTA claim present
curl -s http://localhost:3031 | grep -c "Bereit, KI ernst zu nehmen"
# → 1 ✓

# animate-marquee in DOM (4 repeats via Marquee repeat=4 default)
curl -s http://localhost:3031 | grep -oE "animate-marquee" | wc -l
# → 4 ✓

# Sparringspartner tiles (6 tiles × 4 repeats)
curl -s http://localhost:3031 | grep -oE "Sparringspartner" | wc -l
# → 24 ✓
```

## Playwright Results

`E2E_BASE_URL=http://localhost:3031 pnpm exec playwright test landing.spec.ts --reporter=line`:

```
Running 8 tests using 4 workers

[1/8] [chromium] › landing.spec.ts:35 › R1.1 — Mobile-Nav: Hamburger opens overlay, X closes
[2/8] [chromium] › landing.spec.ts:44 › R1.2 — Hero CTA links to /join
[3/8] [chromium] › landing.spec.ts:25 › R1.1 — Nav-Dropdown opens via keyboard (Enter) and closes via Escape
[4/8] [chromium] › landing.spec.ts:19 › R1.1 — Nav-Dropdown 'Für Partner' opens on click
[5/8] [chromium] › landing.spec.ts:50 › R1.5 — Tool-Showcase: 'Beispiel'-Badge sichtbar
[6/8] [chromium] › landing.spec.ts:56 › R1.6 — Community-Preview: 'Beispiel'-Badge sichtbar
[7/8] [chromium] › landing.spec.ts:63 › R1.8 — Trust marquee pauses on prefers-reduced-motion
[8/8] [chromium] › landing.spec.ts:74 › CSP — keine Console-Errors mit 'Content Security Policy' auf Landing

8 passed (4.4s)
```

**Alle 8 Tests grün.** R1.8 (Trust marquee reduced-motion) war das neue Gate für Plan 05 — grün via CSS-Guard aus Plan 01.

## Decisions Made

See frontmatter `key-decisions`. Zusammengefasst:

- **Marquee-DOM-Pflicht:** immer rendern (nicht durch Static-Fallback ersetzen) — Test erwartet `.animate-marquee` + prüft animationPlayState
- **Claim als substantive Placeholder:** "Bereit, KI ernst zu nehmen?" — wie Plan 03 Muster, Preview-Readability
- **Stub-Partner als Text-Pills:** kein BeispielBadge — Sparringspartner-Assets sind Deferred nicht Stub-Data
- **LampContainer min-h-[70vh]:** statt Default min-h-screen — Section-sinnvoll, kein CLS

## Deviations from Plan

None. Der Plan wurde 1:1 ausgeführt:

- Alle drei Tasks kompilierten first-try
- Builds first-try grün mit `ƒ /`
- Lokaler Prod-Smoke first-try grün (alle 8 DOM-Checks bestanden)
- Playwright 8/8 first-try grün (R1.8 als neuer Gate grün via Plan-01-CSS-Guard)

Kleine Plan-Abweichung zur Marquee-Style-Prop (im Plan-Text stand `style={{ animationPlayState: "paused" }}` als Option): die Marquee-Komponente reicht style auf den outer-Div durch, aber die `.animate-marquee`-Klasse sitzt auf den inner Divs — daher Tailwind-arbitrary-child-selector-Pattern genutzt (`[&_.animate-marquee]:![animation-play-state:paused]`). Kein Rule-Fix, sondern Plan-Alternativpfad den der Plan selbst als "Hinweis" markierte.

## Issues Encountered

Keine. Alle drei Sections kompilierten first-try, Build first-try grün, Playwright first-try 8/8 grün.

## User Setup Required

Keine. Purely code changes innerhalb `apps/website/components/sections/`.

## Known Stubs

Zwei bewusste Stub-Inhalte, beide korrekt als Deferred getrackt:

| File | Stub-Inhalt | Deferred-Kategorie | Resolved by |
|------|-------------|--------------------|-------------|
| trust-section.tsx | 6 "Sparringspartner 1..6" Text-Pills statt Logos | CONTEXT.md "Deferred Ideas": Sparringspartner-Logos (Asset-Delivery durch Luca) | Luca liefert Assets, separater Swap in Phase 21+ |
| final-cta-section.tsx | Claim-Wording "Bereit, KI ernst zu nehmen?" + Subline | CONTEXT.md "Deferred Ideas": Final-CTA finales Wording (Marketing-Pass) | Content-Pass mit Marketing später |

Audience-Split-Copy ist ebenfalls Deferred per CONTEXT.md "Zielgruppen-Split Copy" — aber die Platzhalter sind substantive und section-funktional (kein TODO/Lorem).

## Threat Flags

None. Alle Änderungen sind client-side Section-Komponenten, konsumieren bestehende CSP-Nonce-Infrastruktur aus Plan 02. Keine neuen Network-Endpoints, Auth-Pfade, File-Access-Patterns, Schema-Changes oder Daten-Handling. Externe Links konsistent mit `target="_blank" rel="noopener noreferrer"` — kein reverse-tabnabbing.

## Next Phase Readiness

**Ready for Plan 06 (Polish + Lighthouse-Gate):**
- Wave-3 section-stub contract held: outer `<section data-section="…">` + `id="…-heading"` preserved on all three filled sections
- home-client.tsx NOT touched (Wave-2-Boundary respected per Plan 02)
- Alle 8 Requirements-Tests grün (R1.1×3 + R1.2 + R1.5 + R1.6 + R1.8 + CSP) — Plan 06 beginnt mit grüner Baseline
- Alle 8 Landing-Sections visuell platziert: Hero (Wow 1) → Discrepancy (Wow 2) → Offering → Tool-Showcase → Community-Preview → Audience-Split → Trust → Final-CTA (Wow 3). Footer folgt

**Notes for Plan 06 (Polish):**
- **LampContainer interne Motion:** Aceternity-intern läuft bei reduced-motion weiter — Plan 06 könnte einen useReducedMotion-Fork der lamp.tsx erwägen (oder entscheiden, dass der einmalige entry-effect akzeptabel ist)
- **BeispielBadge-Refactor:** Plan 04 hat BeispielBadge lokal in tool-showcase-section exportiert. Wenn Plan 06 mehr Sections mit Stub-Markierung braucht, Refactor nach `@/components/ui/beispiel-badge.tsx` ist Backlog-Item
- **Lighthouse-Gate:** Alle 8 Sections sind pure CSS + Motion-Animations (keine Bild-Assets, keine externen Scripts außer Vercel Speed-Insights). LCP-Kandidaten: Hero H1-Text, Discrepancy-Intro. CLS: alle Animations transform-basiert + overflow-hidden clipped → ≤0.1 realistic
- **Trust-Logos-Swap:** sobald Luca Sparringspartner-Logos liefert, Text-Pills durch `<Image>`-Komponenten ersetzen (separater Plan / PR)

## Manual Sight-Check Notes (for Lucas Review in Plan 06)

- **Audience-Split:** Studi-Block wirkt visuell dominant (py-24+, H2 text-5xl, Primary-Button mit Glow); B2B-Streifen klar untergeordnet (py-8, kleinere Typo, bg-Wechsel). Hierarchie-Zielmarke D-13/D-22/D-23 erfüllt — finale visuelle Bewertung bleibt Lucas-UAT.
- **Trust:** Marquee läuft sanft (40s full cycle), 6 Text-Pills mit leerer Optik = klarer Stub-Hinweis. 'N=109 · März 2026' sitzt mittig unter dem Strip. Reduced-Motion-Check via Browser-DevTools → Keyframe pausiert sofort.
- **Final-CTA:** Lamp-Effect erzeugt bei Scroll-in den erwarteten Spotlight-Glow von oben, conic-gradient öffnet sich, Claim fadet dezent ein. Wow-Peak 3 visuell platziert — subjektive Energie-Bewertung bleibt Lucas-UAT.
- **Mobile-Check noch offen:** nur Desktop-Chromium getestet (Playwright default). < 768px-Sicht-Check bleibt Plan 06.

## Self-Check: PASSED

Verified files and commits exist on disk:

- `apps/website/components/sections/audience-split-section.tsx` — MODIFIED (FOUND)
- `apps/website/components/sections/trust-section.tsx` — MODIFIED (FOUND)
- `apps/website/components/sections/final-cta-section.tsx` — MODIFIED (FOUND)
- Commit `c7575c6` (Task 1, audience-split) — FOUND in git log on `feature/phase-20-landing-skeleton`
- Commit `e8a8860` (Task 2, trust) — FOUND in git log
- Commit `333c977` (Task 3, final-cta) — FOUND in git log
- Build output `ƒ /` — FOUND in fresh build log (Task 3 post-build)
- Playwright landing.spec.ts 8/8 passed gegen `http://localhost:3031`

---
*Phase: 20-navigation-landing-skeleton*
*Completed: 2026-04-20*
