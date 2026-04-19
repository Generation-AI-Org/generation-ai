# @genai/tools-app

## 0.2.0

### Minor Changes

- [`7739de9`](https://github.com/Generation-AI-Org/generation-ai/commit/7739de945ebb750463c2dcc823c69a5dd1f67901) Thanks [@luca-schweigmann](https://github.com/luca-schweigmann)! - feat(chat): Chat überall — global + Context-aware (Phase 15).

  AppShell gesplittet in GlobalLayout (Header + FloatingChat) und HomeLayout (FilterBar + CardGrid). GlobalLayout läuft jetzt auf allen authed Routen inkl. `/settings`, `/[slug]` und Legal-Seiten; `/login` bleibt bare.

  FloatingChat kennt einen neuen `context`-Prop. Auf Desktop-Detail-Seiten (`/[slug]`, ≥1024px) wird der Chat bei Expand zu einer 400px-Sidebar rechts, der Artikel schrumpft sichtbar. Mobile bleibt Floating/Bottom-Sheet.

  Der Agent bekommt via `/api/chat`-Body (`context`-Feld) den aktuellen Tool-Kontext (slug/title/type/summary) als System-Prefix — die Antwort referenziert das gelesene Tool. User-Message wird weiterhin ohne Prefix persistiert.

  Empty-State auf `/[slug]`: "Fragen zu {ToolName}?" + 3 One-Tap-Chips ("Wie unterscheidet sich das von ähnlichen Tools?", "Für welche Use-Cases passt {ToolName}?", "Wie fange ich an?").

  Session-Persistenz: `genai-chat-session` Key überlebt Navigation (Home → Detail → Settings). Analytics-Event `chat_opened_from_route` wird bei jedem Chat-Open mit `{ route, context_slug?, mode }` gefeuert (Vercel Analytics + Sentry-Breadcrumb fallback).

- [`f852b37`](https://github.com/Generation-AI-Org/generation-ai/commit/f852b373c45aa999a4851ce2cd44ebd297089e8f) Thanks [@luca-schweigmann](https://github.com/luca-schweigmann)! - Phase 16: Brand System Foundation — Radix Colors + Geist Fonts + Logo Component + Brand Migration
  - Install `@radix-ui/colors@3.0.0` and `geist@1.7.0`; extend `packages/config/tailwind/base.css` with Radix slate/slate-dark token imports and semantic CSS custom properties (`--text`, `--surface`, `--border`, `--accent`, etc.)
  - Implement `<Logo />` component in `@genai/ui` with 11 colorway variants, `colorway="auto"` matrix resolving correct variant per context + theme, and full Vitest suite
  - Migrate `apps/website`: Inter + CascadiaCode → Geist Sans/Mono; `<Logo />` in header, footer, terminal-splash; focus-ring `var(--accent)` → `var(--text)`; VOICE.md microcopy; metadata umlauts restored
  - Migrate `apps/tools-app`: same font swap; `<Logo />` in GlobalLayout, DetailHeaderLogo, login page; neutral hex audit; VOICE.md microcopy
  - Typography upgrade: H1, buttons, and kbd globally on Geist Mono; tool card titles + footer + chat titles mono; chat body text stays Geist Sans
  - Unify website favicon + apple-touch-icon with tools-app; remove orphan logo PNG files
  - Visual regression gate: 14 routes tested, 12 intentional diffs (font swap + SVG logo), 0 unintentional regressions; post-migration baselines updated

### Patch Changes

- [`e2ddec7`](https://github.com/Generation-AI-Org/generation-ai/commit/e2ddec766891f4f5fa46ab6a7f345f74fba09258) Thanks [@luca-schweigmann](https://github.com/luca-schweigmann)! - fix(mobile): Backdrop-Blur hinter Chat-Panel — wenn Chat offen ist, wird die Page dahinter abgedunkelt + geblurrt. Kein Durchschimmern mehr, keine ungewollten Background-Scrolls. Kiwi-Bot bleibt als Toggle klickbar. Tap aufs Backdrop schließt den Chat.

- [`d0521b1`](https://github.com/Generation-AI-Org/generation-ai/commit/d0521b11c9cc40aa5c26f20a946e2e9b308ea15d) Thanks [@luca-schweigmann](https://github.com/luca-schweigmann)! - fix(mobile): Chat im expanded-Modus nimmt jetzt den vollen Screen ein statt unter Header + Filter-Bar eingeengt zu sein. Desktop bleibt 35%-Sidebar. Minimize- und X-Button funktionieren wie gehabt.

- [`d22b452`](https://github.com/Generation-AI-Org/generation-ai/commit/d22b452bd15161e1b6e64e8f4d4262c540b69dfb) Thanks [@luca-schweigmann](https://github.com/luca-schweigmann)! - fix(chat): Textarea waechst jetzt auch bei Diktat-Input (Voice) und programmatischen Updates synchron mit — nicht nur beim manuellen Tippen. Resize-Logik als DRY-Funktion extrahiert.

  fix(mobile): Legal-Footer (Impressum/Datenschutz) wird ausgeblendet waehrend der Chat mobile full-screen expanded ist, damit der Chat die volle Hoehe nutzen kann. Footer-Farbe auf theme-aware CSS-Variable umgestellt (`var(--text-muted)` / `var(--text)`) fuer konsistenten Kontrast im Dark- und Light-Mode.

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

- [#3](https://github.com/Generation-AI-Org/generation-ai/pull/3) [`24f631f`](https://github.com/Generation-AI-Org/generation-ai/commit/24f631fc27cd81b70b40aeb22e2ed50f442f8f56) Thanks [@luca-schweigmann](https://github.com/luca-schweigmann)! - Fix member-mode chat agent always returning "Ich konnte keine vollständige Antwort finden."

  Three related fixes that together restore the member/Pro chat:
  1. **Root cause: Gemini 3 thinking over-planned.** Gemini 3 Flash has
     non-disableable reasoning. Without a `reasoning_effort` hint the
     default effort makes the model keep planning more tool calls
     instead of synthesizing an answer, so `finish_reason: stop` never
     fires. Fix: send `reasoning_effort: 'low'` and switch to
     `max_completion_tokens: 8000` (OpenAI-compat param that includes
     reasoning tokens for thinking models). Also log `reasoning_tokens`
     from `completion_tokens_details` to verify the budget is healthy.
  2. **Safety net for remaining loops.** Even with low reasoning, a
     pathological prompt could still exhaust iterations. When max
     iterations is reached, issue one final completion with no tools
     to force synthesis from the context already gathered. Costs one
     extra API call only for queries that would otherwise fail.
  3. **Tool-Highlighting never fired.** `/api/chat` hardcoded
     `recommendedSlugs: []` for member mode while the agent populated
     `sources: ContentSource[]`. The frontend only highlights tools
     based on `recommendedSlugs`. Fix: derive
     `recommendedSlugs` from `sources.map(s => s.slug)`.

- [`46d0965`](https://github.com/Generation-AI-Org/generation-ai/commit/46d09650a698396dd13b583a7d3e9ac7fe501152) Thanks [@luca-schweigmann](https://github.com/luca-schweigmann)! - Performance Polish (Phase 11)
  - Removed console.logs from production code
  - Memoized MarkdownContent with React.memo + useMemo
  - Switched audio visualization from Framer Motion to CSS scaleY (GPU-accelerated)
  - Memoized ContentCard component
  - Added CSS utility classes: animate-dropdown, animate-slide-in, animate-pop-in, animate-fade-in, dropdown-glow
  - Added will-change hints for smooth animations
  - Lazy-loaded FloatingChat with next/dynamic (smaller initial bundle)
  - Added priority prop to above-the-fold images (first 6 cards)
  - Added mobile login/logout button to header (no more horizontal scroll needed)

- [`1eaac2c`](https://github.com/Generation-AI-Org/generation-ai/commit/1eaac2c214f12a7dc05510021131deca6db1662d) Thanks [@luca-schweigmann](https://github.com/luca-schweigmann)! - Fix session drop ~1s after login in tools-app.

  `/auth/signout` exposed a GET handler and two components rendered
  `<Link href="/auth/signout">`. Next.js App Router prefetches visible
  `<Link>`s → every prefetch issued a real GET /auth/signout, which
  destroyed the session cookies the moment a logout link came on
  screen. Login appeared to succeed, then the user was logged out
  before any interaction.
  - Remove the GET handler from `auth/signout/route.ts` (POST only).
  - Replace `<Link href="/auth/signout">` with `<form method="POST"
action="/auth/signout">` + button in `AppShell` and `FilterBar`.

  Canonical Supabase pattern — mutating auth state via a prefetchable
  GET link was the real root cause behind the "cookie vanishes after
  login" bug that phase-12 could not fully eliminate.

- [#1](https://github.com/Generation-AI-Org/generation-ai/pull/1) [`bfca54b`](https://github.com/Generation-AI-Org/generation-ai/commit/bfca54b7e785da5a29ecb3d5cf262c2720fcd296) Thanks [@luca-schweigmann](https://github.com/luca-schweigmann)! - UI polish pass for tools-app: mobile-parity animations, card hook, transient highlights.
  - **Cards gain a `quick_win` hook.** The DB-backed `quick_win` string
    (already fetched, previously unrendered) now shows as an accent-
    colored one-liner beneath the summary — a concrete, promptable
    "so gehts" so cards feel like invitations rather than catalog rows.
  - **Highlights are transient.** SessionStorage no longer re-applies
    `recommendedSlugs` from the last assistant message on mount, so
    highlights clear on refresh and on back-navigation from a detail
    page, matching the mental model that highlights are a fresh-
    response cue.
  - **Mobile tap feedback everywhere.** `active:scale-95` / `scale-[0.98]`
    on cards, filter buttons, theme toggle, settings gear, login/logout,
    chat send/close/paperclip, voice toggle, and the detail-page CTA.
    `group-active:*` mirrors of the existing `group-hover:*` rotations
    so the sun/moon and settings gear spin on tap, not just hover.
  - **Grey iOS tap-highlight killed** via `-webkit-tap-highlight-color:
transparent` on all interactive elements — the scale feedback
    replaces it.
  - **`prefers-reduced-motion` respected globally.** Transforms and
    animations collapse to near-zero duration; color/opacity
    transitions stay.

  All CSS-only, transform/opacity only, no new deps.

- Updated dependencies [[`6a7fca1`](https://github.com/Generation-AI-Org/generation-ai/commit/6a7fca1f1c25db5b44e2ffe9a9ed805d408840b4)]:
  - @genai/auth@0.1.0
