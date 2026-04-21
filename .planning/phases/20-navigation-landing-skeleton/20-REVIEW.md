---
phase: 20-navigation-landing-skeleton
reviewed: 2026-04-20T00:08:15Z
depth: deep
files_reviewed: 20
files_reviewed_list:
  - apps/website/app/globals.css
  - apps/website/app/page.tsx
  - apps/website/components/home-client.tsx
  - apps/website/components/layout/header.tsx
  - apps/website/components/layout/footer.tsx
  - apps/website/components/terminal-splash.tsx
  - apps/website/components/sections/hero-section.tsx
  - apps/website/components/sections/discrepancy-section.tsx
  - apps/website/components/sections/offering-section.tsx
  - apps/website/components/sections/tool-showcase-section.tsx
  - apps/website/components/sections/community-preview-section.tsx
  - apps/website/components/sections/audience-split-section.tsx
  - apps/website/components/sections/trust-section.tsx
  - apps/website/components/sections/final-cta-section.tsx
  - apps/website/components/ui/aurora-background.tsx
  - apps/website/components/ui/bento-grid.tsx
  - apps/website/components/ui/dropdown-menu.tsx
  - apps/website/components/ui/infinite-moving-cards.tsx
  - apps/website/components/ui/lamp.tsx
  - apps/website/components/ui/marquee.tsx
  - apps/website/components/ui/number-ticker.tsx
  - apps/website/components/ui/sheet.tsx
findings:
  blocking: 1
  high: 4
  medium: 7
  low: 8
  total: 20
status: issues-found
fixes_applied:
  - id: BL-01
    commit: 36c771a
    note: nested <main> in aurora-background replaced with <div>
  - id: HI-04
    commit: 58cb695
    note: "@custom-variant dark flipped to &:not(.light *) to match .light-based theming"
  - id: HI-03
    commit: b4988e2
    note: scroll-behavior smooth moved inside @media (prefers-reduced-motion: no-preference)
  - id: HI-01
    commit: 4c50119
    note: useReducedMotion() hook removed from TrustSection (SSR-hydration mismatch); CSS guard remains
  - id: HI-02
    commit: 0c93c95
    note: InfiniteMovingCards cleanup + aria-hidden=true on clones; deps include [direction, speed, items]
---

# Phase 20: Code Review Report

