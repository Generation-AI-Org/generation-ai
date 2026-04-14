---
phase: 05-security-headers
plan: 01
subsystem: infra
tags: [security-headers, hsts, csp, next.js]

requires:
  - phase: 04-dsgvo-legal
    provides: Legal pages (Datenschutz references CSP)
provides:
  - HSTS header with preload for HTTPS enforcement
  - Standard security headers (X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy)
  - CSP in Report-Only mode for testing
affects: [05-02-PLAN, 05-03-PLAN, tools-app-security]

tech-stack:
  added: []
  patterns:
    - "Security headers via next.config.ts headers() function"
    - "CSP Report-Only mode before enforcing"
    - "Dev-specific unsafe-eval for HMR"

key-files:
  created: []
  modified:
    - apps/website/next.config.ts

key-decisions:
  - "CSP Report-Only first, not enforcing - allows testing without breaking functionality"
  - "unsafe-inline for static build - Nonces would require dynamic rendering"

patterns-established:
  - "Security headers pattern: Define directives array, join with semicolons"
  - "Dev mode check: isDev constant for development-specific CSP directives"

requirements-completed: [R1.1, R1.2, R1.4, R1.5]

duration: 1min
completed: 2026-04-14
---

# Phase 5 Plan 01: Website Security Headers Summary

**HSTS mit preload + alle Standard Security Headers + CSP in Report-Only Mode via next.config.ts headers()**

## Performance

- **Duration:** ~1 min
- **Started:** 2026-04-14T00:19:38Z
- **Completed:** 2026-04-14T00:20:28Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments

- HSTS Header aktiv (max-age=63072000; includeSubDomains; preload)
- Alle 5 Standard Security Headers implementiert
- CSP in Report-Only Mode mit Supabase connect-src
- Dev-Mode Support (unsafe-eval fuer HMR)

## Task Commits

1. **Task 1: Security Headers + CSP-Report-Only** - `89470b5` (feat)
2. **Task 2: Lokaler Test** - Verification only, no commit needed

## Files Modified

- `apps/website/next.config.ts` - Security headers configuration with headers() function

## Decisions Made

- **CSP Report-Only Mode:** Violations werden geloggt aber nicht geblockt - erlaubt sicheres Testen vor Enforcement
- **unsafe-inline statt Nonces:** Website ist primaer statisch, Nonces wuerden dynamic rendering erzwingen

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- Port 3000 war bereits belegt (Dev-Server lief), curl konnte trotzdem die Headers vom laufenden Server verifizieren

## Next Phase Readiness

- Website Security Headers vollstaendig
- Bereit fuer 05-02: tools-app Security Headers (Nonce-basiertes CSP)
- CSP muss nach Produktions-Test von Report-Only zu Enforcing gewechselt werden (separater Plan)

## Self-Check: PASSED

- FOUND: apps/website/next.config.ts
- FOUND: 89470b5

---
*Phase: 05-security-headers*
*Completed: 2026-04-14*
