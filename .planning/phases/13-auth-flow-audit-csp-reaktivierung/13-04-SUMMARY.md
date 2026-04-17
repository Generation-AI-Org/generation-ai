---
phase: 13
plan: 04
subsystem: website-csp
tags: [csp, security-headers, proxy, nonce, middleware]
dependency_graph:
  requires: [13-02, packages/auth/src/middleware.ts]
  provides: [enforced-csp-website, nonce-injection-pattern]
  affects: [apps/website/proxy.ts, apps/website/next.config.ts, apps/website/lib/csp.ts]
tech_stack:
  added: []
  patterns: [Next.js 16 proxy.ts nonce-based CSP, strict-dynamic, per-request crypto.randomUUID nonce]
key_files:
  created:
    - apps/website/lib/csp.ts
  modified:
    - apps/website/proxy.ts
    - apps/website/next.config.ts
    - docs/AUTH-FLOW.md
decisions:
  - "CSP set on updateSession() response (not new NextResponse) — preserves auth cookies (Pitfall 1)"
  - "Prefetch excluded from proxy matcher — prevents nonce cache collision (T-13-17)"
  - "unsafe-inline retained in style-src only (Tailwind v4); removed from script-src"
  - "va.vercel-scripts.com explicit in script-src for Speed Insights (Pitfall 4)"
  - "Prod-deploy not executed — awaiting Luca merge to main (CLAUDE.md: no prod deploy without OK)"
metrics:
  duration_minutes: 15
  completed_date: "2026-04-17"
  tasks_completed: 4
  tasks_total: 4
  files_changed: 4
---

# Phase 13 Plan 04: CSP Reaktivierung (website) Summary

**One-liner:** Enforced nonce-based CSP via proxy.ts, `'unsafe-inline'` removed from script-src, Report-Only header eliminated — branch pushed for Vercel Preview.

---

## Objective

Convert website CSP from Report-Only to enforced. Implement nonce-injection pattern (Next.js 16 proxy.ts). Remove `'unsafe-inline'` from script-src. Output: enforced `Content-Security-Policy` header on generation-ai.org.

---

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | lib/csp.ts — pure buildCspDirectives | `334384d` | apps/website/lib/csp.ts (NEW) |
| 2 | proxy.ts + next.config.ts | `09cdc90` | apps/website/proxy.ts, apps/website/next.config.ts |
| 3 | Preview-Deploy (YOLO auto-advance) | `09cdc90` push | git push origin feat/auth-flow-audit |
| 4 | AUTH-FLOW.md documentation | `09932be` | docs/AUTH-FLOW.md |

---

## What Was Built

### `apps/website/lib/csp.ts` (new)

Pure function `buildCspDirectives(nonce: string, isDev: boolean): string`. Encapsulates all CSP directives for website:
- `script-src`: nonce + strict-dynamic + explicit `va.vercel-scripts.com` (Speed Insights)
- `connect-src`: Supabase + Speed Insights vitals
- `style-src 'unsafe-inline'`: retained for Tailwind v4
- Security directives: `frame-ancestors 'none'`, `form-action 'self'`, `base-uri 'self'`, `object-src 'none'`, `upgrade-insecure-requests`

### `apps/website/proxy.ts` (updated)

Extended from single `updateSession()` call to:
1. `updateSession(request)` — auth session refresh, returns response with auth cookies
2. `crypto.randomUUID()` → base64 nonce, per-request
3. `buildCspDirectives(nonce, isDev)` — build CSP string
4. `response.headers.set("Content-Security-Policy", csp)` — set on same response (cookies preserved)
5. `response.headers.set("x-nonce", nonce)` — forward nonce for Next.js framework injection
6. matcher updated: prefetch requests excluded to prevent cached-nonce collision

### `apps/website/next.config.ts` (cleaned)

- `Content-Security-Policy-Report-Only` header removed
- `cspDirectives` const removed
- `isDev` const removed (no longer used)
- HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy unchanged
- Replaced with comment: "CSP moved to proxy.ts (Phase 13)"

