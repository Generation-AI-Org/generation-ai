# Generation AI — Design System

> **Source of Truth.** Jede Design-Entscheidung in Website, Tools-App, Mails, Decks und Social leitet sich hier ab. Wenn etwas hier nicht steht, wurde es noch nicht entschieden.
>
> Version 1.1 · 2026-04-20
> Primärer Leser: LLM beim Code-Generieren — deshalb präzise, mit konkreten Werten, ohne Raten-Spielräume.

**Companion files:**
- `README.md` — kuratierter Einstieg + Indexbundle über alles hier drin
- `colors_and_type.css` — alle Tokens als einbindbare CSS-Variablen
- `tokens.json` — selbe Tokens im W3C-Design-Tokens-Format
- `VOICE.md` — komplette Microcopy-Library

---

## A — Theming

Das Design-System hat **zwei Themes**, funktional gleichwertig:

| Theme | Body-BG | Akzent-Action | Header-Band |
|---|---|---|---|
| **Dark** (default) | `#141414` | Neon `#CEFF32` | Blau `#3A3AFF` |
| **Light** | `#F6F6F6` | Rot `#F5133B` | Rosa `#FC78FE` |

**Toggle-Verhalten:**
- Default = System-Präferenz (`prefers-color-scheme`). Bei keiner Präferenz → **Dark**.
- User-Toggle überschreibt, gespeichert in LocalStorage.
- **Kein Flächen-Flood**: Rosa/Blau sind Akzente (Header-Band, Buttons, Hover-Glow), nicht Seiten-BG. Body-BG bleibt Neutral.

**Mail-Strategie:** Alle Mails (Auth + Marketing) adaptiv via `@media (prefers-color-scheme: dark)`. Ein Template pro Mail-Typ, kein Segment-basiertes Theming.

---

## B — Typografie

### Font-System

| Rolle | Font | Einsatz |
|---|---|---|
| Display / H1 / UI-Akzente | **Geist Mono** (700) | Hero-Headlines, Buttons, Tags, Labels, Code, Captions |
| Headlines H2–H4 | **Geist Sans** (600–700) | Sections, Artikel, Dialog-Titel |
| Body / Lede / Lists | **Geist Sans** (400–500) | Fließtext, Absätze, Bullets |

