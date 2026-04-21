# Generation AI — Design System

**KI-Community für Studierende im DACH-Raum.** Drei Surfaces, ein System.

- **Marketing-Website** — `generation-ai.org` — Landing + Sign-up
- **Tools-App** — `tools.generation-ai.org` — KI-Tool-Bibliothek + Agent-Chat
- **Circle-Community** — `community.generation-ai.org` — Kurse, Events, Diskussionen

**Look:** editorial-tech-dark. Neon `#CEFF32` auf Dark Neutral `#141414`. Secondary: Blau `#3A3AFF`, Rosa `#FC78FE`, Rot `#F5133B`.
**Voice:** konfident-casual, Du, Deutsch mit Denglisch wo's natürlich ist.
**Motif:** Connection / Signal over Noise — Linien, Knoten, roter Faden.

**Theming:** Dark + Bright gleichwertig, Default = Dark, Toggle verfügbar. Alle Komponenten müssen in beiden Modi sauber aussehen.

---

## Sources

- **`brand/`** (local attached folder) — `DESIGN.md`, `VOICE.md`, `tokens.json`, SVG-Logos, typography-Mockups. Die Rohquellen wurden in dieses Projekt kuratiert und auf den aktuellen Stand gebracht.
- **GitHub repo** — `Generation-AI-Org/generation-ai` (monorepo). Relevante Pfade:
  - `packages/config/tailwind/base.css` — canonical CSS-Variablen + Slate-Tokens
  - `packages/ui/src/components/Logo.tsx` — Logo-Component mit colorway-Auto-Wahl
  - `apps/website/` — Marketing-Site (Next.js, Tailwind v4)
  - `apps/tools-app/` — Tools-App (Next.js, Tailwind v4, Floating Chat)
- **Circle-Community** — hosted via Circle.so, kein eigener Codebase. UI-Kit entsprechend limitiert (cover der sichtbaren Circle-Oberfläche im GenAI-Look).

---

## Index

| File | What |
|---|---|
| `README.md` | This file — context, fundamentals, iconography, index |
| `colors_and_type.css` | CSS-Variablen (colors, type, spacing, radius, shadow, motion). Source of truth für alle HTML-Artefakte |
| `tokens.json` | W3C Design-Tokens-Spec (maschinenlesbare Referenz) |
| `VOICE.md` | Voice & Tone — komplette Microcopy-Library |
| `DESIGN.md` | Kanonisches Design-System-Dokument — Theming, Typografie, Farben, Spacing, Motion, Logos, Iconography, Imagery |
| `assets/logos/` | Alle Wide-Logos (11 Colorways) + Favicons (light/dark, transparent) |
| `fonts/` | Self-hosted variable fonts (Geist Sans, Geist Mono) |
| `preview/*.html` | ~24 Design-System-Cards (colors, type, spacing, components, brand) |

---

## Content Fundamentals

**Primärsprache:** Deutsch mit echten Umlauten (ö/ä/ü/ß — **nie** oe/ae/ue/ss). Tech-Begriffe Englisch lassen: Agent, Chat, Tool, Dashboard, Feature, Login, Account.

**Ton:** konfident-casual. "Wir wollen geilen Shit machen und wissen was wir tun."
- **Du** überall, auch Business-Kontakte
- **Selbstbewusst statt entschuldigend** — "Passt, gespeichert" statt "Erfolgreich gespeichert"
- **Kurz gewinnt** — jedes Wort muss arbeiten
- **Ehrlich bei Fehlern** — "Ups, da ist was schiefgelaufen" statt "Ein Fehler ist aufgetreten"

**Interjektionen als Signatur** (max 1 pro Message):
- **Ups** — Server-Fehler
- **Hmm** — User-Input-Fehler, freundlich korrigierend
- **Passt** — Success, selbstsicher
- **Let's go** — Motivations-Momente (Onboarding fertig)

**Denglisch okay** wo natürlich: "Let's go", "cool", "fair enough", "okay".

**Casing:** Buttons casual Title-Case ("Kostenlos beitreten", "Mehr erfahren"). Section-Marker / Tags in `UPPERCASE` mit +0.08em tracking (Geist Mono).

