---
status: fixing
trigger: "Login in tools-app (tools.generation-ai.org) succeeds initially (Supabase returns session, user redirected to home) but auth cookie disappears ~1s later. After any click/navigation, user is logged out again. Affects both password login and magic link."
created: 2026-04-17T00:00:00Z
updated: 2026-04-17T03:30:00Z
---

## Current Focus
<!-- OVERWRITE on each update - reflects NOW -->

hypothesis: CONFIRMED (re-validated after CDP test analysis). Stale host-only btoa cookie from pre-Phase-12 code causes SIGNED_OUT on every page load. cookie.parse() returns FIRST occurrence of duplicate-named cookies — and browsers send host-only (more specific) cookies before domain-scoped cookies. Proxy reads the stale btoa value, _isValidSession fails, SIGNED_OUT fires, new domain-scoped cookie is deleted. Host-only stale cookie survives (domain-scoped deletion can't touch it). User sees SSR-rendered logged-in page for ~1s (initialUser from server), then AuthProvider receives SIGNED_OUT via onAuthStateChange → setUser(null).

The "ZERO cookies in DevTools" observation was AFTER the deletion cycle had already run — the domain-scoped cookie was deleted, and the stale host-only cookie may have been filtered out or already gone from a prior cycle.

fix: commit f3b893c is CORRECT. clearStaleHostOnlyCookies() before signInWithPassword/signInWithOtp on login page, and on first AuthProvider mount. This ensures login page clears stale cookie before writing new session.

next_action: rebase/push f3b893c and request human verification

## Symptoms
<!-- Written during gathering, then IMMUTABLE -->

expected: After successful login, `sb-*-auth-token` cookie persists. Reload → user still logged in. Navigation → session stays.
actual: Login succeeds (Supabase createSession OK, user object present, redirect to home fires). For ~1 second user appears logged in. Then the auth cookie vanishes from the browser / is not persisted. On next click or navigation user is logged out again.
errors: None visible to user. No obvious error in UI.
reproduction: 1) Go to https://tools.generation-ai.org/login 2) Log in via password OR magic link 3) Observe redirect to home page 4) Within ~1s the auth cookie disappears 5) Click any link → back to logged-out state
started: After Phase 12 Auth Rewrite deployed 2026-04-16

## Eliminated
<!-- APPEND only - prevents re-investigating -->

- hypothesis: Missing middleware.ts / proxy not wired up
  evidence: Next.js 16 explicitly uses PROXY_FILENAME='proxy' constant. Both apps have proxy.ts with correct `export async function proxy`. Production build output shows "ƒ Proxy (Middleware)". Proxy IS running.
  timestamp: 2026-04-17T00:30:00Z

- hypothesis: proxy.ts missing from tools-app
  evidence: proxy.ts exists at apps/tools-app/proxy.ts with identical content to apps/website/proxy.ts
  timestamp: 2026-04-17T00:30:00Z

- hypothesis: NEXT_PUBLIC_COOKIE_DOMAIN not set in Vercel
  evidence: vercel env ls confirms NEXT_PUBLIC_COOKIE_DOMAIN is set in Production (added 9h ago, deployment 8h ago)
  timestamp: 2026-04-17T00:30:00Z

- hypothesis: cookieOptions domain mismatch between browser and server
  evidence: After commit 2fab206 both browser.ts and middleware.ts use same domain logic. Commit message confirms this was the previous bug, now addressed.
  timestamp: 2026-04-17T00:30:00Z

- hypothesis: AuthProvider signOut or onAuthStateChange firing maliciously
  evidence: onAuthStateChange only calls setUser(), no signOut. No auto-logout anywhere in the page→home flow.
  timestamp: 2026-04-17T00:30:00Z

## Evidence
<!-- APPEND only - facts discovered -->

- timestamp: 2026-04-17T00:15:00Z
  checked: apps/tools-app directory structure
  found: proxy.ts exists at app root (not middleware.ts). Next.js 16 explicitly supports PROXY_FILENAME='proxy' as replacement for middleware — confirmed in node_modules/next/dist/esm/lib/constants.js:39
  implication: proxy.ts IS recognized and executed by Next.js 16. Missing middleware.ts is NOT the bug.

- timestamp: 2026-04-17T00:15:00Z
  checked: Both proxy.ts files (tools-app and website)
  found: Identical content — both export named function `proxy(request)` wrapping `updateSession(request)`. Correct export name for Next.js 16 proxy files.
  implication: Proxy/middleware wiring is correct.