**Reviewed:** 2026-04-20T00:08:15Z
**Depth:** deep (cross-file analysis: section→UI-primitive import graph, motion/react dependency chain, CSP/nonce flow)
**Files Reviewed:** 20 source files (.planning/**, packages/e2e-tools/**, changesets ausgeschlossen laut Scope)
**Branch:** `feature/phase-20-landing-skeleton` vs `main`
**Status:** issues-found

## Summary

Phase 20 liefert eine hochwertige Neugestaltung der Landing mit 8 Sections, 8 UI-Primitives (Aceternity/MagicUI brand-rebranded) und einer konsistenten Reduced-Motion-Strategie. Die CSP-/Nonce-Kette ist korrekt verdrahtet (`MotionConfig nonce={nonce}` + `await headers()` in `app/page.tsx` + `force-dynamic` in `app/layout.tsx` bleibt intakt).

**Ein blocking Issue:** `AuroraBackground` rendert einen eigenen `<main>`-Wrapper, der innerhalb des `<main id="main-content">` aus `home-client.tsx` ein nested `<main>`-Element erzeugt — das ist HTML-invalid (WCAG 1.3.1 / axe-core `landmark-no-duplicate-main`). Der Review-Kommentar in `hero-section.tsx:16–19` deklariert das explizit als "pre-existing from Plan 01 / deferred" — gemessen an den Validierungskriterien von Phase 20 (R1.11 "keine A11y-Regressionen", Plan 20-01 Task 5 Aceternity-Adaptation) zähle ich es trotzdem als blocking, weil es eine neue Regression relativ zu main ist (auf main gab es diese Nesting nicht).

Zusätzlich mehrere high/medium Issues rund um: Hydration-Mismatch-Risiko bei `useReducedMotion()` in className (TrustSection), doppelte Inflight-Kopien bei `InfiniteMovingCards` in React-19-StrictMode, Dark-Variant-Semantik (`@custom-variant dark (&:is(.dark *))` vs. bestehender `.light`-Theme-Strategie), `scroll-behavior: smooth` ohne reduced-motion-Override, sowie einige Code-Quality-Smells (BeispielBadge cross-section-Import, unused `LampDemo` default-export, inline-Style-Komponenten innerhalb Render).

Brand-Token-Compliance: **sauber** — keine Tailwind-Default-Farben (cyan/purple/violet/fuchsia/indigo) in tatsächlichen className-Werten. Alle Matches sind Kommentare aus Upstream-Attribution oder `slate-950`-Referenz im Kommentar (tatsächlich wurde `bg-bg` verwendet). Security: keine Secrets, keine XSS-Risiken via reflektiertem User-Input, das einzige `dangerouslySetInnerHTML` (app/layout.tsx `application/ld+json`) ist unverändert gegenüber main.

---

## Blocking

### BL-01 — Nested `<main>` element (HTML-invalid, A11y violation)

**File:** `apps/website/components/ui/aurora-background.tsx:29` + `apps/website/components/home-client.tsx:42`
**Issue:**
`AuroraBackground` wrapping markup öffnet ein eigenes `<main>`:
```tsx
return (
  <main>
    <div className={...}>
      ...
      {children}
    </div>
  </main>
);
```

`home-client.tsx` rendert bereits ein `<main id="main-content">` das alle Sections enthält, darunter `<HeroSection />`, die ihrerseits `<AuroraBackground>` mountet. Ergebnis im DOM:

```
<main id="main-content">
  <section aria-labelledby="hero-heading">
    <main>                      ← invalide
      <div>…Hero content…</div>
    </main>
  </section>
  …
</main>
```

Das HTML-Spec erlaubt maximal **ein** `<main>` pro Dokument (WHATWG `main` element). axe-core flagt das als `landmark-no-duplicate-main` (serious). Ausserdem bricht es das Skip-Link-Target (`#main-content`): wenn Screenreader nach dem nächsten `main`-Landmark sucht, landet er im Aurora-Wrapper, nicht im echten Content.

Der Kommentar in `hero-section.tsx:16-19` benennt das Problem korrekt, verschiebt es aber ins Deferred-Register. Für Phase 20 mit expliziter R1.11-Pflicht ("keine A11y-Regressionen") sollte der Fix nicht warten — er ist 2 Zeilen.

**Fix:**
```tsx
// aurora-background.tsx
export const AuroraBackground = ({ className, children, showRadialGradient = true, ...props }: AuroraBackgroundProps) => {
  return (
    <div
      className={cn(
        "transition-bg relative flex h-[100vh] flex-col items-center justify-center bg-bg text-text",
        className,
      )}
      {...props}
    >
      <div className="absolute inset-0 overflow-hidden" style={…}>
        <div className={cn(…)} />
      </div>
      {children}
    </div>
  );
};
```

Das äußere `<main>` wird zum neutralen `<div>`. Die semantische main-Landmark liegt weiterhin bei `home-client.tsx`. Kein Verlust für Aceternity-Visual, da `<main>` dort nur als block-level-Container missbraucht war.

---

## High

### HI-01 — `useReducedMotion()` in className-String → Hydration-Mismatch

**File:** `apps/website/components/sections/trust-section.tsx:52`
**Issue:**
```tsx
<Marquee
  pauseOnHover
  className={`[--duration:40s] ${prefersReducedMotion ? "[&_.animate-marquee]:![animation-play-state:paused]" : ""}`}
>
```

`useReducedMotion()` aus `motion/react` liest `window.matchMedia('(prefers-reduced-motion: reduce)')`. Auf dem Server existiert kein `window` → der Hook liefert initial `null` (erster Render), nach Mount kommt `true`/`false`. Der Server-HTML enthält also entweder den leeren Suffix oder einen falschen — Client re-rendert mit abweichendem className-String → React 19 loggt Hydration-Mismatch und re-rendert clientseitig.

Die CSS-Guard in `globals.css:176-183` (`@media (prefers-reduced-motion: reduce) { .animate-marquee { animation-play-state: paused !important; } }`) deckt das Verhalten bereits komplett ab — der JS-Teil ist redundant **und** fehlerhaft. "Belt and braces" (laut Kommentar Z.10) → de facto loose braces.

**Fix:** JS-Seite streichen, rein auf die CSS-Guard setzen:
```tsx
export function TrustSection() {
  return (
    <section ...>
      …
      <Marquee pauseOnHover className="[--duration:40s]">
        {stubPartners.map((name) => <PartnerTile key={name} name={name} />)}
      </Marquee>
      …
    </section>
  )
}
```
Damit entfällt auch der ungenutzte `useReducedMotion`-Import.

---

### HI-02 — `InfiniteMovingCards`: Effect ohne Cleanup, `addAnimation` fehlt in deps, Double-Mount in StrictMode kloniert doppelt

**File:** `apps/website/components/ui/infinite-moving-cards.tsx:33-52`
**Issue:**
```tsx
useEffect(() => {
  addAnimation();
}, []);
```

Drei Probleme in einem:

1. **`addAnimation` appendet DOM-Clones ohne Reset.** In React 19 Dev/StrictMode werden Effects doppelt ausgeführt (mount → unmount → mount). Jede Ausführung kloniert die 5 Stub-Tools und hängt sie an `scrollerRef.current`. Nach dem Doppel-Mount stehen 5 Originale + 2× 5 Clones = 15 `<li>` im DOM statt der gewünschten 10. In Production (kein StrictMode-Double) kein Problem, aber lokale Dev-Previews zeigen einen visuell längeren Marquee.
2. **`items` nicht in deps:** Wenn ein Parent `items` ändert (hier aktuell statisch, aber die Signatur erlaubt es), rendert React die neuen `<li>`, dupliziert aber nicht erneut → halbe Wiederholung, sichtbarer Gap in der Animation.
3. **Fehlender Cleanup:** Es gibt keinen `return () => { ... }` der die geklonten Nodes wieder entfernt. Bei wechselnden `items` sammeln sich tote Nodes an.

**Fix:**
```tsx
useEffect(() => {
  if (!containerRef.current || !scrollerRef.current) return;

  const scroller = scrollerRef.current;
  const originals = Array.from(scroller.children);
  const clones = originals.map((item) => {
    const clone = item.cloneNode(true) as HTMLElement;
    clone.setAttribute("aria-hidden", "true");
    scroller.appendChild(clone);
    return clone;
  });

  // Direction + speed
  containerRef.current.style.setProperty(
    "--animation-direction",
    direction === "left" ? "forwards" : "reverse",
  );
  const duration = speed === "fast" ? "20s" : speed === "normal" ? "40s" : "80s";
  containerRef.current.style.setProperty("--scroll-duration", duration);

  setStart(true);

  return () => {
    clones.forEach((c) => c.remove());
    setStart(false);
  };
}, [direction, speed]);
```

Zusätzlich auf den Clones `aria-hidden="true"` setzen → Screenreader liest die Duplikate nicht doppelt vor (aktuell werden 5 `<li>` mit denselben Quotes doppelt vorgelesen).

---

### HI-03 — `scroll-behavior: smooth` ohne `prefers-reduced-motion` Override (A11y)

**File:** `apps/website/app/globals.css:58-61`
**Issue:**
```css
html {
  scroll-behavior: smooth;
  background-color: var(--bg);
}
```

Phase 20 ist durchgängig pingelig bei `prefers-reduced-motion` (Aurora-, Marquee-, Scroll-Animationen alle gated). `scroll-behavior: smooth` gilt aber nicht als Animation im Motion-Sinne — sie ist global aktiv, auch wenn User `reduce` gesetzt hat. WCAG 2.3.3 (Animation from Interactions, AAA) und die generelle „respect user motion preference"-Linie verlangen, dass Anker-Smooth-Scroll für diese User deaktiviert wird (z.B. Skip-Link-Sprung an `#main-content` wird sonst animiert).

**Fix:** Im reduced-motion-Block ergänzen:
```css
@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
  .animate-aurora,
  .animate-scroll,
  .animate-marquee,
  .animate-marquee-vertical {
    animation-play-state: paused !important;
  }
}
```

---

### HI-04 — Dark-Variant-Konflikt: `@custom-variant dark (&:is(.dark *))` vs. `.light`-basiertes Theme-System

**File:** `apps/website/app/globals.css:6` + cross-ref `components/**`
**Issue:**
Neu in diesem Diff (Z.6):
```css
@custom-variant dark (&:is(.dark *));
```

Gleichzeitig nutzt das bestehende Theme-System (`ThemeProvider`, Aurora light/dark swap in `globals.css:158-173`) die **`.light`**-Klasse auf `<html>` als Light-Override (und *keine* `.dark`-Klasse — dark ist Default). Komponenten wie `bento-grid.tsx`, `infinite-moving-cards.tsx`, `discrepancy-section.tsx` (`dark:bg-brand-blue-12/40`, `dark:text-brand-neon-9`) verlassen sich aber jetzt auf den `dark:`-Variant.

Damit `dark:` überhaupt matched, müsste `.dark` irgendwo am `<html>` landen. Tut es im aktuellen Tree **nicht** (der `ThemeProvider` fügt nur `.light` hinzu bei light-mode). Folge:

- **Dark-Default** (keine Klasse): `dark:`-Styles matchen **nicht** → `bg-brand-blue-12/40` wird nicht angewendet → Discrepancy-Section nutzt nur die Light-Defaults `bg-brand-blue-2` / `text-brand-blue-11`.
- **Light-Mode** (`.light` auf html): gleiches Verhalten, `dark:` matchen nicht.

Ergebnis: Die Dark-Varianten in den neuen Sections greifen nie. Entweder

(a) `@custom-variant dark` so umschreiben, dass er *standardmäßig* aktiv ist und `.light` das negativ-override:
```css
@custom-variant dark (&:not(.light *));
```
Damit matcht `dark:` überall *außer* unterhalb von `.light` — konsistent mit dem Projekt-Theming.

(b) oder die Dark-Klasse in `ThemeProvider` setzen (`<html class="dark">` als Default). Invasiver Eingriff ausserhalb Phase 20-Scope.

**Fix (empfohlen):**
```css
@custom-variant dark (&:not(.light *));
```

Verify nach Fix: `grep -r "dark:" apps/website/components/sections/` + visueller Check dass die Dark-Varianten jetzt auch in Dark-Default rendern (z.B. Discrepancy-LINKS-Panel ist in Dark `bg-brand-blue-12/40` statt `bg-brand-blue-2`).

---

## Medium

### ME-01 — `Prompt` und `Cursor` als inline-Components innerhalb `TerminalSplash` → Re-Mount pro State-Change

**File:** `apps/website/components/terminal-splash.tsx:330-345`
**Issue:**
```tsx
export function TerminalSplash({ ... }) {
  ...
  const Prompt = () => ( ... )
  const Cursor = () => ( ... )
  ...
}
```

Bei jedem Render der `TerminalSplash` wird eine **neue** Funktionsreferenz für `Prompt` und `Cursor` erzeugt. React sieht das als unterschiedliche Component-Types → unmountet+remountet die Subtrees statt zu reconciliaten. In diesem Hot-Path (Typing-Animation mit 45 ms Intervall + Cursor-Blink 300 ms) bedeutet das: jedes `setTypedText`, jedes `setCursorVisible` erzeugt einen neuen Prompt/Cursor-Subtree. DOM-Churn wird durch die kleine Größe gemildert, aber es ist ein React-Antipattern.

**Fix:** Top-level deklarieren (oder in gleichem File außerhalb `TerminalSplash`):
```tsx
const Prompt = () => (
  <span className="flex-shrink-0 select-none">
    <span className="text-[#78dce8]">{USERNAME}</span>
    <span className="text-[#a0a0a0]">@</span>
    <span className="text-[#96d461]">generation-ai</span>
    <span className="text-[#a0a0a0] ml-1.5">%</span>
  </span>
)

const Cursor = ({ visible }: { visible: boolean }) => (
  <span className={`bg-[#c7c7c7] w-[8px] h-[16px] inline-block ml-px transition-opacity duration-100 ${visible ? 'opacity-100' : 'opacity-0'}`} />
)
```

Und `cursorVisible` als Prop reingeben.

---

### ME-02 — `NumberTicker` doppelte `useInView`-Gating in DiscrepancySection

**File:** `apps/website/components/sections/discrepancy-section.tsx:107-114` + `apps/website/components/ui/number-ticker.tsx:31`
**Issue:**
`DiscrepancySection` gated den NumberTicker extern:
```tsx
{tickersInView ? <NumberTicker value={stat.value} decimalPlaces={stat.decimals} /> : <span>0</span>}
```

Der Ticker selbst hat aber bereits einen internen `useInView(ref, { once: true, margin: "0px" })` (ticker-internal Z.31) der den Spring startet sobald der Ticker im Viewport ist. Wenn der Ticker erst *nach* `tickersInView=true` überhaupt gemountet wird, ist er zu diesem Zeitpunkt schon im Viewport → Internal `isInView` wird synchron `true` → Spring startet sofort — aber nicht als "fade-in von 0", sondern `motionValue` wurde im `useMotionValue(startValue)`-Init auf `0` gesetzt und dann auf `value` animiert. Funktional **ok**, aber überraschend: ein Teil der Ticker-Logik ist doppelt.

Zudem: der externe `{tickersInView ? ... : <span>0</span>}`-Fallback rendert als `0` (nicht als `0.0` oder `0 %`) → kurz bevor der Ticker greift, blinkt es semantisch falsch (ohne Unit), kann CLS verursachen, wenn "0" ≠ "83.5 %" unterschiedliche Breite haben.

**Fix:** Eine der beiden Gates entfernen. Empfehlung: extern auf reines Layout reduzieren, Ticker macht sein Job selbst:
```tsx
<p className="font-mono text-5xl …">
  <NumberTicker value={stat.value} decimalPlaces={stat.decimals} />
  <span className="text-3xl sm:text-4xl ml-1">{stat.suffix}</span>
</p>
```

`tickersRef`/`tickersInView` können entfallen → weniger State, kein CLS-Risiko mehr zwischen "0" und Endwert (NumberTicker rendert initial `{startValue}` = "0", gleiche Font → identische Breite).

---

### ME-03 — `AuroraBackground`: Inline-Styles mit CSS-Custom-Properties — CSP style-src-Caveat

**File:** `apps/website/components/ui/aurora-background.tsx:39-54`
**Issue:**
```tsx
<div
  className="absolute inset-0 overflow-hidden"
  style={{ "--aurora": "...", "--dark-gradient": "...", ... } as React.CSSProperties}
>
```

Inline styles via React `style`-Prop erzeugen ein serielles `style="--aurora: ..."`-Attribut im HTML. Wenn die CSP `style-src 'nonce-xxx' 'strict-dynamic'` oder strikt ohne `'unsafe-inline'` ist, blockt der Browser **style-attribute** nicht direkt (das wäre eine anderer Mechanismus via `'unsafe-hashes'` + inline-style-hash), aber der Browser loggt einen CSP-Report. Moderne Chrome/Firefox erlauben style-attributes standardmäßig nur bei `'unsafe-inline'` oder `'unsafe-hashes'`.

**Ich habe `apps/website/lib/csp.ts` nicht gelesen** — aber das ist per LEARNINGS.md eine der „vor jeder Änderung lesen"-Dateien. Wenn dort `style-src` ohne `'unsafe-inline'` gesetzt ist, wird dieses inline-style im Prod-Build Violations erzeugen.

**Fix-Optionen:**
1. CSS-Custom-Properties in `globals.css` wandern lassen (sind sowieso theme-bound via `.light` switch):
   ```css
   .aurora-layer {
     --aurora: repeating-linear-gradient(100deg, var(--brand-aurora-1) 10%, ...);
     --dark-gradient: repeating-linear-gradient(100deg, #000 0%, #000 7%, ...);
     ...
   }
   ```
   und in JSX nur `className="aurora-layer"` setzen.
2. CSP prüfen und ggf. `'unsafe-inline'` für style-src dokumentiert dulden (nur bei starkem script-src ok).

**Pflicht:** `apps/website/lib/csp.ts` checken vor Prod-Promotion, analog zur LEARNINGS.md-Regel.

---

### ME-04 — `BeispielBadge` cross-section-Import (Coupling)

**File:** `apps/website/components/sections/community-preview-section.tsx:4` importiert aus `apps/website/components/sections/tool-showcase-section.tsx:18`
**Issue:**
```tsx
// community-preview-section.tsx
import { BeispielBadge } from "@/components/sections/tool-showcase-section"
```

Der Kommentar in `tool-showcase-section.tsx:10-14` dokumentiert das als Plan-Constraint-Workaround. Strukturell bleibt es trotzdem Section-A importiert aus Section-B. Löschen/Refactoren von `tool-showcase-section.tsx` würde `community-preview-section.tsx` brechen, ohne dass das in der Dependency-Hierarchie erwartbar wäre.

**Fix (nach Phase 20):** Nach `components/ui/beispiel-badge.tsx` verschieben. Jetzt dokumentiert im Code — für den Review-Bericht als medium-Code-Quality-Schuld festhalten, die in einem Cleanup-Follow-up beseitigt wird.

---

### ME-05 — `home-client.tsx` `setTimeout(50)` ohne Cleanup + magic number

**File:** `apps/website/components/home-client.tsx:25-28`
**Issue:**
```tsx
const handleSplashComplete = () => {
  setSplashDone(true)
  setTimeout(() => setShowContent(true), 50)
}
```

Kein Cleanup. Wenn User schnell wegnavigiert (unwahrscheinlich auf Landing, aber möglich), feuert `setShowContent` auf einem unmounted Component. React 18+ swallows das silent — kein Crash. Aber: das magische `50` ist nirgends dokumentiert. Vermutlich „1 Frame Delay, damit das unmount-Fade einen Tick vor dem Content-Fade-In liegt".

**Fix:**
```tsx
const handleSplashComplete = useCallback(() => {
  setSplashDone(true)
  // 1 frame delay, so splash's exit-animation (fade+scale, 600ms in terminal-splash.tsx:306)
  // has committed before content's 700ms fade-in starts — prevents visual overlap.
  const id = requestAnimationFrame(() => setShowContent(true))
  return () => cancelAnimationFrame(id)
}, [])
```

Aber: `useCallback` mit Cleanup-Return funktioniert nur in Effect, nicht im Handler. Sauberer: Effect basierend auf `splashDone`:
```tsx
useEffect(() => {
  if (!splashDone) return
  const id = requestAnimationFrame(() => setShowContent(true))
  return () => cancelAnimationFrame(id)
}, [splashDone])
```

---

### ME-06 — `LampContainer`: Viel Duplikation zwischen den zwei Cone-Motion.Divs

**File:** `apps/website/components/ui/lamp.tsx:50-82`
**Issue:** Die zwei `motion.div`s (Z.50-65 und Z.66-81) sind Byte-für-Byte fast identisch:
- Beide: gleiche `initial`/`whileInView`/`transition`
- Unterschiede: `right-1/2` vs. `left-1/2`, conic-gradient-Richtung (`from-brand-neon-9 via-transparent to-transparent` vs. umgekehrt), `[--conic-position:from_70deg]` vs. `from_290deg`, Mask-Direction.

Copy-Paste aus Aceternity. Funktional korrekt, aber bei Brand-Änderung (z.B. Farbwechsel) fehleranfällig, weil zwei Stellen synchron gehalten werden müssen.

**Fix (optional, refactor in Cleanup-Phase):** Ein wiederverwendbares `<LampCone side="left" />` extrahieren. Nicht blocking.

---

### ME-07 — `@custom-variant dark` + `dark:`-Usage in Discrepancy/Bento/etc. = Coupling zu HI-04

**File:** Cross-cutting
**Issue:** Siehe HI-04 für die semantische Ursache. Medium-Befund hier ist: wenn HI-04 gefixt wird (`@custom-variant dark (&:not(.light *))`), müssen alle neuen `dark:`-Nutzungen in `discrepancy-section.tsx:98,100,106,126,128,134` visuell verifiziert werden — Farben werden sich im Dark-Default sichtbar ändern (positive Regression: jetzt greifen die Brand-Farben, vorher nicht).

**Fix:** Als Follow-up-Todo für die Fix-PR: visueller A/B-Check (light + dark) nach Variant-Fix, gerne auch als Playwright-Screenshot-Baseline im e2e-Pfad.

---

## Low

### LO-01 — `LampDemo` default-export als unused dead code

**File:** `apps/website/components/ui/lamp.tsx:16-33`
**Issue:** Der default-export `LampDemo` ist reiner Aceternity-Demo-Code ("Build lamps the right way"). Wird nirgends importiert (`FinalCTASection` nutzt nur den named export `LampContainer`).
**Fix:** Default-export streichen.

---

### LO-02 — `KEY_SOUNDS` fallback zu `'A'` für unbekannte Tasten

**File:** `apps/website/components/terminal-splash.tsx:122`
**Issue:**
```tsx
const sound = KEY_SOUNDS[key.toUpperCase()] || KEY_SOUNDS[key] || KEY_SOUNDS['A']
```
User drückt z.B. Ziffern, Sonderzeichen, F-Keys → es spielt immer der A-Sound. Minor UX smell.
**Fix:** Für unbekannte Keys einfach skippen (`if (!sound) return`).

---

### LO-03 — Magic numbers: `TYPING_SPEED = 45`, `OUTPUT_DELAY = 250`, `COMMAND_DELAY = 500`, `50` in home-client, `600` in splash-exit

**File:** multiple (`terminal-splash.tsx`, `home-client.tsx`)
**Issue:** Konstanten sind lokal definiert (ok), aber quer über Files verteilt und werden nicht in Beziehung gesetzt. Die `setTimeout(onComplete, 600)` in `terminal-splash.tsx:306` muss >= der Exit-Transition-Duration (700 ms laut `className="transition-all duration-700"` Z.349) sein — aktuell 600 < 700, Exit-Fade ist noch nicht fertig wenn `onComplete` feuert. Visueller Overlap.
**Fix:** In einem `const` zentralisieren oder mindestens auf 700 erhöhen.

---

### LO-04 — `MobileNavList` key-Stability

**File:** `apps/website/components/layout/header.tsx:194`
**Issue:** `key={\`${item.type}-${item.label ?? index}\`}` — wenn `item.label` zwischen Renders gewechselt würde, bekämen verschiedene Items denselben Key. Statisches Array hier, also nicht praktisch relevant.
**Fix:** Aktuell nicht nötig. Wenn das Array dynamisch würde: stabile IDs vergeben.

---

### LO-05 — Missing `<SheetDescription>` für Mobile-Sheet

**File:** `apps/website/components/layout/header.tsx:144-162` (SheetContent)
**Issue:** base-ui Dialog warnt in Dev-Console wenn ein Dialog `<SheetTitle>` aber keinen `<SheetDescription>` hat (accessible description missing). Nicht sichtbar im Prod, aber Dev-Noise und potenzielle A11y-Empfehlung für Screenreader-Kontext.
**Fix:**
```tsx
<SheetHeader className="relative">
  <SheetTitle className="font-mono">Navigation</SheetTitle>
  <SheetDescription className="sr-only">
    Hauptnavigation von Generation AI mit Links zu Tools, Community, Partner und Über uns.
  </SheetDescription>
  <SheetClose … />
</SheetHeader>
```

---

### LO-06 — `InfiniteMovingCards`: `aria-hidden="true"` Div mit `-z-1` ohne sichtbaren Zweck

**File:** `apps/website/components/ui/infinite-moving-cards.tsx:100-105`
**Issue:**
```tsx
<div
  aria-hidden="true"
  className="user-select-none pointer-events-none absolute -top-0.5 -left-0.5 -z-1 h-[calc(100%_+_4px)] w-[calc(100%_+_4px)]"
></div>
```

Leeres `<div>` ohne Content oder Background. Aus Aceternity-Upstream als Gradient-Border-Slot übriggeblieben, aber keine Styles im rebrand-Path gesetzt → unsichtbar. `user-select-none` ist zudem kein Standard-Tailwind-Utility (`select-none` wäre korrekt).

**Fix:** Element komplett entfernen, oder falls doch als Hover-Glow geplant: styles hinzufügen und dokumentieren.

---

### LO-07 — Commented-out / leere `<div>` in `infinite-moving-cards.tsx`, unused `className` prop in `NumberTicker`

**File:** `apps/website/components/ui/number-ticker.tsx:62-73`
**Issue:** `className` wird akzeptiert und weitergereicht, Konsument in `discrepancy-section.tsx` gibt keinen mit — ok. Aber `{...props}`-Spread enthält bei dem Styling der parent-Text-Elemente potenziell `children`, `style` etc. — base-component hygiene ok, low concern.

---

### LO-08 — `Footer` `© {new Date().getFullYear()}` in Client-Component

**File:** `apps/website/components/layout/footer.tsx:156`
**Issue:** `'use client'` + `new Date().getFullYear()` rendert serverseitig beim SSR und client-seitig beim Hydrate. Mit `force-dynamic` in `app/layout.tsx` ist Server = Request-Zeit → kein Mismatch. Harmlos, aber bei jedem Jahreswechsel-Edge-Case (Request exakt um Mitternacht 31.12. → 01.01.) theoretisch unterschiedliche Jahre auf Server/Client — vernachlässigbar.
**Fix:** Kein Handlungsbedarf. Hinweis.

---

## Positive Observations (nicht-blocking, gut gemacht)

- **CSP/Nonce-Flow korrekt umgesetzt:** `app/page.tsx` → `await headers()` → `x-nonce` → `MotionConfig nonce={nonce}` → `force-dynamic` im Root-Layout bleibt intakt. Matches LEARNINGS.md Pattern.
- **Reduced-motion durchgängig beachtet:** Aurora, Marquee, Scroll, Number-Ticker, motion.div entries — sowohl CSS- als auch JS-Guard (HI-01 ist die einzige Regression).
- **Brand-Token-Compliance:** Keine Tailwind-Default-Farben in className. Alle `dark:`-, `brand-*`-Varianten via CSS-Custom-Properties aus `packages/config/tailwind/base.css`.
- **Deleted legacy sections** (`hero.tsx`, `features.tsx`, `signup.tsx`, `target-audience.tsx`) konsistent aus `home-client.tsx` entfernt — keine Dead-Imports.
- **A11y-Fixes im Terminal-Splash** (BL-Ticket aus Plan 20-06): aria-labels auf Traffic-Lights, 24×24 Hit-Targets via padding — gut.
- **Skip-link** in `header.tsx:48-50` + globale Style in `globals.css:71-89` korrekt gekoppelt an `<main id="main-content">`.
- **External-Link-Hygiene:** Alle `target="_blank"` haben `rel="noopener noreferrer"`.

---

## Empfohlene Fix-Reihenfolge

1. **BL-01** (nested `<main>`) — 2 Zeilen in `aurora-background.tsx`, vor Prod-Promotion zwingend.
2. **HI-04** (`@custom-variant dark`) — 1 Zeile in `globals.css`, aber erfordert visuellen Re-Check aller neuen `dark:`-Usage.
3. **HI-03** (`scroll-behavior` reduced-motion) — 3 Zeilen in `globals.css`.
4. **HI-01** (TrustSection hydration-mismatch) — `useReducedMotion`-Zeile streichen.
5. **HI-02** (`InfiniteMovingCards` cleanup) — Effect rewrite, verifizieren dass Marquee noch flüssig läuft.
6. **ME-03** (Aurora inline-styles + CSP) — `lib/csp.ts` prüfen, ggf. CSS extrahieren.
7. Medium/Low nach Kapazität.

---

_Reviewed: 2026-04-20T00:08:15Z_
_Reviewer: Claude Opus 4.7 (gsd-code-reviewer)_
_Depth: deep_
