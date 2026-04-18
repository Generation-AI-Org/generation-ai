# Roadmap — Generation AI

## Status

- ✅ **v1.0 Monorepo Migration** — shipped 2026-04-14
- ✅ **v2.0 Production Hardening** — shipped 2026-04-17 (Release v4.1.0)
- 🚧 **v3.0 UX Polish & Feature Expansion** — Phases 14-17 (in progress)

---

<details>
<summary>Milestone v1.0: Monorepo Migration ✅ COMPLETE</summary>

## Milestone v1.0: Monorepo Migration ✅ COMPLETE

| Phase | Name | Status |
|-------|------|--------|
| 1 | App Migration | ✅ Complete |
| 2 | Shared Packages | ✅ Complete |
| 3 | Deploy & Archive | ✅ Complete |

</details>

---

<details>
<summary>Milestone v2.0: Production Hardening ✅ COMPLETE (Release v4.1.0)</summary>

## Milestone v2.0: Production Hardening ✅ COMPLETE

| Phase | Name | Goal | Requirements |
|-------|------|------|--------------|
| 4 | DSGVO & Legal | Rechtliche Compliance sicherstellen | R2 |
| 5 | Security Headers | Security Headers + CSP implementieren | R1 |
| 6 | Monitoring | Error Tracking + Uptime Monitoring | R3 |
| 7 | Testing | Test-Infrastruktur aufbauen | R4 |
| 8 | Performance & A11y | Lighthouse Audit + Fixes | R5 |

---

## Phase 4: DSGVO & Legal

**Goal:** Rechtliche Compliance fuer DACH-Markt sicherstellen.

**Plans:** 3 plans

Plans:
- [x] 04-01-PLAN.md — Impressum und Datenschutzerklaerung aktualisieren (DDG, TDDDG, Claude API)
- [x] 04-02-PLAN.md — Account-Delete-Funktion in tools-app (Art. 17 DSGVO)
- [ ] 04-03-PLAN.md — DPA-Dokumentation (Supabase, Vercel, Resend)

**Scope:**
- Impressum auf beiden Domains pruefen/vervollstaendigen
- Datenschutzerklaerung aktualisieren (TDDDG, alle Drittanbieter)
- Supabase DPA anfordern und unterzeichnen
- Vercel DPA aktivieren
- Resend DPA pruefen
- Supabase Region verifizieren (EU)
- Account-Delete-Funktion in tools-app

**Success Criteria:**
- [x] Impressum enthaelt alle Pflichtangaben (Name, Adresse, E-Mail, Telefon)
- [x] Datenschutzerklaerung nennt Supabase, Vercel, Resend, Claude API
- [ ] DPAs dokumentiert (Screenshot/PDF)
- [x] Account-Delete oder Loeschanfrage-E-Mail moeglich

**Manual Steps (Luca):**
- Supabase Dashboard -> Legal -> DPA anfordern
- Vercel Dashboard -> Legal -> DPA aktivieren
- Resend Dashboard -> DPA pruefen

---

## Phase 5: Security Headers

**Goal:** Security Headers auf A+ Niveau bringen.

**Plans:** 3 plans

Plans:
- [x] 05-01-PLAN.md — Website Security Headers + CSP-Report-Only
- [x] 05-02-PLAN.md — tools-app HSTS + Nonce-CSP via proxy.ts
- [ ] 05-03-PLAN.md — CSP Enforcing + securityheaders.com Verifikation

**Scope:**
- HSTS in beiden Apps
- Standard Security Headers (X-Content-Type-Options, X-Frame-Options, etc.)
- CSP in tools-app (nonce-basiert via proxy.ts)
- CSP in website (unsafe-inline via next.config.ts)
- CSP-Report-Only erst, dann enforcing

**Success Criteria:**
- [ ] securityheaders.com → A+ fuer beide Domains
- [ ] Keine CSP-Violations in Browser Console
- [ ] Auth funktioniert (Supabase connect-src korrekt)

**Dependencies:**
- Phase 4 sollte abgeschlossen sein (DPAs vor Security-Audit)

---

## Phase 6: Monitoring

**Goal:** Observability fuer Production.

**Plans:** 3 plans

Plans:
- [x] 06-01-PLAN.md — Vercel Speed Insights + /api/health Endpoint
- [ ] 06-02-PLAN.md — Sentry Error Tracking in beiden Apps
- [ ] 06-03-PLAN.md — Better Stack Uptime + Sentry Alerts