**Hard Don'ts:**
- Keine Ausrufezeichen in Buttons
- Kein "Leider", "bitte haben Sie Verständnis", "wir freuen uns Ihnen mitteilen zu dürfen"
- Kein "Erfolgreich [Verb]" — direkter sein
- Kein Binnen-I, kein Gender-Gap — neutral formulieren
- Emojis: nur wenn sie ein Wort **ersetzen** (👋 in Welcome-Mail), nie dekorieren

Vollständige Microcopy-Library: **`VOICE.md`**.

---

## Visual Foundations

**Colors.** Default = Dark. Accent Neon `#CEFF32` auf `#141414`. Bright Mode: Accent Rot `#F5133B` auf `#F6F6F6`. Brand-Akzente (Rosa `#FC78FE`, Blau `#3A3AFF`) sind **Akzente**, nie Full-Bleed-Backgrounds — sie landen in Header-Bands, Buttons, Hover-Glows. Neutrals via Radix `slate` (12 Steps), Brand-Farben via 12-Step-Scales (`--neon-1` … `--neon-12`). Semantic status colors eigene Skala (`--status-error` etc.), damit sie nie mit Brand kollidieren.

**Type.** Zwei-Ebenen-System: **Geist Sans** für Body + Headlines H2/H3, **Geist Mono** für Display/H1, Buttons, Labels, Tags, Section-Marker, Timestamps, Kategorien — wie Kommentare im Code. Das ist die editorial-technische Signatur. H1 `clamp(32px, 5vw, 48px)` / 700 / -0.02em, Body 16/400/1.65. Ligaturen in UI-Text aus (`font-feature-settings: "liga" 0, "calt" 0`).

**Spacing.** Basis 4px. Haupt-Rhythmus: 4, 8, 12, 16, 24, 32, 48, 64, 96. Cards `p-6`, Sections `py-20..py-28` auf Desktop.

**Radius.** Soft. Defaults: **Buttons = `rounded-full` (pill)**, Cards/Modals/Inputs = `rounded-2xl` (16px), Tags = `rounded-full`.

**Backgrounds.** Kein Gradient-Spam. Kein Stock-Foto-Hintergrund. Backgrounds sind entweder die `--bg`-Neutrals, ein `--bg-header`-Brand-Band (Blau/Rosa) oder die **Signal-Grid**-Canvas-Animation (Nodes + Linien, Propagation auf Mouse-Move, im Hero). Radial-Fade-Overlay protected Text. Kein Parallax, keine Stock-Fotos, keine dekorativen Blobs.

**Animation.** Smooth, zweckmäßig, mit Wow-Momenten — nie hektisch, nie Startup-Hustle. Durations: `fast 150ms` · `normal 300ms` · `slow 500ms`. Easing: `ease-out cubic-bezier(0.16, 1, 0.3, 1)` als Default, `ease-in-out cubic-bezier(0.65, 0, 0.35, 1)` für komplexere Flows. Referenzen: Anthropic, Resend, Linear. **Nicht:** Agency-Parallax-Overkill.

**Hover states.** Primary-Button → `scale(1.03)` + `box-shadow: 0 0 20px var(--accent-glow)` (Neon-Glow). Secondary → `border-color` wird accent-soft, text heller. Icons innerhalb von Buttons: `group-hover:scale-110` + optional `rotate` / `translate`. Card-Hover → `scale(1.015)` + subtiler Shadow, Border fadet zu accent-ramp-30%.

**Press states.** `active:scale(0.98)` oder `translate-y-px` (mini-press), `transition-transform duration-75`.

**Borders.** Dark: `rgba(255,255,255,0.08)` Standard, `rgba(206,255,50,0.6)` für accent-border. Light: `rgba(0,0,0,0.1)`. Divider/Card-Border = `slate-6`.

**Shadows.** Subtil auf Dark (Opacity 0.4–0.5 für Sichtbarkeit). Haupt-Punch ist **der Glow** — `0 0 20px var(--accent-glow)` auf Primary-Button-Hover und Highlighted-Cards. Modal `shadow-xl`.

