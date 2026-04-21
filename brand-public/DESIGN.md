# Generation AI — Design System

> Source of Truth für alle Design-Entscheidungen.
> Version 1.3 · 2026-04-21

Diese Datei ist die **maschinen- und menschenlesbare Referenz**. Jede UI-Entscheidung in Website, tools-app, Mails, Decks und Social leitet sich hier ab. Wenn etwas hier nicht steht, wurde es noch nicht entschieden.

**Primärer Leser:** LLM beim Code-Generieren. Deshalb: präzise, mit konkreten Werten, ohne Raten-Spielräume.

---

## A — Bright + Dark Mode

Alle digitalen Surfaces (Website, tools-app, Mails) unterstützen **Bright + Dark Mode als gleichwertige Theme-Modi** — wie jede moderne Produkt-Website. **Kein Audience-basiertes Mapping**, kein "Education vs Business"-Split. Der User (oder das System) wählt, wir rendern entsprechend.

**Defaults:**
- Website (generation-ai.org): **Dark** als Default (editorial-tech-dark Aesthetic)
- tools-app (tools.generation-ai.org): **System-Präferenz** (`prefers-color-scheme`), User-Override möglich
- Mails: adaptiv via `@media (prefers-color-scheme: dark)`, ein Template pro Mail-Typ

**Toggle-Verhalten:**
- User-Toggle überschreibt System-Präferenz, gespeichert in LocalStorage
- Alle Komponenten müssen in beiden Modi sauber aussehen und getestet sein
- Jeder Mode hat ein festes Farb-Paar: **Dark = Neon + Blau** (kühl), **Bright = Rot + Rosa** (warm). Siehe Block C für Details — keine Paar-Kreuzung.

**Kein Flächen-Flood:**
Brand-Akzente (Rosa, Rot, Blau, Neon) sind **Akzente** — Buttons, Hover-Glow, Highlights, Section-Marker, Tags. Nicht Seiten-BG. Body-BG bleibt Neutral (`#F6F6F6` Bright / `#141414` Dark).

---

## B — Typografie

### Font-System

| Rolle | Font | Einsatz |
|---|---|---|
| Display / H1 / UI-Akzente | **Geist Mono** (700) | Hero-Headlines, Buttons, Tags, Labels, Code, Captions |
| Headlines H2–H6 | **Geist Sans** (600–800) | Sections, Artikel, Dialog-Titel |
| Body / Lede / Lists | **Geist Sans** (400–500) | Fließtext, Absätze, Bullets |

**Begründung:** Geist Mono für den Tech/KI-Moment, Geist Sans für lesbaren Fließtext. Monospace-Body wäre auf 200+ Wörtern anstrengend.

**Font-Loading:**
- `next/font/google` in beiden Apps
- Geist Sans: Weights 400, 500, 600, 700, 800, 900
- Geist Mono: Weights 400, 500, 700
- Fallback-Stack Sans: `Geist, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif`
- Fallback-Stack Mono: `"Geist Mono", ui-monospace, "SF Mono", Menlo, monospace`

**Ligaturen:** In UI-Text deaktiviert via `font-feature-settings: "liga" 0, "calt" 0`. Nur in echten Code-Blöcken aktiv.

### Skala (px-basiert, Base 16)

| Rolle | Size | Weight | Line-Height | Font |
|---|---|---|---|---|
| H1 / Hero | `clamp(32px, 5vw, 48px)` | 700 | 1.05 | Geist Mono |
| H2 | `clamp(24px, 3vw, 32px)` | 700 | 1.2 | Geist Sans |
| H3 | 20px | 600 | 1.3 | Geist Sans |
| Lede / Intro | 18px | 500 | 1.5 | Geist Sans |
| Body | 16px | 400 | 1.65 | Geist Sans |
| Body Small | 14px | 400 | 1.55 | Geist Sans |
| Caption | 13px | 400 | 1.5 | Geist Sans |
| Micro / Tag / Label | 11px | 700 | 1.4 | Geist Mono |
| Button | 14px | 700 | 1 | Geist Mono |
| Code Inline / Block | 13px | 400 | 1.5 | Geist Mono |

**Letter-Spacing:**
- H1: `-0.02em`
- H2: `-0.015em`
- Tag/Micro: `+0.08em`
- Button: `+0.02em`

**Italic:**
- Nur in Blockquotes (Geist Sans italic)
- Headlines und Body nie italic

---

## C — Farbsystem

### Brand-Farben (aus CI-PDF, unverändert)

Die vier Brand-Farben sind in zwei **Farb-Paare** organisiert — ein kühles Paar für Dark Mode, ein warmes für Bright Mode. Dieses Pairing spiegelt sich auch in unseren Duo-Tone-Logos (`logo-wide-neon-on-blue.svg` / `logo-wide-red-on-pink.svg`).