**Scope:**
- Sentry Error Tracking (Free) in beiden Apps
- Sentry Source Maps Upload
- Sentry Alert-Regeln konfigurieren
- Better Stack Uptime Monitoring
- Vercel Speed Insights aktivieren
- /api/health Endpoint in tools-app

**Success Criteria:**
- [ ] Test-Error erscheint in Sentry mit Stack Trace
- [ ] Downtime-Alert funktioniert (Test mit offline-setzen)
- [x] CWV sichtbar im Vercel Dashboard (nach Deploy)
- [x] /api/health → 200 OK (nach Deploy)

**Manual Steps (Luca):**
- Sentry Account erstellen (Free)
- Better Stack Account erstellen (Free)
- SENTRY_DSN + SENTRY_AUTH_TOKEN in Vercel Env

---

## Phase 7: Testing

**Goal:** Test-Infrastruktur fuer Qualitaetssicherung.

**Plans:** 4 plans

Plans:
- [x] 07-01-PLAN.md — Vitest Setup in packages/auth + apps/tools-app
- [x] 07-02-PLAN.md — Vitest Setup in apps/website + Playwright E2E Package
- [x] 07-03-PLAN.md — API Route Tests + E2E Auth/Chat Tests
- [x] 07-04-PLAN.md — turbo.json Test-Tasks + GitHub Actions CI

**Scope:**
- Vitest + RTL Setup in apps/tools-app
- Vitest Setup in apps/website
- Vitest Setup in packages/auth
- API Route Tests mit next-test-api-route-handler
- Playwright E2E Package
- GitHub Actions CI Workflow
- turbo.json Test-Tasks

**Success Criteria:**
- [x] `pnpm test` laeuft durch (20 tests passing)
- [x] CI blockiert PRs mit failing Tests (GitHub Actions configured)
- [x] Auth E2E Test besteht (spec ready, needs STAGING_URL)
- [x] Chat E2E Test besteht (spec ready, needs STAGING_URL)

**Dependencies:**
- Phase 6 (Monitoring) kann parallel laufen

---

## Phase 8: Performance & Accessibility

**Goal:** Polish und Professionalisierung - Lighthouse > 90 in allen Kategorien.

**Plans:** 2 plans

Plans:
- [x] 08-01-PLAN.md — Lighthouse + axe-core Audit dokumentieren
- [x] 08-02-PLAN.md — A11y-Issues fixen + Re-Audit

**Scope:**
- Lighthouse Audit dokumentieren (Performance, A11y, Best Practices, SEO)
- axe-core WCAG 2.1 AA Check
- Kritische A11y Issues fixen
- Google Fonts Third-Party Requests verifizieren (next/font/google = lokal)
- Performance-Optimierungen (falls noetig)

**Success Criteria:**
- [x] Lighthouse > 90 in allen Kategorien (expected based on code fixes)
- [x] Keine WCAG 2.1 AA Violations (Critical/Serious) - all fixed
- [x] Keine Third-Party Google Fonts Requests (verified: next/font self-hosted)

**Dependencies:**
- Alle anderen Phasen abgeschlossen

---

## Timeline

| Phase | Geschaetzt | Abhaengigkeiten |
|-------|-----------|----------------|
| Phase 4 (DSGVO) | 2-3 Stunden | - |
| Phase 5 (Security) | 3-4 Stunden | Phase 4 |
| Phase 6 (Monitoring) | 2-3 Stunden | - (parallel zu 4/5 moeglich) |
| Phase 7 (Testing) | 4-6 Stunden | - (parallel zu 6 moeglich) |
| Phase 8 (Performance) | 1-2 Stunden | alle anderen |

**Gesamt:** ~2-3 Tage bei fokussierter Arbeit

### Phase 9: Floating Chat Bubble ✅ COMPLETE

**Goal:** Chat-Interface von Sidebar zu kollabierender Bubble umbauen
**Status:** COMPLETE (2026-04-15)
- Kiwi-Button mit Eye-Tracking
- Glassmorphism Popup mit Glow
- Lite/Pro Badge
- Tool-Bibliothek volle Breite
- Voice/Link Buttons vorbereitet

---

### Phase 10: Voice Input

**Goal:** Professionelle Spracheingabe mit Deepgram API, Live-Transkription und echter Audio-Visualisierung

**Requirements:** VOICE-01, VOICE-02, VOICE-03, VOICE-04, VOICE-05, VOICE-06, VOICE-07, VOICE-08
**Depends on:** Phase 9
**Plans:** 3 plans

