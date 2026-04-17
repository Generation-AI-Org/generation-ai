# @genai/tools-app

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
