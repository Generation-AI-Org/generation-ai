# @genai/ui

## 0.1.0

### Minor Changes

- [`f852b37`](https://github.com/Generation-AI-Org/generation-ai/commit/f852b373c45aa999a4851ce2cd44ebd297089e8f) Thanks [@luca-schweigmann](https://github.com/luca-schweigmann)! - Phase 16: Brand System Foundation — Radix Colors + Geist Fonts + Logo Component + Brand Migration
  - Install `@radix-ui/colors@3.0.0` and `geist@1.7.0`; extend `packages/config/tailwind/base.css` with Radix slate/slate-dark token imports and semantic CSS custom properties (`--text`, `--surface`, `--border`, `--accent`, etc.)
  - Implement `<Logo />` component in `@genai/ui` with 11 colorway variants, `colorway="auto"` matrix resolving correct variant per context + theme, and full Vitest suite
  - Migrate `apps/website`: Inter + CascadiaCode → Geist Sans/Mono; `<Logo />` in header, footer, terminal-splash; focus-ring `var(--accent)` → `var(--text)`; VOICE.md microcopy; metadata umlauts restored
  - Migrate `apps/tools-app`: same font swap; `<Logo />` in GlobalLayout, DetailHeaderLogo, login page; neutral hex audit; VOICE.md microcopy
  - Typography upgrade: H1, buttons, and kbd globally on Geist Mono; tool card titles + footer + chat titles mono; chat body text stays Geist Sans
  - Unify website favicon + apple-touch-icon with tools-app; remove orphan logo PNG files
  - Visual regression gate: 14 routes tested, 12 intentional diffs (font swap + SVG logo), 0 unintentional regressions; post-migration baselines updated