| Name | Hex | Rolle | Paar |
|---|---|---|---|
| Neon-Grün | `#CEFF32` | **Primary-Action in Dark Mode**. Signatur-Akzent. Sparsam auf dunklem Grund. | Kühl (Dark) |
| Blau | `#3A3AFF` | **Companion in Dark Mode**. Alternativ-Action, Link-Farbe, Hero-BG (`neon-on-blue` Logo). | Kühl (Dark) |
| Rot | `#F5133B` | **Primary-Action in Bright Mode**. Action-Akzent, sparsam (error-nah). | Warm (Bright) |
| Rosa | `#FC78FE` | **Companion in Bright Mode**. Alternativ-Action, Highlights, Hero-BG (`red-on-pink` Logo). | Warm (Bright) |
| Light Neutral | `#F6F6F6` | Body-BG in Bright Mode | Neutral |
| Dark Neutral | `#141414` | Body-BG in Dark Mode, Ink in Bright Mode | Neutral |

**Pair-Logik:**
- **Dark Mode → Neon + Blau**. Primary = Neon, Companion = Blau. Wenn ein Design im Dark Mode eine zweite Akzent-Farbe braucht (Sekundär-Button, Link, Hero-BG), kommt Blau — nicht Rosa oder Rot.
- **Bright Mode → Rot + Rosa**. Primary = Rot, Companion = Rosa. Zweiter Akzent im Bright Mode → Rosa, nicht Blau oder Neon.
- **Keine Paar-Kreuzung**: Neon auf Rosa-BG oder Rot auf Blau-BG sind verboten. Immer innerhalb des Paars bleiben.

### Semantic States (nicht Brand-Farben)

Zweck: Status-Signale dürfen nicht mit Brand-Akzenten kollidieren. Deshalb eigene Skala.

| Rolle | Hex | Tailwind-Äquivalent |
|---|---|---|
| Error | `#DC2626` | `red-600` |
| Success | `#16A34A` | `green-600` |
| Warning | `#F59E0B` | `amber-500` |
| Info | `#2563EB` | `blue-600` |

### Neutrals — Radix Colors

**Skala:** Radix `slate` (12 Steps) + `slate-dark` für Dark-Mode. Alpha-Varianten für Overlays (`slateA`).

**Semantische Zuordnung (LLM-Referenz):**

| Step | Rolle | Beispiel-Einsatz |
|---|---|---|
| `slate-1` | App-BG | `body` background |
| `slate-2` | Subtle-BG | Card-Section, Zebra-Streifen |
| `slate-3` | UI-Element-BG | Disabled-Button, Skeleton |
| `slate-4` | Hover-BG für UI-Elemente | Button-Hover-State auf Ghost-Button |
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
- Offset: `2px`
- Breite: `2px`
- Nie brand-farbig (kollidiert mit Primary-Button-Farbe)

---

## D — Spacing, Radius, Shadows

### Spacing-Grid

**Basis: 4 px** (Tailwind-Default). Skala:

| Token | Wert | Einsatz |
|---|---|---|
| `space-0` | 0 | — |
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
- Badges/Tags: `rounded-full`

### Shadows

**Skala:** Tailwind-Default + Brand-Glow für Hover.

| Token | Wert | Einsatz |
|---|---|---|
| `shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtile Cards |
| `shadow` | `0 1px 3px rgba(0,0,0,0.1)` | Standard-Cards |
| `shadow-md` | `0 4px 6px rgba(0,0,0,0.1)` | Dropdowns |
| `shadow-lg` | `0 10px 15px rgba(0,0,0,0.1)` | Modals |
| `shadow-xl` | `0 20px 25px rgba(0,0,0,0.15)` | Popovers, wichtige Dialoge |
| `shadow-glow` | `0 0 20px var(--accent-glow)` | **Hover auf Primary-Button** |

Dark-Mode-Anpassung: Shadow-Opacity auf `0.4`–`0.5` hochziehen (sonst unsichtbar auf `#141414`).

---

## E — Voice & Tone

Siehe [VOICE.md](VOICE.md) für komplette Microcopy-Library.

**Kurz:**
- Ansprache: **Du überall** (siehe VOICE.md für Rollen-Matrix — einzige Ausnahme: Presse)
- Ton: **konfident-casual** — wie ein konfidentes Mitte-20er-Startup reden würde
- Denglisch okay wenn natürlich ("Let's go", "cool", "fair enough")
- Interjektionen als Brand-Signatur: "Ups", "Hmm", "Passt"
- Umlaute immer echt (ö/ä/ü/ß, nie oe/ae/ue/ss)
- Emojis: nur wo sie etwas ersetzen (👋 in Welcome-Mail), nie in UI

---

## F — Logo-System

### Logo-Dateien

Alle in `brand/logos/`:

