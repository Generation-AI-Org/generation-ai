---
phase: 13-auth-flow-audit-csp-reaktivierung
verified: 2026-04-17T01:58:06Z
status: human_needed
score: 5/5 goals verified (branch-level); 2 goals require Luca-merge + prod-verify
overrides_applied: 0
human_verification:
  - test: "Merge feat/auth-flow-audit to main and verify enforced CSP in production"
    expected: "curl -sI https://generation-ai.org returns Content-Security-Policy (not -Report-Only) with nonce-. curl -sI https://tools.generation-ai.org returns Content-Security-Policy including o4511218002362368.ingest.de.sentry.io and api.deepgram.com"
    why_human: "Per CLAUDE.md 'kein Prod-Deploy ohne OK' — merge decision is Luca's. Prod currently serves the pre-phase-13 state (website: Report-Only, tools-app: no CSP header)."
  - test: "Confirm securityheaders.com rating after prod deploy"
    expected: "Both domains reach A or A+ rating"
    why_human: "Third-party check, needs post-deploy state"
  - test: "Smoke test Voice (Deepgram WSS), Sentry error reporting, ToolLogo (Clearbit) on tools-app after CSP enforced in prod"
    expected: "Voice start/stop works, Sentry test event arrives, ToolLogo images render"
    why_human: "Browser-feature integration can only be verified in live env post-deploy"
  - test: "Session-Refresh path (auth path 3) verified manually"
    expected: "Token rotation via middleware updateSession observed across a long session"
    why_human: "Token TTL too long for automated E2E (VALIDATION.md explicitly marks this manual-only)"
---

# Phase 13: Auth-Flow-Audit + CSP Reaktivierung — Verification Report

**Phase Goal:** Systematische E2E-Validierung aller Auth-Pfade (Login/Passwort, Magic Link, Session-Refresh, Signout, Password-Reset, Cross-Domain Website↔tools-app) + CSP von Report-Only auf enforced heben und auf tools-app implementieren. Edge-Runtime-Blocker klären.
**Verified:** 2026-04-17T01:58:06Z
**Status:** human_needed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths (5 goals from prompt)

| #   | Goal / Truth                                                                                                           | Status                    | Evidence                                                                                                                                                                                                                       |
| --- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | All 6 Auth-Pfade via Playwright getestet                                                                               | VERIFIED                  | `pnpm -F @genai/e2e-tools test tests/auth.spec.ts` → 10 passed, 2 intentional skips (Path 3 manual-only, CSP wave-2). All 6 describe-blocks active: Path 1–6 present in `packages/e2e-tools/tests/auth.spec.ts`. Run time 30.5s. |
| 2   | docs/AUTH-FLOW.md mit Diagrammen + Findings                                                                            | VERIFIED                  | File exists (457 lines, 17.6 KB). 7 Mermaid sequenceDiagrams (`grep -c sequenceDiagram` = 7). Sections: Overview, 6 paths, Findings (F1 backlogged, F2 fixed commit 582cd63), Consolidation Audit, CSP Rollout, Signup (503 disabled), Test Suite, References. No DRAFT marker. |
| 3   | CSP enforced auf website + tools-app via proxy.ts                                                                      | VERIFIED (branch-level)   | Both `apps/website/proxy.ts` (33L) and `apps/tools-app/proxy.ts` (33L) contain: `buildCspDirectives()` import from `./lib/csp`, `updateSession(request)` first, `crypto.randomUUID()` nonce, `response.headers.set("Content-Security-Policy", csp)`, `x-nonce` forwarded, prefetch excluded via `missing` header check. `apps/website/next.config.ts` no longer contains `Content-Security-Policy-Report-Only` or `cspDirectives` (Pitfall 1 fix). **NOTE:** Prod still serves old state — merge to main pending (see human_verification). |
| 4   | Auth-Stack Konsolidierung verifiziert clean                                                                            | VERIFIED                  | `grep -rn "from '@supabase/ssr'" apps/ --include="*.ts" --include="*.tsx"` returns 0 matches. Thin shims (`apps/tools-app/lib/auth.ts` 8L, `apps/website/lib/supabase/client.ts` 3L, `apps/website/lib/supabase/server.ts` 3L) all delegate to `@genai/auth`. Documented in `docs/AUTH-FLOW.md` "Consolidation Audit" section. |
| 5   | Regression-Guard: Signout GET → 405 bleibt (Commit f5f9cb7 Session-Drop-Fix)                                           | VERIFIED                  | `apps/tools-app/app/auth/signout/route.ts` exports only `POST` (no GET handler). Next.js default returns 405 for unimplemented verbs. Playwright test `Auth Path 4: GET /auth/signout returns 405 (regression test für Session-Drop-Bug f5f9cb7)` passes. Commit f5f9cb7 present in git log. |

