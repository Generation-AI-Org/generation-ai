---
phase: 21
slug: about-page
status: draft
shadcn_initialized: false
preset: none
created: 2026-04-24
---

# Phase 21 — UI Design Contract

> `/about`-Seite. Single-Page-Layout mit 9 Sections. Credibility-Anker (warm für Studis, seriös für Partner). Reuse der gesamten DS-Baseline aus Phase 20.6. Keine neuen Tokens, keine neuen Primitives — ausschließlich Komposition auf existierendem Fundament.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none (eigenes DS-Fundament, keine shadcn-Init geplant in v4.0) |
| Preset | not applicable |
| Component library | keine externe — Komposition aus `components/sections/*` + `components/ui/*` (project-lokal, Phase 20.6 etabliert) |
| Icon library | `lucide-react` (projektweit etabliert, z.B. `ArrowRight`, `ArrowUpRight`, `ExternalLink`, `Linkedin` via Inline-SVG Fallback) |
| Font | Geist Sans (Body, H2, H3) + Geist Mono (H1, Eyebrows, Buttons, Micro-Labels) — global via `GeistSans.variable` / `GeistMono.variable` in `app/layout.tsx` |
| Theme-Support | Dark default (`:root`) + Light-Mode (`.light` auf `<html>`). Alle Tokens theme-aware. |
| CSP-Constraint | Route `apps/website/app/about/page.tsx` muss durch `export const dynamic = "force-dynamic"` im Root-Layout dynamic gerendert werden (bereits aktiv). Keine per-page `dynamic`-Override nötig — LEARNINGS.md Regel 2 wird durch Root-Layout erfüllt. |

**Reuse-Kern (aus Phase 20.6, nicht neu bauen):**

- `components/sections/kurz-faq-section.tsx` — Accordion-Mechanik (Multi-open, `useId`-basierte aria-controls/labelledby, motion-entry, rotate-plus-icon, rote-Faden-Hairline) ist Blueprint für die 10-FAQ auf `/about`. Komponente wird NICHT in `packages/ui` extrahiert (Plan-21-Entscheidung offen, aber Default: lokale Neu-Komposition einer Schwester-Komponente `faq-section.tsx` mit identischer Mechanik, nur anderem Daten-Input + anderem Eyebrow-Text).
- `components/sections/final-cta-section.tsx` — CTA-Pattern (Primary-Pill + Secondary-Outline-Pill, exakte Paddings/Durations, Hero-Parity) ist Blueprint für Abschluss-CTA.
- Section-Header-Pattern: `// kommentar` (font-mono, 11px, uppercase, tracking-0.2em, text-muted) + Dot-Bullet (`h-1.5 w-1.5 rounded-full` mit `background: var(--accent) + boxShadow: 0 0 8px var(--accent-glow)`) + H3 (Geist Sans, 20px, weight 700, lh 1.3).
- Entry-motion Pattern: `useReducedMotion()` gate → `fadeIn` mit `initial: {opacity: 0, y: 16}, whileInView: {opacity: 1, y: 0}, viewport: {once: true, margin: "-10% 0px"}, transition: {duration: 0.6, ease: [0.16, 1, 0.3, 1]}`.
- Cross-section "roter-Faden" Beam aus `final-cta-section.tsx` wird NICHT in `/about` dupliziert — `/about` bleibt typografie- und flächengetrieben, ohne zusätzliches Connection-Motif zwischen Sections.

---

## Spacing Scale

Declared values (alle Multiples von 4, aus `packages/config/tailwind/base.css` Design-Tokens `--space-*`):

| Token | Value | Usage in Phase 21 |
|-------|-------|-------------------|
| xs (`--space-1`) | 4px | Icon-Text-Gaps, Inline-Dot-Bullet neben Eyebrow |
| sm (`--space-2`) | 8px | Kompakte Tag/Pill-Abstände, Inline-Link-Gap zur Pfeil-Arrow |
| md (`--space-4`) | 16px | Default-Element-Spacing innerhalb einer Card, Team-Kachel-Padding intern |
| lg (`--space-6`) | 24px | Accordion-Panel-Padding horizontal, Card-Padding, Gründer-Karte interne Paddings |
| xl (`--space-8`) | 32px | Werte-Block-Vertical-Spacing, Team-Grid-Gap (Desktop) |
| 2xl (`--space-12`) | 48px | Section-Header→Content-Spacing, innerhalb einer Section |
| 3xl (`--space-16`) | 64px | Mitglieder-Grid-Item-Gap bei Tablet, Mobile-Section-Padding vertikal |
| — (`--space-24`) | 96px | Section-Vertical-Padding Desktop (via `py-24 sm:py-32` etabliert in 20.6) |

**Section-Padding-Standard (übernommen aus 20.6-Sections, exakt):**

- Section-Vertical: `py-24 sm:py-32` (96px → 128px Desktop). Hero Phase 21 (kleiner als Landing-Hero): `py-28 sm:py-36` (abgeleitet — kein Signal-Grid, kein Aurora, nur Typo).
- Section-Horizontal: `px-6` innerhalb `mx-auto` Container.
- Container-max-width:
  - Text-zentrierte Sections (Hero, Story, Werte, Verein, Mitmach, Abschluss-CTA): `max-w-3xl` (768px) — exakt wie `kurz-faq-section.tsx`.
  - Team-Grid-Section: `max-w-5xl` (1024px) — damit 4×3-Grid atmen kann.
  - FAQ-Accordion: `max-w-3xl` (768px) — 1:1 wie Kurz-FAQ.
  - Kontaktbox: `max-w-3xl` (768px).

**Exceptions:** keine. Alle Werte bleiben in der 4-basierten Scale.

---

## Typography