| Datei | Farbgebung | Primär-Einsatz |
|---|---|---|
| `logo-wide-black.svg` | Schwarz uni | Mono-Kontext Bright, Favicon-Quelle |
| `logo-wide-white.svg` | Weiß uni | Mono-Kontext Dark |
| `logo-wide-red.svg` | Rot uni | Bright-Mode Header + Mail |
| `logo-wide-pink.svg` | Rosa uni | Alternativer warmer Akzent |
| `logo-wide-pink-red.svg` | Rosa "Generation" + Rot "AI" | Deck-Cover (warm) |
| `logo-wide-red-on-pink.svg` | Rot auf Rosa-BG (Hero) | Social / OG (warm) |
| `logo-wide-neon.svg` | Neon-Grün uni | Dark-Mode Header + Mail |
| `logo-wide-blue.svg` | Blau uni | Alternativer kühler Akzent |
| `logo-wide-blue-neon.svg` | Blau "Generation" + Neon "AI" | Deck-Cover (cool) |
| `logo-wide-neon-on-blue.svg` | Neon auf Blau-BG (Hero) | Social / OG (cool, Default) |
| `logo-wide-sand.svg` | Beige uni | Print auf warmen Oberflächen |
| `favicon-blue-neon-padded.svg` | GA-Monogramm, Neon auf Blau (`#3A3AFF`) | **Favicon Dark Mode** — Browser-Tab, Home-Screen-Icon, PWA-Manifest |
| `favicon-red-on-pink-padded.svg` | GA-Monogramm, Rot auf Rosa (`#FC78FE`) | **Favicon Bright Mode** — Browser-Tab, Home-Screen-Icon, PWA-Manifest |

### Kontext → Logo-Matrix

| Kontext | Datei |
|---|---|
| Website Header Bright | `logo-wide-red.svg` |
| Website Header Dark | `logo-wide-neon.svg` |
| Website Footer Bright | `logo-wide-black.svg` |
| Website Footer Dark | `logo-wide-white.svg` |
| Auth-Mail Header Bright | `logo-wide-red.svg` |
| Auth-Mail Header Dark | `logo-wide-neon.svg` |
| Marketing-Mail (beide Modi) | wie Auth-Mail |
| Social Profil (Default, cool) | `logo-wide-neon-on-blue.svg` |
| Social Profil (Alt, warm) | `logo-wide-red-on-pink.svg` |
| OG-Image Default | `logo-wide-neon-on-blue.svg` |
| Deck für Partner/Corporate | `logo-wide-blue-neon.svg` |
| Deck für Hochschulen | `logo-wide-pink-red.svg` |
| Print (warm/Papier) | `logo-wide-sand.svg` |
| Favicon Dark Mode | `favicon-blue-neon-padded.svg` (GA-Monogramm, Neon auf Blau) |
| Favicon Bright Mode | `favicon-red-on-pink-padded.svg` (GA-Monogramm, Rot auf Rosa) |

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

**Clearspace:**
- **½ Logo-Höhe** rundherum freihalten (Safe-Zone)

### Logo-Component (für Code)

```tsx
<Logo variant="wide" colorway="auto" />
```

- `colorway="auto"` wählt automatisch basierend auf aktuellem Theme + Kontext-Prop (`header`, `footer`, `mail`)
- Manuelles Override möglich: `colorway="red"`, `colorway="neon"`, etc.
- Size-Props: `sm` (32px), `md` (40px), `lg` (56px), oder explicit `height={…}`

Implementierung in separater Session (siehe IMPLEMENTATION-TODO.md).

---

## Offen / Later

- **Square-Logo-Varianten** (für App-Icons, Avatare) — nicht in aktuellen Assets, später vom Designer ziehen. Favicon-Pair existiert bereits (`favicon-blue-neon-padded.svg` / `favicon-red-on-pink-padded.svg`), App-Icons brauchen Multi-Res-Export (16/32/180/192/512).
- **Weiß-Outline-Variante** (laut CI-PDF existiert, nicht in Dateien) — nachfordern
- **Typografie-Italic in Body-Kontexten** — aktuell deaktiviert, bei Bedarf aktivieren
- **Motion & Animation** — Tempo, Easing, `prefers-reduced-motion` noch nicht systematisch definiert
- **Component-Library (Storybook)** — nach Bedarf, P3

---

## Changelog

- **2026-04-21 v1.3** — Favicon-Pair komplett: `favicon-red-on-pink-padded.svg` (GA-Monogramm Rot auf Rosa) als Bright-Mode-Gegenstück zum bestehenden Blau+Neon-Favicon ergänzt. Beide Favicons in Logo-Dateien-Tabelle und Kontext-Matrix aufgenommen. Multi-Res-Export für App-Icons bleibt Dev-To-do.
- **2026-04-21 v1.2** — Farb-Paar-Logik explizit: Dark Mode = Neon + Blau (kühl), Bright Mode = Rot + Rosa (warm). Companion-Farbe pro Mode festgelegt, Paar-Kreuzung verboten. Block C und Block A entsprechend erweitert.
- **2026-04-21 v1.1** — Two-Worlds-Modell (Education=Light / Business=Dark) entfernt. Bright + Dark Mode sind jetzt gleichwertige Theme-Modi ohne Audience-Kopplung. Block A komplett neu. Brand-Farben-Tabelle, Voice-Block und Logo-Matrix entsprechend entkoppelt. Favicon finalisiert: `favicon-blue-neon-padded.svg` (GA-Monogramm, Neon auf Blau) — nicht mehr TBD.
- **2026-04-18 v1.0** — Erstfassung nach Workshop-Session mit Luca. Blöcke A–F entschieden.
