---
phase: 05-security-headers
plan: 02
subsystem: tools-app
tags: [security, csp, hsts, headers]

dependency_graph:
  requires: []
  provides: [tools-app-hsts, tools-app-csp-report-only, nonce-generation]
  affects: [tools-app-security-posture]

tech_stack:
  added: []
  patterns: [nonce-based-csp, proxy-middleware]

key_files:
  created: []
  modified:
    - apps/tools-app/next.config.ts
    - apps/tools-app/proxy.ts

decisions:
  - CSP in Report-Only mode first for safe rollout
  - Nonce-based CSP for dynamic app (stronger than unsafe-inline)
  - proxy.ts must be in project root for Next.js 16

metrics:
  duration: ~3 minutes
  completed: 2026-04-14T00:23:00Z
  tasks: 3/3
  files: 2
---

# Phase 05 Plan 02: tools-app HSTS + Nonce-based CSP Summary

Nonce-basierte CSP und HSTS fuer tools-app implementiert mit Report-Only Mode zum sicheren Testen.

## What Was Done

### Task 1: HSTS zu next.config.ts hinzugefuegt
- HSTS Header mit `max-age=63072000; includeSubDomains; preload` hinzugefuegt
- Referrer-Policy von `origin-when-cross-origin` zu `strict-origin-when-cross-origin` korrigiert
- Commit: `ffeba00`

### Task 2: Nonce-basierte CSP in proxy.ts
- Nonce-Generierung pro Request via `crypto.randomUUID()`
- CSP-Direktiven:
  - `script-src 'self' 'nonce-...' 'strict-dynamic'` (+ `'unsafe-eval'` in dev)
  - `style-src 'self' 'nonce-...'` (+ `'unsafe-inline'` in dev)
  - `connect-src 'self' https://wbohulnuwqrhystaamjc.supabase.co`
  - `frame-ancestors 'none'`
- x-nonce Header fuer Server Components
- CSP-Report-Only Header auf Response
- Commit: `d8323ea`

### Task 3: Lokaler Test
- Alle Security Headers verifiziert
- Nonce korrekt in CSP und link-Tags
- Auth-Flow weiterhin funktional

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] proxy.ts Location**
- **Found during:** Task 3
- **Issue:** proxy.ts war in `app/` statt im Projekt-Root, dadurch wurde der CSP-Header nicht angewendet
- **Fix:** proxy.ts von `app/proxy.ts` nach `proxy.ts` (Projekt-Root) verschoben
- **Files modified:** apps/tools-app/proxy.ts
- **Commit:** `72ba15b`

## Deferred Items

Pre-existing lint errors in tools-app (not caused by this plan):
- `AppShell.tsx`, `AuthProvider.tsx`, `ThemeProvider.tsx`: setState in useEffect warnings
- `ChatPanel.tsx`: a-Tags statt Next.js Link
- Various unused variable warnings

## Commits

| Hash | Type | Description |
|------|------|-------------|
| ffeba00 | feat | Add HSTS and fix Referrer-Policy |
| d8323ea | feat | Implement nonce-based CSP |
| 72ba15b | fix | Move proxy.ts to project root |

## Verification Results

- [x] `pnpm build --filter=@genai/tools-app` erfolgreich
- [x] HSTS Header in Response: `max-age=63072000; includeSubDomains; preload`
- [x] CSP-Report-Only Header mit Nonce in Response
- [x] Build zeigt "Proxy (Middleware)" - korrekt erkannt
- [x] Auth-Flow funktioniert (Supabase in connect-src)

## Self-Check: PASSED

- [x] apps/tools-app/next.config.ts exists and contains HSTS
- [x] apps/tools-app/proxy.ts exists and contains nonce generation
- [x] Commit ffeba00 exists
- [x] Commit d8323ea exists
- [x] Commit 72ba15b exists
