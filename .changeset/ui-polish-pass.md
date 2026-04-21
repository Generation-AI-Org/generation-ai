---
"@genai/website": patch
---

UI Polish Pass — design-system-level defaults (make-interfaces-feel-better)

- `base.css`: `text-wrap: pretty` on body, `text-wrap: balance` on h1–h4
  (no more lone-word orphan lines), `font-variant-numeric: tabular-nums`
  on `<html>` (dynamic numbers no longer cause horizontal shift).
- `button.tsx`: `transition-all` → Tailwind curated `transition` (colors +
  shadow + transform + opacity only — no layout properties animated).
- `offering-section.tsx`: `transition-all` → specific properties
  (`transition-[border-color,box-shadow]` on cards,
  `transition-[opacity,transform]` on hover chevron).

Applies globally via shared `@genai/config` Tailwind base, so tools-app
inherits the typography/numerals defaults on next build.
