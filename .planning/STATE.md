# Project State — Generation AI Monorepo

> Session-Brücke für Context nach /clear

## Current Status

**Milestone:** v2.0 Production Hardening
**Phase:** Phase 8 in progress (Plan 1/2 complete)
**Last Updated:** 2026-04-14T03:15
**Site Status:** ✓ ONLINE (tools.generation-ai.org)

## Progress

```
Phase 4: [████████░░] DSGVO & Legal (Code ✓, DPAs pending)
Phase 5: [████░░░░░░] Security Headers (CSP disabled - Edge Runtime issue)
Phase 6: [███░░░░░░░] Monitoring (Health ✓, SpeedInsights broken)
Phase 7: [██████████] Testing COMPLETE (CI Pipeline live)
Phase 8: [█████░░░░░] Performance & A11y (1/2 plans)
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

### Phase 7 COMPLETE
- Vitest + RTL setup in packages/auth (4 tests)
- Vitest + RTL setup in apps/tools-app (11 tests)
- Vitest + RTL setup in apps/website (5 tests)
- Playwright E2E package created (packages/e2e-tools)
- API Route Tests: /api/health (1 test), /api/chat (4 tests)
- E2E Specs: auth.spec.ts (4 tests), chat.spec.ts (3 tests)
- turbo.json: test, test:watch, e2e Tasks mit Caching
- GitHub Actions CI Workflow (.github/workflows/ci.yml)
- Total: 20 unit tests passing, FULL TURBO caching

### Phase 8 (in progress)
- Lighthouse + A11y Audit complete (LIGHTHOUSE-AUDIT.md)
- Google Fonts self-hosting verified (no third-party requests)
- WCAG 2.1 AA violations identified (6 issues in tools-app)
- Fixes pending in Plan 08-02

## Next Step

Phase 8 Plan 02: A11y Fixes (`/gsd-execute-phase 8`)