Alle Werte sind Design-Token-basiert aus `packages/config/tailwind/base.css`. Zeilenhöhen folgen den semantischen `--lh-*`-Tokens.

| Role | Size | Weight | Line Height | Font | Usage |
|------|------|--------|-------------|------|-------|
| Hero H1 (`/about`) | `clamp(32px, 5vw, 48px)` (`--fs-h1`) | 700 | 1.05 (`--lh-tight`) | Geist Mono | „Warum es uns gibt." (Section 1) |
| Display-Claim (Englisch-Lock) | 28px (Mobile) → 36px (Desktop) | 700 | 1.1 | Geist Mono | „We shape talent for an AI-native future." — D-07 |
| H2 Section (Mitmach, Abschluss) | `clamp(24px, 3vw, 32px)` (`--fs-h2`) | 700 | 1.2 (`--lh-headline`) | Geist Sans | „Bock, mitzumachen?", „Wir freuen uns auf dich." |
| H3 Section-Header | 20px (`--fs-h3`) | 700 | 1.3 (`--lh-sub`) | Geist Sans | „Warum wir das machen.", „Wir sind Generation AI.", „Worauf wir Wert legen.", „Gemeinnützig. Transparent. Offen.", „Was du wissen solltest.", „Hier erreichst du uns." |
| Eyebrow / Micro-Label | 11px (`--fs-micro`) | 700 | 1.4 | Geist Mono | Alle Section-Header `// kommentar` Eyebrows + Team-„Stand April 2026" Zeile, tracking `0.2em` uppercase, color `text-muted` |
| Lede / Intro (Hero-Subline) | 18px (`--fs-lede`) | 400 | 1.5 (`--lh-lede`) | Geist Sans | Hero-Intro-Absatz, Mitmach-Body, Abschluss-Body |
| Body | 16px (`--fs-body`) | 400 | 1.65 (`--lh-body`) | Geist Sans | Story-Absätze, Werte-Bodies, Verein-Body, FAQ-Antworten |
| Body Small | 14px (`--fs-small`) | 400 | 1.55 | Geist Sans | Team-Gründer-Bios, Kontaktbox-Description-Zeilen |
| Caption | 13px (`--fs-caption`) | 400 | 1.5 | Geist Sans | Team-Member-Sub-Row (Name-Caption unter Placeholder-Avatar), Mitglieder-Kacheln |
| Bold-Claim (Werte-Block) | 16px | 700 | 1.3 | Geist Sans | „Offen für alle.", „Anwenden statt auswendig lernen.", „Signal statt Noise.", „Voneinander lernen, zusammen wachsen." — jeweils `text-text` + nachfolgender Body in `text-text-secondary` |
| Button-Label | 14-15px (`--fs-button` bzw. Hero-Parity 15px) | 700 | 1 | Geist Mono | Primary + Secondary CTAs, tracking `0.02em` |
| FAQ-Trigger-Label | 15-16px | 700 | 1.35 | Geist Mono | Accordion-Button-Text (exakt aus `kurz-faq-section.tsx`) |
| FAQ-Answer-Body | 15px | 400 | 1.6 | Geist Sans | Panel-Antwort-Absatz, `text-secondary` |

**Regeln:**

- Keine zusätzlichen Font-Files. Geist Sans + Geist Mono sind der komplette Stack.
- Keine Italic-Bodies außer in potenziellen Blockquotes (nicht vorgesehen in Phase 21).
- `text-wrap: balance` (H1-H4, via globals.css) + `text-pretty` (Bodies, inline via class) bleiben Pflicht — verhindert Lone-Word-Orphans.
- `font-variant-numeric: tabular-nums` (global) bleibt — wichtig für „Stand: April 2026"-Zeile und FAQ-Index-Marker `// 01`–`// 10`.

---

## Color

60/30/10-Split, 1:1 übernommen aus Phase 20.6 Landing. Keine neuen semantischen Farben.

| Role | Value (Dark/Default) | Value (Light) | Usage |
|------|----------------------|---------------|-------|
| Dominant (60%) — App-BG | `var(--bg)` = `#141414` | `#F6F6F6` | Alle Section-Backgrounds (`bg-bg`), 9 von 9 Sections |
| Secondary (30%) — Cards | `var(--bg-card)` = `#1C1C1C` | `#FFFFFF` | Verein-Highlighted-Card (§1.5 User-Decision 4), Gründer-Karten-BG, Team-Member-Kachel-BG, FAQ-Accordion-Item-BG, Kontaktbox-Card-BG |
| Secondary (elevated) | `var(--bg-elevated)` = `#222222` | `#EFEFEF` | Placeholder-Avatar-Background (Initialen-Tiles), Hover-States auf Team-Kacheln |
| Accent (10%) | `var(--accent)` = `#CEFF32` (Neon Green) | `#F5133B` (Brand Red) | **Reserved-for-List unten** |
| Destructive | `#DC2626` (`--status-error`) | `#DC2626` | NICHT verwendet in Phase 21 — keine destruktiven Aktionen auf `/about`. |
| Text Primary | `var(--text)` = `#F6F6F6` | `#141414` | H1, H2, H3, Bold-Claims, FAQ-Trigger, Gründer-Name |
| Text Secondary | `var(--text-secondary)` = `#B0B0B0` | `#666666` | Body-Absätze, FAQ-Antworten, Werte-Body-Zeilen, Team-Bio, Kontaktbox-Description |
| Text Muted | `var(--text-muted)` = `#8A8A8A` | `#555555` | Eyebrows (`// kommentar`), „Stand April 2026"-Sub-Zeile, Secondary-Text-Links (Partner/Mitmach-Links unter Abschluss-CTA) |
| Border Subtle | `var(--border)` = `rgba(255,255,255,0.08)` | `rgba(0,0,0,0.1)` | Cards, Accordion-Items, Gründer-Karten, Verein-Card |
| Border Accent (Hover) | `var(--border-accent)` = `rgba(206,255,50,0.6)` | `rgba(245,19,59,0.4)` | Hover-State auf Cards + Accordion-Items + Secondary-CTA-Outline |

