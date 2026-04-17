# Phase 13: Auth-Flow-Audit + CSP Reaktivierung - Context

**Gathered:** 2026-04-17
**Status:** Ready for planning
**Source:** Synthesized from STATE.md + CONCERNS.md (manual, in lieu of discuss-phase)

<domain>
## Phase Boundary

Diese Phase liefert:
1. **Systematisches E2E-Audit aller Auth-Pfade** gegen Production (generation-ai.org + tools.generation-ai.org), verifiziert per Playwright, dokumentiert in `docs/AUTH-FLOW.md` mit Mermaid-Diagrammen.
2. **Gefundene Auth-Bugs** (kleine Fixes) inline behoben, größere als Backlog-Items eingetragen.
3. **CSP reaktiviert und scharf geschaltet** auf beiden Apps — website von Report-Only auf enforced, tools-app neu implementiert. Edge-Runtime-Blocker gelöst.
4. **Konsolidierungs-Reste** aus Phase 12 überprüft (tools-app/lib/auth.ts, website/lib/supabase/) und bereinigt, falls Drift zu @genai/auth existiert.

NICHT in dieser Phase:
- OAuth-Implementation (Google/Apple/GitHub) → Backlog
- Circle-Member-Detection → Backlog
- Supabase Email-Template-Customization (Dashboard-Only, kein Code) → Backlog
- Signup-Reaktivierung (bleibt laut STATE.md auf 503)

</domain>

<decisions>
## Implementation Decisions

### Audit-Scope (6 Pfade)
- **D-01:** Audit deckt diese Auth-Pfade ab:
  1. Login via Email+Passwort (tools.generation-ai.org)
  2. Login via Magic Link (Email-Flow end-to-end)
  3. Session-Refresh (Token-Rotation via middleware)
  4. Signout (POST-only, verifiziert dass keine Prefetch-Regression wiederkommt)
  5. Password-Reset End-to-End (Request → Email → /auth/set-password → Re-Login)
  6. Cross-Domain Session: Login auf website.generation-ai.org → Session gültig auf tools.generation-ai.org

### Testing-Strategie
- **D-02:** Audit läuft **zweigleisig**: (a) Manuelle Playwright-MCP-Runs gegen Prod mit Screenshots + Logs dokumentiert, (b) reproduzierbare E2E-Tests in `packages/e2e-tools/tests/auth.spec.ts` erweitert/neu angelegt, sodass CI dies zukünftig automatisch deckt.
- **D-03:** Playwright-Runs dokumentieren Network-Requests (wichtig für Cookie-Set/-Clear-Verhalten), Console-Errors, und Set-Cookie-Header (Domain-Scope `.generation-ai.org` verifizieren).
- **D-04:** Test-User: separater Testaccount bei Supabase (Credentials via `.env.test.local` für E2E-Package, nicht committen). Wenn kein Test-Account existiert → Plan enthält Task ihn anzulegen.

### Gefundene Bugs — Fix-Policy
- **D-05:** Kleine Fixes (< 30 Zeilen, klarer Root-Cause, gleicher Scope) werden inline in dieser Phase behoben und in separaten atomic commits gepusht.
- **D-06:** Größere Findings (Refactorings, neue Features, UX-Gaps) werden in `.planning/BACKLOG.md` eingetragen mit Link auf AUTH-FLOW.md-Abschnitt — nicht in dieser Phase implementiert, um Scope zu halten.
- **D-07:** Password-Reset-Flow: Wenn Audit zeigt, dass der Flow kaputt ist (Token-Expiry ohne Feedback, Email-Template-Issue, Reset-Endpoint fehlerhaft) → **inline fixen**, da Selbst-Service-Lücke für User schmerzhaft ist. Ausnahme: Wenn der Fix "UI neu bauen" bedeutet (Forgot-Password-Link auf Login-Page) → Backlog.