**Score:** 5/5 goals verified at branch level.

### Required Artifacts

| Artifact                                                       | Expected                                                                                 | Status     | Details |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------- | ------- |
| `docs/AUTH-FLOW.md`                                            | 7 sequenceDiagrams, 6 auth paths, Findings, Consolidation Audit, CSP sections            | VERIFIED   | 457L, 7 sequenceDiagrams, all required sections present, no DRAFT markers |
| `apps/website/lib/csp.ts`                                      | `buildCspDirectives(nonce, isDev)` pure function                                         | VERIFIED   | 30L, exports `buildCspDirectives`, nonce + strict-dynamic + `va.vercel-scripts.com` explicit, Tailwind v4 `unsafe-inline` in style-src only |
| `apps/website/proxy.ts`                                        | updateSession first → CSP on same response → nonce injection                             | VERIFIED   | 33L, imports `buildCspDirectives`, uses `updateSession(request)`, `crypto.randomUUID()` nonce, sets CSP + x-nonce, matcher excludes prefetch |
| `apps/tools-app/lib/csp.ts`                                    | Same pattern with Sentry DE-Region + Deepgram + Clearbit hosts                           | VERIFIED   | 39L, Sentry (`o4511218002362368.ingest.de.sentry.io`), Deepgram https+wss, Clearbit img-src |
| `apps/tools-app/proxy.ts`                                      | Identical nonce-CSP pattern to website                                                   | VERIFIED   | 33L, same structure as website/proxy.ts |
| `apps/website/next.config.ts`                                  | No Report-Only CSP, no `cspDirectives` const                                             | VERIFIED   | 0 matches for `cspDirectives` or `Content-Security-Policy-Report-Only`; comment "CSP moved to proxy.ts (Phase 13)" present |
| `docs/ARCHITECTURE.md` → AUTH-FLOW.md link                     | blockquote link to docs/AUTH-FLOW.md                                                     | VERIFIED   | `grep -q "AUTH-FLOW.md" docs/ARCHITECTURE.md` returns match |
| `packages/e2e-tools/tests/auth.spec.ts` — 6 auth paths         | Active tests for paths 1,2,4,5,6; manual skip for 3                                      | VERIFIED   | 10 passing tests, 2 intentional skips, run against production |
| `apps/tools-app/app/auth/signout/route.ts` — POST only         | Only POST handler exported; GET returns 405                                              | VERIFIED   | File has POST handler only (14L); comment states "POST only. GET would be prefetched by Next.js Link, silently destroying the session" |

### Key Link Verification

