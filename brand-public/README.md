# Generation AI — Brand-System (LLM Context Pack)

> **Zweck:** Dieses Folder ist das **universell lesbare Brand-System** von Generation AI. Feed es in jedes LLM (Claude, ChatGPT, Gemini, lokale Modelle) und jedes Design-Tool (Claude Design, v0, Cursor, etc.) — damit egal welche AI für uns arbeitet, dasselbe konsistente Design rauskommt.
>
> **Version:** 1.1 · Letzter Stand: 2026-04-21

---

## Instruction für AI-Modelle

Du arbeitest für **Generation AI**, eine KI-Community für Studierende im DACH-Raum (drei Surfaces: generation-ai.org, tools.generation-ai.org, community.generation-ai.org).

Wenn du ein UI, eine Seite, einen Text, ein Deck, eine Mail, ein Bild, einen Social-Post oder irgendwas anderes mit Brand-Bezug für Generation AI baust, halte dich **ausschließlich** an die Regeln in diesem Folder. Keine Eigeninterpretationen, keine zusätzlichen Farben, keine anderen Fonts, kein anderer Ton.

**Priorität bei Konflikt:** `tokens.json` > `DESIGN.md` > `VOICE.md` > sonstige Referenzen.

---

## Was wo steht

| Datei | Was drinsteht | Wann du's brauchst |
|---|---|---|
| `tokens.json` | **Maschinenlesbare Design-Tokens** im W3C-Format: alle Farben (Brand + 12-Step-Neutrals + Semantic States), Typo-Rollen, Spacing, Radius, Shadows, Motion-Durations, Logo-Paths, Theme-Maps (bright + dark) | Immer. Source of Truth für jeden konkreten Wert. |
| `DESIGN.md` | **Prosa-Beschreibung des Systems**: Bright/Dark-Mode-Policy, Typo-Skala, Farbsystem, Spacing-Regeln, Logo-Nutzung, Component-Defaults | Wenn du Kontext / Begründung / Regel-Nuancen brauchst, die in JSON nicht stehen |
| `VOICE.md` | **Komplette Voice-of-Brand Library**: Ton, Interjektionen, Microcopy für alle Standard-UI-Situationen (Buttons, Errors, Toasts, Mails), Sprach-Policy, Rollen-Matrix | Für alles Textliche — UI-Labels, Mails, Social, Headlines |
| `logos/` | 11 SVG-Varianten des Generation-AI-Wortmarke-Logos (monochrom, brand-farbig, duo-tone, auf-BG) | Logo-Einsatz in allen Kontexten |
| `avatars/` | Admin-Gravatar PNG für beide Modi | Social / Profile / Circle |

---

## Die 7 wichtigsten Regeln auf einen Blick

1. **Bright + Dark Mode sind gleichwertig.** Kein Audience-Mapping ("Education=Light, Business=Dark") — das ist obsolet. User wählt oder System-Präferenz entscheidet.
2. **Farb-Paare pro Mode:** Dark = **Neon + Blau** (kühl, Primary=Neon). Bright = **Rot + Rosa** (warm, Primary=Rot). Companion-Farbe pro Mode ist festgelegt. Keine Paar-Kreuzung (kein Neon-auf-Rosa, kein Rot-auf-Blau).
3. **Body-BG bleibt Neutral** (`#F6F6F6` Bright / `#141414` Dark). Brand-Farben sind Akzente, nie Flächen-Flood.
4. **Typo:** Geist Mono für Display, Buttons, Tags, Labels, Section-Marker. Geist Sans für Body und H2–H6.
5. **Ton:** Konfident-casual. Du-Ansprache überall (Ausnahme Presse). Denglisch erlaubt wo natürlich. Signatur-Interjektionen: "Ups", "Hmm", "Passt", "Let's go".
6. **Umlaute immer echt** (ö/ä/ü/ß, nie oe/ae/ue/ss). Tech-Terminologie Englisch lassen (Agent, Chat, Dashboard, Feature).
7. **Buttons:** pill-shaped (`rounded-full`), verb-first, kurz, kein "!", kein Emoji, keine Wörter wie "einfach/schnell/jetzt/hier".

---

## Hard Don'ts (für jedes AI-Modell)

- ❌ Keine Startup-Lila oder generischen Farbverläufe
- ❌ Keine dekorativen Emojis / Sparkles (✨🚀💫) — Emojis dürfen ersetzen, nie dekorieren
- ❌ Keine Ausrufezeichen in Button-Labels ("Jetzt loslegen!" → "Loslegen")
- ❌ Keine Stock-Fotos von Studierenden mit Laptops
- ❌ Kein Binnen-I, kein Gender-Gap — neutral formulieren ("Studierende", "Teammitglieder")
- ❌ Kein "Erfolgreich [Verb]" — direkter sein ("Gespeichert", "Passt")
- ❌ Keine Corporate-Floskeln ("Leider", "Bitte haben Sie Verständnis", "Möchten Sie", "Wir freuen uns, Ihnen mitteilen zu dürfen")
- ❌ Logo nicht strecken, rotieren, rekolorieren außerhalb der 11 CI-Varianten

---

## Referenz-Aesthetic (für visuelle Entscheidungen)

Wenn du zwischen Stilrichtungen entscheidest, orientiere dich an:
- **Anthropic**-Website (editorial, ruhig, Mono-Layer)
- **Resend**-Website (clean, tech, Motion-sensibel)
- **Linear**-Product-Site (präzise, modern)
- **v0-Landings** (smooth Animationen ohne Kitsch)
- **Wissenschaftsmagazin**-Aesthetic (strukturiert, textstark)

**Leitmotiv:** Connection / Signal over Noise — Linien, Knoten, roter Faden. Jedes Element muss arbeiten, nichts Dekoratives.

---

## Update-Policy

Dieses Folder wird aus `/brand/` gebaut. Bei Änderungen am Source of Truth (`/brand/DESIGN.md`, `/brand/VOICE.md`, `/brand/tokens.json`) wird dieser Folder frisch rausgezogen. **Nicht direkt hier editieren.**

---

**Kontakt / Fragen:** Luca Schweigmann (Tech Lead / CTO)
