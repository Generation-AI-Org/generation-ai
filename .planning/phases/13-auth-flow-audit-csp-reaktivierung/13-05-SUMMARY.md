---
phase: 13
plan: 05
subsystem: tools-app/security
tags: [csp, security, middleware, nonce, deepgram, sentry, clearbit]
dependency_graph:
  requires: [13-02]
  provides: [tools-app-csp-enforced]
  affects: [apps/tools-app/proxy.ts, apps/tools-app/lib/csp.ts, docs/AUTH-FLOW.md]
tech_stack:
  added: []
  patterns: [nonce-based-csp, strict-dynamic, csp-on-updateSession-response]
key_files:
  created:
    - apps/tools-app/lib/csp.ts
  modified:
    - apps/tools-app/proxy.ts
    - docs/AUTH-FLOW.md
decisions:
  - "Set CSP on updateSession() response, not a new NextResponse (Pitfall 1 — preserves auth cookies)"
  - "Exact Sentry DE-Region DSN host instead of *.sentry.io wildcard"
  - "Deepgram WSS + HTTPS both in connect-src (Voice feature requires both)"
  - "Clearbit in img-src (not connect-src) — ToolLogo uses <img> tag"
  - "Prefetch excluded from matcher via missing-header check (T-13-23 nonce-cache)"
metrics:
  duration: ~20min
  completed: 2026-04-17
  tasks_completed: 3
  tasks_total: 4
  files_changed: 3
---

# Phase 13 Plan 05: CSP Aktivierung tools-app Summary

tools-app erhält erstmals enforced Content-Security-Policy via nonce-basiertem proxy.ts-Pattern — mit Sentry DE-Region, Deepgram WSS, Clearbit img-src und Vercel Speed Insights neben Supabase.

## What Was Built

### apps/tools-app/lib/csp.ts (NEW)

Pure function `buildCspDirectives(nonce: string, isDev: boolean): string` mit allen tools-app-spezifischen Hosts:

- `script-src`: nonce + strict-dynamic + Vercel Speed Insights loader; unsafe-eval nur in dev
- `style-src`: unsafe-inline (Tailwind v4)
- `img-src`: Clearbit logo CDN (`https://logo.clearbit.com`)
- `connect-src`: Supabase (https+wss), Sentry DE-Region exakt, Deepgram (https+wss), Vercel Speed Insights + Web Vitals
- `frame-ancestors 'none'`, `form-action 'self'`, `upgrade-insecure-requests`

### apps/tools-app/proxy.ts (UPDATED)

Von 13 Zeilen (nur updateSession) auf 32 Zeilen mit vollständigem CSP-Pattern:

1. `updateSession(request)` — Session-Refresh zuerst, Response-Objekt bleibt dasselbe (Pitfall 1)
2. `crypto.randomUUID()` → base64-encoded nonce
3. `buildCspDirectives(nonce, isDev)` → CSP-String
4. `Content-Security-Policy` + `x-nonce` auf Response gesetzt
5. Matcher: api-routes ausgeschlossen, prefetch via `missing`-Condition ausgeschlossen

## Task Status

| Task | Name | Status | Commit |
|------|------|--------|--------|
| 1 | lib/csp.ts erstellen | COMPLETE | 64e845c |
| 2 | proxy.ts erweitern | COMPLETE | 8b6868d |
| 3 | Preview-Deploy Checkpoint | BLOCKED (pre-existing Vercel preview env issue) | — |
| 4 | AUTH-FLOW.md Update | COMPLETE (build-time doc) | 38d708e |

## Preview Deploy Status

Der Vercel-Preview-Deploy schlug fehl — pre-existing Issue: Vercel Preview-Environments haben keine env vars konfiguriert (`NEXT_PUBLIC_SUPABASE_URL` etc. fehlen). Gleiches Muster bei allen vorherigen Preview-Deploys (feat/ui-polish sha df7cb45 → auch failure). Production deployments funktionieren.

TypeScript-Check und alle 15 Unit-Tests sind grün. Die Änderungen selbst sind korrekt.

## Production Deploy Gate

Per CLAUDE.md: Kein Prod-Deploy ohne Lucas OK.

Prod-Deploy erfolgt wenn Luca `feat/auth-flow-audit` → `main` merged. Vercel deployed dann automatisch.

Post-Deploy Verification Commands:
```bash
curl -sI https://tools.generation-ai.org | grep -i "content-security-policy"
# Expected: header present with nonce-, o4511218002362368, api.deepgram.com

securityheaders.com: https://securityheaders.com/?q=https%3A%2F%2Ftools.generation-ai.org
# Target: A or A+
```

## Rollback

```bash
git revert 8b6868d 64e845c
git push origin feat/auth-flow-audit
```

## Deviations from Plan

### Pre-existing Vercel Preview Env Issue

**Found during:** Task 3 (Preview-Deploy Check)
**Issue:** Alle Vercel Preview-Deployments auf diesem Repo schlagen fehl wegen fehlender env vars in der Preview-Umgebung. Kein neues Problem unserer Änderungen.
**Fix:** Nicht anwendbar — pre-existing, out-of-scope. Verifikation stattdessen via TypeScript + Unit-Tests lokal.
**Impact:** Task 3 Checkpoint konnte nicht vollständig abgearbeitet werden (kein lauffähiger Preview). AUTH-FLOW.md-Sektion als build-time-Dokumentation committed.

### unsafe-inline Count in Acceptance Criteria

Plan-Check `grep -c "unsafe-inline" apps/tools-app/lib/csp.ts` → 1 erwartet, 2 tatsächlich. Weil die Comment-Zeile über `style-src` den String "unsafe-inline" enthält. Tatsächliche Directive hat es nur einmal (nur style-src). Sicherheitsanforderung erfüllt — kein unsafe-inline in script-src.

## Known Stubs

None — keine Stub-Patterns in csp.ts oder proxy.ts.

## Threat Flags

None — keine neuen Trust-Boundary-Surfaces eingeführt. CSP reduziert Attack-Surface (XSS-Mitigierung T-13-18 bis T-13-24 aus PLAN.md Threat Register implementiert).

## Self-Check

## Self-Check: PASSED

| Item | Status |
|------|--------|
| apps/tools-app/lib/csp.ts | FOUND |
| apps/tools-app/proxy.ts | FOUND |
| docs/AUTH-FLOW.md | FOUND |
| 13-05-SUMMARY.md | FOUND |
| Commit 64e845c (csp.ts) | FOUND |
| Commit 8b6868d (proxy.ts) | FOUND |
| Commit 38d708e (AUTH-FLOW.md) | FOUND |
