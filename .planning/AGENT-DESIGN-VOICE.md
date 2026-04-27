# Agent Design And Voice

Load this file for UI, brand, website page, tools-app, or public copy work.

## Context

- Website pages: read `apps/website/AGENTS.md`.
- Tools app: read `apps/tools-app/AGENTS.md`.
- Brand/design: read `brand/Generation AI Design System/README.md`, `DESIGN.md`, `VOICE.md`, and `packages/config/tailwind/base.css`.

## Design Defaults

Use tokens and shared components instead of ad hoc styling.

- Default theme: dark.
- Dark accent: neon `#CEFF32`.
- Light accent: red `#F5133B`.
- Header band: blue in dark, pink in light.
- Hero H1 token: `--fs-display`; do not invent inline hero clamps.
- Buttons: `rounded-full`.
- Cards: `rounded-2xl`.
- Canonical card hover: `hover:scale-[1.015]`, accent glow, accent border, `duration-300`, `ease-[var(--ease-out)]`.
- Avoid inline `onMouseEnter` / `onMouseLeave` for visual hover states.

Website subpages must follow `apps/website/AGENTS.md`: `LabeledNodes` background, `max-w-4xl`, `--fs-display`, client wrapper with `MotionConfig nonce={nonce}`, and `SectionTransition` between content sections.

Header/scroll behavior is a brand consistency requirement:

- Website and Tools-App use the shared `MarketingHeader` geometry from `@genai/ui`.
- Header is fixed, content begins below it (`pt-20` for standard pages), and the document owns vertical scrolling.
- Do not wrap the header in splash/page-transition containers or any animated parent that changes transform/opacity.
- Do not introduce page-level `h-screen overflow-hidden` plus inner `overflow-y-auto` containers for normal website/tools pages.
- Extra app-specific actions such as Tools search must live in reserved header slots so Logo/Nav/Theme/CTA positions stay identical.

## Voice

User-facing product copy is German with real umlauts: ö, ä, ü, ß. Never use oe/ae/ue/ss substitutions.

- Use `Du`.
- Keep code identifiers English.
- Confident-casual tone.
- Short, direct copy.
- No corporate filler such as "Leider", "bitte haben Sie Verständnis", or "erfolgreich gespeichert".
- No emoji in UI/buttons/labels unless the brand docs explicitly allow it for the context.
