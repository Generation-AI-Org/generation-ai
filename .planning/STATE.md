---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: Monorepo Migration ✅ COMPLETE
current_plan: 13-04 COMPLETE → enforced CSP on website, branch pushed for Vercel Preview
status: unknown
last_updated: "2026-04-17T01:50:24.282Z"
progress:
  total_phases: 13
  completed_phases: 3
  total_plans: 28
  completed_plans: 19
  percent: 68
---

# Project State — Generation AI Monorepo

> Session-Brücke für Context nach /clear

## Current Status

**Milestone:** v2.0 Production Hardening
**Phase:** 13 Auth-Flow-Audit + CSP Reaktivierung (IN PROGRESS — Wave 2 complete)
**Current Plan:** 13-04 COMPLETE → enforced CSP on website, branch pushed for Vercel Preview
**Last Updated:** 2026-04-17
**Last Session:** 2026-04-17T01:50:24.277Z
**Site Status:** ✅ Live — Login auf tools.generation-ai.org funktioniert (Commit f5f9cb7)

## Session-Drop-Bug (f5f9cb7, 2026-04-17)

**Root Cause:** `apps/tools-app/app/auth/signout/route.ts` hatte GET-Handler → Next.js `<Link href="/auth/signout">` in AppShell + FilterBar wurde automatisch prefetched → Server rief `signOut()` bei jedem Page-Render auf → Session wurde ~1s nach Login zerstört.

**Fix:** Signout-Route auf POST-only, Links durch `<form method="POST">` ersetzt. Canonical Supabase-Pattern.

**Verifiziert via Playwright gegen Prod:** Login setzt Cookie, Reload persistiert, Navigation zu /settings hält Session.

## Next Up (geplant für nächste Session — nach /clear)

Luca möchte tools-app hochziehen als Basis für künftige Features. Dreistufiger Plan:

**Stufe 1 — Codebase-Map (als nächstes starten):**

- Command: `/gsd-map-codebase`
- Produziert strukturierte Docs in `.planning/intel/` (Tech-Stack, Architektur, Qualität, Pain-Points)
- Ergebnis: jede künftige Session kann Projekt in 80% verstehen ohne zu grep'en

**Stufe 2 — Auth-Flow-Audit (nach Stufe 1):**

- Jeden Auth-Pfad systematisch testen: Login (Passwort), Magic Link, Session-Refresh, Signout, Password-Reset, Cross-Domain (Website ↔ tools-app)
- Playwright-gestützt gegen Prod
- Ergebnis: `docs/AUTH-FLOW.md` mit Diagrammen + Bugs falls gefunden gefixt
- Als GSD-Phase planen (/gsd-plan-phase)

**Stufe 3 — Simplify-Pass tools-app (nach Stufe 2):**

- Tote Files löschen, inkonsistente Patterns vereinheitlichen, Naming fixen
- Basiert auf Findings aus Stufe 1+2

**Feature-Ideen für später (Luca hat Interesse):**

- Google OAuth-Login (UX-Win, ~1 Tag)
- Circle-Member-Status → Pro-Modus automatisch
- Smart-Links "Weiter im Circle"
- Password-Reset end-to-end testen (Code da, nie verifiziert)

**Wichtig für Claude bei Start:**

- Luca ist No-Code, braucht Erklärungen
- Bei Tech-Entscheidungen: Option zeigen, Tradeoff nennen, Empfehlung — nicht einfach machen
- Signup ist auf 503 disabled — nicht wieder aktivieren ohne expliziten Auftrag

## Auth Rewrite — DEPLOYED

**Root Cause (fixed):**

- Manueller `btoa(JSON.stringify(...))` Cookie-Write im tools-app inkompatibel mit `@supabase/ssr` native Base64-URL/Chunked-Encoding
- Doppel-Write Race zwischen custom `setAll` und `saveSessionToCookie`
- 3 parallele Auth-Implementierungen im Monorepo (packages/auth ungenutzt, zwei kaputte lokale Versionen)

**Fix (Phase 12, DEPLOYED):**

- `@genai/auth` als canonical implementation konsolidiert
- `updateSession()` middleware helper (Supabase canonical pattern)
- Alle manuellen `document.cookie`-Hacks entfernt (−360 Zeilen broken code)
- Cross-domain cookies via `NEXT_PUBLIC_COOKIE_DOMAIN=.generation-ai.org`
- Beide Apps: build ✓, tests 24/24 ✓, lint (nur pre-existing warnings)

**Commits (gepusht 2026-04-16):**

- `728386d` feat(auth): canonical @supabase/ssr helpers + cross-domain cookies
- `902f389` refactor(tools-app): migrate auth to @genai/auth, remove cookie hacks
- `4d3977d` refactor(website): migrate auth to @genai/auth + add session-refresh proxy
- `8cdc931` fix(auth): client-safe barrel, server code imports from subpath
- `6a7fca1` docs(auth): update flow docs for canonical pattern + add settings-todo

**Pending:**

1. ✓ `git push` → Production Deploy triggered
2. ⏳ Supabase Dashboard settings (siehe `.planning/phases/12-auth-rewrite/SETTINGS-TODO.md`)
3. ⏳ Login testen auf Production

## Progress

