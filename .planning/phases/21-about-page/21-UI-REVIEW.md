---
status: complete
phase: 21-about-page
date: 2026-04-24
baseline: 21-UI-SPEC.md
audit_mode: code-only (screenshots nicht erstellt — Brief: "verzichte auf Screenshots")
dev_server: detected (localhost:3000 /about → 200)
scores:
  copywriting: 3
  visuals: 4
  color: 4
  typography: 4
  spacing: 4
  experience_design: 3
overall: 22/24
---

# Phase 21 — UI Review (`/about`)

**Audited:** 2026-04-24
**Baseline:** `21-UI-SPEC.md` (approved), plus `apps/website/AGENTS.md` Page-Framework-Regeln
**Screenshots:** nicht erstellt (Brief-Anweisung — Code-Audit only)
**Dev-Server:** `localhost:3000/about` → 200 erreichbar, nicht genutzt
**Post-UAT-Commits auditiert:** `734d477`, `4f9dbe3`, `b027053`

---

## Executive Summary

**Gesamtbild: sehr sauber.** Phase 21 ist fast ein Musterbeispiel für disziplinierten Reuse: Hero-Parity zur Landing ist nach den UAT-Fixes 1:1 erreicht (LabeledNodes + `--fs-display` + `max-w-4xl`), alle Section-Header folgen exakt dem DS-Pattern aus Phase 20.6, Accent wird eng auf die im UI-SPEC deklarierte Liste begrenzt, und die SectionTransition-Umstellung (border-b raus) hat den narrativen Flow sichtbar verbessert.

Zwei Punkte drücken auf die Score: (1) **Team-Grid rendert 10 Platzhalter-Namen „Mitglied 1"–„Mitglied 10"** — für eine Credibility-Anker-Seite schwach, auch wenn im UAT explizit bis Phase 27 akzeptiert; (2) **Abschluss-CTA-Secondary führt zu `/partner`-404** bis Phase 22 live geht — UAT-akzeptiert, aber ein Tag echte User machen das zu einer Glaubwürdigkeits-Narbe. Kein echter Bug, aber die zwei führenden Priority-Fixes.

