# Codebase Concerns

**Analysis Date:** 2026-04-17

## Tech Debt

### Signup Feature Disabled (Critical User Impact)

**Issue:** Signup endpoint returns 503 with placeholder message. Feature disabled in response to earlier bugs but never re-enabled.

**Files:**
- `apps/website/app/api/auth/signup/route.ts` (lines 3-8)

**Impact:** New users cannot sign up. Only existing authenticated users can access tools-app. Blocks user growth completely.

**Fix approach:** 
1. Restore signup implementation from git history (check commit before disable)
2. Test end-to-end: form submission → Supabase auth.signUp() → email verification
3. Add to test suite (currently no signup tests in packages/e2e-tools)

**Notes:** Signup was disabled after Phase 4 legal review, but reason not documented. Investigate original issue before re-enabling.

---

### CSP Header Disabled (Security Gap)

**Issue:** Content-Security-Policy is in Report-Only mode on website, completely disabled on tools-app. Both apps expose `'unsafe-inline'` for scripts and styles.

**Files:**
- `apps/website/next.config.ts` (lines 7-19, 49-51): Report-Only mode only
- `apps/tools-app/next.config.ts` (lines 34-76): No CSP header at all

**Impact:** 
- XSS attacks not blocked, only logged
- Inline event handlers and data: URIs could load malicious scripts
- tools-app has zero CSP protection
- STATE.md notes "CSP geparkt" due to Edge Runtime issue

**Fix approach:**
1. Investigate original Edge Runtime incompatibility (mentioned in STATE.md as blocker)
2. Move from Report-Only to enforced CSP on website once tested
3. Implement CSP on tools-app with same directives as website
4. Test with Playwright to ensure no breakage

**Current state:** Known issue, deprioritized but still open.

---

### Three Parallel Auth Implementations (Consolidation Incomplete)

**Issue:** Phase 12 rewrite consolidated auth to `@genai/auth`, but consolidation may have residual patterns or unused files in apps.

**Files:**
- `packages/auth/src/` (canonical implementation post-Phase-12)
- `apps/tools-app/lib/auth.ts` (240 lines, legacy patterns may remain)
- `apps/website/lib/supabase/` (client.ts, server.ts — may have duplicated logic)

**Impact:** 
- Code duplication increases maintenance burden
- Multiple implementations can drift
- Harder to onboard new developers

**Fix approach:**
1. Audit `apps/tools-app/lib/auth.ts` for any manual cookie handling (should be gone)
2. Check `apps/website/lib/supabase/` for duplication with `@genai/auth` functions
3. If found, replace with imports from canonical `@genai/auth` package
4. Run build + tests to verify no regressions

**Notes:** Phase 12 is deployed, but STATE.md notes "evtl. Reste" — thorough cleanup still needed.

---

### Chat Input Auto-Resize Not Triggering on Dictation (UX Bug)

**Issue:** When user types normally and presses Enter, textarea auto-expands correctly. When long text arrives via voice transcription (programmatic `setMessage()`), textarea remains small/narrow, making text hard to read/edit.

**Files:**
- `apps/tools-app/components/chat/FloatingChat.tsx` (lines 66-76: transcript update logic)
- `apps/tools-app/components/chat/ChatInput.tsx` (82-84: textarea with `disabled` state, likely missing resize handler)

**Impact:** Poor UX for voice input users. Text appears cramped, editing becomes awkward.

**Fix approach:**
1. Add `useEffect` hook that triggers textarea resize when `message` length changes programmatically
2. Call `textareaRef.current?.dispatchEvent(new Event('input'))` after `setMessage()` to trigger resize
3. Or manually set `textareaRef.current.style.height = '...'` based on `scrollHeight`
4. Test on mobile and desktop with both voice and typed input

**Backlog item:** Listed in `.planning/BACKLOG.md` under "🐛 Bugs tools-app".

---

### Tool-Highlighting Returns String Instead of Array (AI Output Bug)

**Issue:** Knowledge base tools tool recommends a list of tools, but LLM returns `"string"` instead of `Tool[]`. Highlight mechanism broken.