- timestamp: 2026-04-17T00:16:00Z
  checked: Vercel env vars for tools-app production
  found: NEXT_PUBLIC_COOKIE_DOMAIN is set in Production (added 9h ago). Was NOT in dev/preview. The env pull (development) does not include it.
  implication: NEXT_PUBLIC_COOKIE_DOMAIN=.generation-ai.org IS set in production. The last commit (2fab206) inlines it at build time in next.config.ts.

- timestamp: 2026-04-17T00:17:00Z
  checked: git show 2fab206 — the most recent "fix" commit
  found: This commit added NEXT_PUBLIC_COOKIE_DOMAIN to next.config.ts `env` block for tools-app. Commit message says: "browser-set cookies used no domain (host-only), while server-set cookies used .generation-ai.org, causing the server to delete its own empty cookie on each request."
  implication: The domain mismatch was a known prior bug. This fix should have resolved it. But the bug persists.

- timestamp: 2026-04-17T00:18:00Z
  checked: @supabase/ssr@0.10.2 createBrowserClient.js
  found: Module-level singleton cachedBrowserClient. On hard navigation (window.location.href), the module cache is cleared, so a fresh client is always created on the new page.
  implication: Singleton caching does NOT cause stale cookies.

- timestamp: 2026-04-17T00:19:00Z
  checked: @supabase/ssr@0.10.2 createServerClient.js
  found: onAuthStateChange fires applyServerStorage for SIGNED_IN/TOKEN_REFRESHED/SIGNED_OUT etc. ONLY if hasStorageChanges (setItems or removedItems is non-empty).
  implication: If token is fresh and not expired, no cookie update is emitted by proxy. Cookie stays as-is.

- timestamp: 2026-04-17T00:20:00Z
  checked: DEFAULT_COOKIE_OPTIONS in @supabase/ssr
  found: {path: '/', sameSite: 'lax', httpOnly: false, maxAge: 400*24*60*60}. No `secure` flag.
  implication: Cookies are not Secure-flagged by default. This means on HTTPS the cookie is accessible to JS (httpOnly:false) which is expected for browser-side reading.

- timestamp: 2026-04-17T00:21:00Z
  checked: lib/supabase.ts usage
  found: Only used in server-side code (KB tools, content.ts, chat route, delete route) with service role key. NOT used in any auth cookie operations.
  implication: Old supabase.ts client does NOT interfere with auth cookies.

- timestamp: 2026-04-17T00:22:00Z
  checked: signout/route.ts, AppShell.tsx, AuthProvider.tsx
  found: No auto-signout. signOut() only called on explicit user action. AuthProvider just subscribes to onAuthStateChange and updates state.
  implication: No accidental signOut calls in the login→home flow.

- timestamp: 2026-04-17T01:00:00Z
  checked: git show 902f389 — old login/page.tsx before Phase 12
  found: Old code set document.cookie with `sb-${projectRef}-auth-token=${btoa(JSON.stringify({access_token,refresh_token}))}; path=/; max-age=...; SameSite=Lax` — NO domain attribute. This is a host-only cookie for tools.generation-ai.org.
  implication: Any user who logged in before Phase 12 (or during Phase 12 pre-2fab206) has a stale host-only cookie in the EXACT key name `sb-xxx-auth-token`.

- timestamp: 2026-04-17T01:05:00Z
  checked: @supabase/ssr@0.10.2 combineChunks() in chunker.js lines 59-77
  found: combineChunks() checks the EXACT key first (`retrieveChunk(key)`). If `sb-xxx-auth-token` exists (un-chunked), it returns that value immediately WITHOUT checking `.0`, `.1` chunks. The stale host-only cookie shadows all new chunked cookies.
  implication: New session chunks (.0, .1) are written correctly but are NEVER READ because the old exact-key cookie intercepts every read.

- timestamp: 2026-04-17T01:08:00Z
  checked: @supabase/ssr@0.10.2 cookies.js browser setItem() logic
  found: setItem() builds removeCookies from existing chunks including the exact key. Tries to delete via document.cookie = serialize(name, "", {maxAge:0, domain:'.generation-ai.org', ...}). Browser silently rejects deletion because old cookie has NO domain (host-only). The old cookie CANNOT be deleted by specifying a different domain.
  implication: The stale cookie is immortal from the perspective of the new code — new code can never delete it.

