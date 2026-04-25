---
phase: 25
plan: B
slug: circle-client-package
status: complete
completed: 2026-04-24
commits:
  - a38b734
---

# Plan 25-B SUMMARY — @genai/circle package

## What was built

- New workspace package `packages/circle/` with `@genai/circle` import name.
- `src/types.ts` — `CircleMember`, `CircleSsoToken`, `CreateMemberInput`, `GenerateSsoInput`.
- `src/errors.ts` — `CircleApiError` + `CircleErrorCode` union (8 codes).
- `src/client.ts` — 4 helpers with retry + timeout + lazy env-read:
  - `getMemberByEmail(email)` — returns `{ circleMemberId } | null`. Parses both single-object and `records[]` response shapes.
  - `createMember(input)` — GET-first idempotent. Returns `{ circleMemberId, alreadyExists }`.
  - `addMemberToSpace(memberId, spaceId)` — idempotent (409 swallowed).
  - `generateSsoUrl({ memberId, redirectPath, ttlSeconds })` — default TTL 7d (Q4). Falls back to composing URL from `access_token` + `CIRCLE_COMMUNITY_URL` if Circle response uses alternate shape.
- `src/index.ts` — barrel export.
- `vitest.config.mts` — Node env, globals on.
- `src/__tests__/client.test.ts` — 16 tests covering CONFIG_MISSING, happy paths (both response shapes), 404-null, 409-swallow, retry-on-500, no-retry-on-401, TTL pass-through, access_token fallback.

## Key files

- `packages/circle/package.json`
- `packages/circle/tsconfig.json`
- `packages/circle/vitest.config.mts`
- `packages/circle/src/types.ts`
- `packages/circle/src/errors.ts`
- `packages/circle/src/client.ts`
- `packages/circle/src/index.ts`
- `packages/circle/src/__tests__/client.test.ts`

## Verification

- `pnpm --filter @genai/circle exec tsc --noEmit` clean.
- `pnpm --filter @genai/circle test` → 16 tests pass.
- `pnpm install` succeeds; workspace resolves `@genai/circle`.

## Deviations

- Added defensive parsing for two Circle response shapes (single object vs. `records[]` array). The plan had fixed `CircleMember` shape only.
- `generateSsoUrl` accepts both `sso_url` (preferred) and `access_token` (fallback — composes URL using `CIRCLE_COMMUNITY_URL`). This guards against Circle endpoint variability per plan's "best-guess paths" caveat.
- Endpoint paths unchanged from plan — `/community_members`, `/space_members`, `/headless_auth_tokens`. Plan H E2E is the verification point; real API mismatch is expected to surface there.

## Hand-off

Plan E can now `import { createMember, addMemberToSpace, generateSsoUrl, CircleApiError } from '@genai/circle'`. Plan F can reuse the same helpers for reprovision. Bundle-safety check (CIRCLE_API_TOKEN not in client chunk) is part of Plan H.