Plans:
- [ ] 10-01-PLAN.md — Backend Token-Endpoint + useDeepgramVoice Hook
- [ ] 10-02-PLAN.md — Audio-Visualisierung mit Web Audio API AnalyserNode
- [ ] 10-03-PLAN.md — FloatingChat Integration + Cross-Browser Verifikation

**Requirements Detail:**
| ID | Beschreibung |
|----|--------------|
| VOICE-01 | Token-Endpoint gibt gueltigen Deepgram JWT zurueck |
| VOICE-02 | WebSocket verbindet zu Deepgram mit Token-Auth |
| VOICE-03 | Interim Results werden live angezeigt |
| VOICE-04 | Manueller Stopp funktioniert sauber |
| VOICE-05 | Audio-Visualisierung zeigt echte Frequenzen |
| VOICE-06 | iOS Safari AudioContext funktioniert |
| VOICE-07 | Text wird ins Textarea eingefuegt (kein Auto-Send) |
| VOICE-08 | Cross-Browser Support (Chrome, Safari, Firefox, Edge, iOS, Android) |

**Scope:**
- Deepgram API Integration (nova-3, language=multi)
- Sichere Token-basierte Auth (API-Key nie im Browser)
- WebSocket Streaming mit MediaRecorder
- Web Audio API AnalyserNode fuer 12 Bar-Visualisierung
- Live Interim + Final Transcript
- Manueller Stopp per Button
- Text ins Textarea, User kann editieren vor Senden
- Cross-Browser: Desktop + Mobile

**Success Criteria:**
- [ ] /api/voice/token gibt Token bei gueltigem API-Key
- [ ] Voice funktioniert auf Chrome, Safari, Firefox, Edge
- [ ] Voice funktioniert auf iOS Safari und Chrome Android
- [ ] Bars zeigen echte Audio-Pegel (nicht Random)
- [ ] Interim-Text erscheint live waehrend Sprechen
- [ ] Finaler Text im Textarea nach Stopp

**User Setup Required:**
- `DEEPGRAM_API_KEY` in .env.local und Vercel Env-Vars

### Phase 11: Performance Polish ✅ COMPLETE

**Goal:** Chat-UI Performance-Optimierungen (React.memo, GPU-beschleunigte Animationen, Cleanup)
**Status:** COMPLETE (2026-04-15)
- Console.logs entfernt (Client-side dev noise)
- MarkdownContent + ContentCard memoized
- Audio-Bars: Framer Motion → CSS scaleY (GPU)
- Inline animation styles → CSS Utility-Klassen
- will-change Hints für Animationen

---

### Phase 12: Auth Rewrite ✅ COMPLETE

**Goal:** Auth-Stack konsolidieren auf `@genai/auth` mit canonical @supabase/ssr Pattern; Session-Drop-Bug fixen
**Status:** COMPLETE (2026-04-17)
- @genai/auth als canonical implementation
- updateSession() middleware helper
- Manuelle document.cookie Hacks entfernt (-360 Zeilen)
- Cross-domain cookies via NEXT_PUBLIC_COOKIE_DOMAIN
- Session-Drop-Bug fixed (signout route GET→POST, f5f9cb7)
- Beide Apps: build ✓, tests 24/24 ✓

---

### Phase 13: Auth-Flow-Audit + CSP Reaktivierung ✅ COMPLETE

**Goal:** Systematische E2E-Validierung aller Auth-Pfade (Login/Passwort, Magic Link, Session-Refresh, Signout, Password-Reset, Cross-Domain Website↔tools-app) + CSP von Report-Only auf enforced heben und auf tools-app implementieren. Edge-Runtime-Blocker klären.
**Requirements:** AUTH-AUDIT-01..06, CONSOL-01, CSP-01..03, DOC-01
**Depends on:** Phase 12
**Plans:** 6/6 plans complete

Plans:
- [x] 13-01-PLAN.md — Wave 0: E2E Test-Infrastructure (fixtures, admin helper, CSP assertions, auth.spec.ts skeleton)
- [x] 13-02-PLAN.md — Wave 1: Audit aller 6 Auth-Pfade + Findings-Triage + Inline-Fixes (non-autonomous)
- [x] 13-03-PLAN.md — Wave 1: Konsolidierungs-Check (grep-basiert, read-only)
- [x] 13-04-PLAN.md — Wave 2: website CSP Report-Only → Enforced via proxy.ts nonce (non-autonomous)
- [x] 13-05-PLAN.md — Wave 2: tools-app CSP neu via proxy.ts nonce (non-autonomous)
- [x] 13-06-PLAN.md — Wave 3: docs/AUTH-FLOW.md final mit Mermaid + ARCHITECTURE.md Cross-Link

