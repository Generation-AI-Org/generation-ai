# @genai/website

## 0.2.0

### Minor Changes

- [`f852b37`](https://github.com/Generation-AI-Org/generation-ai/commit/f852b373c45aa999a4851ce2cd44ebd297089e8f) Thanks [@luca-schweigmann](https://github.com/luca-schweigmann)! - Phase 16: Brand System Foundation — Radix Colors + Geist Fonts + Logo Component + Brand Migration
  - Install `@radix-ui/colors@3.0.0` and `geist@1.7.0`; extend `packages/config/tailwind/base.css` with Radix slate/slate-dark token imports and semantic CSS custom properties (`--text`, `--surface`, `--border`, `--accent`, etc.)
  - Implement `<Logo />` component in `@genai/ui` with 11 colorway variants, `colorway="auto"` matrix resolving correct variant per context + theme, and full Vitest suite
  - Migrate `apps/website`: Inter + CascadiaCode → Geist Sans/Mono; `<Logo />` in header, footer, terminal-splash; focus-ring `var(--accent)` → `var(--text)`; VOICE.md microcopy; metadata umlauts restored
  - Migrate `apps/tools-app`: same font swap; `<Logo />` in GlobalLayout, DetailHeaderLogo, login page; neutral hex audit; VOICE.md microcopy
  - Typography upgrade: H1, buttons, and kbd globally on Geist Mono; tool card titles + footer + chat titles mono; chat body text stays Geist Sans
  - Unify website favicon + apple-touch-icon with tools-app; remove orphan logo PNG files
  - Visual regression gate: 14 routes tested, 12 intentional diffs (font swap + SVG logo), 0 unintentional regressions; post-migration baselines updated

### Patch Changes

- [`2c980b8`](https://github.com/Generation-AI-Org/generation-ai/commit/2c980b86707ac55d5f733e3367da9355700eca98) Thanks [@luca-schweigmann](https://github.com/luca-schweigmann)! - Phase 17: Supabase auth email templates vereinheitlicht auf React Email — 6 Templates (Confirm Signup, Magic Link, Reset Password, Change Email, Reauthentication, Invite) teilen ein Layout + Design-Tokens aus brand/tokens.json, theme-adaptiv via prefers-color-scheme. Copy aus brand/VOICE.md. HTML-Export via `pnpm -F @genai/emails run email:export`.

- Updated dependencies [[`f852b37`](https://github.com/Generation-AI-Org/generation-ai/commit/f852b373c45aa999a4851ce2cd44ebd297089e8f)]:
  - @genai/ui@0.1.0

## 0.1.1

### Patch Changes

- [`6a7fca1`](https://github.com/Generation-AI-Org/generation-ai/commit/6a7fca1f1c25db5b44e2ffe9a9ed805d408840b4) Thanks [@luca-schweigmann](https://github.com/luca-schweigmann)! - Fix broken login session persistence in tools-app and consolidate
  the auth implementation across the monorepo.
  - `@genai/auth`: new canonical `updateSession` middleware helper +
    cross-domain cookie support via `NEXT_PUBLIC_COOKIE_DOMAIN`.
    The barrel is now client-safe; server helpers live on subpaths
    (`/server`, `/middleware`, `/helpers`).
  - `tools-app`: all manual `document.cookie` hacks removed. Auth now
    flows through `@genai/auth` — root cause of the session blocker
    was a custom `btoa(JSON.stringify(...))` format incompatible with
    `@supabase/ssr`'s native base64-URL/chunked encoding.
  - `website`: migrated to `@genai/auth` shims + new `proxy.ts` for
    session refresh, enabling cross-domain cookies with tools-app.

  Net change: −360 lines of broken auth code removed.
  Ref: `.planning/phases/12-auth-rewrite/PLAN.md`

- Updated dependencies [[`6a7fca1`](https://github.com/Generation-AI-Org/generation-ai/commit/6a7fca1f1c25db5b44e2ffe9a9ed805d408840b4)]:
  - @genai/auth@0.1.0
