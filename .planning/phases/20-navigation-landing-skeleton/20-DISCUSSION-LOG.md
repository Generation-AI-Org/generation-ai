# Phase 20: Navigation + Landing-Skeleton - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-20
**Phase:** 20-navigation-landing-skeleton
**Areas discussed:** Stack-Richtung, Animation-Library, UI-Primitives, Stil-Richtung, Section-Komponenten-Mapping, Brand-Extension-Timing, Ausführungs-Autonomie

---

## Animation-Library

| Option | Description | Selected |
|--------|-------------|----------|
| Motion (ehem. Framer Motion) | React-Standard, built-in prefers-reduced-motion, 21st.dev/Aceternity setzen Motion voraus | ✓ |
| GSAP | Mächtiger, schwerer, schlechterer React-Fit | |
| Nur CSS + IntersectionObserver | Leicht, aber limitiert für komplexe Scroll-Orchestrierung | |

**User-Entscheidung:** Motion. Zitat Luca: *"dann nehmen wir das"* nach Claude-Erklärung.

---

## UI-Primitives (a11y-kritisch, z.B. Dropdown)

| Option | Description | Selected |
|--------|-------------|----------|
| shadcn/ui (auf Radix UI) | Vercel-gesegnet, passt zu Radix-Colors, Copy-in-Pattern, 21st.dev-kompatibel | ✓ |
| Radix UI Primitives direkt | Unstyled, wir stylen mit Tailwind | |
| Headless UI | Ähnlich, kleiner | |
| Eigene Implementierung | Fummelig, leicht A11y-Fehler | |

**Entscheidung:** Claude's Discretion → shadcn/ui. Grund: 21st-dev-Komponenten setzen shadcn oft voraus.

---

## Stil-Richtung

| Option | Description | Selected |
|--------|-------------|----------|
| A) Tech-Corporate Clean (Linear, Vercel) | Minimal, kühl, präzise | |
| B) Playful AI-native (Lovable, Anthropic) | Warm, illustrativ, freundlich | (Würze) |
| C) Creative Technical (Raycast, Supabase, Railway) | Dark-first, neon-glows, scroll-reveals, polished | ✓ |
| D) Bold Editorial (Framer, Midjourney) | Große Typo, bildlastig, Statement | |

**User-Entscheidung:** C als Basis + B als Würze. Zusammenfassung: *"90% Raycast-Vibe, 10% Anthropic-Wärme"*.

---

## Brand-Extension (12-Step-Skalen für Akzentfarben)

| Option | Description | Selected |
|--------|-------------|----------|
| A) Upfront als Vor-Phase | 1-2h Arbeit, danach volle Palette für alle Phasen | ✓ |
| B) Ad-hoc während Phase 20 | Tropft über Zeit rein, Inkonsistenz-Risiko | |
| C) CSS color-mix() dynamisch | Wenig Arbeit, aber weniger präzise | |

**User-Entscheidung:** Option A, separate Session. Executed in commit `961dfda` 2026-04-20: `brand-{neon,blue,pink,red}-{1-12}` Skalen in `brand/tokens.json` + `packages/config/tailwind/base.css` (HSL-interpoliert, verfeinerbar via Radix Custom Palette Tool).

---

## Ausführungs-Autonomie

| Option | Description | Selected |
|--------|-------------|----------|
| User kuratiert jede Komponente aus 21st.dev | Maximale Kontrolle, hoher User-Aufwand | |
| Claude picks initial, User-Override während Execution | Balance zwischen Fortschritt + Kontrolle | ✓ |
| Claude entscheidet alles, User reviewt am Ende | Schnell, Risiko großer Umbauten | |

**User-Entscheidung:** Option 2. Zitat: *"du machst mal so wie du dir denkst und wenn ich später irgendwelche Features oder einzelne Elemente habe, dann kann ich das Ganze mit einbauen"*.

---

## Claude's Discretion (während Execution User-Override-fähig)

- Section-Komponenten-Mapping (D-07 bis D-16): initial picks aus Aceternity + MagicUI
- Scroll-Animation-Pattern: Motion's `useInView` für fade+y-translation beim Reinkommen
- Stub-Placeholder-Strategie: sichtbare "Beispiel"-Badges + realistischer Dummy-Content
- Mobile-Nav-Pattern: Full-Screen-Overlay mit staggered-reveal

## Deferred Ideas

- Finale Wording (Hero, Final-CTA, 4-Card-Texts, Zielgruppen-Split-Copy) — out-of-scope v4.0, Marketing-Pass später
- Social-Proof-Section mit Member-Count — "später" per SCOPE.md
- Sparringspartner-Logo-Assets — Luca liefert, nicht Phase-20-Scope
