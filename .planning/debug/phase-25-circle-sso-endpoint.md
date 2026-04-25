---
status: awaiting_human_verify
trigger: "Phase 25 Bug #2: Circle generateSsoUrl failing in preview, falls back to /welcome instead of seamless SSO into Circle community"
created: 2026-04-24T22:00:00Z
updated: 2026-04-25T00:05:00Z
---

## Current Focus

hypothesis: ROOT CAUSE CONFIRMED + LIVE-VERIFIED + CODE FIX IMPLEMENTED + UNIT-TESTED. Awaiting human end-to-end confirmation via preview-deploy signup → confirm-click → land inside Circle.
test: vitest 18/18 green; @genai/circle typecheck clean; website typecheck clean for all paths touched (one pre-existing unrelated TS error in skill-radar-chart.test.tsx remains, untouched). Preview-deploy E2E pending push.
expecting: After Luca pushes branch + Vercel preview rebuilds, signup with fresh test alias → confirm-click → 303 to `community.generation-ai.org/session/cookies?access_token=<jwt>` → user lands inside Circle (no `/welcome?circle=pending` fallback).
next_action: HUMAN-VERIFY checkpoint — Luca runs E2E with fresh alias on preview after push.

## Symptoms

expected: After confirm-mail click → /auth/confirm verifyOtp success → generateSsoUrl returns Circle SSO URL → 303 redirect to that URL → user lands inside Circle in #how-to-space.
actual: After verifyOtp succeeds, the try/catch around generateSsoUrl fires (apps/website/app/auth/confirm/route.ts:156) → redirect to /welcome?circle=pending (then Bug #3 takes them to /).
errors: Sentry events tagged `op: generateSsoUrl` from 2026-04-24 ~21:34 UTC on the preview deployment. Likely 404 or 422 from Circle.
reproduction: New signup via /join on preview branch → confirm-mail click → ends on /welcome (or /). Bug-isolated reproduction: call `circleFetch('/headless_auth_tokens', POST, {community_member_id, redirect_path, ttl_seconds})` directly with a valid Circle member ID and observe error.
started: Phase 25 introduction — Plan-B (`packages/circle/src/client.ts`) shipped with `/headless_auth_tokens` as a "best guess" without live verification. Same root-cause class as Bug #1 (addMemberToSpace 404 → wrong payload key).

## Eliminated

- hypothesis: Endpoint exists at `/api/admin/v2/headless_auth_tokens` (current code path)
  evidence: Live curl 2026-04-24T22:10Z returned HTTP 404 with HTML body (Circle's SPA fallback). Confirmed against Circle's published Admin API v2 swagger (api-headless.circle.so/api/admin/v2/swagger.yaml) — there is NO SSO/auth_token endpoint in the Admin API.
  timestamp: 2026-04-24T22:10:00Z

- hypothesis: Endpoint exists at `/api/admin/v2/sso` or `/api/admin/v2/community_members/:id/sso_token`
  evidence: Both probed live → 404 + HTML body. Neither is in Admin API v2 swagger.
  timestamp: 2026-04-24T22:10:00Z

- hypothesis: Circle returns a single passwordless `sso_url` for the hosted community (what current code expects)
  evidence: Per docs (https://api.circle.so/apis/headless/quick-start.md), Headless Auth API returns `{access_token, refresh_token, access_token_expires_at, refresh_token_expires_at, community_member_id, community_id}` — there is no `sso_url` field. The seamless-redirect URL is constructed CLIENT-SIDE on the community domain.
  timestamp: 2026-04-24T22:15:00Z

## Evidence

- timestamp: 2026-04-24T22:00:00Z
  checked: packages/circle/src/client.ts (lines 211-246)
  found: `generateSsoUrl` POSTs to `/headless_auth_tokens` with body `{community_member_id, redirect_path, ttl_seconds}`. Code-comment explicitly marks endpoint as best-guess: "may be /headless_auth_tokens or /community_members/:id/sso_token depending on Circle plan".
  implication: Endpoint and payload key never verified against Circle's live API schema; same pattern that broke addMemberToSpace (Bug #1, where MCP showed payload should use `email` not `community_member_id`).

- timestamp: 2026-04-24T22:00:00Z
  checked: apps/website/app/auth/confirm/route.ts (lines 155-190)
  found: Try/catch around generateSsoUrl falls into `redirectWithCookies(fallbackUrl(origin))` → `/welcome?circle=pending`. CircleApiError is captured to Sentry with status code, op tag, correlation ID.
  implication: Fallback path is observable in runtime logs (the 303→/welcome→307→/ chain in 25-FOLLOW-UP.md). Sentry event will show the actual status code Circle returned, but the fix can be verified via MCP without Sentry first.

- timestamp: 2026-04-24T22:08:00Z
  checked: Live curl POST https://app.circle.so/api/admin/v2/headless_auth_tokens with valid Admin token + real community_member_id 80552151
  found: HTTP 404. Body is the Circle SPA HTML (window.RAILS_ENV="production" etc.) — that's the catch-all router fallback for unknown paths under /api/admin.
  implication: The endpoint literally does not exist. Same result for `/sso` and `/community_members/:id/sso_token` variants.

- timestamp: 2026-04-24T22:12:00Z
  checked: Live curl POST https://app.circle.so/api/v1/headless/auth_token with same Admin token + community_member_id
  found: HTTP 401 with JSON body `{"success":false,"message":"Your account could not be authenticated.","error_details":{}}`. Same with email-based payload. 401 (vs 404) confirms the endpoint EXISTS — it just rejects the Admin token.
  implication: Endpoint exists and is correctly addressed. The 401 means the Admin API token is the wrong TYPE for this endpoint.

- timestamp: 2026-04-24T22:14:00Z
  checked: Circle docs https://api.circle.so/apis/headless/quick-start.md
  found: Quote: "Community admins can obtain an API key by going to the Developers → Tokens page in their community and selecting the type as **Headless Auth**. You will need to use the token type `Headless Auth` for it to work with the Auth APIs." Token-type is a property of the API key itself, set at mint time in the Circle Dashboard.
  implication: We need a SECOND API token (separately minted, type=Headless Auth) in addition to the existing Admin token. Current `CIRCLE_API_TOKEN` stays for Admin operations (createMember, getMemberByEmail, addMemberToSpace, etc.); a new `CIRCLE_HEADLESS_TOKEN` env-var is needed for `/api/v1/headless/auth_token`.

- timestamp: 2026-04-24T22:15:00Z
  checked: Circle docs https://api.circle.so/apis/headless/member-api/cookies.md
  found: Documented seamless-redirect pattern: "The simplest way to get authenticated is to navigate to our authentication URL with the access token as part of the query params: `https://{communityDomain}/session/cookies?access_token={YOUR_ACCESS_TOKEN}`. That should take you to your community's root path (either `/` or `/home`)."
  implication: Two-step flow is confirmed as the official pattern: (1) POST /api/v1/headless/auth_token → JWT access_token; (2) Redirect user to `https://community.generation-ai.org/session/cookies?access_token=<jwt>`. No `redirect_path` query param documented but Circle drops user at community root by default.

- timestamp: 2026-04-24T21:59:48Z
  checked: Live curl POST https://app.circle.so/api/v1/headless/auth_token with NEW CIRCLE_HEADLESS_TOKEN (Headless-Auth type) + body {"community_member_id":80552151}. Authorization header redacted from this evidence entry.
  found: HTTP 200, x-request-id e92b0196-108b-4b1c-8faa-a00bf6132006. Response body shape exactly matches docs:
    {
      "access_token": "<RS256 JWT, redacted>",
      "access_token_expires_at": "2026-04-24T22:59:48.857Z",  // ~1h TTL (server-fixed)
      "refresh_token": "<redacted>",
      "refresh_token_expires_at": "2026-05-24T21:59:48.000Z", // 30d TTL
      "community_member_id": 80552151,                        // numeric
      "community_id": 511295                                  // numeric
    }
  implication: Contract fully verified. Endpoint + token type + payload (community_member_id) + response shape all confirmed. Note: response IDs come back as numbers, not strings — types must reflect that. TTL is server-fixed at ~1h; the `ttl_seconds` parameter from old code path is moot. No `redirect_path` accepted by Circle. Safe to proceed with code edits.

## Resolution

root_cause: |
  `generateSsoUrl` was implemented against an imagined API contract that does not exist on Circle. Three independent defects compound:
  (1) Endpoint path `/api/admin/v2/headless_auth_tokens` is wrong — correct path is `/api/v1/headless/auth_token` (different API surface entirely: Headless Auth API, not Admin API v2).
  (2) Token type is wrong — Admin API token cannot authenticate against Headless endpoints; Circle requires a separately-minted "Headless Auth" token.
  (3) Response model is wrong — Circle does not return a passwordless `sso_url`. It returns a JWT access_token; the seamless-login URL is composed client-side as `https://{communityDomain}/session/cookies?access_token=<jwt>`.

fix: |
  1. Add new env var `CIRCLE_HEADLESS_TOKEN` (Luca mints in Circle Dashboard → Developers → Tokens, type "Headless Auth"; adds to Vercel for Prod/Preview/Dev).
  2. `packages/circle/src/client.ts`:
     - Extend `getConfig()` to read `CIRCLE_HEADLESS_TOKEN`.
     - Refactor `circleFetch` to take an optional `tokenType: 'admin' | 'headless'` and use the matching base URL:
       - admin → `https://app.circle.so/api/admin/v2`
       - headless → `https://app.circle.so/api/v1/headless`
     - Rewrite `generateSsoUrl(input)` to:
       a) POST `/auth_token` with body `{community_member_id: input.memberId}` using headless token + headless base.
       b) Take `access_token` from response.
       c) Compose `ssoUrl = ${CIRCLE_COMMUNITY_URL}/session/cookies?access_token=${access_token}`.
       d) Return `{ssoUrl, expiresAt: access_token_expires_at}`.
     - Drop `redirect_path` and `ttl_seconds` from `GenerateSsoInput` (Circle's auth_token endpoint doesn't accept them; access_token TTL is fixed at 1h server-side).
  3. `packages/circle/src/types.ts`:
     - Update `CircleSsoToken` interface to match real shape: `{access_token, refresh_token, access_token_expires_at, refresh_token_expires_at, community_member_id, community_id}`.
     - Simplify `GenerateSsoInput` to just `{memberId: string}`.
  4. `packages/circle/src/__tests__/client.test.ts`:
     - Update `generateSsoUrl` tests to mock POST to new path (`/api/v1/headless/auth_token` via headless base) and assert returned ssoUrl format.
     - Add test for `CIRCLE_HEADLESS_TOKEN` missing → CONFIG_MISSING.
  5. `apps/website/.env.example`: Add `CIRCLE_HEADLESS_TOKEN=` placeholder.
  6. Live-verify with curl using the new Headless token before commit.