### CSP-Strategie
- **D-08:** Ziel-Directives (baseline, wird im Research verfeinert):
  - `default-src 'self'`
  - `script-src 'self' 'nonce-{random}' https://*.sentry.io https://*.vercel-insights.com`
  - `style-src 'self' 'unsafe-inline'` (Tailwind v4 generiert inline styles — `unsafe-inline` für styles akzeptabel, für scripts NICHT)
  - `connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.sentry.io https://api.deepgram.com wss://api.deepgram.com https://api.resend.com`
  - `img-src 'self' data: https:`
  - `frame-ancestors 'none'`
  - `form-action 'self'`
- **D-09:** Website-App: CSP-Report-Only → CSP enforced. Jeder removed violation-report wird verifiziert (Browser DevTools + securityheaders.com).
- **D-10:** tools-app: CSP neu hinzufügen. Edge-Runtime-Blocker aus STATE.md klären — wahrscheinlich via middleware nonce-injection (Next.js 16 Pattern). Research-Agent klärt die korrekte Next.js-16-CSP-Implementierung.
- **D-11:** Jede App bekommt `Permissions-Policy` und `Referrer-Policy: strict-origin-when-cross-origin` mit (falls noch nicht gesetzt).
- **D-12:** Verifikation: `securityheaders.com` für beide Domains auf A+ (Ziel, min. A). Keine CSP-Violations in Console nach Deploy (manuell + Playwright-Check).

### Konsolidierungs-Prüfung (Phase-12-Reste)
- **D-13:** Audit: `apps/tools-app/lib/auth.ts` und `apps/website/lib/supabase/` werden gegen `packages/auth` verglichen. Duplicate logic → durch Imports aus @genai/auth ersetzen. Nur wenn ohne Regression möglich (build + tests grün).
- **D-14:** Wenn Konsolidierung non-trivial ist (> 50 Zeilen Änderung oder Breaking-Risk) → Backlog, nicht in dieser Phase.

