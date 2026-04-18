# Phase 16 — Brand System Foundation · CONTEXT

> Vorbereitungs-Kontext für `/gsd-plan-phase 16`. Liest der Planner-Agent vor PLAN.md-Erstellung.

---

## TL;DR

Brand-Entscheidungen aus Workshop-Session (2026-04-18) in Code überführen. Alle Design-Entscheidungen sind bereits festgelegt und dokumentiert in `brand/`. Diese Phase ist **Umsetzung, nicht Entscheidungsfindung**.

**Source of Truth für die Phase:**

| Datei | Zweck |
|---|---|
| `brand/DESIGN.md` | Vollständige Design-Entscheidungen (Blöcke A–F) — maschinenlesbar, LLM-optimiert |
| `brand/VOICE.md` | Tonfall + Microcopy-Library (50+ vordefinierte Strings) |
| `brand/tokens.json` | W3C Design Tokens (Colors, Typography, Spacing, Radius, Shadows) |
| `brand/logos/` | 11 Logo-Varianten (wide, umbenannt nach sauberer Convention) |
| `brand/IMPLEMENTATION-TODO.md` | Detaillierter 8-Schritte-Plan mit Aufwand-Schätzung |

---

## Kern-Entscheidungen (bereits gefallen)

### Welt-Mapping
- **Light-Theme** = Education (Rosa/Rot-Akzente, `#F6F6F6` Body-BG)
- **Dark-Theme** = Business (Blau/Neon-Akzente, `#141414` Body-BG)
- Default = `prefers-color-scheme`, User-Toggle überschreibt
- **Kein Flächen-Flood** — Rosa/Blau sind nur in Header + Akzenten, nicht Seiten-BG

### Typografie
- **Geist Sans + Geist Mono** (OFL, via `next/font/google`)
- **Mono** für H1/Hero, Buttons, Tags, Labels, Code
- **Sans** ab H2 + Body
- Inter raus, Cascadia Referenz raus
- Skala: H1 44 (fluid 32–48), H2 28 (fluid 24–32), H3 20, Body 16, Caption 13, Micro 11

### Farben
- **Brand-Farben unverändert** aus CI-PDF: Rosa `#FC78FE`, Rot `#F5133B`, Blau `#3A3AFF`, Neon `#CEFF32`
- **Neutrals via Radix Colors** (`@radix-ui/colors`, slate + slate-dark, 12 Steps + Alpha)
- **Semantic States** separat (nicht Brand-Farben): Error `#DC2626`, Success `#16A34A`, Warning `#F59E0B`, Info `#2563EB`
- **Primary-Action = `--accent`** (Rot Light / Neon Dark) — Fix bereits in globals.css eingespielt
- **Focus-Ring = `--text`** (neutral-kontraststark) — Fix bereits in globals.css eingespielt

### Logo
- 11 Varianten in `brand/logos/` mit sauberer Naming-Convention (`logo-wide-<colorway>.svg`)
- Neue `<Logo />` Component in `packages/ui/` mit `colorway="auto"` + Kontext-Prop
- Kontext-zu-Datei-Matrix in `brand/DESIGN.md` §F
- Favicon bleibt offen (braucht separates Design-Briefing — nicht Teil dieser Phase)

### Voice
- **Du überall** (auch Business)
- **Konfident-casual** — "Let's go", "Ups", "Hmm", "Passt" als Brand-Signatur
- Microcopy-Library in `brand/VOICE.md` — in dieser Phase gegen bestehende UI-Strings abgleichen

---

## Scope dieser Phase

### In-Scope
1. Package-Installation: `@radix-ui/colors`, Geist-Fonts
2. `packages/config/tailwind/base.css` erweitern (Radix imports, Font-Family, Token-Mapping)
3. `<Logo />` Component in `packages/ui/` + 11 Varianten verdrahten
4. Website-Migration: Inter → Geist, Hex → Radix-Tokens, Logo-Swap, Microcopy-Pass
5. tools-app-Migration: gleich wie Website
6. Visual-Regression-Check via Playwright (Baseline-Screenshots vor/nach)

