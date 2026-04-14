---
phase: 06-monitoring
plan: 01
subsystem: monitoring
tags: [monitoring, cwv, health-check, vercel]
dependency-graph:
  requires: []
  provides: [speed-insights, health-endpoint]
  affects: [website-layout, tools-app-layout]
tech-stack:
  added: ["@vercel/speed-insights"]
  patterns: [vercel-monitoring]
key-files:
  created:
    - apps/tools-app/app/api/health/route.ts
  modified:
    - apps/website/app/layout.tsx
    - apps/tools-app/app/layout.tsx
    - apps/website/package.json
    - apps/tools-app/package.json
decisions:
  - Speed Insights statt Sentry Performance fuer CWV (simpler, built-in)
  - Health Endpoint ohne DB-Check (reicht fuer Uptime Monitoring)
metrics:
  duration: 86s
  completed: 2026-04-14
---

# Phase 06 Plan 01: Speed Insights + Health Endpoint Summary

Vercel Speed Insights fuer Core Web Vitals Monitoring in beiden Apps, plus Health Check Endpoint fuer Uptime Monitoring.

## Tasks Completed

| Task | Description | Commit | Status |
|------|-------------|--------|--------|
| 1 | Speed Insights in beide Apps installieren | 37c12f8 | Done |
| 2 | Health Check Endpoint in tools-app | cf1f7b5 | Done |

## Implementation Details

### Task 1: Speed Insights

- `@vercel/speed-insights` in website und tools-app installiert
- `SpeedInsights` Component in beide Root-Layouts eingefuegt
- Keine Konfiguration noetig — funktioniert automatisch auf Vercel

### Task 2: Health Endpoint

- `/api/health` gibt `{ status: "ok", timestamp: "..." }` zurueck
- Fuer Better Stack oder andere Uptime-Monitore

## Deviations from Plan

None — Plan genau wie geschrieben ausgefuehrt.

## Verification

- `pnpm build` erfolgreich
- `/api/health` Route im Build-Output sichtbar
- SpeedInsights Import in beiden layout.tsx vorhanden

## Self-Check: PASSED

- [x] apps/tools-app/app/api/health/route.ts exists
- [x] SpeedInsights in apps/website/app/layout.tsx
- [x] SpeedInsights in apps/tools-app/app/layout.tsx
- [x] Commit 37c12f8 exists
- [x] Commit cf1f7b5 exists

## Next Steps (Post-Deploy)

1. Nach Vercel Deploy: CWV-Tab im Dashboard pruefen
2. Better Stack Account erstellen, tools.generation-ai.org/api/health monitoren
3. Phase 06 Plan 02: Sentry Error Tracking einrichten