---

## Verification

- `pnpm -F @genai/website build` → 0 errors
- `pnpm -F @genai/website test` → 5/5 tests passed
- `git push origin feat/auth-flow-audit` → Vercel Preview auto-triggered
- All acceptance criteria verified (grep checks)

---

## Deviations from Plan

### Auto-noted: JSON-LD inline scripts (non-issue)

`apps/website/app/layout.tsx` has two `<script type="application/ld+json" dangerouslySetInnerHTML>` tags. These were assessed for CSP compatibility:
- `type="application/ld+json"` is a **data script type**, not executed as JavaScript by browsers
- Per CSP spec: only scripts with executable MIME types are governed by `script-src`
- No nonce required, no violation expected
- No change needed — plan proceeded as written

**Finding: non-issue, zero action required.**

---

## Pending (awaiting Luca)

Prod-deploy is **not** executed per CLAUDE.md ("kein Prod-Deploy ohne OK"). Luca needs to:
1. Review Vercel Preview (branch feat/auth-flow-audit auto-deployed)
2. Check securityheaders.com against Preview URL
3. Merge feat/auth-flow-audit → main when satisfied

After prod deploy, update docs/AUTH-FLOW.md "Prod Verification" section with:
- Actual `curl -sI https://generation-ai.org` header output
- securityheaders.com rating
- Date deployed

---

## Rollback

```bash
git revert 09cdc90 334384d
git push origin feat/auth-flow-audit
```

Vercel re-deploys automatically — reverts to Report-Only CSP within minutes.

---

## Key Decisions

1. **CSP on updateSession() response** — never create a new NextResponse after updateSession(); that would lose auth cookies (Pitfall 1 from RESEARCH.md)
2. **Prefetch exclusion in matcher** — `missing: [next-router-prefetch, purpose:prefetch]` prevents nonce cached on prefetched HTML being reused on actual navigation (T-13-17)
3. **Speed Insights explicit host** — `va.vercel-scripts.com` in script-src because SpeedInsights injects a `<script src>` without nonce; strict-dynamic alone doesn't cover externally-sourced scripts not loaded by a nonced script
4. **style-src unsafe-inline** — Tailwind v4 generates inline styles at runtime; nonce for styles would require additional layout.tsx changes for no security benefit
5. **Prod-deploy deferred** — CLAUDE.md constraint respected; preview pushed, merge decision is Luca's

---

## Threat Model Coverage

| Threat ID | Status |
|-----------|--------|
| T-13-11 (XSS via inline script) | Mitigated — nonce + strict-dynamic, unsafe-inline removed from script-src |
| T-13-12 (Clickjacking) | Mitigated — frame-ancestors none (proxy) + X-Frame-Options DENY (next.config) |
| T-13-13 (Form credential phishing) | Mitigated — form-action self |
| T-13-14 (CSP blocks own scripts) | Mitigated — strict-dynamic + explicit Speed Insights host + Preview gate |
| T-13-15 (Base-URL hijack) | Mitigated — base-uri self |
| T-13-16 (Nonce reuse) | Mitigated — crypto.randomUUID() per request |
| T-13-17 (Prefetch cached nonce) | Mitigated — matcher.missing excludes prefetch requests |

---

## Known Stubs

None. All CSP directives are fully wired. No placeholder data flows to UI.

---

## Self-Check: PASSED

- `apps/website/lib/csp.ts` exists: FOUND
- `apps/website/proxy.ts` updated: FOUND (contains buildCspDirectives, Content-Security-Policy, next-router-prefetch)
- `apps/website/next.config.ts` cleaned: FOUND (no Report-Only, no cspDirectives, HSTS present)
- `docs/AUTH-FLOW.md` updated: FOUND (contains CSP Rollout section)
- Commits: 334384d, 09cdc90, 09932be — all in git log