**Accent reserved for (explizite Liste — NICHT „alle interaktiven Elemente"):**

1. Dot-Bullet in jedem Section-Header-Eyebrow (5x5px runde Dot mit Glow).
2. Primary-CTA-Buttons (2 Stück in Phase 21: Mitmach-CTA `[Melde dich]` und Abschluss-CTA `[Kostenlos Mitglied werden]`).
3. Inline-Hero-Word-Highlight (optional, bewusst sparsam): `dabei` in der Abschluss-CTA-H2 und ggf. ein Keyword im Hero — **maximal 1 Wort pro H1/H2**. Entscheidung pro Headline im Planner.
4. Hover-Focus-Ring + Hover-Border-Accent auf Cards und Accordion-Items (via `--border-accent`).
5. FAQ-Accordion Index-Marker `// 01` bis `// 10` in der Trigger-Zeile (accent-color).
6. FAQ-Accordion Plus-Icon im Hover-State + rotiert im Open-State (Plus wird Cross).
7. LinkedIn-Icon-Hover-State bei Gründer-Karten.
8. Inline-CTA-Pfeil `→` in Story-Closer „Werde Teil davon →" (accent-color beim Hover auf dem Link).
9. Verein-Section-Highlight — dezente Accent-Glow-Outline auf der Verein-Card (optional, D-09 `#verein`-Anker muss User sofort erkennen lassen „hier bin ich"). Umsetzung: `ring-1 ring-[var(--border-accent)]/30` oder einfacher Accent-Hairline-Top wie in `final-cta-section.tsx`.

**Regeln:**

- Body-Links sind NICHT accent-gefärbt — nutze `underline-on-hover` mit `text` bleibt `text-secondary/text` (body-color). Gilt für die Secondary-Abschluss-CTA-Zeile („→ Partner werden · → Aktiv mitmachen") und für Inline-Links in FAQ-Antworten 8+10 (Team-Section- und Mitmach-CTA-Anker).
- Keine semantischen Warn/Error/Success-Farben auf `/about` verwenden. Seite hat keine Form, keine Banner.
- Placeholder-Avatar-Initialen: `color: var(--text)` auf `background: var(--bg-elevated)` + dezente `border: var(--border)`. KEIN accent-gefärbtes Initial — vermeidet Noise im Team-Grid.

---

## Copywriting Contract

Copy-Snippets mit echten Umlauten (CLAUDE.md Regel). Finales Marketing-Wording ist Phase 27 — für Phase 21 ist **Simons §9-Wording Source-of-Truth**. Alles hier ist implementier-ready, nicht „Platzhalter".

### Hero (Section 1)

| Element | Copy |
|---------|------|
| Eyebrow | `// Generation AI · Über uns` |
| H1 | „Warum es uns gibt." |
| Display-Claim (Englisch, D-07) | „We shape talent for an AI-native future." |
| Intro-Absatz | „Wir bringen Studierenden die KI-Skills bei, die in Jobs heute schon erwartet werden. Kostenlos, praxisnah, für alle Fachrichtungen." |

### Story (Section 2, Anker `#story`)

| Element | Copy |
|---------|------|
| Eyebrow | `// unsere story` |
| H3 | „Warum wir das machen." |
| Absatz 1 | „Janna und Simon haben Generation AI im Februar 2026 gegründet. Beide haben selbst studiert, als KI in der Mitte der Gesellschaft ankam — und gemerkt, wie schnell der Abstand wächst zwischen dem, was Unis lehren, und dem, was in Jobs heute erwartet wird." *(Platzhalter bis Luca finale Founder-Story liefert, Phase 27.)* |
| Absatz 2 | „Aus einem Workshop-Versuch zu zweit ist ein Team von zehn Leuten geworden. Studierende, Early-Careers, ehrenamtlich. Wir bauen die Community auf, die wir selbst gebraucht hätten." |
| Absatz 3 | „Ziel: eine Generation, die KI nicht erleidet, sondern gestaltet. Offen für alle Fachrichtungen, kostenlos, unabhängig." |
| Inline-CTA | „Werde Teil davon →" (Link auf `#mitmach` Anker) |

### Team (Section 3, Anker `#team`)

| Element | Copy |
|---------|------|
| Eyebrow | `// wer dahintersteckt` |
| H3 | „Wir sind Generation AI." |
| Sub-Zeile | „Stand: April 2026 · Wir wachsen." |
| Gründer-Karten: Rolle | „Co-Founder" (beide) |
| Gründer-Bio (Draft, 1-2 Sätze) | *Janna*: „Gründerin. Macht das strategische Big-Picture und die Partnerschaften." *(Platzhalter bis Luca Bios liefert.)* *Simon*: „Gründer. Verantwortet Community-Aufbau und Events." *(Platzhalter.)* |
| LinkedIn-Link-Label (screenreader) | „LinkedIn-Profil von {Name}" |
| Aktive-Mitglieder-Section-Sub-Header | *(optional, nur wenn in der Implementation Micro-Trenner zwischen Gründern und Mitgliedern gewünscht)* `// aktive mitglieder` |
| Placeholder-Avatar-Fallback (aria-label) | „Platzhalter-Porträt von {Name}" |

**Team-Grid-Content (10 aktive Mitglieder zum Launch, §1.3 User-Decision 1):**

Die 10 Mitgliedernamen werden vom Planner aus aktueller Mitgliederliste übernommen. UI-SPEC-Scope: layout + placeholder-copy, nicht Namen-Lock.

### Werte (Section 4, Anker `#werte`)

| Block | Bold-Claim | Body |
|-------|-----------|------|
| 1 | „Offen für alle." | „KI-Kompetenz ist keine Frage des Studiengangs. Von Medizin bis Maschinenbau, von Pädagogik bis Politik — jede Disziplin wird durch KI verändert, und jede Disziplin braucht Leute, die verstehen, wie sie funktioniert." |
| 2 | „Anwenden statt auswendig lernen." | „Theorie alleine bringt nichts. Bei uns baust du in Workshops echte Dinge — vom ersten Chat-Agenten bis zur Mini-Automatisierung. Erfolg heißt: du hast am Ende einen Output, den du nutzen kannst." |
| 3 | „Signal statt Noise." | „Das KI-Feld ist voll mit Gurus, Hype-Tools und Tutorial-Flut. Wir filtern. Was wir zeigen, haben wir selbst geprüft — oder wir sagen ehrlich, wenn wir's noch nicht wissen." |
| 4 | „Voneinander lernen, zusammen wachsen." | „Community ist unser Kernangebot, nicht Content. Die besten Einsichten kommen aus der Gruppe — nicht von einem Dozenten vorne. Wer aktiv teilt, lernt am schnellsten." |

**Eyebrow:** `// was uns antreibt` · **H3:** „Worauf wir Wert legen."

### Verein (Section 5, Anker `#verein` — kritisch für Partner-Page-Link, D-09)

| Element | Copy |
|---------|------|
| Eyebrow | `// verein` |
| H3 | „Gemeinnützig. Transparent. Offen." |
| Absatz 1 (Rechtsform) | „Generation AI ist ein gemeinnütziger Verein in Gründung (e.V. i.G.). Gewinnorientiert sind wir nicht — alles, was reinkommt, geht in die Community zurück." |
| Absatz 2 (Finanzierung) | „Finanziert durch Fördermittel, Sachleistungen und Partnerschaften mit Unternehmen, Stiftungen und Hochschulen. Keine Paywall, keine versteckten Kosten für Mitglieder." |
| Absatz 3 (Mitgliedschaft) | „Mitgliedschaft ist kostenlos. Aktives Mitmachen — Events organisieren, Content beitragen, Strategie mitbauen — ist möglich und willkommen." |

**Visual:** Hervorgehobene Card mit `bg-bg-card` + `rounded-2xl` + `border border-border` + dezenter Accent-Hairline oben (6-10px breiter accent-Strich, opacity 60%). Card hat `px-8 py-10` interne Paddings. Card sitzt zentriert mit `max-w-3xl`.

### Mitmach-CTA (Section 6, Anker `#mitmach`)

| Element | Copy |
|---------|------|
| H2 | „Bock, mitzumachen?" |
| Body | „Wir suchen Leute, die mit aufbauen wollen. Events, Content, Strategie, Tech — sag uns, wo du anpacken würdest." |
| Primary-CTA | `Melde dich` |
| CTA-Mechanik (D-08) | `href="mailto:info@generation-ai.org?subject=Mitmachen"` |

### FAQ (Section 7, Anker `#faq` — Target vom Landing-Kurz-FAQ-Link)

| Element | Copy |
|---------|------|
| Eyebrow | `// fragen & antworten` |
| H3 | „Was du wissen solltest." |

**Sync-Regel (User-Decision 3):** Fragen 3, 5, 6, 7 + „Was passiert nach der Anmeldung?"-Äquivalent sind 1:1 identisch zur Copy in `components/sections/kurz-faq-section.tsx`. **Source-of-Truth für die überlappenden 5 Fragen ist die bereits gelockte Copy in der Kurz-FAQ-Section.** Bei Copy-Change muss Kurz-FAQ + /about-FAQ gemeinsam geändert werden.

**10-Fragen-Liste mit Antwort-Draft:**

| # | Frage | Antwort |
|---|-------|---------|
| 01 | „Was ist Generation AI?" | „Wir sind die erste kostenlose KI-Community für Studierende im DACH-Raum. Gemeinnütziger Verein in Gründung. Wir bringen praktische KI-Skills in Workshops, Community-Austausch und kuratierte Wissensplattform zusammen — für alle Fachrichtungen, nicht nur Informatik." |
| 02 | „Wer kann Mitglied werden?" | „Studierende und Early-Career-Professionals aus dem DACH-Raum (Deutschland, Österreich, Schweiz) — unabhängig von Hochschule, Fachrichtung oder Vorerfahrung." |
| 03 | „Kostet die Mitgliedschaft etwas?" | *(1:1 identisch mit Kurz-FAQ #1)* „Nein. Mitgliedschaft, Community-Zugang, Wissensplattform und Events sind kostenlos. Generation AI ist als gemeinnütziger Verein aufgestellt und finanziert sich über Fördermitglieder und Partner." |
| 04 | „Wie melde ich mich an?" | „Über den Button oben (`Jetzt beitreten`) — kurzer Fragebogen, Bestätigung per Mail, dann direkter Zugang zur Community. Dauert keine 2 Minuten." |
| 05 | „Brauche ich technisches Vorwissen?" | *(1:1 identisch mit Kurz-FAQ #2)* „Nein. Wir starten beim Alltagsnutzen und führen schrittweise zu Agenten und Automatisierung. Alle Fachrichtungen willkommen — du musst weder programmieren können noch Informatik studieren." |
| 06 | „Wie viel Zeit muss ich investieren?" | *(1:1 identisch mit Kurz-FAQ #4)* „So viel oder so wenig du willst. Kein Pflichtprogramm. Die Community läuft asynchron, Events sind optional. Viele schauen monatlich rein, andere bauen aktiv mit — beides passt." |
| 07 | „Muss ich an einer bestimmten Uni sein?" | *(1:1 identisch mit Kurz-FAQ #3)* „Nein. Offen für Studierende und Early-Career aus dem gesamten DACH-Raum, unabhängig von Hochschule oder Fachrichtung. Wir arbeiten perspektivisch mit Hochschulen zusammen, aber eine Mitgliedschaft ist daran nicht gebunden." |
| 08 | „Wer steckt hinter Generation AI?" | „Gegründet im Februar 2026 von Janna und Simon. Inzwischen ein zehnköpfiges Team aus Studierenden und Early-Careers, alle ehrenamtlich. → Mehr zum Team." *(„Mehr zum Team" ist Inline-Link auf `#team`-Anker.)* |
| 09 | „Wie finanziert ihr euch?" | „Über Fördermittel, Partnerschaften mit Unternehmen, Stiftungen, Hochschulen — und durch Sachleistungen (z.B. Tool-Zugänge, Event-Räume). Gewinnorientiert sind wir nicht. → Details im Verein-Abschnitt." *(Inline-Link auf `#verein`.)* |
| 10 | „Kann ich aktiv im Verein mitarbeiten?" | „Ja — und wir suchen aktiv Leute. Events, Content, Strategie, Tech, Partnerschaften. → Mitmachen." *(Inline-Link auf `#mitmach`.)* |

**A11y-Pattern (1:1 von `kurz-faq-section.tsx`):**

- Multi-open (`Set<number>` state, User kann mehrere gleichzeitig öffnen — D-03 + User-Decision 3).
- `<button aria-expanded aria-controls>` auf Trigger, `<div role="region" aria-labelledby>` auf Panel.
- Plus-Icon rotiert 45° im Open-State (wird zu Kreuz).
- `AnimatePresence` mit `height: 0 ↔ auto` + opacity. `useReducedMotion` → instant toggle.
- Keyboard: native `<button>` → Space/Enter. Tab iteriert sequentiell.
- Inline-Links innerhalb Antworten: `underline-on-hover`, `text-secondary` default, accent-farbe auf hover.

### Abschluss-CTA (Section 8)

| Element | Copy |
|---------|------|
| H2 | „Wir freuen uns auf dich." |
| Body | „Mitgliedschaft ist kostenlos und in 2 Minuten erledigt." |
| Primary-CTA | `Kostenlos Mitglied werden` → `/join` |
| Secondary-Zeile (User-Decision 2) | `→ Partner werden · → Aktiv mitmachen` |
| Secondary-Link-1 | „→ Partner werden" → `/partner` |
| Secondary-Link-2 | „→ Aktiv mitmachen" → `#mitmach` |
| Trenner | Middle-Dot ` · ` (Unicode `\u00B7`), einfache Whitespace-Einbettung |

**Layout:**

- Primary-CTA zentriert (reuse `final-cta-section.tsx` Styling für Primary-Pill).
- Secondary-Zeile darunter, zentriert, `mt-4` Abstand, `text-muted` body-color, `underline-on-hover` beim jeweiligen Link.
- Kein Popover, keine Card-UI für Secondary.

### Kontaktbox (Section 9, Anker `#kontakt`)

| Element | Copy |
|---------|------|
| Eyebrow | `// kontakt` |
| H3 | „Hier erreichst du uns." |
| Zeile 1 Label | „Allgemeine Anfragen" |
| Zeile 1 Value | `info@generation-ai.org` (mailto-Link) |
| Zeile 2 Label | „Partnerschaften" |
| Zeile 2 Value | „Zur Partner-Seite →" (Link `/partner`) |
| Zeile 3 Label | „Aktiv mitmachen" | 
| Zeile 3 Value | „Zum Mitmach-Aufruf →" (Anker-Link `#mitmach`) |

**Layout:** Einzelne `bg-bg-card` Card mit `rounded-2xl`, `px-6 py-8`, drei Zeilen untereinander (`divide-y divide-border` für Trenner) oder drei kleine Sub-Cards in einem Stack.

### Meta-Tags

| Element | Copy |
|---------|------|
| `<title>` | „Über uns · Generation AI" (wird im Browser als „Über uns · Generation AI \| Generation AI" dank Root-Template — alternativ: `title: { absolute: "Über uns · Generation AI" }` zum Unterdrücken der Template-Wiederholung) |
| Meta-Description | „Warum es Generation AI gibt, wer dahintersteckt und wie wir uns organisieren. Gemeinnütziger Verein in Gründung, von und für Studierende im DACH-Raum." |
| OG-Title | „Über uns · Generation AI" |
| OG-Description | (wie Meta-Description) |
| OG-Image | Reuse des Landing-OG (`app/opengraph-image.tsx`) bis dediziertes `/about`-OG-Image kommt — deferred auf Phase 27 Copy-Pass |

### Empty / Error States

**Relevanz:** Phase 21 hat keine dynamischen Datenquellen (kein API-Fetch, keine Forms, keine User-generated Content). Empty/Error-States sind NICHT zutreffend.

**Einzige Ausnahme:** Falls LinkedIn-URLs für Gründer bei Launch noch fehlen (D-06), muss der Link `disabled` oder versteckt gerendert werden — kein broken `#`-Link. Das ist eine Build-Time-Bedingung, kein Runtime-State.

| Element | Behaviour |
|---------|-----------|
| LinkedIn-Link fehlt (D-06) | Icon wird NICHT gerendert. Karte bleibt ohne LinkedIn-Zeile. Kein Dead-Link, kein Placeholder-`#`, kein Tooltip „bald verfügbar". |

### Destruktive Aktionen

**Keine** destruktiven Aktionen auf `/about`. Keine Account-Löschung, keine Form-Submits, keine irreversiblen State-Changes. Destructive-Confirmation-Pattern ist in dieser Phase NICHT zutreffend.

---

## Component Inventory

Komposition aus existierenden Primitives + neuen, lokalen Section-Components.

| Component (neu) | Lokation | Reuse-Basis | Zweck |
|-----------------|----------|-------------|-------|
| `AboutHeroSection` | `apps/website/components/about/hero-section.tsx` | Typo-only, kein Signal-Grid / kein Aurora | H1 + Englisch-Claim + Intro-Absatz |
| `AboutStorySection` | `apps/website/components/about/story-section.tsx` | Section-Header-Pattern aus 20.6 | 3 Absätze + Inline-CTA |
| `AboutTeamSection` | `apps/website/components/about/team-section.tsx` | `bg-bg-card` + Avatar-Tile-Pattern | Gründer-Karten (2 prominent) + Mitglieder-Grid (10, 4×3 Desktop / 2-col Tablet / 1-col Mobile) |
| `AboutValuesSection` | `apps/website/components/about/values-section.tsx` | Bold-Claim-Pattern | 4 Werte-Blöcke, vertikaler Stack |
| `AboutVereinSection` | `apps/website/components/about/verein-section.tsx` | Card-Pattern aus `bg-bg-card` | Hervorgehobene Card mit 3 Absätzen, `#verein`-Anker |
| `AboutMitmachCTASection` | `apps/website/components/about/mitmach-cta-section.tsx` | Primary-Pill-Pattern aus `final-cta-section.tsx` | H2 + Body + Mailto-Button |
| `AboutFaqSection` | `apps/website/components/about/faq-section.tsx` | 1:1 Mechanik-Reuse von `kurz-faq-section.tsx` | 10-FAQ Accordion, multi-open, `#faq`-Anker |
| `AboutFinalCTASection` | `apps/website/components/about/final-cta-section.tsx` | Primary-Pill + Secondary-Text-Links-Zeile | „Wir freuen uns auf dich." + 2 Secondary-Links |
| `AboutKontaktSection` | `apps/website/components/about/kontakt-section.tsx` | Card-Pattern + 3-Zeilen-Liste | 3 Kontaktwege, `#kontakt`-Anker |
| `TeamMemberCard` | `apps/website/components/about/team-member-card.tsx` (sub-component) | Avatar-Placeholder + Name-Row | Einzelne Member-Kachel mit Placeholder-Avatar-Fallback |
| `FounderCard` | `apps/website/components/about/founder-card.tsx` (sub-component) | Placeholder-Avatar + Name + Rolle + Bio + LinkedIn | Prominente Gründer-Karte |
| `PlaceholderAvatar` | `apps/website/components/about/placeholder-avatar.tsx` (sub-component) | `bg-bg-elevated` + Initialen in Geist-Mono | Fallback-Avatar bis echte Fotos liegen |

**Component-Ordner:** Neue Ordnerkonvention `components/about/` — konsistent mit `components/sections/` (Landing) und `components/ui/` (primitives). Keine Extraktion nach `packages/ui` für Phase 21 (zu early).

**Accordion-Komponenten-Heimat (Open Question 7 aus CONTEXT):**

Entscheidung: **Lokale Neu-Komposition in `components/about/faq-section.tsx`.** Reuse-Strategie:

- Daten-Struktur (`FaqItem`-Type), Accordion-Mechanik (`openIndices: Set<number>`, `toggle`, `aria-expanded`, `AnimatePresence`), Plus-Icon-Rotation, Reduced-Motion-Gate, Entry-Fade — alles **1:1 kopiert** aus `kurz-faq-section.tsx` oder in `components/ui/faq-accordion.tsx` extrahiert (Plan-Entscheidung).
- **Abweichungen zum Kurz-FAQ:**
  - 10 Fragen statt 5.
  - Kein „Mehr Fragen? → Über uns"-Footer-Link (wir SIND „Über uns").
  - Eyebrow anders: `// fragen & antworten` statt `// häufige fragen`.
  - H3 statt H2 (20px statt 3xl/4xl), weil `/about`-FAQ ist innerhalb der Seite eine Sub-Section, nicht Closing-Peak.
  - Inline-Links in Antworten 8, 9, 10 auf Anker-Targets `#team`, `#verein`, `#mitmach`.

**Route-File:**

- `apps/website/app/about/page.tsx` — Server Component, metadata export, rendert alle 9 Section-Components in Reihenfolge.
- `apps/website/app/about/layout.tsx` — NICHT nötig (Root-Layout reicht, `dynamic = "force-dynamic"` ist dort bereits gesetzt).

---

## Interaction Contract

| Interaction | Trigger | Behaviour |
|-------------|---------|-----------|
| Nav-Link „Über uns" klicken | Header-Nav | Route nach `/about`, Nav-Link highlightet aktiv (Header-Active-State, Konvention aus Phase 20 Header) |
| Anker-Deep-Link `/about#faq` | Landing-Kurz-FAQ-Footer-Link | Route lädt, Browser scrolled smooth zu `#faq`-Section (CSS `scroll-behavior: smooth`, reduced-motion-safe via `@media (prefers-reduced-motion: no-preference)` — bereits aktiv in `globals.css`) |
| Anker-Deep-Link `/about#verein` | Partner-Page (Phase 22, D-09) | Smooth-Scroll zu `#verein`, Card ist visuell eigenständig → User erkennt „hier bin ich" |
| Story-Inline-CTA „Werde Teil davon →" | Klick | Smooth-Scroll zu `#mitmach`-Anker (gleiche Seite) |
| FAQ-Accordion-Trigger | Klick oder Space/Enter | Toggle Panel. Multi-open (User kann mehrere offen haben). Plus-Icon rotiert 45°. Panel animiert height:0 ↔ auto über 0.3s mit ease `cubic-bezier(0.16, 1, 0.3, 1)`. Reduced-motion → instant. |
| FAQ-Answer-Inline-Link | Klick | Smooth-Scroll zu Ziel-Anker (`#team`, `#verein`, `#mitmach`). Panel bleibt offen. |
| Gründer-LinkedIn-Icon | Klick | Öffnet LinkedIn-URL in neuem Tab (`target="_blank" rel="noopener noreferrer"`). Fokus-Ring sichtbar bei Keyboard-Fokus. |
| Mitmach-CTA „Melde dich" | Klick | Öffnet Mailto: `mailto:info@generation-ai.org?subject=Mitmachen`. Keine in-app Form. |
| Abschluss-Primary-CTA „Kostenlos Mitglied werden" | Klick | Navigation zu `/join` (Next.js `<Link>`, `prefetch={false}` konsistent mit anderen Landing-CTAs) |
| Abschluss-Secondary-Link „→ Partner werden" | Klick | Navigation zu `/partner` |
| Abschluss-Secondary-Link „→ Aktiv mitmachen" | Klick | Smooth-Scroll zu `#mitmach` (gleiche Seite) |
| Kontaktbox-Mailto | Klick | Öffnet Mailto für `info@generation-ai.org` (ohne Subject-Präfix) |
| Kontaktbox „Zur Partner-Seite" | Klick | Navigation zu `/partner` |
| Kontaktbox „Zum Mitmach-Aufruf" | Klick | Smooth-Scroll zu `#mitmach` |
| Team-Placeholder-Avatar | Hover | Hover-State: dezenter `scale-[1.02]` (motion-safe), `border-border-accent` (Accent-Ring leicht sichtbar). Reduced-motion → kein scale. Kein Tooltip. |
| FAQ-Accordion-Hover | Hover auf Item-Card | `border-border-accent`-Transition. Kein Color-Change beim Trigger-Text. |
| Scroll — generell | - | Smooth via `scroll-behavior: smooth` (global, motion-safe). Kein scroll-driven JavaScript, keine Sticky-Mechaniken in Phase 21. |

**A11y-Kontrakt:**

- Alle interaktiven Elemente (Accordion-Trigger, Buttons, Links) haben `focus-visible`-Ring (globals.css: `outline: 2px solid var(--text); outline-offset: 2px;`).
- Skip-Link „Zum Inhalt springen" (aus Header) funktioniert auch auf `/about` — Main-Element der Page hat `id="main-content"`.
- Landmark-Struktur: `<main id="main-content">` wrappt alle Sections. Jede `<section aria-labelledby="...">` hat eindeutige ID.
- Heading-Hierarchie: 1× H1 (Hero) → mehrere H2 (Mitmach, Abschluss) → mehrere H3 (Section-Header für Story, Team, Werte, Verein, FAQ, Kontakt). KEINE H4+ nötig.
- Team-Placeholder-Avatars haben `aria-label="Platzhalter-Porträt von {Name}"`.
- FAQ-Accordion: aria-expanded/controls/labelledby-Pairing wie Kurz-FAQ.
- Inline-Anker-Links innerhalb FAQ-Antworten sind echte `<a href="#anker">`, nicht JS-only.

**Motion-Kontrakt:**

- Entry-Animationen nur auf Section-Ebene (fadeIn mit y-offset 16px, once viewport).
- Keine Scroll-Driven-Animationen (keine `useScroll`, keine Parallax — bewusst, Phase 21 ist typografie- und textgetrieben, nicht Wow-Peak).
- Reduced-Motion (`useReducedMotion` von `motion/react`) muss auf jeder animierten Komponente gated werden → initial=final-state, keine Transition.
- Keine Loop-Animationen auf `/about` (kein Marquee, keine Aurora, keine Grid-Spotlight) → `@media (prefers-reduced-motion: reduce)` in `globals.css` greift nicht, aber das ist konsistent: `/about` hat keine Loop-Animationen.

---

## Responsive Contract

Breakpoints aus Tailwind v4 default (übernommen aus Phase 20.6):

| Breakpoint | Screen | Behaviour |
|------------|--------|-----------|
| Mobile | <640px (`sm:` breakpoint) | Team-Grid: 1-Spalte (Gründer oben, Mitglieder darunter als Stack). Hero-H1: `32px`. Werte-Blöcke: vertical stack. Section-Vertical-Padding: `py-24`. Accordion: volle Breite. |
| Tablet | 640-1024px (`sm:` → `lg:`) | Team-Mitglieder-Grid: 2 Spalten. Hero-H1: `~40px` (clamp). Werte-Blöcke: 2-Spalten-Option ODER weiterhin vertical stack (Plan-Entscheidung). Section-Vertical-Padding: `py-32`. |
| Desktop | ≥1024px (`lg:` breakpoint) | Team-Mitglieder-Grid: 4 Spalten (4×3 für 10-12 Mitglieder, letzte Reihe füllt sich mit leeren Slots oder bleibt unvollständig — Decision im Plan). Hero-H1: `48px` (clamp max). Werte-Blöcke: 2×2 Grid ODER 4-Spalten (Plan-Entscheidung, default: 2×2). Gründer-Karten: 2 nebeneinander. |
| Wide | ≥1280px (`xl:` breakpoint) | Kein zusätzlicher Layout-Change. Inhalt bleibt zentriert mit `max-w-5xl` (Team) / `max-w-3xl` (alle anderen). Keine Stretching-Effekte. |

**Layout-Shift-Prevention (D-05, User-Decision 1):**

- Placeholder-Avatars haben **feste Aspect-Ratio** (`aspect-square`, 1:1).
- Echte Fotos beim späteren Swap (Phase 27): müssen exakte Aspect-Ratio haben oder via `object-cover` gecroppt werden.
- `next/image` mit explizitem `width` + `height` Props (z.B. 120×120 für Gründer, 80×80 für Mitglieder — exakte Zahlen Plan-Entscheidung).
- Gründer-Karten und Mitglieder-Kacheln haben feste Min-Heights unabhängig von Content-Länge (Bio kann 1 oder 2 Sätze sein, Card-Height ist festgelegt via `min-h-[value]`).

**Reduziert-Motion:**

- `useReducedMotion` auf jeder Section-Komponente (Pattern aus `kurz-faq-section.tsx`).
- `@media (prefers-reduced-motion: reduce)` in `globals.css` greift auf alle `.animate-*`-Klassen (nicht relevant für Phase 21, da keine Loop-Animationen).

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | none — `components.json` existiert nicht im Projekt | not applicable |
| Third-party | none | not applicable |

**Kein shadcn-Init für Phase 21.** Rationale: Das Projekt hat ein eigenes, bereits etabliertes DS-Fundament (Geist-Fonts, Radix-Colors-Neutrals, `--brand-*`-Scales, DS-Tokens in `packages/config/tailwind/base.css`). Die existierenden Section-Komponenten (z.B. `kurz-faq-section.tsx`, `final-cta-section.tsx`) sind bereits „DS-native" ohne shadcn. Eine nachträgliche shadcn-Init würde Doppelstrukturen erzeugen und gegen D-02 (DS-compliance, Reuse) verstoßen.

**Dependencies, die tatsächlich eingesetzt werden (alle bereits installiert, kein neuer Install-Schritt):**

- `motion/react` (Framer Motion v11+) — Entry-Fades, Accordion-Animations, Reduced-Motion-Hook.
- `lucide-react` — `ArrowRight`, `ArrowUpRight`, `Linkedin` (mit Inline-SVG-Fallback bei Pack-Lücken).
- `next/link`, `next/image` — Navigation, Image-Optimierung.
- Keine neuen Packages für Phase 21.

---

## Open Issues for Planner

1. **Team-Grid-Layout bei 10 Mitgliedern Desktop:** 4×3 Grid mit 2 leeren Slots oder 5×2 Grid? User-Decision 1 sagt „4×3 (Desktop)" → Default. Planner kann Sub-Layout entscheiden (z.B. leere Slots als dezente Placeholder-Stubs oder Grid mit `justify-items-center` auf letzter Reihe).
2. **Gründer-Bios finalisieren:** Luca liefert Final-Copy für Janna + Simon (CONTEXT Open Question 2). UI-SPEC liefert Placeholder; Plan-21 oder Phase 27 setzt Final-Copy ein.
3. **LinkedIn-URLs für Janna + Simon:** Nachgeliefert von Luca (D-06). Bis dahin Icons versteckt rendern.
4. **Werte-Layout Desktop:** 2×2 Grid (default-Empfehlung, besseres Scanning) vs. 4-Spalten-Row vs. vertical stack. Planner entscheidet visuell, Empfehlung: 2×2.
5. **Accordion-Extraktion:** Shared Accordion-Primitive in `components/ui/faq-accordion.tsx` extrahieren oder lokale Kopie in `components/about/faq-section.tsx`? UI-SPEC-Default: **lokale Kopie**, extrahieren ist Phase-27-Cleanup wenn Muster sich stabilisiert hat. Planner kann override.
6. **„Aktive Mitglieder"-Micro-Trenner:** Zwischen Gründer-Karten und Mitglieder-Grid ein kleiner Eyebrow-Trenner (`// aktive mitglieder`) oder nahtlos? UI-SPEC-Default: **nahtlos**, weil der Section-Header „Wir sind Generation AI." bereits die ganze Team-Section adressiert. Micro-Trenner nur wenn visueller Bruch zwischen Gründer (prominent) und Mitgliedern (klein) zu hart ist.
7. **OG-Image `/about`:** Reuse vom Landing oder dediziertes Hero-basiertes OG? UI-SPEC-Default: **Reuse Landing-OG**, dediziertes OG ist Phase 27.
8. **Nav-Active-State „Über uns":** Header-Komponente muss aktives Nav-Highlighting auf `/about` unterstützen (falls nicht bereits). Plan-21 prüft Header-Component und ergänzt falls nötig. Erwartetes Styling: Accent-underline oder bold-weight im aktiven Link.

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS (10 FAQ-Antworten final, Hero + Story + Werte + Verein + Mitmach + Abschluss + Kontakt mit echter Copy)
- [ ] Dimension 2 Visuals: PASS (Section-Header-Pattern konsistent mit 20.6, Cards + Accordion + CTAs reuse existierendes DS, keine neuen Primitives)
- [ ] Dimension 3 Color: PASS (60/30/10 exakt übernommen, Accent-Reserved-for-Liste explizit 9 Items, keine willkürlichen Accent-Einsätze)
- [ ] Dimension 4 Typography: PASS (4 Haupt-Sizes: Body 16px, Heading H3 20px, H2 clamp 24-32px, H1 clamp 32-48px; 2 Weights: 400 + 700; Geist Sans + Geist Mono split definiert)
- [ ] Dimension 5 Spacing: PASS (alle Werte aus 4-basierter Scale, Section-Padding konsistent, exceptions=none)
- [ ] Dimension 6 Registry Safety: PASS (keine shadcn, keine Third-Party-Registry, keine neuen Packages)

**Approval:** pending (Checker-Pass ausstehend — wird durch `gsd-ui-checker` in diesem Workflow erteilt)