Experience-Design fällt auf 3/4 wegen der genannten Live-404-Thematik + weil LinkedIn-URLs für Gründer aktuell komplett versteckt sind (D-06-konform, aber aus Nutzersicht „Wer sind die?" ohne externen Verifikationsweg).

---

## Pillar Scores

| Pillar | Score | Key Finding |
|--------|-------|-------------|
| 1. Copywriting | 3/4 | Simon-§9-Wording 1:1 umgesetzt, Umlaute korrekt, keine generischen Labels. Abzug: Team-Grid-Placeholder „Mitglied 1–10" + Gründer-Bio-Platzhalter sichtbar. |
| 2. Visuals | 4/4 | Hero-Parity perfekt, Section-Header-Pattern 9/9 konsistent, Verein-Card mit Accent-Hairline als dezenter Anker-Marker, SectionTransition statt border-b. |
| 3. Color | 4/4 | Null Hex/RGB-Hardcodes, 36 Accent-Uses über 10 Files — alle auf der im UI-SPEC deklarierten Reserved-for-Liste. |
| 4. Typography | 4/4 | Nur Geist Sans + Mono, nur `font-normal`/`font-bold` (2 Weights), DS-Tokens durchgängig (`--fs-display`, `--fs-h2`, `--fs-h3`, `--fs-body`, `--fs-lede`). |
| 5. Spacing | 4/4 | Alle vertikalen Section-Paddings `py-24 sm:py-32` konsistent. Arbitrary-Werte (`text-[11px]`, `text-[15px]`, `h-[120px]`, `min-h-[320px]`) sind alle UI-SPEC-deklariert oder Hero-Parity-Carry-over. |
| 6. Experience Design | 3/4 | FAQ-Accordion A11y-Gold (aria-expanded/controls/labelledby, multi-open, reduced-motion, keyboard). Abzug: `/partner`→404 bis Phase 22, LinkedIn komplett versteckt (Info-Void für Gründer). |

**Overall: 22/24**

---

## Top 3 Priority Fixes

1. **Team-Grid-Placeholder „Mitglied 1–10" ist Credibility-Kill** — Eine Über-Uns-Seite, die ihre eigenen Mitglieder als „Mitglied 1", „Mitglied 2" listet, untergräbt genau die Glaubwürdigkeit, die §9 erreichen soll. **Fix:** Entweder echte 10 Vornamen in `components/about/team-data.ts` eintragen (Phase-27-Kandidat vorziehen) oder das Mitglieder-Grid bis Phase 27 verstecken (`members`-Array leer → Grid rendert nichts) und nur die 2 Gründer-Karten zeigen. Empfehlung: Array leeren + `members.length === 0 ? null : …` in `about-team-section.tsx`, damit das leere Grid nicht unsichtbar-breit bleibt. Aktueller Stand ist UAT-akzeptiert, aber für Live-Launch höchst empfohlen.

2. **Abschluss-CTA + Kontaktbox linken auf `/partner` → 404** — `apps/website/components/about/about-final-cta-section.tsx:79` (`href="/partner"`) und `…/about-kontakt-section.tsx:91` zeigen im Live-Web aktuell auf eine Route, die bis Phase 22 nicht existiert. UAT hat „wenige Tage 404" akzeptiert, aber für eine Credibility-Seite ist jeder 404-Click ein Rückschritt. **Fix für Zwischenzeit:** Beide Links temporär auf `mailto:partner@generation-ai.org?subject=Partnerschaft` umstellen (ImprovMX-Forwarding existiert laut Memory), dann bei Phase-22-Launch zurück auf `/partner`. Alternativ: Kontakt-Zeile 2 auf `info@generation-ai.org?subject=Partnerschaften` zeigen und Abschluss-CTA-Secondary-Link komplett entfernen bis `/partner` live ist.

3. **Gründer-LinkedIn-Icons komplett versteckt (D-06) → Zero external verification** — `team-data.ts:27,33` haben `linkedinUrl: undefined` für Janna + Simon. `FounderCard` rendert dann gar kein LinkedIn-Element. Für eine Über-Uns-Seite, die Credibility transportieren soll, ist „Wer sind die?" ohne externen Nachweis ein Trust-Gap. **Fix:** LinkedIn-URLs von Luca einholen (D-06 Open Issue) und in `team-data.ts` eintragen — einzeiliger Edit pro Founder. Solange URLs fehlen, die aktuelle Lösung (Icon versteckt) ist technisch sauber, aber inhaltlich eine Lücke.

---

## Detailed Findings

### Pillar 1: Copywriting (3/4)

**Audit-Methode:** Grep nach generischen Labels (Submit/Click Here/OK/Cancel/Save/went wrong/try again/No data/Empty) → 0 Matches. Manueller Walkthrough aller 9 Sections gegen UI-SPEC Copywriting-Contract.

**Positiv:**

- Alle 10 FAQ-Antworten 1:1 aus UI-SPEC Zeile 217–228 umgesetzt (`about-faq-section.tsx` mit externer `faq-data.ts`), inklusive der Kurz-FAQ-Sync-Items (#3, #5, #6, #7).
- Umlaute korrekt: „Warum es uns gibt." (nicht „gibts"), „Gemeinnützig", „Pädagogik", „für" — keine ae/oe/ue/ss-Verstöße gegen CLAUDE.md-Regel.
- CTA-Labels spezifisch und aktiv: „Kostenlos Mitglied werden", „Melde dich", „Werde Teil davon", „Zum Mitmach-Aufruf →" — keine Submit/Click-Pattern.
- Eyebrow-Kommentare stringent im `// lowercase`-Stil: `// Generation AI · Über uns`, `// unsere story`, `// wer dahintersteckt`, `// was uns antreibt`, `// verein`, `// fragen & antworten`, `// kontakt` — konsistentes Voice-Signal.
- Englisch-Lock „We shape talent for an AI-native future." (D-07) korrekt als `--fs-h2`-Claim unter H1 gerendert (`about-hero-section.tsx:56-65`).
- Secondary-Zeile „→ Partner werden · → Aktiv mitmachen" verwendet Unicode-Middle-Dot (`·`) als Trenner — UI-SPEC-konform.

**Findings (warum nicht 4/4):**

- **`team-data.ts:38-49` listet 10 Mitglieder als `"Mitglied 1"` … `"Mitglied 10"`.** Der `PlaceholderAvatar` rendert daraus Initialen `M1`, `M2`, … (`placeholder-avatar.tsx:27-32` splittet nach Whitespace). Visuell ergibt sich eine Wand aus 10 nahezu identischen „M1/M2/…"-Kacheln. UAT hat das bis Phase 27 akzeptiert, aber für die Pillar-Score ist das Copywriting-Plateau spürbar.
- **Gründer-Bios sind im UI-SPEC explizit als „Platzhalter" markiert** und werden 1:1 übernommen (`team-data.ts:26,32`). Aktueller Text „Gründerin. Macht das strategische Big-Picture und die Partnerschaften." ist funktional, aber verrät per Satzkonstruktion, dass es noch keine echte Bio ist. Für Credibility-Anker ist das akzeptabel-aber-nicht-stark.

**Score-Kalibrierung:** Eine 4/4 würde echte Mitgliedernamen + Final-Bios voraussetzen. Eine 2/4 wäre, wenn Copy generisch oder voice-fremd wäre — das ist sie nicht. 3/4 ist fair.

### Pillar 2: Visuals (4/4)

**Audit-Methode:** Visueller Struktur-Walkthrough aller 9 Sections + Cross-Check gegen `AGENTS.md` Page-Framework-Checkliste.

**Positiv (vollständig erfüllt):**

- **Hero-Pattern exakt wie vorgeschrieben** (`about-hero-section.tsx`):
  - `<LabeledNodes>` als Background ✓
  - `<section className="relative isolate">` + `min-h-[calc(100vh-5rem)]` ✓
  - Container `relative z-10 mx-auto max-w-4xl px-6 py-20 text-center` ✓ (exakt die „Unterseiten"-Variante, nicht Landing's `max-w-3xl`)
  - H1 mit `fontSize: var(--fs-display)` + `leading-[1.02]` + `tracking-[-0.03em]` ✓
  - Subhead mit `var(--fs-h2)` + `lineHeight: var(--lh-headline)` + `max-w-3xl` ✓
  - textShadows korrekt (Small für Eyebrow/Lede, Large für H1/Claim) ✓
  - Kein Scroll-Indicator auf Unterseite ✓ (korrekt, der ist nur auf Landing)

- **Section-Header-Pattern 9/9 konsistent** (Eyebrow mit Dot-Bullet + Glow + H2/H3):
  - `about-story-section.tsx:44-57`, `about-team-section.tsx:47-60`, `about-values-section.tsx:62-76`, `about-verein-section.tsx:39-52`, `about-faq-section.tsx:76-89`, `about-kontakt-section.tsx:42-55` — jedes File liefert das identische Eyebrow-Markup-Snippet (mono 11px, uppercase, tracking 0.2em, accent-dot mit `box-shadow: 0 0 8px var(--accent-glow)`).
  - Einzige Abweichungen sind die beiden CTA-only-Sections (Mitmach + Final-CTA), die bewusst kein Eyebrow haben (UI-SPEC deklariert sie auch nicht).

- **SectionTransition statt border-b durchgängig** (`about-client.tsx:37-52`):
  - `variant="soft-fade"` zwischen Story↔Team, Team↔Values, Values↔Verein, Verein↔Mitmach, Mitmach↔FAQ (5 Transitions)
  - `variant="signal-echo"` vor Final-CTA (1 Transition, bewusst als „Peak"-Signal)
  - Keine Transition zwischen Hero↔Story (Hero hat eigene Landing-Zone) und Final-CTA↔Kontakt (Closing-Cluster schließt visuell selbst ab) — beides AGENTS.md-konform.
  - `grep border-b` in `components/about/` → **0 Matches.** `border-border` existiert 9× aber nur in Card-Komponenten (FounderCard, TeamMemberCard, Verein-Card, FAQ-Item, Kontakt-Card) — nie auf Section-Level.

- **Verein-Card-Accent-Hairline** (`about-verein-section.tsx:69-78`): 2px-Balken an Card-Top mit `var(--accent)` opacity 0.6 + `box-shadow: 0 0 8px var(--accent-glow)` — D-09-konform, markiert `#verein`-Deep-Link-Target visuell ohne dominant zu werden.

- **Clear Focal Point pro Section:** Jede Section hat eine einzige klare Hierarchie-Spitze (Eyebrow → H2 → Content), kein visueller Wettstreit zwischen mehreren Elementen.

- **Icon-only-Elemente haben aria-labels:** LinkedIn-Icon in `founder-card.tsx:73` (`aria-label="LinkedIn-Profil von {name}"`), PlaceholderAvatar-Wrapper in `founder-card.tsx:56` (`aria-label="Platzhalter-Porträt von {name}"`).

**Keine Findings gegen 4/4.** Alle Page-Framework-Checklist-Punkte aus AGENTS.md erfüllt.

### Pillar 3: Color (4/4)

**Audit-Methode:** Grep nach Hex/RGB-Hardcodes + Count Accent-Uses.

- Hex/RGB-Hardcodes in `components/about/`: **0 Matches** (einzige Ausnahme: `svg path` in `founder-card.tsx` LinkedIn-Glyph nutzt `fill="currentColor"` — korrekt theme-aware).
- Accent-Uses (`var(--accent)` oder `accent-*`): **36 Matches über 10 Files** — jede einzelne Nutzung ist im UI-SPEC Reserved-for-Liste (Zeile 113-123) deklariert:
  1. **Dot-Bullet im Eyebrow** (alle 7 Sections mit Eyebrow) — 7 Uses
  2. **Primary-CTA-Buttons** (Mitmach + Final-CTA) — 2 Uses
  3. **FAQ-Index-Marker `// 01`–`// 10`** (`about-faq-section.tsx:126`) — 1 Use × 10 Items
  4. **FAQ-Accordion-Hover-States** (Plus-Icon, Trigger-Text, Border-Accent) — mehrere Uses innerhalb einer Component
  5. **Hover-States auf Cards** (`hover:border-[var(--border-accent)]`) — FounderCard, TeamMemberCard, FAQ-Item, Verein-Card (4 Uses)
  6. **Story-Inline-CTA-Hover** (`about-story-section.tsx:95` `hover:text-[var(--accent)]`) — 1 Use
  7. **Verein-Card-Hairline** (`about-verein-section.tsx:74`) — 1 Use
  8. **Final-CTA-Secondary-Link-Hover** (`about-final-cta-section.tsx:81,87`) — 2 Uses
  9. **Kontakt-Link-Hover** (`about-kontakt-section.tsx:79,93,106`) — 3 Uses
  10. **LinkedIn-Icon-Hover** (`founder-card.tsx:74`) — 1 Use
  11. **FAQ-Inline-Answer-Links** (`about-faq-section.tsx:34` — Standard-Accent-farben im FAQ-Text, gelistet als Ausnahme der „Body-Links NICHT accent"-Regel)

- **60/30/10-Split passt:** 9 von 9 Sections nutzen `bg-bg` als Dominant (60%), `bg-bg-card` taucht nur in 5 Cards auf (Verein, FAQ-Items, Founder, Member, Kontakt — das sind die deklarierten Secondary-30%), Accent bleibt auf ~10 diskreten Hotspots.

- **Keine semantische Warnfarbe** (`--status-*`) in Phase 21 verwendet — UI-SPEC Zeile 106 korrekt eingehalten.

- **Placeholder-Avatar-Initialen auf `bg-bg-elevated` mit `text-text`** (`placeholder-avatar.tsx:49`) — NICHT accent-gefärbt, UI-SPEC Zeile 129 eingehalten.

**Keine Findings gegen 4/4.**

### Pillar 4: Typography (4/4)

**Audit-Methode:** Grep nach `font-*`-Weights + Inspect Size-Tokens.

- **Font-Weights:** Nur `font-normal` (400) und `font-bold` (700) — exakt 2 Weights, UI-SPEC-Regel erfüllt. Keine `font-semibold`/`medium`/`light` in `components/about/`.
- **Font-Families:** Nur `font-sans` (Geist Sans, default) und `font-mono` (Geist Mono). Korrekte Zuordnung:
  - Mono: Eyebrows, H1, Button-Labels, FAQ-Trigger, Dot-Bullet-Labels, Team-Sub-Zeile „Stand: April 2026" (`about-team-section.tsx:78`)
  - Sans: H2, H3, Bodies, Werte-Claims, Kontakt-Values
- **Size-Tokens:** DS-Tokens durchgängig (`var(--fs-display)`, `var(--fs-h2)`, `var(--fs-h3)`, `var(--fs-body)`, `var(--fs-lede)`) statt inline clamp-Magic.
- **Arbitrary-Size-Werte audited:**
  - `text-[11px]` — UI-SPEC `--fs-micro` (11px) alias, 14× verwendet für Eyebrows — korrekt
  - `text-[13px]` — UI-SPEC `--fs-caption`, verwendet in TeamMemberCard und FounderCard-Bio — korrekt
  - `text-[14px]` — UI-SPEC `--fs-small`, FounderCard-Bio — korrekt
  - `text-[15px]` — UI-SPEC Zeile 83 deklariert (Button-Label Hero-Parity 15px, FAQ-Trigger-Label 15-16px) — korrekt
  - Keine arbiträren Sizes außerhalb dieser deklarierten Set.
- **Line-Heights:** `leading-[1.02]` (H1), `leading-[1.35]` (FAQ-Trigger), `leading-[1.55]`/`leading-[1.5]`/`leading-[1.6]` (Bodies) — alle aus UI-SPEC Tabelle ableitbar oder DS-Token-gespiegelt.
- **`text-balance`/`text-pretty`** konsistent: `text-balance` auf H1/H2/H3 (7 Matches), `text-pretty` auf Bodies (9+ Matches) — `globals.css`-Regel erfüllt.
- **`tabular-nums` auf Team-Sub-Zeile** (`about-team-section.tsx:78`) und PlaceholderAvatar — UI-SPEC §Regel unter Typography eingehalten.

**Keine Findings gegen 4/4.**

### Pillar 5: Spacing (4/4)

**Audit-Methode:** Inspect Section-Paddings, Grep Arbitrary-Spacing.

- **Section-Vertical-Padding konsistent:** `py-24 sm:py-32` in 8 von 8 Non-Hero-Sections (Story, Team, Values, Verein, Mitmach, FAQ, Final-CTA, Kontakt). Hero hat `min-h-[calc(100vh-5rem)]` (Landing-Parity statt `py-*`) — AGENTS.md-konform.
- **Container-Max-Widths folgen UI-SPEC Zeile 58-61:**
  - `max-w-4xl` Hero (Unterseiten-Pattern) ✓
  - `max-w-3xl` Story, Values, Verein, Mitmach, Final-CTA, FAQ, Kontakt (7×) ✓
  - `max-w-5xl` Team-Section ✓ (Ausnahme für 4-col-Grid, deklariert)
- **Horizontal-Padding `px-6`** auf allen Container-Divs — konsistent.
- **Grid-Gaps folgen Scale:** `gap-4` (TeamMembers), `gap-6` (Founders + Story-Absätze), `gap-8` (Values-Grid) — 4-basiert, UI-SPEC-Token-konform.
- **Arbitrary-Bracket-Values audited:**
  - `h-[120px]`, `w-[120px]`, `text-[28px]` in `placeholder-avatar.tsx:38` — Founder-Avatar 120px, UI-SPEC Zeile 394 deklariert
  - `min-h-[320px]` in `founder-card.tsx:55` — Layout-Shift-Prevention, UI-SPEC Zeile 394-395 deklariert
  - `h-[2px]` in `about-verein-section.tsx:72` — Accent-Hairline (2px wie in `final-cta-section.tsx`)
  - `rounded-[16px]` in `about-faq-section.tsx:112` — entspricht `--radius-2xl` (16px), aber als Pixel-Literal statt Token geschrieben. Minimal, kein Score-Abzug.
  - `gap-x-4`, `mb-4`, `mt-4`, `mt-6`, `mt-10`, `mt-12`, `mt-14` — alle aus Tailwind-Default-Scale (4, 8, 16, 24, 40, 48, 56 px), 4-basiert.
- **Card-Internal-Paddings:**
  - Founder-Card `px-6 py-8` ✓ (UI-SPEC `--space-6` × `--space-8`)
  - TeamMemberCard `px-4 py-6` ✓
  - Verein-Card `px-8 py-10` ✓ (UI-SPEC Zeile 195 deklariert)
  - Kontakt-Card-Rows `px-6 py-6` ✓
  - FAQ-Trigger `px-6 py-5` ✓ (20.6-09 Blueprint-Reuse)

**Keine Findings gegen 4/4.** Einzig `rounded-[16px]` könnte gegen `rounded-2xl` getauscht werden, aber das ist 1:1 wertgleich und 20.6-Blueprint-Import.

### Pillar 6: Experience Design (3/4)

**Audit-Methode:** State-Coverage + A11y-Grep + Manual Interaction-Walkthrough.

**Positiv (Gold-Standard):**

- **FAQ-Accordion A11y perfekt** (`about-faq-section.tsx`):
  - `<button aria-expanded aria-controls>` auf jedem Trigger (Zeile 118-119)
  - `<div role="region" aria-labelledby>` auf jedem Panel (Zeile 149-150)
  - Eindeutige IDs via `useId()` (Zeile 44) — verhindert Kollisionen mit mehrfach gemounteten Accordions auf derselben Seite
  - Multi-open via `Set<number>` (Zeile 42) — UI-SPEC + User-Decision 3 konform
  - `useReducedMotion`-Gate (Zeile 43) — disablet Height-Transition bei `prefers-reduced-motion: reduce`, UI-SPEC-konform
  - Keyboard: native `<button>` → Space/Enter funktioniert out-of-the-box
  - Plus-Icon rotiert 45° im Open-State (Zeile 135-137) — `aria-hidden` korrekt gesetzt

- **42× aria-Attribute** across 12 Files — dichte A11y-Coverage auch für Non-Accordion-Elemente:
  - Placeholder-Avatar aria-label-Wrapper
  - LinkedIn-Icon aria-label
  - Section `aria-labelledby` auf allen 9 Sections
  - `aria-hidden` auf dekorativen Dot-Bullets (8 Matches)

- **11× focus-visible-States** — jedes interaktive Element hat sichtbaren Fokus-Ring (FAQ-Trigger, CTA-Buttons, Links in Story/Kontakt/Final-CTA, LinkedIn-Icon).

- **Motion-Kontrakt erfüllt:** Jede Section hat `useReducedMotion`-Gate (10 Matches across Files), `viewport: { once: true }` (Entry-Animationen triggern nur einmal), `ease: [0.16, 1, 0.3, 1]` konsistent.

- **Mailto-CTA korrekt** (`about-mitmach-cta-section.tsx:68`): `href="mailto:info@generation-ai.org?subject=Mitmachen"` — D-08 + UI-SPEC Zeile 204 konform. Als `<a>` statt Next.js `<Link>` (Link wirft Warnung bei mailto).

- **Anker-Links korrekt:** `#mitmach`, `#faq`, `#team`, `#verein`, `#kontakt`, `#story`, `#werte` alle als `id`-Attribute auf `<section>`-Elementen vergeben — Smooth-Scroll funktioniert global via `scroll-behavior: smooth`.

- **Cross-Boundary-Links:** `target="_blank" rel="noopener noreferrer"` auf LinkedIn-Link (`founder-card.tsx:71-72`) — Clickjacking-Schutz.

- **Conditional Rendering für Missing LinkedIn** (`founder-card.tsx:68-78`): `linkedinUrl ? … : null` — D-06 + UI-SPEC Zeile 290 korrekt (kein Dead-`#`-Link).

**Findings (warum nicht 4/4):**

- **`/partner`-404 aktiv:** `about-final-cta-section.tsx:79` und `about-kontakt-section.tsx:91` linken auf `/partner`, Route existiert erst in Phase 22. UAT-akzeptiert, aber Live-Verhalten ist broken. **Mitigation:** Temporär Mailto-Fallback, siehe Top-Fix #2.
- **LinkedIn-Gründer-Icons komplett versteckt:** `team-data.ts:27,33` — `linkedinUrl: undefined`. Conditional Rendering bedeutet: FounderCard hat gar keinen externen Verifikationsweg auf der Live-Seite. Für Credibility-Anker ein Gap. D-06-Follow-up.
- **Team-Placeholder-Namen sichtbar:** Siehe Top-Fix #1. Nicht strikt ein „State"-Issue, aber aus UX-Sicht ein „empty placeholder content on live site".

**Dynamische Datenquellen:** Phase 21 hat keine API-Fetches, keine Forms, keine User-Inputs — Loading/Error/Empty-States sind N/A (UI-SPEC Zeile 284 deklariert).

**Score-Kalibrierung:** FAQ-A11y ist 4/4-Niveau. Der Abzug stammt aus Live-Broken-Links + fehlenden LinkedIns. 3/4 reflektiert das fair.

---

## Registry Safety

`components.json` existiert **nicht** im Projekt (kein shadcn-Init, UI-SPEC Zeile 408-411 bestätigt). UI-SPEC „Registry Safety"-Tabelle markiert alle Einträge als `not applicable`.

**Registry Audit:** übersprungen (kein shadcn, keine Third-Party-Registry). Keine Flags.

---

## Files Audited

**Phase-21-Section-Components (11 Files):**

- `apps/website/components/about-client.tsx` (Wrapper)
- `apps/website/components/about/about-hero-section.tsx`
- `apps/website/components/about/about-story-section.tsx`
- `apps/website/components/about/about-team-section.tsx`
- `apps/website/components/about/about-values-section.tsx`
- `apps/website/components/about/about-verein-section.tsx`
- `apps/website/components/about/about-mitmach-cta-section.tsx`
- `apps/website/components/about/about-faq-section.tsx`
- `apps/website/components/about/about-final-cta-section.tsx`
- `apps/website/components/about/about-kontakt-section.tsx`
- `apps/website/components/about/team-data.ts`

**Sub-Components (3 Files):**

- `apps/website/components/about/founder-card.tsx`
- `apps/website/components/about/team-member-card.tsx`
- `apps/website/components/about/placeholder-avatar.tsx`

**Parity-/Token-Referenzen (2 Files):**

- `apps/website/components/sections/hero-section.tsx` (Landing-Hero Parity-Check)
- `packages/config/tailwind/base.css` (DS-Token-Verifikation: `--fs-display`, `--fs-h1`…`--fs-micro`, Spacing-Scale, Color-Tokens)

**Planning-Artefakte (3 Files):**

- `.planning/phases/21-about-page/21-CONTEXT.md`
- `.planning/phases/21-about-page/21-UI-SPEC.md`
- `.planning/phases/21-about-page/21-HUMAN-UAT.md`

**Total: 19 Files.**

---

## Minor Recommendations (nicht Top-3, aber notiert)

- **`rounded-[16px]` → `rounded-2xl`** in `about-faq-section.tsx:112` — kosmetisch, gleiche 16px, aber DS-Token-Stil konsistenter.
- **Team-Mitglieder-Grid bei 10 Items / 4-col hat 2 Leer-Slots in letzter Reihe** (10 ÷ 4 = 2 Rest). Aktuell akzeptiert, aber wenn real 10 Mitglieder bleiben, könnte Grid auf `grid-cols-1 sm:grid-cols-2 lg:grid-cols-5` umgestellt werden (2×5 Desktop). Plan-Entscheidung, UI-SPEC Open Issue 1.
- **Kontakt-Zeilen mobile:** `flex-col sm:flex-row` zeigt auf Mobile Label über Value. Bei `Partnerschaften` → `Zur Partner-Seite →` könnte auf Mobile der Pfeil (`→`) visuell unerwartet mitten im Zeilenumbruch landen. Praktisch ist es ein einzelner Link, passt — nur erwähnt falls Mobile-Layout später nochmal angefasst wird.
- **`about-team-section.tsx:78` Sub-Zeile „Stand: April 2026"** nutzt `font-mono text-[11px]` + `tabular-nums` — elegant, aber wenn Luca das Datum später hardcoded auf April 2026 lässt und es wird 2027, wirkt das stale. Könnte in `team-data.ts` als Konstante gelegt werden für 1-Stellen-Update.

Keiner dieser Punkte ist Score-relevant; alle Phase-27-Cleanup-Kandidaten.