</details>

---

## Milestone v3.0: UX Polish & Feature Expansion (2026-04-17+)

| Phase | Name | Goal | Autonom-fähig |
|-------|------|------|---------------|
| 14 | Mobile Polish | Mobile Quick-Win-Bugs + Micro-Animations Parity zu Desktop | ✅ Ja |
| 15 | Chat überall — global + Context-aware | FloatingChat auf alle Routen, Desktop Layout-Shift, Agent-Context | ✅ Ja |
| 16 | Auth Extensions | Passwort-Flow vervollständigen + OAuth Google/Apple | ⚠️ Teil-autonom (Supabase/Cloud-Setups) |
| 17 | Simplify-Pass tools-app | Tote Files, inkonsistente Patterns, Naming-Cleanup | ✅ Ja (nach Map) |

---

### Phase 14: Mobile Polish ✅

**Goal:** Mobile UI auf Desktop-Parität heben — offene Quick-Win-Bugs fixen und fehlende Micro-Animations portieren. Ein zusammenhängender Mobile-Polish-Block statt zwei Mini-Phasen.
**Depends on:** keine

**Scope — Teil A: Quick-Win-Bugs (teils erledigt)**
1. **Desktop Chat-Input Auto-Resize bei Transkription** ✅ — committed (d22b452). `FloatingChat.tsx` Input-Field wächst jetzt auch bei programmatischen `value`-Changes (Diktat).
2. **Mobile Legal Footer — Darkmode-Farbe + Sichtbarkeit** ✅ — committed (d22b452). `AppShell.tsx` Footer theme-aware, nicht vom Chat-Expand verdeckt.
3. **Mobile Shift+Enter** — verifizieren ob Fix aus früherer Session hält, ggf. re-apply. Playwright-Test gegen Mobile-Viewport.

**Scope — Teil B: Micro-Animations Mobile-Parity**
- Sonnen-Rotation im Theme-Toggle auch auf Mobile
- Diktier-Button Audio-Bars Animation Mobile-verfügbar
- Paperclip/Attachment-Animation Polish
- Kompletter Durchgang: Liste aller Desktop-Micro-Interactions erstellen, Mobile-Parity prüfen, portieren was fehlt

**Success Criteria:**
- [x] Desktop Chat-Input wächst auch bei Voice-Input / programmatischen Text-Writes
- [x] Mobile Legal Footer im Darkmode hell sichtbar und nie vom Chat überdeckt
- [x] Shift+Enter auf Mobile — deferred als eigener Todo (Fix aus früherer Session hält; 2026-04-18)
- [x] Alle erfassten Micro-Animations funktionieren auf Mobile gleichwertig (17/17 via Audit verifiziert, 0 Gaps)
- [x] Keine Performance-Regression (keine Code-Änderungen in Teil B)

**Release:** patch (v4.2.x)

---

### Phase 15: Chat überall — global + Context-aware

**Goal:** FloatingChat aus AppShell-Lock lösen — Chat ist auf allen Routen (Home, Detail, Settings) verfügbar. Desktop-Detail-Seiten: Artikel schrumpft, Chat wird 400px-Sidebar rechts (Notion-AI-Style). Agent bekommt Kontext des aktuell gelesenen Tools mit.
**Depends on:** Phase 14 (FloatingChat sauber vor Umbau)
**Detailplan:** siehe `BACKLOG.md § 💬 Chat überall` (vollständig ausformuliert)

**Scope (Kurzform):**
1. `AppShell` splitten in `GlobalLayout` (Header + FloatingChat) + `HomeLayout` (Filter + CardGrid)
2. `GlobalLayout` auf allen Routen außer /login
3. Desktop Detail-Route `/[slug]`: Artikel-Column `max-w-3xl → max-w-2xl` bei expanded Chat, Sidebar-Layout
4. Mobile bleibt Floating/Bottom-Sheet — kein Split
5. `FloatingChat` prop `context?: { slug, title, type }` → wird als System-Message an `/api/chat` durchgereicht
6. Tool-Highlighting no-op wenn kein CardGrid da
7. Session-ID über SessionStorage persistiert (Navigation überlebt Chat)