### Dokumentation
- **D-15:** `docs/AUTH-FLOW.md` enthält:
  - Übersichts-Diagramm (Mermaid) aller 6 Pfade mit Actors (Browser, Website, tools-app, Supabase, Resend)
  - Pro Pfad: Sequenz-Diagramm, Cookie-Verhalten, mögliche Fehler-States, Verifizierungs-Kommando
  - Findings-Tabelle mit Status (fixed / backlog'd / verified-ok)
  - Link zu `SETTINGS-TODO.md` falls Supabase-Dashboard-Einstellungen nötig
- **D-16:** `docs/ARCHITECTURE.md` bekommt Update-Link auf AUTH-FLOW.md im Auth-Abschnitt.

### Signup bleibt disabled
- **D-17:** Signup-Endpoint bleibt auf 503. Nicht reaktivieren in dieser Phase. Nur dokumentieren in AUTH-FLOW.md als "currently disabled" mit Reason-Link.

### Claude's Discretion
- Exakte Test-Dateistruktur (Split in mehrere specs vs. eine große)
- Mermaid-Diagramm-Detaillierungsgrad
- Welche konkreten CSP-Directives pro Domain (abhängig vom Research-Ergebnis zu Sentry/Vercel-Insights-Hosts)
- Reihenfolge der Audit-Pfade während Ausführung

</decisions>

<specifics>
## Specific Ideas

- CSP-Pattern muss kompatibel sein mit Sentry (bereits integriert), Vercel Speed Insights, Resend (Email embedded preview?), Deepgram (WebSocket), Supabase Auth (WSS für realtime).
- "Session-Drop-Bug f5f9cb7" war ein Prefetch-Problem — Playwright-Tests müssen explizit Prefetch-Szenarien testen (Mouse-Hover auf Links, Page-Navigation).
- Signout-Route muss POST-only bleiben — Regression-Test einbauen (GET → 405).
- Cross-Domain-Test: Cookie mit `Domain=.generation-ai.org` muss auf BEIDEN Subdomains funktionieren. Playwright mit zwei baseURL-Contexts.
- Password-Reset-Email-Template hat "hellen Hintergrund" laut CONCERNS.md — das ist Dashboard-Config (Backlog).

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Projekt-State + History
- `.planning/STATE.md` — Projekt-Status, Phase-12-Deploy-Details, Session-Drop-Bug-Root-Cause
- `.planning/codebase/CONCERNS.md` — CSP-Disable-Reason, Auth-Konsolidierungs-Reste, Password-Reset-Untested-Status, Test-Coverage-Gaps
- `docs/ARCHITECTURE.md` — Auth-Stack-Übersicht, Shared-Cookie-Pattern
- `CLAUDE.md` — Projekt-Regeln (kein Push ohne OK, kein Prod-Deploy ohne OK)

### Auth-Implementation
- `packages/auth/src/` — Canonical `@genai/auth` implementation (read BEFORE konsolidierungs-prüfung)
- `apps/tools-app/lib/auth.ts` — Legacy-Pfad, prüfen ob Drift existiert
- `apps/website/lib/supabase/` — client.ts + server.ts, prüfen ob Duplikate zu @genai/auth
- `apps/tools-app/app/auth/signout/route.ts` — POST-only, Regression-Sensor
- `apps/tools-app/app/auth/set-password/page.tsx` — 139 Zeilen, ungetesteter Password-Reset-Endpoint
- `.planning/phases/12-auth-rewrite/` — Kontext + SETTINGS-TODO.md

### Security Headers
- `apps/website/next.config.ts` (Zeilen 7–19, 49–51) — aktueller Report-Only CSP
- `apps/tools-app/next.config.ts` (Zeilen 34–76) — Headers, kein CSP
- Phase 5 ROADMAP-Einträge — "CSP Enforcing + securityheaders.com Verifikation" (offen aus Phase 5)

### Testing
- `packages/e2e-tools/tests/auth.spec.ts` — existierende E2E, zu erweitern
- `packages/e2e-tools/` — Playwright-Setup, Base-URLs

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `@genai/auth` package: `createClient`, `createServerClient`, `updateSession` middleware-helper (Phase 12 canonical pattern)
- `packages/e2e-tools/`: Playwright config + existing auth.spec.ts (minimal, 4 tests)
- Sentry + Better Stack monitoring: nach CSP-Deploy können Alerts CSP-Violations erfassen
- `apps/website/next.config.ts` CSP-Report-Only Template: als Ausgangspunkt für enforced Version

### Established Patterns
- **Cross-Domain Cookies:** `NEXT_PUBLIC_COOKIE_DOMAIN=.generation-ai.org` (Phase 12)
- **Middleware:** `updateSession()` läuft in beiden Apps — CSP-Header kann dort pro-Request mit Nonce gesetzt werden (Next.js 16 Pattern für Edge-kompatibel)
- **Security-Headers:** statisch in `next.config.ts` — ausreichend für HSTS/Referrer-Policy, aber CSP braucht dynamisches Nonce → middleware.

### Integration Points
- Supabase Auth-Endpoints (Login, Magic Link, Password-Reset) laufen über `https://*.supabase.co` — muss in CSP `connect-src` + `form-action` (bei Magic-Link-Callbacks).
- Sentry Beacon + Speed Insights: `script-src` + `connect-src` Hosts müssen freigegeben werden.
- Deepgram WebSocket: `wss://api.deepgram.com` in `connect-src`.
- `apps/website/app/api/auth/refresh-session/` (existing): Cross-domain session refresh proxy — muss im Audit als eigener Pfad getestet werden.

</code_context>

<deferred>
## Deferred Ideas

- **OAuth-Login** (Google/Apple/GitHub): Separate Phase (Feature, nicht Hardening)
- **Circle-Member-Detection** für Pro-Mode: Separate Phase (braucht Circle-API)
- **Supabase Email-Template-Customization** (dark mode): Backlog (Dashboard-only, kein Code)
- **Signup-Reaktivierung**: Out of scope, laut STATE.md disabled-by-design bis explizit freigegeben
- **Password-Reset-UI auf Login-Page** ("Forgot password?" Link): Backlog (nur wenn Audit zeigt dass set-password Endpoint funktioniert)
- **FloatingChat-Refactoring** (1113 Zeilen): nicht Auth-related, Backlog
- **Upstash / Supabase Scaling**: Infra-Entscheidungen, Backlog

</deferred>

---

*Phase: 13-auth-flow-audit-csp-reaktivierung*
*Context gathered: 2026-04-17 (synthesized from STATE.md + CONCERNS.md — no discuss-phase run)*
