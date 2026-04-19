# Codebase Concerns

**Analysis Date:** 2026-04-19
**Scope:** Generation AI Monorepo (apps/website, apps/tools-app, packages/*)
**Primary input for:** Phase 18 — Simplify-Pass tools-app

---

## Disabled / Stubbed Features

### Signup endpoint returns 503 (by design, pre-launch)

- File: `apps/website/app/api/auth/signup/route.ts`
- Current state: POST handler always returns `{ error: 'Anmeldung ist momentan geschlossen…' }` with status 503. Comment says "DISABLED BY DESIGN — pre-launch".
- Impact: No public signups. New users only via Supabase admin invite or restored signup form (`apps/website/components/sections/signup.tsx` may still render UI).
- Re-enable plan: documented in `.planning/BACKLOG.md` ("Signup-Reactivation"). Restore from `git show 44f7c97:apps/website/app/api/auth/signup/route.ts` AND set `user_metadata: { name, full_name }` (both keys) so mail templates show the user's name.
- Not safe to flip without explicit Luca approval (per `CLAUDE.md` Aktueller Status).

### tools-app `/api/debug-auth` route still live in production

- File: `apps/tools-app/app/api/debug-auth/route.ts`
- Returns cookie names, Supabase session info, user id/email, session expiry, host header, partial cookie header for the calling user.
- Impact: Information-disclosure surface. Not exposing tokens directly, but leaks session presence + user identity for any authenticated request and is reachable unauthenticated. Was useful during Phase 12 auth rewrite — no longer needed.
- Fix approach: delete the route in Phase 18, OR gate behind `process.env.NODE_ENV !== 'production'` if still wanted for local debugging.

### Skipped E2E tests (intent unclear)

- File: `packages/e2e-tools/tests/chat.spec.ts` lines 26-37 — two `test.skip` cases with `TODO: Full chat flow with authenticated user` and `TODO: Verify AI response appears`. Chat e2e coverage is effectively nil.
- File: `packages/e2e-tools/tests/auth.spec.ts:90` — `manual-only: session refresh verified per Playwright-MCP run in AUTH-FLOW.md` (intentional skip, documented).
- File: `packages/e2e-tools/tests/auth.spec.ts:210` — `TODO-wave2: tools-app /login serves enforced Content-Security-Policy header` — Phase 13 left this for a follow-up wave.
- Fix approach: Phase 18 should at minimum convert the chat skips into real tests or remove them with a backlog entry; the CSP-on-/login skip can be implemented now that CSP is enforced (LEARNINGS 2026-04-18 fix).

---

## Tech Debt

### Deprecated `useVoiceInput` hook still in repo

- File: `apps/tools-app/hooks/useVoiceInput.ts`
- Header comment: `DEPRECATED: Use useDeepgramVoice directly for new code`. File re-exports `useDeepgramVoice` and then keeps a full legacy Web Speech API implementation below "kept for reference" (~250 lines total).
- No call sites: only `apps/tools-app/components/chat/FloatingChat.tsx` uses `useDeepgramVoice` directly. Grep for `useVoiceInput` returns zero importers.
- Fix approach: delete `useVoiceInput.ts` entirely in Phase 18.

### Largest file is a 1180-line chat component

- File: `apps/tools-app/components/chat/FloatingChat.tsx` (1180 lines)
- Mixes: floating bubble chrome, expanded panel, mobile sheet, message list integration, voice button wiring, attachments panel, URL modal, quick actions, agent context plumbing, recommendedSlugs highlight callbacks.
- Impact: Hard to reason about, hard to test, every chat-related change touches this file (Phase 9, 11, 14, 15 all did).
- Fix approach: NOT a Phase 18 task (Phase 18 is housekeeping, not refactor). Backlog as separate phase: split into `<FloatingBubble />`, `<ExpandedDesktopChat />`, `<MobileChatSheet />` shells + a shared headless hook.

### Dev artefacts committed to repo

- Directory: `.playwright-mcp/` (5+ console log files like `console-2026-04-14T23-17-17-430Z.log`)
- Loose files at repo root: `Generation AI_CI.pdf`, `brand/tool-animations-poc.html` (POC page), various untracked brand assets per `git status`.
- Impact: Repo bloat, confusion about which files are canonical. `.playwright-mcp/` is MCP runtime output, not source.
- Fix approach: add `.playwright-mcp/` to `.gitignore` and `git rm -r --cached .playwright-mcp`. Move the PDF either into `brand/` or out of the repo. Decide on POC HTML retention.

### Duplicate auth shim layers (low risk, monitor)

- `packages/auth/` is the canonical `@genai/auth` (per Phase 12 rewrite, STATE.md line 161-189).
- Both apps still have their own `lib/supabase.ts` (`apps/tools-app/lib/supabase.ts`) and `apps/website/lib/supabase/`. Phase 13 audit confirmed these are thin shims (≤8 lines).
- Fix approach: Phase 18 should grep for direct `@supabase/ssr` imports in `apps/` (audit says zero) and confirm shims still ≤8 lines. If grown, trim back.

### Inline-`//`-comment density in FloatingChat

- File: `apps/tools-app/components/chat/FloatingChat.tsx` has 43 `//`-line comments — many are likely scaffolding/dev notes. Worth a manual sweep in Phase 18.

---

## Security Concerns

### `sb-` session cookie not HttpOnly (Finding F1, Phase 13)

- Documented in: `docs/AUTH-FLOW.md` Finding F1, also `.planning/BACKLOG.md` "Auth cookie httpOnly hardening (F1)".
- Issue: `@supabase/ssr` browser client requires JS-readable session cookie → `httpOnly: false`. XSS could steal the session.
- Mitigation in place: CSP enforced with nonce + strict-dynamic on both apps (Phase 13). No known XSS vector currently.
- Fix path: evaluate Supabase SSR v2 "tokens-only" mode OR HttpOnly-proxy-cookie pattern. Requires research + migration; not a Phase 18 task.

### CSP regression risk after layout / proxy changes

- See `LEARNINGS.md` 2026-04-18: nonce-on-response (instead of request) + static prerendering caused total site blackout (16 blocked script chunks, HTTP 200 but blank page). Fix required `request.headers.set("x-nonce", …)` BEFORE `updateSession()` AND `export const dynamic = "force-dynamic"` in root layout.
- Files at risk: `apps/website/proxy.ts`, `apps/tools-app/proxy.ts`, `apps/*/lib/csp.ts`, `apps/*/app/layout.tsx`.
- Prevention: rules in LEARNINGS.md must be respected. **Do not touch these files in Phase 18 without re-reading LEARNINGS.md.**
- Open prevention TODOs (from LEARNINGS.md):
  - [ ] Playwright smoke test as Vercel check (block prod promotion on console errors)
  - [ ] Better Stack monitor on "DOM has text + no JS errors" not just HTTP 200
  - [ ] CSP `report-to` directive + Sentry endpoint
  - [ ] Sentry alarm on frontend error rate spike

### Local env files present (not read; verify gitignored)

- Files exist: `apps/tools-app/.env.local`, `apps/website/.env.local`, `apps/tools-app/.env.sentry-build-plugin`.
- Not read here (forbidden). Verify they are gitignored before any commit that touches `.gitignore` or env scaffolding.

---

## Fragile Areas (handle with care)

### `apps/*/proxy.ts` + auth middleware

- See LEARNINGS + Session-Drop bug (STATE.md line 119-126). Two separate auth incidents within a week (Session-Drop f5f9cb7, CSP-Blackout 2026-04-18). This subsystem has the worst regression history in the repo.
- Test coverage: 10 Playwright auth e2e tests against prod (Phase 13). Trust those before shipping any change here.

### `apps/tools-app/components/chat/FloatingChat.tsx` (mobile vs desktop split)

- Mobile chat bug history: width-jump (fixed 2026-04-17), shift-enter (unverified), input auto-resize on transcription (open in BACKLOG). Mobile vs desktop layout branches are tightly intertwined.
- Safe modification: change one branch (`lg:` vs base) at a time, verify on real devices.

### `apps/tools-app/app/auth/signout/route.ts`

- POST-only by design (see STATE.md Session-Drop section). `<Link href="/auth/signout">` would prefetch a GET and destroy the session. Regression guard: e2e test verifies GET → 405. **Never add a GET handler here.**

---

## Naming Drift / Inconsistency Candidates (Phase 18 input)

These are *candidates* for the Phase 18 naming-harmonisierung wave. Not all should change — some may be intentional (stop-gates).

- **`ContentCard` vs informal "Tool Card" terminology** — component is `ContentCard` (`apps/tools-app/components/library/ContentCard.tsx`) but BACKLOG and conversations consistently say "Tool-Cards". Decide: rename component to `ToolCard` (matches user-facing language + existing `ToolIcon`/`ToolLogo` siblings) OR keep generic name if other content types are planned. **Stop-gate.**
- **Hook naming** — `useDeepgramVoice` (provider-named) vs the deprecated `useVoiceInput` (capability-named). After deleting the deprecated wrapper, consider whether the canonical hook should be `useVoiceTranscription` (provider-agnostic) or stay Deepgram-named. **Stop-gate.**
- **Logo components** — `apps/tools-app/components/ui/ToolLogo.tsx`, `apps/tools-app/components/ui/DetailHeaderLogo.tsx`, plus shared `<Logo />` from `@genai/ui` (Phase 16). Three logo abstractions; verify each still has a distinct purpose.
- **Layout components** — `GlobalLayout`, `ConditionalGlobalLayout`, `HomeLayout`, `DetailPageShell`, `AppShell` (referenced in BACKLOG). After Phase 15 split, are all of these still needed? `ConditionalGlobalLayout` smells like a transitional adapter.
- **API route style** — verify all 8 route handlers in `apps/tools-app/app/api/**/route.ts` use the same export style (`export async function GET()` vs `export const GET = async () =>`). Mentioned as Phase 18 in-scope item in CONTEXT.
- **Import paths** — relative `../../` vs `@/` and `@genai/*` aliases. Mentioned in CONTEXT.

---

## Console Logging in Production Code

- 22 files contain `console.log/warn/error/debug` (104 occurrences total in `apps/`).
- Hot files: `apps/tools-app/hooks/useVoiceInput.ts` (15 — deprecated, will be deleted), `apps/tools-app/hooks/useDeepgramVoice.ts` (11), `apps/tools-app/lib/agent.ts` (8), `apps/tools-app/components/chat/FloatingChat.tsx` (3).
- Per STATE.md Phase 11, `console.log`s were intentionally pruned with the policy "API error logs bleiben". Re-audit during Phase 18 — voice hooks are noisy and should likely lose dev-only logs or be wrapped in `if (process.env.NODE_ENV !== 'production')`.

---

## Test Coverage Gaps

- **Chat e2e effectively zero** — `packages/e2e-tools/tests/chat.spec.ts` has 1 active test (page loads) + 2 skipped. Member-mode agent loop, Gemini 3 Flash reasoning_effort fix (STATE.md), recommendedSlugs highlighting — none covered.
- **Voice input not e2e-tested** — Phase 10 left a manual browser checklist (`STATE.md` Phase 10) that was never converted to Playwright. Browser permission mocking required.
- **CSP enforcement on tools-app `/login`** — `auth.spec.ts:210` skipped with TODO-wave2 marker. Easy to implement now that Phase 13 is done.
- **Account delete verification** — BACKLOG item: `Code existiert, aber wirklich restlos gelöscht?` No test exists. File: `apps/tools-app/app/api/account/delete/route.ts`.
- **Password reset end-to-end** — STATE.md "Code da, nie verifiziert". BACKLOG entry exists.

---

## Known Bugs (open, from BACKLOG)

- **Mobile Shift+Enter in chat** — Luca thinks fixed, never verified. File: `apps/tools-app/components/chat/ChatInput.tsx`.
- **Desktop chat input does not grow on transcription** — auto-resize fires on user typing but not on programmatic text writes from voice input. Files: `apps/tools-app/components/chat/ChatInput.tsx` + `FloatingChat.tsx`.
- **Mobile chat backdrop transparency** — `bg-[var(--bg-card)]` shows page through. Should be opaque or get a backdrop. File: `apps/tools-app/components/chat/FloatingChat.tsx:406` (per BACKLOG).
- **Mobile legal footer color + visibility** — uses `text-text-muted` (dark) instead of theme-aware. Path per BACKLOG was `AppShell.tsx:340-349`; current file may be `apps/tools-app/components/layout/GlobalLayout.tsx` post Phase 15 split — verify.
- **Tool-Cards show truncated intro text instead of summary** — needs a dedicated preview field in DB content. Files: `apps/tools-app/components/library/ContentCard.tsx` + `content_items` table.

---

## Content / DB Concerns (out of code scope but tracked)

- **Umlaut audit in DB** — `content_items` table (Supabase) may still contain `ae/oe/ue/ss` instead of `ö/ä/ü/ß`. Code is fixed (Phase 14 follow-up), DB is not. Per global rule: umlauts mandatory in user-facing text.
- **Tool article quality** — too short / proprietary. Separate content workstream, not engineering.

---

## Dependencies / Infrastructure

- **`@genai/config` ignored by changesets** — by design (`.changeset/config.json`). Not a concern, just confirming.
- **`@genai/ui` README possibly stale** — `packages/ui/README.md` documents it as intentionally empty ("Status: Leer (by design)"). After Phase 16 it now exports `<Logo />` and has a CHANGELOG.md. Update README to reflect current state.
- **Vercel Hobby plan** — DECIDED 2026-04-17, no upgrade. Not a concern.

---

## Out-of-Scope for Phase 18 (do not touch)

Per Phase 18 CONTEXT "Out-of-Scope" list:

- Feature changes
- Big refactors (e.g., FloatingChat split → separate future phase)
- Breaking changes to public APIs
- Dependency upgrades
- Test rewrites (only delete dead test code)

The following items above belong to **other** future phases, not 18:
- Signup re-activation (own decision)
- HttpOnly cookie hardening (auth research phase)
- FloatingChat refactor (own phase, ~3-5 days)
- Chat e2e expansion (test phase)

---

*Concerns audit: 2026-04-19. Inputs: STATE.md, BACKLOG.md, LEARNINGS.md, Phase 18 CONTEXT.md, source grep (TODO/FIXME/HACK/console), file size scan, Phase 17 closure notes.*