**Transparency & Blur.** Sparsam. Verwendet für: Accent-soft-Backgrounds (`rgba(accent, 0.15)` für Badge-Füllungen, Hover-States), Protection-Overlays (Radial-Fade hinter Hero-Text über Signal-Grid). **Kein** dekoratives Glassmorphism.

**Corner radii.** Pills + Cards, nie harte 0-Ecken, nie extreme Pill-Cards. Buttons → `full`. Cards → `2xl`. Tiny tags → `full`.

**Cards.** `bg-[var(--bg-card)]` + `rounded-2xl` + `1px solid var(--border)`. **Highlighted** card (search result, selected): `2px solid var(--accent)` + neon box-shadow `0_0_24px_var(--accent-glow)`. Keine linke farbige Kante, keine Inner-Shadows.

**Layout rules.** Header = brand-colored Band (Blau im Dark, Rosa im Light), Body = neutraler BG. Max-Widths: Hero-Text `max-w-4xl`, Form `max-w-2xl`, Article `max-w-[65ch]`. Cards-Grid in Tools-App: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`. Floating-Chat fixed bottom-right, expandable auf 35 % Desktop, lg:`400px`.

**Imagery vibe.** **Keine** Stock-Fotos ("Studis mit Laptops"). Echte Screenshots in Case-Studies, Logos der Tools über ToolLogo-Component (domain-basiert, Fallback = Mono-Letter). Dunkel, fokussiert, funktional — wie Wissenschaftsmagazine.

---

## Iconography

**Primary:** Inline-SVGs im Tailwind/Next-Stil — `stroke` + `currentColor`, `stroke-width: 2`, `stroke-linecap: round`, `stroke-linejoin: round`, `viewBox="0 0 24 24"`. Der Codebase nutzt hand-inlined Icons für alle UI-Actions (Search, Theme-Toggle, Login-Door mit Arrow-Animation, Settings-Gear, etc.).

**Library:** Wo Icons aus einer Library kommen, ist das **Lucide** (`lucide-react`) — siehe `apps/website/components/sections/signup.tsx` (`Loader2`, `CheckCircle`, `AlertCircle`). Kompatibel mit dem Inline-Stil (gleicher stroke, gleicher viewBox).

> **Flag:** In diesem Design-System-Artefakt nutzen wir Lucide via CDN (`https://unpkg.com/lucide-static@latest/icons/...svg`) als Fallback. Wenn du produktiv baust: `lucide-react` installieren.

**Emoji:** Nicht in UI, nicht in Buttons. Einzige Ausnahmen: Welcome-Mail-Betreff (`👋` ersetzt "Hallo"), Marketing-Mails sparsam (max 1 pro Mail, funktional). Sparkles `✨🚀🔥` sind **verboten**. Siehe VOICE.md.

**Unicode-Chars:** `→`, `←`, `·`, `//`, `$` als Terminal-Prompt werden im editorial-tech-Kontext benutzt (z. B. Mono-Section-Marker `// SECTION · 01`).

**Logos:** 11 Colorways × 1 Orientation (wide) + 2 Favicons (transparent, dark + light). Automatische Wahl via `<Logo context="header|footer|mail" colorway="auto" />`. Kontext-Matrix siehe `DESIGN.md § G`.

**Tool-Logos:** In Tools-App werden Third-Party-Tool-Logos über `ToolLogo`-Component aus Domain-Favicon-Services (Google S2) gezogen, mit Mono-Letter-Fallback.

---

## Fonts

**Geist Sans** + **Geist Mono** — self-hosted variable fonts in `fonts/`. Both are single-file weight-axis variables (100–900) licensed under the SIL Open Font License by Vercel. Loaded via `@font-face` in `colors_and_type.css` — no Google Fonts CDN, no FOUT after initial load. Produktiv wird `next/font/local` empfohlen.

---

## Caveats

- Signup-Component im Original-Codebase verwendet einen `✨`-Sparkle im Quick-Win-Hint — widerspricht der Voice-Rule (keine Emojis in UI). Beim Nachbauen rausnehmen.
- Icon-Set ist eine Mischung aus hand-inlined SVGs (Header, Chat) und Lucide-Icons (Forms). Keine zentrale Icon-Library.