### Out-of-Scope (bewusst)
- Favicon-Design (braucht separates Briefing — siehe BACKLOG)
- Square-Logo-Varianten (nicht in Asset-Drop, beim Designer nachfordern)
- Mail-Templates auf React Email (ist Phase 17)
- Radix-Square-Logo-Varianten (P3)
- Circle Custom-CSS (separater Admin-Task für Luca)
- OG-Image-Templates (P2, später)

### Success Criteria (aus ROADMAP.md)
- [ ] `pnpm build` beider Apps grün
- [ ] Light/Dark-Toggle-Visual-Check: Header, Buttons, Body-Text, Cards — nichts gebrochen
- [ ] Typografie visuell = Geist (H1 Mono, H2 Sans) wie in `brand/typography-scale.html` Option B
- [ ] Radix-Tokens greifen (kein Hardcoded Hex mehr in Component-Files für Neutrals)
- [ ] Logo-Component ersetzt alle hardcoded Logo-Paths in Website + tools-app
- [ ] Microcopy aus `brand/VOICE.md` durchgängig eingesetzt (Buttons, Errors, Toasts, Empty-States)
- [ ] Visual-Regression-Screenshots: nur gewollte Änderungen, keine ungewollten Layout-Bruchstellen
- [ ] Alle E2E-Tests grün

---

## Vorschlag für PLAN.md-Struktur (3 Waves)

Dem Planner als Orientierung — finale Struktur entscheidet der Planner selbst.

### Wave 1 — Foundation
- Plan 16-01: `@radix-ui/colors` + Geist installieren, `base.css` erweitern, Token-Layer setzen
- Plan 16-02: `<Logo />` Component in `packages/ui/` + 11 Varianten-Mapping

### Wave 2 — App-Migration (kann parallel laufen)
- Plan 16-03: Website auf neue Tokens + Fonts + Logo + Microcopy
- Plan 16-04: tools-app auf neue Tokens + Fonts + Logo + Microcopy

### Wave 3 — Verify
- Plan 16-05: Playwright Visual-Regression Baseline + Diff + Smoke-Test Light/Dark auf beiden Apps

---

## Technische Notizen

### Bereits erledigt (nicht nochmal anfassen)
- `apps/website/app/globals.css`: `--color-primary: var(--accent)`, `--color-primary-foreground: var(--text-on-accent)`, `--color-ring: var(--text)` — Fix bereits eingespielt während Workshop-Session am 2026-04-18

### Aufgepasst bei Migration
- **CSP + Force-Dynamic Regel**: Nonce auf Request-Headers bleibt, `export const dynamic = "force-dynamic"` im Root-Layout bleibt. Siehe `apps/website/AGENTS.md` und `LEARNINGS.md`. Bei Font-Einbindung via `next/font/google` beachten, dass kein externer Font-Request entsteht (next/font self-hosted).
- **packages/config ist shared** — Änderungen an `base.css` betreffen beide Apps gleichzeitig. Vor Umstellung: Snapshot von beiden Apps als Regression-Baseline.
- **Aktueller Font-Stand Website**: Inter via `--font-sans`, siehe `apps/website/app/globals.css` Zeile `--font-sans: var(--font-inter), ...`. Beim Geist-Swap Import in Layout anpassen.
- **Logo-Paths aktuell**: müssen alle gefunden und durch `<Logo />` ersetzt werden — in beiden Apps. `rg "logo"` über Repo zeigt Fundstellen.

### Changeset
- minor Bump (v4.3.0) — Design-System-Foundation ist ein sichtbares Feature für alle Nutzer

---

## Referenzen

- Workshop-Dokumente:
  - `brand/DESIGN.md` · Haupt-Referenz
  - `brand/VOICE.md` · Tonfall + Microcopy
  - `brand/tokens.json` · Maschinenlesbare Tokens
  - `brand/IMPLEMENTATION-TODO.md` · Schritt-Plan
- Mockups für visuellen Abgleich:
  - `brand/typography-scale.html` · Option B als Ziel
  - `brand/typography-mockup-geist.html` · Geist-Varianten
- CI-Quelle:
  - `Generation AI_CI.pdf` (im Repo-Root) · 9 Logo-Varianten + Farbpalette
- Logo-Assets:
  - `brand/logos/` · 11 SVG-Dateien mit sauberer Naming-Convention

---

**Erstellt:** 2026-04-18 · nach Workshop-Session mit Luca