**Files:**
- `apps/tools-app/lib/agent.ts` (tool parsing logic, likely in parsing recommended slugs)
- `apps/tools-app/components/chat/MessageList.tsx` or `FloatingChat.tsx` (consumption of `recommendedSlugs`)

**Impact:** Tool highlighting doesn't work. UI shows "string" instead of highlighted tool cards in the tool library.

**Fix approach:**
1. Check agent response parsing for tool recommendations
2. Validate LLM output structure matches expected `recommendedSlugs: string[]`
3. Add type guard or validation before passing to highlight handler
4. Add test case to `apps/tools-app/__tests__/api/chat.test.ts` for tool recommendation parsing

**Regression check needed:** This worked before, so investigate what changed in recent commits.

---

### Mobile Chat Width Jumps to ~80% When Opened (Layout Bug)

**Issue:** On mobile, when user opens floating chat, layout jumps/shifts to ~80% width instead of full viewport width. Rants are cut off.

**Files:**
- `apps/tools-app/components/chat/FloatingChat.tsx` (likely styling/layout logic, ~1113 lines)
- CSS for expanded state (check for `isExpanded` class/style application)

**Impact:** Mobile UX is broken — text wraps strangely, hard to read responses.

**Fix approach:**
1. Check `isExpanded && isOpen` state and corresponding CSS
2. Ensure width: 100vw or max-width: 100% when chat is expanded
3. Check for any padding/margin/border that might reduce available space
4. Test on actual mobile device (not just devtools)

**Backlog item:** Listed in `.planning/BACKLOG.md` under "🐛 Bugs tools-app".

---

## Known Bugs

### Session-Drop Bug (FIXED in Phase 12, Verified)

**Symptoms:** User logs in, session destroyed ~1s later automatically.

**Root Cause:** `apps/tools-app/app/auth/signout/route.ts` had GET handler. Next.js `<Link>` components in `AppShell` + `FilterBar` auto-prefetch on hover/render, triggering GET requests and calling `signOut()` before user had time to navigate.

**Files:** `apps/tools-app/app/auth/signout/route.ts`

**Trigger:** Page load → AppShell renders → next/link components prefetch → GET /auth/signout called → session destroyed

**Fix:** Changed to POST-only route (commit f5f9cb7). Links replaced with `<form method="POST">`. Verified via Playwright on production.

**Status:** ✓ CLOSED. Deployed 2026-04-17. Verified login persists across page reloads.

---

### Password Reset Never End-to-End Tested (Potential Bug Risk)

**Issue:** Password reset code exists in codebase but has never been tested against production Supabase.

**Files:**
- `apps/tools-app/app/auth/set-password/page.tsx` (139 lines)
- Supabase Magic Link → Reset Link handling (server-side logic not fully verified)

**Impact:** 
- Users trying to reset password may encounter broken flow
- Email templates may not be customized (Luca noted "heller Hintergrund" instead of system colors)
- Reset token may expire silently without user feedback

**Workaround:** Users can only use Magic Link signup currently. No self-serve password reset tested.

**Fix approach:**
1. Plan GSD Phase for auth flow audit (mentioned in STATE.md as "Stufe 2")
2. Create Playwright test in `packages/e2e-tools/tests/auth.spec.ts` that:
   - Signs up user with Magic Link
   - Sets password via /auth/set-password endpoint
   - Logs out, logs in with new password
3. Customize Supabase email templates in Dashboard → Auth → Email Templates
4. Test on actual email client (Gmail, Outlook) to verify styling

**Backlog item:** Listed in `.planning/BACKLOG.md` under "🔐 Auth — Passwort-Flow vervollständigen".

---

## Security Considerations

### Vercel Hobby Plan Non-Commercial Limitation (Legal/Compliance Risk)

**Risk:** Deployment target is Vercel Hobby (free tier). ToS states "non-commercial personal use only". Generation AI is a community platform for students — arguably commercial or at minimum in gray zone.

**Files:** No code files, but affects entire deployment at:
- https://generation-ai.org
- https://tools.generation-ai.org