verification: |
  Self-verified ✅:
  (a) Live curl 2026-04-24T21:59:48Z (after Headless token minted): POST https://app.circle.so/api/v1/headless/auth_token with `{"community_member_id":80552151}` → HTTP 200 + JWT response (full evidence above, auth header redacted).
  (b) `pnpm --filter @genai/circle test` → 18/18 passed.
  (c) `pnpm --filter @genai/circle typecheck` → clean.
  (d) `pnpm --filter @genai/website exec tsc --noEmit` → clean for all touched files (one pre-existing unrelated TS error in __tests__/components/test/skill-radar-chart.test.tsx remains, NOT introduced by this fix).

  Pending (requires human + preview deploy):
  (e) Push branch → Vercel preview rebuilds with `CIRCLE_HEADLESS_TOKEN` → run signup E2E with fresh `movo.fitness+p25-test3@gmail.com` alias → /auth/confirm 303 → community.generation-ai.org/session/cookies?... → land inside Circle community root.

files_changed:
  - packages/circle/src/client.ts (circleFetch token-type support + generateSsoUrl rewrite + new HEADLESS_BASE_URL constant)
  - packages/circle/src/types.ts (CircleSsoToken matches real JWT response shape; GenerateSsoInput simplified to just memberId)
  - packages/circle/src/__tests__/client.test.ts (5 new generateSsoUrl tests, dropped 3 obsolete ones that asserted the imagined contract)
  - apps/website/app/auth/confirm/route.ts (call site cleanup — drop redirectPath param that the real endpoint doesn't accept)
  - apps/website/.env.example (add CIRCLE_HEADLESS_TOKEN with explanatory comment; CIRCLE_API_TOKEN comment also clarified to scope it to Admin operations only)
  - .changeset/phase-25-fix-circle-sso-endpoint.md (new)
  - .planning/phases/25-circle-api-sync/25-FOLLOW-UP.md (Bug #2 marked resolved; struck from open-bugs section)
