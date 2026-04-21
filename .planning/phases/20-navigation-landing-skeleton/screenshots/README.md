# Phase 20 — Screenshot-Galerie für UAT (POST-FIX)

> **Diese Screenshots wurden NACH dem Code-Review-Fix HI-04 aufgenommen** (`@custom-variant dark` → `.light`-based). Alle neuen `dark:`-Varianten in Phase-20-Sections greifen jetzt — visuell anders als die archivierten `screenshots-before-review-fixes/`-Versionen.
>
> Zum Vergleich bei Bedarf: `.planning/phases/20-navigation-landing-skeleton/screenshots-before-review-fixes/`

---

Generiert am 2026-04-20 aus dem lokalen Prod-Build (`pnpm --filter @genai/website build` + `NODE_ENV=production pnpm start` auf Port 3030) mit Playwright/Chromium. Identischer Run wie die Pre-Fix-Galerie — nur der Code-Stand unterscheidet sich (HI-04 Dark-Variant-Fix).

**Zweck:** Manuelle UAT-Abnahme vor dem Merge/Deploy von Phase-20 (Navigation + Landing Skeleton). Diese Bilder zeigen den Ist-Stand der Landing-Page NACH dem Review-Fix in allen relevanten Breakpoint- und Theme-Varianten.

---

## Wie anschauen

- **Finder:** `open .planning/phases/20-navigation-landing-skeleton/screenshots/`
- **VSCode:** Ordner im Explorer anklicken, PNGs preview-en lassen
- **Markdown-Preview:** Diese Datei rendert die Liste; Bilder direkt im File-Browser öffnen

**Reihenfolge zum Review:** Erst die vier `*-full.png` (Overall-Eindruck), dann die Section-Crops (Detail-Check), dann Header/Footer/Dropdown/Sheet (Interaktions-Zustände), zum Schluss `reduced-motion-dark.png` (A11y-Check).

**Diff-Review (Pre- vs. Post-Fix):** Gleiche Dateinamen in beiden Ordnern — z. B. `desktop-dark-full.png` hier vs. in `screenshots-before-review-fixes/`. Erwartete Unterschiede: Dark-Varianten in allen Sections (hero, discrepancy, offering, tool-showcase, community-preview, audience-split, trust, final-cta) greifen jetzt konsistent.

---

## Screenshots

### Full-Page Overviews

| Datei | Viewport | Theme | Zweck |
|---|---|---|---|
| `desktop-dark-full.png` | 1440×900 | dark | Komplette Landing, Desktop-Default-Look |
| `desktop-light-full.png` | 1440×900 | light | Light-Mode-Abnahme (D-20 Theme-Toggle) |
| `mobile-dark-full.png` | 375×812 | dark | Mobile-Default, alle Sections responsive |
| `mobile-light-full.png` | 375×812 | light | Mobile Light-Mode |
| `reduced-motion-dark.png` | 1440×900 | dark | A11y: `prefers-reduced-motion: reduce` aktiv — Motion/Aurora/Marquee sollten ruhig sein |

### Section-Crops (Desktop dark, 1440 Viewport)

Je Section ein isolierter Screenshot des `[data-section="…"]`-Wrappers. Reihenfolge = Scroll-Order.

| Datei | Section | UAT-Check |
|---|---|---|
| `section-hero-desktop.png` | hero | Headline, Sub-Copy, CTA, Trust-Zeile |
| `section-discrepancy-desktop.png` | discrepancy | 0%-Stats-Bento, Diskrepanz-Story |
| `section-offering-desktop.png` | offering | „Vier Säulen" Bento-Grid |
| `section-tool-showcase-desktop.png` | tool-showcase | „Über 100 KI-Tools", Preview-Cards |
| `section-community-preview-desktop.png` | community-preview | Latest Threads + Upcoming Events |
| `section-audience-split-desktop.png` | audience-split | Studierende vs. Partner-Split |
| `section-trust-desktop.png` | trust | Partner-Logos / Trust-Zeile |
| `section-final-cta-desktop.png` | final-cta | Abschluss-CTA |

### Navigation & Chrome

| Datei | Zustand | UAT-Check |
|---|---|---|
| `header-desktop.png` | Desktop-Header sichtbar (1440) | Logo, Nav-Links, Theme-Toggle, CTA-Button |
| `header-mobile.png` | Mobile-Header (375) | Logo + Hamburger + CTA — keine Desktop-Links |
| `footer-desktop.png` | Desktop-Footer | Kategorien, Links, Copyright |
| `footer-mobile.png` | Mobile-Footer | Stack-Layout, Lesbarkeit |
| `dropdown-open.png` | „Für Partner"-Dropdown geöffnet (Desktop) | 3 Subitems: Unternehmen / Stiftungen / Hochschulen (D-17) |
| `mobile-sheet-open.png` | Hamburger-Sheet geöffnet (Mobile) | Nav-Items, „Für Partner"-Accordion, CTA |

---

## UAT-Checkliste-Mapping

Diese Screenshots decken folgende Review-Punkte aus dem Phase-20 Plan ab:

- **D-17 Partner-Dropdown** → `dropdown-open.png`, `mobile-sheet-open.png`
- **D-18 Nav-Struktur (Tools / Community / Für Partner / Über uns)** → `header-desktop.png`, `mobile-sheet-open.png`
- **D-20 Theme-Toggle (Dark/Light)** → `desktop-dark-full.png` vs. `desktop-light-full.png`, `mobile-dark-full.png` vs. `mobile-light-full.png`
- **HI-04 Dark-Variant-Fix** → alle `*-dark-*.png` vs. `screenshots-before-review-fixes/`-Pendants
- **Responsive Breakpoints (Desktop 1440 / Mobile 375)** → alle `*-desktop.png` / `*-mobile.png`
- **8 Landing-Sections (hero → final-cta)** → alle `section-*-desktop.png`
- **A11y Reduced Motion** → `reduced-motion-dark.png`
- **Header-Hierarchie (Logo / Nav / Actions)** → `header-desktop.png`, `header-mobile.png`
- **Footer-Struktur** → `footer-desktop.png`, `footer-mobile.png`

---

## Reproduzieren

```bash
# Prod-Build + Server (Port 3030)
pnpm --filter @genai/website build
cd apps/website && PORT=3030 NODE_ENV=production pnpm start &

# Screenshots (aus packages/e2e-tools für Playwright-Resolution)
cd packages/e2e-tools && node phase-20-screenshots.mjs

# Aufräumen
lsof -ti:3030 | xargs kill -9
```

Das Script (`packages/e2e-tools/phase-20-screenshots.mjs`) umgeht das Terminal-Splash via `sessionStorage.terminal-splash-seen = true` (addInitScript vor Navigation) und setzt das Theme über `localStorage.theme`. Keine App-Änderungen nötig.

---

## Ergebnis

- **19 Screenshots** generiert, **0 Fehler**
- **Gesamtgröße:** ~2.4 MB
- **Basis-Commit:** `feature/phase-20-landing-skeleton` HEAD (Post-Fix-Build 2026-04-20, inkl. HI-04-Fix)