**Begründung:** Geist Mono setzt den Tech/KI-Moment (Editorial-Tech-Look, „comments in code"). Geist Sans trägt Fließtext. Monospace-Body wäre auf 200+ Wörtern anstrengend.

**Font-Loading:**
- Self-hosted via `@font-face` (`fonts/Geist-VariableFont_wght.ttf`, `fonts/GeistMono-VariableFont_wght.ttf`)
- Variable Font, Axis 100–900
- Im Codebase: `next/font/google` in beiden Apps (Sans: 400–900, Mono: 400, 500, 700)
- Fallback Sans: `Geist, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif`
- Fallback Mono: `"Geist Mono", ui-monospace, "SF Mono", Menlo, Consolas, monospace`

**Ligaturen:** In UI-Text deaktiviert via `font-feature-settings: "liga" 0, "calt" 0`. Nur in echten Code-Blöcken aktiv.

### Skala (px-basiert, Base 16)

| Rolle | Size | Weight | Line-Height | Font |
|---|---|---|---|---|
| H1 / Hero | `clamp(32px, 5vw, 48px)` | 700 | 1.05 | Geist Mono |
| H2 | `clamp(24px, 3vw, 32px)` | 700 | 1.2 | Geist Sans |
| H3 | 20px | 600 | 1.3 | Geist Sans |
| H4 | 16px | 600 | 1.4 | Geist Sans |
| H5 (Eyebrow) | 12px | 700 | 1.3 | Geist Mono, uppercase |
| H6 (Micro-Tag) | 11px | 500 | 1.3 | Geist Mono, uppercase |
| Lede / Intro | 18px | 500 | 1.5 | Geist Sans |
| Body | 16px | 400 | 1.65 | Geist Sans |
| Body Small | 14px | 400 | 1.55 | Geist Sans |
| Caption | 13px | 400 | 1.5 | Geist Sans |
| Micro / Tag / Label | 11px | 700 | 1.4 | Geist Mono, uppercase |
| Button | 14px | 700 | 1 | Geist Mono |
| Code Inline / Block | 13px | 400 | 1.5 | Geist Mono |

**Letter-Spacing:**
- H1: `-0.02em`
- H2: `-0.015em`
- Tag / Micro / Eyebrow: `+0.08em`
- Button: `+0.02em`

**H5 = Signature-Move:** Mono-Eyebrow über einem Absatz, uppercase, tracked-out, muted — wie ein Kommentar im Code. Der wichtigste Hebel, um den Editorial-Tech-Look zu setzen.

**Italic:** Nur in Blockquotes (Geist Sans italic). Headlines und Body nie italic.

---

## C — Farbsystem

### Brand-Farben (aus CI, unverändert)

| Name | Hex | Rolle |
|---|---|---|
| Neon-Grün | `#CEFF32` | Dark-Theme Primary-Action, Accent |
| Blau | `#3A3AFF` | Dark-Theme Header-Band |
| Rot | `#F5133B` | Light-Theme Primary-Action, Accent |
| Rosa | `#FC78FE` | Light-Theme Header-Band |
| Dark Neutral | `#141414` | Body-BG Dark, Ink Light |
| Light Neutral | `#F6F6F6` | Body-BG Light |
| Sand | `#E8DEC8` | Print auf warmen Oberflächen |

Jede Brand-Farbe hat zusätzlich eine **12-Step Radix-Skala** (`--neon-1..12`, `--blue-1..12`, `--pink-1..12`, `--red-1..12`) für Hover-/Active-/Subtle-Varianten. Siehe `colors_and_type.css` für alle Werte.

### Semantic States (nicht Brand-Farben)

Zweck: Status-Signale dürfen nicht mit Brand-Akzenten kollidieren. Deshalb eigene Skala.

| Rolle | Hex | Tailwind-Äquivalent |
|---|---|---|
| Error | `#DC2626` | `red-600` |
| Success | `#16A34A` | `green-600` |
| Warning | `#F59E0B` | `amber-500` |
| Info | `#2563EB` | `blue-600` |

### Neutrals — Radix Slate

**Skala:** Radix `slate` (12 Steps) + `slate-dark` für Dark-Mode. Alpha-Varianten für Overlays.

| Step | Rolle | Beispiel-Einsatz |
|---|---|---|
| `slate-1` | App-BG | `body` background |
| `slate-2` | Subtle-BG | Card-Section, Zebra-Streifen |
| `slate-3` | UI-Element-BG | Disabled-Button, Skeleton |
| `slate-4` | Hover-BG | Ghost-Button Hover |
| `slate-5` | Active-BG | Gedrückter Button, Selected-State |
| `slate-6` | Subtle Border | Divider, Card-Border |
| `slate-7` | UI-Border | Input-Border, stärkere Trennlinie |
| `slate-8` | Hover-Border | Input-Focus (wenn kein Ring-Color) |
| `slate-9` | Solid-BG (sekundär) | Tooltip-BG |
| `slate-10` | Hover-Solid | Tooltip-Hover |
| `slate-11` | Low-Contrast-Text | Muted-Text, Captions, Disabled-Text |
| `slate-12` | High-Contrast-Text | Standard-Body-Text, Headings |

**Regel:** Im Code **nie** Hex-Werte für Neutrals verwenden, immer Tokens (`slate-11`, etc.). Brand-Akzente (Rot, Neon, Rosa, Blau) dagegen bleiben Hex-Referenzen über CSS-Variablen (`--accent`, `--bg-header`).

### Interaction-States

| State | Regel |
|---|---|
| Hover | Lightness −8 % oder Alpha-Overlay |
| Active | Lightness −16 % oder Scale `0.98` |
| Focus | Ring `2px solid var(--text)` (neutral-kontraststark) |
| Disabled | Opacity `0.5` + `cursor: not-allowed` |

**Focus-Ring:**
- Farbe: `var(--text)` → schwarz auf Light, hell auf Dark
- Offset: `2px`, Breite: `2px`
- **Nie brand-farbig** (kollidiert mit Primary-Button-Farbe)

---

## D — Spacing, Radius, Shadows

### Spacing-Grid

**Basis: 4 px** (Tailwind-Default).

| Token | Wert | Einsatz |
|---|---|---|
| `space-1` | 4px | Micro-Gap |
| `space-2` | 8px | Inline-Gap (Icon-Text) |
| `space-3` | 12px | Small-Gap (Button-Inhalt) |
| `space-4` | 16px | Standard-Gap |
| `space-6` | 24px | Section-Innenraum |
| `space-8` | 32px | Section-Gap |
| `space-12` | 48px | Major-Section |
| `space-16` | 64px | Hero-Padding |
| `space-24` | 96px | Page-Padding Desktop |

### Radius

Charakter: **soft** — passt zum CI-Hero-Logo (runde Formen, pill-Buttons).

| Token | Wert | Einsatz |
|---|---|---|
| `radius-sm` | 6px | Kleine Tags, Badges |
| `radius-md` | 8px | Inputs, kleine Cards |
| `radius-lg` | 10px | Standard-Elemente |
| `radius-xl` | 14px | Hero-Bands, Alerts |
| `radius-2xl` | 16px | Cards, Modals, Inputs (groß) |
| `radius-3xl` | 24px | Feature-Cards, Panels |
| `radius-full` | 9999px | **Buttons, Pills, Badges, Avatar** |

**Component-Defaults:**
- Buttons: `rounded-full` (pill)
- Cards: `rounded-2xl`
- Modals: `rounded-2xl`
- Inputs: `rounded-2xl`
- Badges / Tags: `rounded-full`

### Shadows

| Token | Wert | Einsatz |
|---|---|---|
| `shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtile Cards |
| `shadow` | `0 1px 3px rgba(0,0,0,0.1)` | Standard-Cards |
| `shadow-md` | `0 4px 6px rgba(0,0,0,0.1)` | Dropdowns |
| `shadow-lg` | `0 10px 15px rgba(0,0,0,0.1)` | Modals |
| `shadow-xl` | `0 20px 25px rgba(0,0,0,0.15)` | Popovers, wichtige Dialoge |
| `shadow-glow` | `0 0 20px var(--accent-glow)` | **Hover auf Primary-Button** |

**Dark-Mode-Anpassung:** Shadow-Opacity auf `0.4`–`0.5` hochziehen (sonst unsichtbar auf `#141414`).

---

## E — Motion

| Token | Wert | Einsatz |
|---|---|---|
| `dur-fast` | 150ms | Hover, Focus-Transitions |
| `dur-normal` | 300ms | Dropdowns, Disclosure |
| `dur-slow` | 500ms | Modals, Page-Transitions |
| `ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Default für Enter-Motions |
| `ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` | Toggle-States, Symmetric-Motions |

`prefers-reduced-motion: reduce` → alle Durations auf `0.01ms` kollabieren, Layout-Animationen deaktivieren, Scale/Opacity okay lassen.

---

## F — Voice & Tone

Komplette Microcopy-Library siehe [`VOICE.md`](VOICE.md).

**Kurz:**
- Ansprache: **Du** überall (Education + Business)
- Ton: **konfident-casual** — wie ein konfidentes Mitte-20er-Startup reden würde
- Denglisch okay wenn natürlich („Let's go", „cool", „fair enough")
- Interjektionen als Brand-Signatur: „Ups", „Hmm", „Passt"
- Umlaute immer echt (ö/ä/ü/ß, **nie** oe/ae/ue/ss)
- Emojis: nur wo sie etwas ersetzen (👋 in Welcome-Mail), **nie** in UI

---

## G — Logo-System

### Logo-Dateien

Alle in `assets/logos/`:

| Datei | Farbgebung | Primär-Einsatz |
|---|---|---|
| `logo-wide-black.svg` | Schwarz uni | Mono-Kontext Light, Favicon-Quelle |
| `logo-wide-white.svg` | Weiß uni | Mono-Kontext Dark |
| `logo-wide-red.svg` | Rot uni | Light-Theme Header + Mail Light |
| `logo-wide-pink.svg` | Rosa uni | Alternativer Akzent Light |
| `logo-wide-pink-red.svg` | Rosa „Generation" + Rot „AI" | Deck-Cover Light-Theme |
| `logo-wide-red-on-pink.svg` | Rot auf Rosa-BG (Hero) | Social / OG Light-Theme |
| `logo-wide-neon.svg` | Neon-Grün uni | Dark-Theme Header + Mail Dark |
| `logo-wide-blue.svg` | Blau uni | Alternativer Akzent Dark |
| `logo-wide-blue-neon.svg` | Blau „Generation" + Neon „AI" | Deck-Cover Dark-Theme |
| `logo-wide-neon-on-blue.svg` | Neon auf Blau-BG (Hero) | Social / OG Dark-Theme |
| `logo-wide-sand.svg` | Beige uni | Print auf warmen Oberflächen |
| `favicon-dark.svg` | Neon-AI, transparent | Dark-Tab-Favicon |
| `favicon-light.svg` | Rot-AI, transparent | Light-Tab-Favicon |

### Kontext → Logo-Matrix

| Kontext | Datei |
|---|---|
| Website Header Light | `logo-wide-red.svg` |
| Website Header Dark | `logo-wide-neon.svg` |
| Website Footer Light | `logo-wide-black.svg` |
| Website Footer Dark | `logo-wide-white.svg` |
| Auth-Mail Header Light | `logo-wide-red.svg` |
| Auth-Mail Header Dark | `logo-wide-neon.svg` |
| Marketing-Mail (beide Themes) | wie Auth-Mail |
| Social Profil Dark-Theme | `logo-wide-neon-on-blue.svg` |
| Social Profil Light-Theme | `logo-wide-red-on-pink.svg` |
| OG-Image Default | `logo-wide-neon-on-blue.svg` |
| Deck-Cover Dark-Theme | `logo-wide-blue-neon.svg` |
| Deck-Cover Light-Theme | `logo-wide-pink-red.svg` |
| Print (warm / Papier) | `logo-wide-sand.svg` |
| Favicon Light-Tab | `favicon-light.svg` |
| Favicon Dark-Tab | `favicon-dark.svg` |

### Logo-Nutzungsregeln

**Don'ts (hart):**
- ❌ Nicht strecken, stauchen oder verzerren (Proportionen fix)
- ❌ Nicht rotieren
- ❌ Keine Effekte: Drop-Shadow, Bevel, Outline, Glow
- ❌ Nicht rekolorieren außerhalb der 11 CI-Varianten
- ❌ Keine Text-Ersetzung oder -Ergänzung im Logo
- ❌ Nie auf busy Foto-BGs ohne abgedunkelten/aufgehellten Overlay

**Min-Size:**
- Digital: **32 px Höhe** (Minimum)
- Print: **10 mm Höhe** (Minimum)

**Clearspace:** **½ Logo-Höhe** rundherum freihalten (Safe-Zone).

### Logo-Component (für Code)

```tsx
<Logo context="header" colorway="auto" />
```

- `colorway="auto"` wählt automatisch basierend auf aktuellem Theme + `context`-Prop (`header`, `footer`, `mail`, `social`, `print`)
- Manuelles Override möglich: `colorway="red"`, `colorway="neon"`, etc.
- Size-Props: `sm` (32px), `md` (40px), `lg` (56px), oder explicit `height={…}`

Canonical Implementation: `packages/ui/src/components/Logo.tsx` im Monorepo.

---

## H — Iconography

**Primary:** Inline-SVGs im Tailwind/Next-Stil — `stroke` + `currentColor`, `stroke-width: 2`, `stroke-linecap: round`, `stroke-linejoin: round`, `viewBox="0 0 24 24"`. Der Codebase nutzt hand-inlined Icons in Header und Floating-Chat.

**Library:** Wo Icons aus einer Library kommen, ist das **Lucide** (`lucide-react`). Kompatibel mit dem Inline-Stil.

**Regel:** Kein Mix von Icon-Libraries. Wenn neu, nimm Lucide. Wenn kontextuell (z.B. Agent-Avatar), hand-inlined.

---

## I — Imagery

- **Keine Stock-Fotos.** Keine „Studis mit Laptops"-Klischees.
- Echte Screenshots in Case-Studies. Authentizität über Polish.
- Tool-Logos in Tools-App kommen über `ToolLogo`-Component (Google S2 Domain-Favicon, Fallback = Mono-Letter).
- Wissenschaftsmagazin-Vibe: dunkel, fokussiert, funktional. Contentlos kein Bild.

---

## Offen / Later

- **Square-Logo-Varianten** (App-Icons, Avatare) — später vom Designer
- **Weiß-Outline-Variante** (laut CI-PDF existiert, nicht in Dateien) — nachfordern
- **Typografie-Italic in Body-Kontexten** — aktuell deaktiviert, bei Bedarf aktivieren
- **Component-Library (Storybook)** — nach Bedarf, P3

---

## Changelog

- **2026-04-20 v1.1** — Two-Worlds-Modell entfernt, durch einfaches Light/Dark-Theming ersetzt. Favicons (transparent, dark + light) ergänzt. H4–H6-Typografie-Rollen dokumentiert. Motion-Section hinzugefügt.
- **2026-04-18 v1.0** — Erstfassung nach Workshop-Session mit Luca. Blöcke A–F entschieden.