| From                                  | To                                                 | Via                                   | Status  | Details |
| ------------------------------------- | -------------------------------------------------- | ------------------------------------- | ------- | ------- |
| `apps/website/proxy.ts`               | `apps/website/lib/csp.ts`                          | `import { buildCspDirectives } from "./lib/csp"` | WIRED   | Import + call site confirmed |
| `apps/tools-app/proxy.ts`             | `apps/tools-app/lib/csp.ts`                        | `import { buildCspDirectives } from "./lib/csp"` | WIRED   | Import + call site confirmed |
| `apps/website/proxy.ts`               | `@genai/auth/middleware` `updateSession`           | import + `await updateSession(request)` | WIRED   | Response from updateSession is the response CSP is set on (Pitfall 1 fix) |
| `apps/tools-app/proxy.ts`             | `@genai/auth/middleware` `updateSession`           | import + `await updateSession(request)` | WIRED   | Same pattern |
| `docs/ARCHITECTURE.md`                | `docs/AUTH-FLOW.md`                                | blockquote link                       | WIRED   | Cross-link present |
| `packages/e2e-tools/tests/auth.spec.ts` | `packages/e2e-tools/helpers/supabase-admin.ts`  | import + `generateMagicLink`/`generateRecoveryLink` | WIRED   | F2 fix (hashed_token PKCE URL) applied in commit 582cd63 |

### Data-Flow Trace (Level 4)

CSP payload flows end-to-end from nonce generation to HTTP response header:

| Artifact                | Data Variable  | Source                                                                   | Produces Real Data | Status   |
| ----------------------- | -------------- | ------------------------------------------------------------------------ | ------------------ | -------- |
| `proxy.ts` (both apps)  | `nonce`        | `crypto.randomUUID()` per-request → base64                               | Yes                | FLOWING  |
| `proxy.ts` (both apps)  | `csp`          | `buildCspDirectives(nonce, isDev)`                                       | Yes (dynamic)      | FLOWING  |
| HTTP response header    | `Content-Security-Policy` | `response.headers.set("Content-Security-Policy", csp)`        | Yes                | FLOWING  |
| HTTP response header    | `x-nonce`      | `response.headers.set("x-nonce", nonce)`                                 | Yes                | FLOWING  |

### Behavioral Spot-Checks

| Behavior                                                                            | Command                                                                                    | Result                                                                                         | Status  |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- | ------- |
| All E2E auth paths pass against production                                          | `pnpm -F @genai/e2e-tools test tests/auth.spec.ts`                                         | 10 passed, 2 skipped (intentional), 30.5s                                                      | PASS    |
| `@genai/auth` unit tests                                                            | `pnpm -F @genai/auth test`                                                                 | 4/4 passed                                                                                     | PASS    |
| `@genai/website` unit tests                                                         | `pnpm -F website test`                                                                     | 5/5 passed                                                                                     | PASS    |
| `@genai/tools-app` unit tests                                                       | `pnpm -F tools-app test`                                                                   | 15/15 passed                                                                                   | PASS    |
| Zero direct `@supabase/ssr` imports in apps/                                        | `grep -rn "from '@supabase/ssr'" apps/ --include="*.ts" --include="*.tsx"`                 | 0 matches                                                                                      | PASS    |
| AUTH-FLOW.md diagram count ≥ 7                                                      | `grep -c "sequenceDiagram" docs/AUTH-FLOW.md`                                              | 7                                                                                              | PASS    |
| AUTH-FLOW.md linked from ARCHITECTURE.md                                            | `grep -q "AUTH-FLOW.md" docs/ARCHITECTURE.md`                                              | match                                                                                          | PASS    |
| website `next.config.ts` clean of Report-Only CSP                                   | `grep -E "cspDirectives\|Content-Security-Policy-Report-Only" apps/website/next.config.ts` | 0 matches                                                                                      | PASS    |
| f5f9cb7 session-drop-fix commit present                                             | `git log --oneline f5f9cb7`                                                                | `f5f9cb7 fix(tools-app): make signout POST-only to prevent Link prefetch kill`                 | PASS    |
| Signup still 503 disabled                                                           | `grep -r "503" apps/website/app/api/auth/signup/`                                          | match at route.ts:8                                                                            | PASS    |
| Prod CSP header (website)                                                           | `curl -sI https://generation-ai.org \| grep -i content-security-policy`                    | `content-security-policy-report-only: ...` (still old state — pre-merge)                       | SKIP (post-merge) |
| Prod CSP header (tools-app)                                                         | `curl -sI https://tools.generation-ai.org \| grep -i content-security-policy`              | no CSP header yet (still old state — pre-merge)                                                | SKIP (post-merge) |