**Current mitigation:** DPA signed with Supabase (requested 2026-04-15), Resend DPA auto-activated. Vercel DPA requires Pro plan ($20/mo).

**Recommendations:**
1. Upgrade Vercel to Pro plan to eliminate ToS violation risk
2. Get proper DPA from Vercel (available in Pro tier)
3. Document decision: cost ($20/mo) vs legal risk (ToS breach, potential takedown)
4. Decision pending from Luca (see BACKLOG.md: "Vercel Pro upgraden?")

**Business impact:** If Vercel discovers commercial use on Hobby tier, they could suspend project.

---

### Missing OAuth Implementations (Security Best Practice)

**Risk:** Only Magic Link auth implemented. No OAuth (Google, Apple, GitHub). Users have no choice but email-based auth, increasing phishing/account takeover risk.

**Files:** No OAuth implementations exist. Starter code needed:
- `apps/tools-app/app/auth/oauth/callback/route.ts` (doesn't exist)
- Supabase provider configuration (not set up)

**Impact:** 
- High friction for new users (email + verification required)
- No passwordless option (Magic Link only)
- Blocks "Circle-Member-Status" feature (needs Circle OAuth integration)

**Recommendations:**
1. Implement Google OAuth (biggest UX win, ~1 day)
2. Implement Apple OAuth (important for iOS users, ~0.5 days)
3. GitHub OAuth optional (lower priority)
4. Add Circle OAuth for member detection (requires Circle API key)

**Backlog item:** Listed in `.planning/BACKLOG.md` under "🔐 Auth — OAuth-Login (Circle-Integration)".

---

### Console.log Statements in Production Code (Information Leakage)

**Issue:** Timing logs left in agent and LLM code. While not sensitive, they add noise and could leak performance metrics to attentive users reading console.

**Files:**
- `apps/tools-app/lib/agent.ts` (lines 36, 45, 106, 129, 132, 140, 158, 189, 195): `console.log("[Timing]"...)` statements
- Error logs are acceptable: `apps/tools-app/lib/llm.ts`, `lib/exa.ts`, `lib/content.ts`

**Impact:** Minor. Timing logs useful for development but shouldn't ship to production.

**Fix approach:**
1. Wrap timing logs in `if (process.env.NODE_ENV === 'development')` guard
2. Or move to structured logging system (Sentry already integrated)
3. Keep error logs (console.error) — those are important for debugging production issues

**Notes:** Phase 11 "Performance Polish" removed some console.logs but these were missed. Low priority.

---

## Performance Bottlenecks

### FloatingChat Component Size (1113 Lines, Complex State)

**Problem:** `apps/tools-app/components/chat/FloatingChat.tsx` is 1113 lines with 20+ useState hooks, multiple effects, and nested conditional rendering. Component re-renders often, potential for memory leaks.

**Files:** `apps/tools-app/components/chat/FloatingChat.tsx`

**Cause:** 
- Handles chat UI, voice input, URL modal, attachments, message history all in one component
- Multiple interdependent state variables (messages, transcript, recordings, etc.)
- No obvious memo/useCallback boundaries

**Improvement path:**
1. Extract sub-components: `<UrlInputModal>` (already separate), `<VoiceInputSection>`, `<MessageEditor>`
2. Use `useCallback` for event handlers to prevent child re-renders
3. Use `useMemo` for derived state (e.g., `isLoading && !value.trim()`)
4. Consider Context API for shared state (transcript, audioLevels)
5. Profile with React DevTools to find unnecessary re-renders

**Priority:** Medium. Works but harder to maintain. Profile before optimizing.

---

### KB Tools Limited Cache (Open-Ended Queries)

**Issue:** `kbList()` and `kbSearch()` functions cap results at 50 and 20 respectively for DoS mitigation, but no caching. Repeated queries hit database each time.

**Files:**
- `apps/tools-app/lib/kb-tools.ts` (lines 41-62, 86-96)

**Impact:** 
- Cold starts slow (full table scans)
- Repeated category/type listings hit DB
- No Upstash Redis integration for query caching

**Improvement path:**
1. Cache `kbExplore()` results (static structure, cache for 1 hour)
2. Cache `kbList()` with category/type filters (cache for 10 minutes)
3. Cache `kbSearch()` results per query hash (cache for 5 minutes)
4. Use `@upstash/redis` (already in dependencies)
5. Invalidate caches on content publish

**Priority:** Low-medium. DB is fast, but caching would reduce latency spikes.

---

## Fragile Areas

### Voice Input Hook (useDeepgramVoice) — 236 Lines, WebSocket Logic

**Files:** `apps/tools-app/hooks/useDeepgramVoice.ts`

**Why fragile:**
- Manages WebSocket connection lifecycle (open → stream → close)
- Browser AudioContext can be denied/suspended on some devices
- Token endpoint dependency (`/api/voice/token`) must be working
- Audio format negotiation (WebM vs WAV) browser-dependent

**Safe modification:**
1. Never change WebSocket message format without testing on actual browsers
2. Always test audio capture on: Chrome, Safari, Firefox (desktop) + iOS Safari, Android Chrome
3. Add feature detection for `MediaRecorder` + `AudioContext`
4. Test with poor network: simulate latency/packet loss

**Test coverage:** No dedicated tests in test suite. Only E2E testing available.

**Recommendation:** Create unit tests in `apps/tools-app/__tests__/hooks/useDeepgramVoice.test.ts` with mocked WebSocket.

---

### Agent Tool-Calling Loop (Complex Logic, Limited Testing)

**Files:**
- `apps/tools-app/lib/agent.ts` (201 lines)
- `apps/tools-app/__tests__/api/chat.test.ts` (142 lines, but only 4 agent tests)

**Why fragile:**
- Max iterations: 5 (line ~195). If exceeded, response gets truncated silently.
- Tool execution error handling: if tool fails, agent continues (may hide bugs)
- LLM response parsing: if format unexpected, agent may fail or loop
- No timeout protection (could hang on slow API calls)

**Safe modification:**
1. Add detailed logging for each iteration (already has [Timing] logs, expand them)
2. Add integration tests for each tool: kb_search, kb_read, web_search, kb_list
3. Test error cases: invalid tool call, missing parameters, rate limits
4. Add timeout wrapper around LLM call

**Test coverage:** Minimal. Only 4 agent tests, all happy path.

**Recommendation:** Expand `__tests__/api/chat.test.ts` to cover:
- Tool recommendation parsing (currently broken)
- Multi-iteration loops
- Error recovery

---

### Large Monolith next.config.ts Files (Hard to Evolve)

**Files:**
- `apps/tools-app/next.config.ts` (116 lines with Sentry + headers)
- `apps/website/next.config.ts` (72 lines with CSP)

**Why fragile:**
- Config and build logic mixed together
- Sentry config embedded (tools-app)
- CSP directives as string (website) — easy to break syntax
- No separation of concerns

**Safe modification:**
1. Extract CSP directives into separate config file (`lib/csp-config.ts`)
2. Extract headers into `lib/security-headers.ts`
3. Extract Sentry config into `lib/sentry-config.ts`
4. Import and compose in next.config.ts

**Priority:** Low. Works fine, but refactoring would improve readability.

---

## Scaling Limits

### Upstash Redis Rate Limiting (Single Instance, No Failover)

**Current capacity:** 10,000 requests/day free tier (or whatever plan is active). No information on current usage or plan tier.

**Limit:** 
- Free tier caps daily requests
- Single Redis instance (no replication)
- If Redis down, rate limiter bypasses (see lib/ratelimit.ts line 77: `console.warn('[RateLimit] Redis error, bypassing')`)

**Scaling path:**
1. Upgrade Upstash plan based on actual usage metrics
2. Monitor Redis connection errors (already logged)
3. Consider fallback rate limiting strategy (in-memory backup)

**Files:**
- `apps/tools-app/lib/ratelimit.ts` (77-line wrapper)

**Related:** Better Stack uptime monitoring can track Redis availability.

---

### Supabase Free Tier Limits (Database, Auth, Realtime)

**Current plan:** Free tier (presumed). No information on storage, auth, or realtime limits.

**Limits vary by service:**
- **Auth:** Free tier caps users/projects (check Supabase dashboard)
- **Database:** 500 MB storage free
- **Realtime:** Connections may be limited

**Scaling path:**
1. Check current usage in Supabase dashboard (Auth → Stats, Database → Storage)
2. Monitor for approaching limits
3. Upgrade Pro plan ($25/mo) if approaching caps
4. Consider dedicated Postgres if tables grow large

**Files:** No code issue, infrastructure decision.

---

### Vercel Build/Deployment Timeouts

**Current:** Vercel Hobby/Pro timeout is 60 seconds. No indication of current build times.

**Risk:** Large features (e.g., bigger AI models, more dependencies) could exceed timeout.

**Scaling path:**
1. Monitor build logs in Vercel dashboard
2. Use `pnpm` caching (already set up via turbo.json)
3. If builds exceed 45s, investigate slow dependencies with `npm ls --all`
4. Consider monorepo splitting if one app becomes too large

**Related:** Vercel Pro plan increases timeout to 15 minutes.

---

## Dependencies at Risk

### @anthropic-ai/sdk (^0.87.0 — Pinned, May Become Outdated)

**Risk:** Caret allows minor/patch updates, but Anthropic SDK has breaking changes between majors. Currently v0.x (pre-1.0).

**Files:**
- `apps/tools-app/package.json` (line 16): `"@anthropic-ai/sdk": "^0.87.0"`

**Impact:** Future upgrade to v1.0+ may require code changes (breaking changes likely at major version).

**Migration plan:**
1. Monitor Anthropic SDK releases for v1.0 announcements
2. When released, create test branch and upgrade
3. Update code to new API if necessary
4. Test chat and tool-calling flows
5. Deploy and verify on production

**Current status:** Works fine, just future-proofing.

---

### Deepgram Voice API (No Fallback, Hard Dependency)

**Risk:** Deepgram API key required for voice input. If Deepgram outage occurs, voice feature completely broken.

**Files:**
- `apps/tools-app/hooks/useDeepgramVoice.ts`
- `apps/tools-app/app/api/voice/token/route.ts` (returns 503 if key missing)
- `apps/tools-app/app/api/voice/transcribe/route.ts` (returns 503 if key missing)

**Impact:** Voice input doesn't degrade gracefully. UI shows error but doesn't suggest typing alternative.

**Improvement path:**
1. Add error boundary UI that says "Voice unavailable, please type instead"
2. Make voice button visually indicate "optional" feature
3. Consider multi-provider strategy (Deepgram + fallback)

**Current status:** Low priority. Voice is new feature, users won't expect it.

---

## Missing Critical Features

### Password Reset UI for Users (Self-Service Gap)

**Problem:** Users cannot self-serve reset their password. Only Magic Link signup available. If user forgets password, no recovery path.

**What's missing:**
- "Forgot password?" link on login page
- Password reset form UI
- Password change UI in settings

**Code exists but untested:**
- `apps/tools-app/app/auth/set-password/page.tsx` (139 lines)

**Blocks:** .planning/BACKLOG.md: "Passwort-Setzen-UI für User".

**Fix approach:** Create GSD Phase for auth flow audit (Stufe 2 in STATE.md).

---

### Circle Member Status Detection (Pro Mode Unlock)

**Problem:** Tools-app can't detect if user is a Circle member. Can't auto-unlock Pro mode for paying community members.

**What's missing:**
- Circle API integration to check member status by email
- `profiles.is_circle_member` column to cache membership
- Middleware to set Pro mode based on membership

**Impact:** Community members pay separately for Circle + can't access Pro features in tools-app. Lost revenue + UX friction.

**Blocks:** Several backlog items depend on this.

**Fix approach:** Requires Circle API key + documentation. Not started yet.

---

### Supabase Email Template Customization

**Problem:** Default Supabase email templates use light background. Luca wants system colors (dark mode in dark mode email clients).

**Files:** Not in codebase. Requires Supabase Dashboard → Auth → Email Templates.

**Impact:** Usability. Users in dark mode email clients see jarring white background in reset/confirm emails.

**Fix approach:** Manual: Go to Supabase Dashboard, customize templates with CSS variables or dark mode meta tag.

---

## Test Coverage Gaps

### Chat API Route (4 Tests, Missing Edge Cases)

**Files:**
- `apps/tools-app/__tests__/api/chat.test.ts` (142 lines, 4 tests)

**What's tested:**
- Basic chat message (happy path)
- Error handling (generic)
- Some edge cases

**What's NOT tested:**
- Tool recommendations parsing (currently broken)
- Multi-turn conversations
- Rate limit exceeded (should return 429)
- Invalid session (should return 401)
- WebSocket stream handling (if applicable)
- Timeout on slow LLM

**Risk:** Can't catch regressions in tool calling or error handling.

**Recommendation:** Add tests for:
1. Tool recommendation structure validation
2. Multi-iteration agent loops
3. Rate limit scenarios
4. Auth failures
5. Network timeouts

---

### Auth Flow End-to-End (2 E2E Tests, Missing Scenarios)

**Files:**
- `packages/e2e-tools/tests/auth.spec.ts`

**What's tested:**
- Login (Magic Link) — but marked TODO "Full login flow with test credentials"
- Signout (implicit in other tests)

**What's NOT tested:**
- Password reset (code exists, never tested on prod)
- Session refresh
- Cross-domain cookie persistence (website → tools-app)
- Token expiry and refresh
- Account deletion

**Risk:** Session-drop bug was found in production (fixed). Without comprehensive E2E tests, similar bugs can slip through.

**Recommendation:** Expand auth test suite:
1. Complete Magic Link login test
2. Add password reset test (sign up → reset → login with new password)
3. Add session persistence test (login → reload → check still authenticated)
4. Add logout test
5. Add cross-domain test (login on website, verify token works on tools-app)

---

### Component Unit Tests (Minimal Coverage)

**Files:**
- `apps/website/__tests__/components/Button.test.tsx` (basic button tests)
- `apps/tools-app/__tests__/components/` — empty

**What's tested:**
- Website Button component (basic)

**What's NOT tested:**
- FloatingChat (1113 lines, zero tests)
- MessageList
- VoiceInputButton
- ChatInput
- ToolIcon
- Any complex component logic

**Risk:** UI bugs found in production (mobile width, input resize, tool highlighting). Without unit tests, regressions appear only when manually testing.

**Recommendation:** Add component tests:
1. `FloatingChat.test.tsx`: Test message loading, input, voice toggle
2. `VoiceInputButton.test.tsx`: Test enabled/disabled state, error display
3. `ChatInput.test.tsx`: Test textarea resize on input
4. `MessageList.test.tsx`: Test markdown rendering, tool highlighting

---

## Misc Observations

### Voice Token Endpoint Returns 503 When Unconfigured

**Files:** `apps/tools-app/app/api/voice/token/route.ts` (lines 1-5)

**Behavior:** If `DEEPGRAM_API_KEY` missing, returns 503 "Voice service not configured".

**Why it matters:** On Vercel, if secret isn't set in env vars, users get 503 every time they click voice button. No graceful degradation.

**Improvement:** Return 403 "Forbidden" instead of 503, or add client-side feature detection to disable button entirely.

---

### Defuddle Endpoint (Firecrawl) Also Returns 503 When Unconfigured

**Files:** `apps/tools-app/app/api/defuddle/route.ts` (lines 6-10)

**Behavior:** Same as voice: 503 if `FIRECRAWL_API_KEY` missing.

**Note:** Likely unused in current phase, but same pattern as voice endpoint.

---

### Next.js 16 App Router Still Marked as "Not the Next.js You Know"

**Files:** `apps/website/AGENTS.md`, `apps/tools-app/CLAUDE.md` — reference docs about Next.js changes

**Note:** These are guidance for future Claude instances. Ensure they stay updated with actual Next.js versions.

---

*Concerns audit: 2026-04-17*