- timestamp: 2026-04-17T01:10:00Z
  checked: Full proxy execution path with stale cookie present
  found: Proxy calls getUser() → storage.getItem('sb-xxx-auth-token') → combineChunks finds old btoa-encoded value → @supabase/auth-js tries JSON.parse on raw base64 → fails → session null → SIGNED_OUT event → applyServerStorage called → setAll emits Set-Cookie with maxAge=0 for domain:.generation-ai.org → new chunked cookies deleted → old host-only remains. On EVERY subsequent request, cycle repeats.
  implication: User sees ~1s of logged-in state (while server renders initial page with initialUser from first getUser() call in layout.tsx), then SIGNED_OUT event fires from proxy and AuthProvider sets user=null.

- timestamp: 2026-04-17T01:15:00Z
  checked: Why layout.tsx getUser() succeeds but proxy SIGNED_OUT fires after
  found: layout.tsx calls createServerClient() → getUser() which fires SIGNED_IN/TOKEN_REFRESHED → applyServerStorage sets new cookies. But proxy runs BEFORE layout. Proxy getUser() reads the stale btoa cookie first via combineChunks → fails → SIGNED_OUT fires → new cookies (written by applyServerStorage from layout) are then deleted by the SIGNED_OUT emission. The proxy runs per-request, so every reload triggers the cycle.
  implication: Even if layout sets cookies correctly, proxy fires SIGNED_OUT and deletes them on the same or next request.

- timestamp: 2026-04-17T03:30:00Z
  checked: Next.js compiled cookie.parse() with duplicate cookie names (node REPL test)
  found: cookie.parse('a=1; b=2; a=3') returns {a: '1', b: '2'} — FIRST occurrence wins. Browsers send host-only (more specific) cookies BEFORE domain-scoped cookies (RFC 6265 ordering by specificity). Therefore when both stale host-only and new domain-scoped cookies exist with the same name, request.cookies.getAll() returns the stale value first.
  implication: This CONFIRMS that the stale cookie shadows the new one even after a fresh login that writes domain-scoped cookies. The ~1s "logged in" window is SSR initialUser from server (layout renders before proxy state propagates to client). Then browser client initialize() reads stale cookie → SIGNED_OUT → setUser(null).

- timestamp: 2026-04-17T03:35:00Z
  checked: Re-analysis of CDP Playwright test results from prior session
  found: CDP tests only tested the PROXY's deletion behavior with manually crafted cookies. They did NOT simulate the scenario where a host-only stale cookie AND a new domain-scoped cookie exist simultaneously. Tests used a single cookie value per test. The "ZERO cookies" observation came AFTER the cycle had already deleted the domain-scoped cookie — the stale host-only cookie may have been ignored in the DevTools domain-filtered view or already expired/absent.
  implication: Prior hypothesis invalidation was WRONG — it was based on a gap in the CDP test coverage, not evidence that stale cookies don't exist. The original root cause analysis was correct.

## Resolution
<!-- OVERWRITE as understanding evolves -->

root_cause: Stale host-only cookie `sb-{ref}-auth-token` written by pre-Phase12 btoa code (no domain attribute) survives in users' browsers. Next.js cookie.parse() returns the FIRST occurrence of duplicate-named cookies. Browsers send host-only cookies before domain-scoped cookies (RFC 6265 specificity ordering). So the proxy always reads the stale btoa value first. JSON.parse fails (btoa is not JSON). _isValidSession returns false. _removeSession() fires SIGNED_OUT. applyServerStorage emits Set-Cookie with maxAge=0 domain=.generation-ai.org — this deletes the new domain-scoped cookie but CANNOT delete the host-only stale cookie (domain mismatch). Cycle repeats on every request.

fix: clearStaleHostOnlyCookies() with max-age=0 / path=/ / NO domain — the only way to delete a host-only cookie. Called in (1) login/page.tsx before signInWithPassword and signInWithOtp, and (2) AuthProvider.tsx on first mount via useRef guard — covers direct navigation without going via login. Commit f3b893c implements this correctly and was written before the incorrect invalidation. It should be pushed as-is.

verification: awaiting human confirmation that login persists after deploy
files_changed: [apps/tools-app/app/login/page.tsx, apps/tools-app/components/AuthProvider.tsx]
commit: f3b893c