### Requirements Coverage

| Requirement     | Source Plan(s)  | Description                                         | Status    | Evidence                                                                      |
| --------------- | --------------- | --------------------------------------------------- | --------- | ----------------------------------------------------------------------------- |
| AUTH-AUDIT-01   | 13-01           | Wave-0 scaffold (fixtures, admin helper, CSP asserts) | SATISFIED | Plan 13-01 SUMMARY verified; files present in packages/e2e-tools              |
| AUTH-AUDIT-02   | 13-02           | Pfad 1 Login Password                                | SATISFIED | 3 E2E tests active, all green                                                 |
| AUTH-AUDIT-03   | 13-02           | Pfad 2 Magic Link (PKCE via hashed_token)            | SATISFIED | F2 fixed inline (582cd63), 2 E2E tests active                                 |
| AUTH-AUDIT-04   | 13-02           | Pfad 4 Signout POST-only regression + Pfad 3 manual  | SATISFIED | 2 E2E tests, path 3 documented as manual-only per VALIDATION.md               |
| AUTH-AUDIT-05   | 13-02           | Pfad 5 Password Reset End-to-End                     | SATISFIED | Full flow test active + green (generateRecoveryLink → set-password → relogin) |
| AUTH-AUDIT-06   | 13-02           | Pfad 6 Cross-Domain cookie                           | SATISFIED | E2E test active, domain=.generation-ai.org verified                           |
| AUTH-AUDIT-07   | 13-02           | Findings-Triage + Fix application                    | SATISFIED | F1 backlogged, F2 fixed inline, table in AUTH-FLOW.md                         |
| CONSOL-01       | 13-03           | Konsolidierungs-Audit @genai/auth                    | SATISFIED | 0 drift grep results documented in Consolidation Audit section                 |
| CSP-01          | 13-04           | website: Report-Only → enforced                      | SATISFIED (branch) | proxy.ts + lib/csp.ts + next.config.ts cleaned; prod-deploy awaits Luca merge |
| CSP-02          | 13-05           | tools-app: neue enforced CSP                         | SATISFIED (branch) | proxy.ts + lib/csp.ts on branch; prod-deploy awaits Luca merge                 |
| CSP-03          | 13-05           | Permissions-Policy + Referrer-Policy                 | PARTIAL   | website has both; tools-app next.config.ts lacks Referrer-Policy + Permissions-Policy (see Anti-Patterns). Static security headers set via next.config ONLY on website. |
| DOC-01          | 13-06           | AUTH-FLOW.md final + ARCHITECTURE.md link            | SATISFIED | 7 diagrams, 457L, cross-link present                                          |

### Anti-Patterns Found

| File                               | Line    | Pattern                                                                                   | Severity | Impact                                                                                                                                          |
| ---------------------------------- | ------- | ----------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/tools-app/next.config.ts`    | (all)   | No `Referrer-Policy` or `Permissions-Policy` headers (website has both, tools-app has HSTS/X-Frame/X-Content-Type only) | Warning  | D-11 in CONTEXT.md stated "Jede App bekommt Permissions-Policy und Referrer-Policy mit" — tools-app still misses these. AUTH-FLOW.md lines 378–383 document the current tools-app static header set (lacks these two). Not blocking, but an unmet sub-goal of CSP-03. |
| `apps/tools-app/CLAUDE.md`         | 10      | Stack line says "Next.js 15" but monorepo CLAUDE.md says Next.js 16; docstring drift      | Info     | Not in Phase 13 scope, but noticed during verification. Pre-existing. |
| `packages/e2e-tools/tests/chat.spec.ts` | 10, 19 | Pre-existing E2E failures (from Phase 07-03 commit 3c5875c) when running `pnpm test` across repo | Info     | Not Phase 13's responsibility; auth.spec.ts and unit suites all green. Pre-existing issue worth backlogging separately. |

### Human Verification Required

Automated checks pass at the branch level. The remaining items require Luca to approve and execute:

1. **Merge feat/auth-flow-audit → main, then verify enforced CSP in prod**
   - Test: `curl -sI https://generation-ai.org | grep -i content-security-policy` expecting `content-security-policy:` (NOT `-report-only`) with `nonce-` token.
   - Test: `curl -sI https://tools.generation-ai.org | grep -i content-security-policy` expecting a `Content-Security-Policy` header including `o4511218002362368.ingest.de.sentry.io` and `api.deepgram.com`.
   - Why human: Per CLAUDE.md "kein Prod-Deploy ohne OK" — merge decision belongs to Luca. Pre-merge, prod still serves website Report-Only + tools-app no CSP.

