# Project State — Generation AI Monorepo

> Session-Brücke für Context nach /clear

## Current Status

**Milestone:** v2.0 Production Hardening
**Phase:** Phase 7 in progress
**Last Updated:** 2026-04-14T02:54
**Site Status:** ✓ ONLINE (tools.generation-ai.org)

## Progress

```
Phase 4: [████████░░] DSGVO & Legal (Code ✓, DPAs pending)
Phase 5: [████░░░░░░] Security Headers (CSP disabled - Edge Runtime issue)
Phase 6: [███░░░░░░░] Monitoring (Health ✓, SpeedInsights broken)
Phase 7: [████      ] Testing (Plan 02 done: Website Vitest + E2E Package)
Phase 8: [          ] Performance & A11y
```

## Backlog (aus Parallel-Session)

1. **CSP Header** — Edge Runtime kompatibel machen (Phase 5 incomplete)
2. **SpeedInsights** — `pnpm approve-builds` fixen
3. **LLM Keys** — auf Vercel setzen, dann in env.ts required machen
4. **DPAs** — Supabase, Vercel, Resend aktivieren

## Completed Code Tasks

### Phase 4 ✓
- Impressum aktualisiert (DDG, Telefon-Placeholder)
- Datenschutzerklärung aktualisiert (TDDDG, Claude API)
- tools-app Legal Pages erstellt
- Account-Delete-Funktion implementiert

### Phase 5 (partial)
- HSTS + Standard Headers ✓
- CSP ✗ (disabled wegen Edge Runtime)

### Phase 6 (partial)
- /api/health ✓
- SpeedInsights ✗ (disabled wegen pnpm)

## Live URLs

- **Website:** https://generation-ai.org
- **tools-app:** https://tools.generation-ai.org ✓ ONLINE
- **GitHub:** https://github.com/Generation-AI-Org/generation-ai

### Phase 7 (in progress)
- Vitest + RTL setup in packages/auth (4 tests)
- Vitest + RTL setup in apps/tools-app (6 tests)
- Vitest + RTL setup in apps/website (5 tests)
- Playwright E2E package created (packages/e2e-tools)

## Next Step

Phase 7 Plan 03: API Route Tests (`/gsd-execute-phase 7`)