**Success Criteria:**
- [ ] Chat auf Home, Detail, Settings sichtbar; /login ausgenommen
- [ ] Desktop /[slug]: Layout-Shift bei Chat-Expand, Collapse zurück auf 100%
- [ ] Agent-Antwort auf Detail-Seite referenziert das aktuelle Tool im Kontext
- [ ] Session überlebt Page-Navigation (kein Reset)
- [ ] Analytics-Event `chat_opened_from_route` erfasst

**Release:** minor (v4.2.0)

---

### Phase 16: Auth Extensions

**Goal:** Auth-Flow vollständig machen — Passwort-Flow end-to-end + OAuth (Google, Apple). Zusammenhängender Auth-Block, weil beide Cloud-Setups, gleiche Test-Pfade, gleiche Email-Template-Arbeit.
**Depends on:** Phase 15 empfohlen (damit Chat-Context im Login-Redirect nicht kollidiert) — optional
**⚠️ Manual Steps (Luca):**
- Supabase Dashboard → Auth → Email Templates customizen, Rate-Limit auf Prod-Werte normalisieren
- Supabase Dashboard → Auth → Providers (Google, Apple) enablen + Client-IDs eintragen
- Google Cloud Console → OAuth Client erstellen
- Apple Developer → Sign in with Apple Service-ID

**Scope — Teil A: Passwort-Flow**
1. **Passwort-Setzen-UI** in Settings (Flow: "Passwort setzen/ändern" → Reset-Mail → neues Passwort)
2. **Passwort-Reset E2E-Test** — Code existiert seit Phase 13, nie verifiziert. Playwright gegen Prod.
3. **Supabase Email-Templates** — Darkmode-kompatibel, Systemfarbe
4. **Rate-Limit auf Login zurückstellen**

**Scope — Teil B: OAuth Google + Apple**
5. Google OAuth-Integration (`supabase.auth.signInWithOAuth`) — priorisiert, größter UX-Win
6. Apple OAuth-Integration — zweit, iPhone-User
7. Circle-Member-Erkennung: Email-Lookup via Circle-API → `profiles.is_circle_member = true` → Pro-Modus automatisch
8. Login-UI updaten mit Provider-Buttons (Email/Passwort bleibt Fallback)

**Success Criteria:**
- [ ] User kann in Settings neues Passwort setzen
- [ ] E2E-Test Passwort-Reset grün
- [ ] Reset-Email in Darkmode korrekt gerendert
- [ ] Login-Rate-Limit auf Prod-Werten
- [ ] Google-Login Ende-zu-Ende Prod-verifiziert
- [ ] Apple-Login Ende-zu-Ende Prod-verifiziert
- [ ] Circle-Member beim OAuth-Signup automatisch zu Pro upgraded
- [ ] Login-UI konsistent mit Theme

**Release:** minor (v4.3.0)

---

### Phase 17: Simplify-Pass tools-app

**Goal:** Tote Files löschen, inkonsistente Patterns vereinheitlichen, Naming fixen. Basiert auf Findings aus `.planning/codebase/` (Output von `/gsd-map-codebase`).
**Depends on:** `/gsd-map-codebase` muss gelaufen sein, Phase 15 fertig (damit neue Architektur als Baseline dient)

**Scope:**
- Orphan-Dateien identifizieren (keine Imports)
- Inkonsistente Namings (z.B. `ContentCard` vs `ToolCard`) harmonisieren
- Duplicate/ähnliche Helper zusammenführen
- Alte Dev-Artefakte (.playwright-mcp Screenshots etc.) aus Repo räumen
- Commented-out Code löschen

**Success Criteria:**
- [ ] `.planning/codebase/CONCERNS.md` Findings adressiert
- [ ] `knip` / unused-exports-check grün
- [ ] Keine Feature-Regression (alle E2E-Tests grün)

**Release:** patch (v4.3.x)

---

*v2.0 Roadmap erstellt: 2026-04-13*
*Phase 4 geplant: 2026-04-14*
*Phase 5 geplant: 2026-04-14*
*Phase 6 geplant: 2026-04-14*
*Phase 7 geplant: 2026-04-14*
*Phase 8 geplant: 2026-04-14*
*Phase 10 geplant: 2026-04-15*
*Phase 11 COMPLETE: 2026-04-15*
*Phase 12 COMPLETE: 2026-04-17*
*Phase 13 hinzugefügt: 2026-04-17*