2. **securityheaders.com rating A/A+**
   - Test: After prod deploy, visit `https://securityheaders.com/?q=https://generation-ai.org` and `.../tools.generation-ai.org`.
   - Expected: A or A+ on both.
   - Why human: Third-party scan, needs live prod headers.

3. **tools-app feature smoke-test under enforced CSP**
   - Test: After prod deploy, exercise Login, Chat (streaming), Voice (Deepgram WSS start/stop), Sentry test-event, ToolLogo Clearbit rendering.
   - Expected: Zero CSP console violations; all features functional.
   - Why human: Runtime browser-integration with third-party endpoints.

4. **Session-refresh (Path 3) manual run**
   - Test: Long-lived session with token rotation via middleware `updateSession`.
   - Expected: Token refreshes silently; cookies rotated; no logout.
   - Why human: Token TTL too long for automated E2E; VALIDATION.md explicitly classifies this as manual-only.

### Gaps Summary

No blocking gaps at the artifact / code / test level. All 6 plans (13-01..13-06) produced the artifacts they claimed, and their wiring is confirmed. Two sub-items surfaced that the team may want to address, but none block goal-achievement:

- **CSP-03 partial:** tools-app `next.config.ts` lacks `Referrer-Policy` and `Permissions-Policy` headers that CONTEXT decision D-11 promised "jede App" would get. Low-friction follow-up (3–5 line addition). Not in any SUMMARY as a deviation — worth surfacing.
- **Prod verification deferred:** Goals 3 (CSP enforced) is VERIFIED on branch `feat/auth-flow-audit`, but **not** in production. Prod currently serves website Report-Only + tools-app no CSP header. This is expected (CLAUDE.md forbids autonomous prod deploy) and correctly flagged in 13-04-SUMMARY ("Pending awaiting Luca") and 13-05-SUMMARY. The "goal" of "CSP enforced auf website + tools-app via proxy.ts" is satisfied at the implementation level; the "rollout" dimension is the human-verification step above.
- **Unrelated pre-existing:** `packages/e2e-tools/tests/chat.spec.ts` has 2 failing tests inherited from Phase 07-03. Not Phase 13 scope; worth a separate backlog entry.

---

## Overall Verdict

**PASS (branch-level)** with **human verification needed** for prod rollout.

- Phase 13's **implementation** goals are all VERIFIED in code, tests, and documentation on branch `feat/auth-flow-audit`.
- Phase 13's **rollout** dimension (CSP live in prod, securityheaders.com rating, feature smoke under enforced CSP) is gated on Luca's merge decision per CLAUDE.md — this is expected and explicitly documented in both plan SUMMARYs.
- One minor deviation from CONTEXT D-11 (tools-app missing Referrer-Policy + Permissions-Policy in `next.config.ts`) is tracked as a non-blocking warning.

Recommended next actions for Luca:
1. Review Vercel Preview of `feat/auth-flow-audit`.
2. Merge to main.
3. Run the 4 human-verification items above.
4. Optionally add `Referrer-Policy` + `Permissions-Policy` to `apps/tools-app/next.config.ts` (D-11 follow-up).

---

_Verified: 2026-04-17T01:58:06Z_
_Verifier: Claude (gsd-verifier) — Opus 4.7_