```
Phase 4: [████████░░] DSGVO & Legal (Code ✓, DPAs pending)
Phase 5: [████████░░] Security Headers (HSTS ✓, CSP geparkt)
Phase 6: [██████████] Monitoring COMPLETE
Phase 7: [██████████] Testing COMPLETE (CI Pipeline live)
Phase 8: [██████████] Performance & A11y COMPLETE
Phase 9: [██████████] Floating Chat Bubble COMPLETE
Phase 10: [████████░░] Voice Input (Code ✓, Testing pending)
Phase 11: [██████████] Performance Polish COMPLETE
Phase 12: [██████████] Auth Rewrite DEPLOYING
```

## v2.0 Production Hardening — COMPLETE ✓

Alle Code-Tasks erledigt. Nur noch Admin-Aufgaben offen:

- ⏳ DPA Supabase (angefragt)
- ⏳ DPA Vercel (braucht Pro-Plan)

## Erledigt (2026-04-14)

- ✓ Agent auf Gemini 3 Flash (71s → ~10s)
- ✓ SpeedInsights re-enabled
- ✓ Sentry Error-Tracking eingerichtet
- ✓ Better Stack Uptime-Monitoring eingerichtet
- ✓ ZHIPU_API_KEY von Vercel gelöscht
- ✓ **Dokumentation erstellt:**
  - `docs/ARCHITECTURE.md` — System-Uebersicht, Datenfluss, Schema
  - `docs/API.md` — Alle API-Endpoints dokumentiert
  - `docs/DEPLOYMENT.md` — Deploy-Flow, Env-Vars, Setup
  - `CLAUDE.md` erweitert mit Session-Start-Checkliste
  - `packages/ui/README.md` — Erklaerung warum leer
  - Memory-Datei aktualisiert

## Backlog (nice-to-have)

1. **CSP Header** — Edge Runtime Issue, geparkt

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

### Phase 8 COMPLETE

- Lighthouse + A11y Audit complete (LIGHTHOUSE-AUDIT.md)
- Google Fonts self-hosting verified (no third-party requests)
- WCAG 2.1 AA violations identified and FIXED (6 issues in tools-app)
- Skip-Link, aria-labels, aria-pressed, focus-visible styles implemented
- All Critical/Serious axe violations resolved

### Phase 9 COMPLETE

- Floating Chat Bubble mit Kiwi-Gesicht (Augen folgen Maus)
- Glassmorphism Popup mit Glow-Effekten
- Tool-Bibliothek hat jetzt volle Breite
- Lite/Pro Badge je nach Login-Status
- Mobile Tabs entfernt
- Voice/Link Buttons vorbereitet (disabled)

## Phase 10: Voice Input — IN TESTING

**Code complete, needs manual browser testing.**

Built:

- ✓ `/api/voice/token` — Token endpoint für Deepgram
- ✓ `useDeepgramVoice` — Hook mit WebSocket streaming
- ✓ Real audio visualization via Web Audio API
- ✓ Live interim transcript während Aufnahme
- ✓ VoiceInputButton mit echten Frequenz-Bars
- ✓ Integration in FloatingChat

**Testing Checklist:**

- [ ] Chrome Desktop: Voice startet, Bars animieren, Text erscheint
- [ ] Safari Desktop: Kein AudioContext-Fehler
- [ ] Firefox Desktop: audio/webm funktioniert
- [ ] iOS Safari: AudioContext nicht suspended
- [ ] Android Chrome: Alles funktioniert

**Setup Required:**

- `DEEPGRAM_API_KEY` in `.env.local` ✓
- `DEEPGRAM_API_KEY` in Vercel Env-Vars (für Production)

## Next Step

Manuelles Testing auf verschiedenen Browsern.

### Phase 11 COMPLETE — Performance Polish

- Console.logs entfernt (nur Client-side dev noise, API error logs bleiben)
- MarkdownContent memoized mit React.memo + useMemo
- Audio-Bars: Framer Motion → CSS scaleY (GPU-beschleunigt)
- ContentCard memoized
- Inline animation styles → CSS Utility-Klassen
- will-change Hints für Animationen
- Neue CSS Klassen: animate-dropdown, animate-slide-in, dropdown-glow

## Roadmap Evolution

- Phase 9 added: Floating Chat Bubble (2026-04-15)
- Phase 9 COMPLETE: Floating Chat implemented (2026-04-15)
- Phase 11 added: Performance Polish (2026-04-15)
- Phase 11 COMPLETE: All optimizations applied (2026-04-15)
- Phase 12 added: Auth Rewrite (2026-04-16)
- Phase 12 COMPLETE: @genai/auth canonical + Session-Drop-Fix (2026-04-17)
- Phase 13 added: Auth-Flow-Audit + CSP Reaktivierung (2026-04-17)
- Roadmap retroaktiv aktualisiert: Phase 11+12 als COMPLETE nachgetragen (2026-04-17)
- Phase 13 Plan 01 COMPLETE: Test-Infrastructure Scaffold (Wave 0) — fixtures, helpers, auth.spec.ts skeleton, 4 tests grün gegen Prod (2026-04-17)
- Phase 13 Plan 02 COMPLETE: E2E Auth Audit — 10 active tests, all 6 auth paths verified against production, 2 findings (F1 backlogged, F2 fixed in 582cd63), docs/AUTH-FLOW.md audit section created (2026-04-17)
