# Roadmap — Generation AI

## Status

- ✅ **v1.0 Monorepo Migration** — shipped 2026-04-14
- ✅ **v2.0 Production Hardening** — shipped 2026-04-17 (Release v4.1.0)
- ✅ **v3.0 UX Polish & Feature Expansion** — shipped 2026-04-19 (Releases v4.2.0, v4.3.0, v4.3.x, v4.4.0) — Phases 14-19
- 🚧 **v4.0 Website Conversion-Layer & Onboarding-Funnel** — Phases 20-26 (planning)

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
| 15 | 3/3 | Complete   | 2026-04-18 |
| 16 | 6/6 | Complete    | 2026-04-18 |
| 17 | 5/5 | Complete    | 2026-04-19 |
| 18 | Simplify-Pass tools-app | Tote Files, inkonsistente Patterns, Naming-Cleanup | ✅ Ja (nach Map) |

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
- [x] Chat auf Home, Detail, Settings sichtbar; /login ausgenommen
- [x] Desktop /[slug]: Layout-Shift bei Chat-Expand, Collapse zurück auf 100%
- [x] Agent-Antwort auf Detail-Seite referenziert das aktuelle Tool im Kontext
- [x] Session überlebt Page-Navigation (kein Reset)
- [x] Analytics-Event `chat_opened_from_route` erfasst

**Release:** minor (v4.2.0)

**Plans:** 3/3 plans complete

Plans:
- [x] 15-01-PLAN.md — AppShell-Split: GlobalLayout + HomeLayout (Refactor, kein Verhaltens-Change)
- [x] 15-02-PLAN.md — FloatingChat context-prop + Desktop Sidebar-Mode (400px, max-w-2xl shrink)
- [x] 15-03-PLAN.md — /[slug] Integration: Agent-Context, Empty-State-Chips, Session, Analytics

---

### Phase 16: Brand System Foundation

**Goal:** Brand-Entscheidungen aus `brand/DESIGN.md` in Code überführen — Radix Colors + Geist-Fonts + Design Tokens etablieren, Website + tools-app auf neue Tokens migrieren. Basis für alles Folgende (Mails, zukünftige UI).
**Depends on:** Phase 15 fertig (neue Architektur als Baseline)
**Source of Truth:** `brand/DESIGN.md`, `brand/VOICE.md`, `brand/tokens.json`, `brand/logos/`

**Scope:**
1. **Packages installieren**: `@radix-ui/colors` (Neutral-Skala). Geist via `next/font/google`.
2. **`packages/config/tailwind/base.css` erweitern**: Radix slate + slate-dark imports, semantische Zuordnung nach DESIGN.md §C, font-family auf Geist. Bestehendes Welt-Mapping (Light = Rosa/Rot, Dark = Blau/Neon) bleibt.
3. **Logo-Component** `<Logo />` in `packages/ui/` mit `colorway="auto"` + Kontext-Prop (header, footer, mail). 11 Varianten aus `brand/logos/` verdrahten. Aktuell verwendete Logos in beiden Apps austauschen.
4. **Website migrieren**: Inter raus, Geist rein. Components auf neue Radix-Tokens (muted-text = slate-11, borders = slate-6/7 etc.). Hardcoded Hex-Werte raus. Primary-Button Fix bereits drin (`--color-primary: var(--accent)`).
5. **tools-app migrieren**: gleich wie Website.
6. **Microcopy-Pass**: bestehende UI-Strings (Buttons, Errors, Empty-States, Toasts) gegen `brand/VOICE.md` Microcopy-Library abgleichen und ersetzen. Schwerpunkt: sichtbare Utility-Texte — nicht Marketing-Copy (das bleibt wie es ist).
7. **Visual-Regression-Check**: Playwright-Screenshots beider Apps (Home, Detail, Settings, Login, /legal) in Light + Dark **vor** Migration als Baseline speichern, **nach** Migration gegen Baseline vergleichen. Absichtliche Änderungen dokumentieren, ungewollte Regressions fixen.

**Plans:** 6/6 plans complete

Plans:
- [x] 16-01-foundation-install-baseline-PLAN.md — Install @radix-ui/colors + geist, bootstrap packages/ui, capture Playwright baseline screenshots
- [x] 16-02-tokens-base-css-PLAN.md — Extend packages/config/tailwind/base.css with Radix slate imports, Geist font bindings, semantic status tokens
- [x] 16-03-logo-component-PLAN.md — Implement <Logo /> in @genai/ui with 11 colorway variants + colorway="auto" matrix + Vitest suite; stage 11 SVGs into both apps' public dirs
- [x] 16-04-website-migration-PLAN.md — Migrate apps/website: Inter→Geist, Logo swap in header/footer/terminal-splash, focus-ring fix, neutral-hex audit, microcopy pass, umlauts in metadata
- [x] 16-05-tools-app-migration-PLAN.md — Migrate apps/tools-app: Inter→Geist, Logo swap in GlobalLayout/DetailHeaderLogo/login, focus-ring fix, neutral-hex audit, microcopy pass
- [x] 16-06-visual-regression-verify-PLAN.md — Playwright diff vs baseline, generate diff report, human checkpoint, update baseline post-approval, final build verify both apps

**Manual Steps (Luca):** keine — rein Code.

**Success Criteria:**
- [ ] `pnpm build` beider Apps grün
- [ ] Light/Dark-Toggle-Visual-Check: Header, Buttons, Body-Text, Cards — nichts gebrochen
- [ ] Typografie visuell = Geist (H1 Mono, H2 Sans) wie in `brand/typography-scale.html` Option B
- [ ] Radix-Tokens greifen (kein Hardcoded Hex mehr in Component-Files für Neutrals)
- [ ] Logo-Component ersetzt alle hardcoded Logo-Paths in Website + tools-app
- [ ] Microcopy aus `brand/VOICE.md` durchgängig eingesetzt (Buttons, Errors, Toasts, Empty-States)
- [ ] Visual-Regression-Screenshots: nur gewollte Änderungen, keine ungewollten Layout-Bruchstellen
- [ ] Alle E2E-Tests grün

**Release:** minor (v4.3.0)

---

### Phase 17: Auth Extensions

**Goal:** 6 Supabase-Email-Templates auf **React Email** vereinheitlichen — nutzt Design-Tokens aus Phase 16, Darkmode via `prefers-color-scheme`, deutsche Copy aus `brand/VOICE.md`. + Rate-Limits auf Prod-Werte setzen.
**Depends on:** Phase 16 (Design-Tokens + Logo-Component sind da)
**Plans:** 5/5 plans complete

Plans:
- [x] 17-01-react-email-foundation-PLAN.md — @genai/emails package: React Email setup, tokens.ts, Layout + EmailButton + BrandLogo
- [x] 17-02-logo-png-generation-PLAN.md — Sharp-based SVG→PNG generation for mail-safe logo assets (red + neon)
- [x] 17-03-templates-group-a-PLAN.md — Templates: Confirm-Signup, Recovery (Reset Password), Magic-Link
- [x] 17-04-templates-group-b-PLAN.md — Templates: Email-Change, Reauth (OTP), Invite
- [x] 17-05-export-and-handoff-PLAN.md — HTML export script, dist/*.html, MANUAL-STEPS.md, changeset, Luca-checkpoint
**⚠️ Manual Steps (Luca):**
- Supabase Dashboard → Auth → Email Templates: finale HTMLs einspielen (Claude liefert Files)
- Supabase Dashboard → Auth → Rate Limits: Prod-Werte setzen

**Scope:**
1. **React Email Setup**: `@react-email/components` + `react-email` dev-CLI. Shared-Layout-Wrapper mit Logo + Footer.
2. **6 Templates bauen**: Confirm Signup, Magic Link, Reset Password, Change Email, Reauthentication, Invite. Copy aus `brand/VOICE.md`. Theme-adaptive via `@media (prefers-color-scheme: dark)`.
3. **Rate-Limit** auf Prod-Werte zurück (falls noch auf Phase-13-Test-Werten).

**Aus Scope entfernt (2026-04-18):**
- ~~Passwort-Setzen-UI in Settings~~ — Reset-Flow reicht
- ~~E2E-Test Passwort-Reset~~ — manuell verifiziert, funktioniert
- ~~OAuth Google + Apple~~ → `BACKLOG.md` "Auth — OAuth-Login (Circle-Integration)"

**Success Criteria:**
- [ ] Alle 6 Templates in React Email, gemeinsamer Layout-Wrapper
- [ ] Darkmode adaptiv (Gmail Light + Dark, Apple Mail Light + Dark manuell verifiziert)
- [ ] Brand-Logo korrekt (red/neon je nach Theme)
- [ ] Copy aus VOICE.md Microcopy-Library übernommen
- [ ] Login-Rate-Limit auf Prod-Werten

**Release:** patch (v4.3.x)

---

### Phase 18: Simplify-Pass tools-app

**Goal:** Tote Files löschen, inkonsistente Patterns vereinheitlichen, Naming fixen. Basiert auf Findings aus `.planning/codebase/` (Output von `/gsd-map-codebase`).
**Depends on:** `/gsd-map-codebase` muss gelaufen sein, Phase 16 fertig (damit neue Brand-Tokens als Baseline dienen)

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

### Phase 19: Password-Flow + Test-Baseline (v3.0 trailing)

**Goal:** Eingeloggte User können optional ein Passwort setzen (First-Login-Prompt mit Skip + Settings-Inline-Form mit Re-Auth bei Change). Recovery-Mail-Template bleibt unverändert (nur noch für Vergessen-Case). E2E-Baseline wird repariert (Default gegen Prod, realer Test-User via GitHub-Secrets).
**Depends on:** — (nur bestehender Auth-Stack)
**Plans:** 5/5 plans complete

Plans:
- [x] 19-01-PLAN.md — confirm-Route: has_password-Check + First-Login-Redirect zu /auth/set-password?first=1
- [x] 19-02-PLAN.md — Set-Password-Page: Skip-Button + metadata-Writes (has_password=true/false)
- [x] 19-03-PLAN.md — /settings Inline-Form: PasswordSection mit Set/Change-Modi + Re-Auth via signInWithPassword
- [x] 19-04-PLAN.md — E2E-Config gegen Prod (E2E_BASE_URL) + chat.spec.ts prod-tauglich
- [x] 19-05-PLAN.md — CI-Secrets + MANUAL-STEPS.md + Changeset + Human-Verify-Checkpoint

**Scope (updated 2026-04-19 per CONTEXT.md Decisions D-01..D-09):**
- `/auth/confirm` erweitert: bei Magic-Link + `user_metadata.has_password` weder `true` noch `false` → redirect zu `/auth/set-password?first=1`
- Set-Password-Page: Skip-Button + metadata-Writes (D-01, D-02)
- `/settings`: neuer Passwort-Section als Inline-Form (D-03), 2 Modi via `has_password` (D-04), Re-Auth via signInWithPassword bei Change, kein Redirect nach Success (D-05)
- Recovery-Mail-Template bleibt unverändert (D-06)
- `packages/e2e-tools/playwright.config.ts` Default auf Prod mit `E2E_BASE_URL`-Override (D-08), `chat.spec.ts` prod-tauglich, `auth.spec.ts` liest baseURL aus gleicher Env-Kette
- CI-Workflow mit `TEST_USER_EMAIL` + `TEST_USER_PASSWORD` Secrets (D-07)
- `.planning/phases/19-password-flow-and-test-baseline/MANUAL-STEPS.md` dokumentiert Supabase-User + GH-Secrets-Setup (D-09)

**Out-of-Scope:** Signup-Reactivation, Circle-API-Integration, OAuth, Password-Policy-Erweiterungen, 2FA, Session-Invalidation bei Change.

**Success Criteria:**
- [x] First-Login-Magic-Link zeigt Set-Password-Screen mit funktionierendem Skip — verifiziert gegen Prod 2026-04-20
- [x] Settings-Eintrag „Passwort setzen/ändern" funktioniert end-to-end — Set/Change-Mode beide grün
- [x] Recovery-Mail-Template unverändert, Flow funktioniert für Vergessen-Case (D-06)
- [x] E2E-Tests grün gegen Prod, kein localhost-/TEST_USER-Dependency mehr — smoke+auth-gate 5p/2s, auth.spec 10p/2s
- [x] `pnpm build` beider Apps grün, keine Regression für Magic-Link-only-Flow

**Status:** ✅ COMPLETE 2026-04-20 — 13/13 Verifier passed, Code-Review 3 Crit+Warn gefixt, 4 Follow-ups done.
**Release:** minor (v4.4.0) — neues User-facing Feature (Passwort-UI). Changeset liegt, `pnpm version` pending.

---

## Milestone v4.0: Website Conversion-Layer & Onboarding-Funnel (2026-04-19+)

**Status 2026-04-23:** Roadmap revidiert nach Simons Website-Konzept (April 2026). Phasen 22, 22.5, 22.7, 26, 27 neu bzw. erweitert. Siehe CONTEXT-Dokumente pro Phase für Detail-Scope.

| Phase | Name | Status | Scope-Kern |
|-------|------|--------|------------|
| 20 | Navigation + Landing-Skeleton | ✅ complete 2026-04-21 | 6/6 plans, Skeleton + Nav + 8 Sections |
| 20.5 | Landing Wow-Pass (Signal-Grid) | ✅ closed at Hero 2026-04-22 | Hero signed-off, 20.5-04+05 deferred → 20.6 |
| 20.6 | 9/9 | Complete    | 2026-04-23 |
| 21 | 8/8 | Complete   | 2026-04-23 |
| 22 | 8/8 | Complete    | 2026-04-24 |
| 22.5 | `/events`-Seite | 🆕 neu | MDX-Pipeline, members-only gated, Hero + Kommende + Formate + Archiv + CTA |
| 22.7 | Tools-Subdomain Polish | 🆕 neu | Logo-Link-Fix, Login-Button-Umbau (Registrieren + Einloggen), Hero, Nav-Sync |
| 23 | 4/6 | In Progress|  |
| 24 | `/test` Assessment | ⏳ | Optionaler Test mit DSGVO-Consent, Score-Migration |
| 25 | Circle-API-Sync (Unified Signup) | ⏳ | Server-Action: Supabase+Circle, SSO-Link, Welcome-Flow |
| 26 | `/community` + Subdomain-Integration | ⏳ erweitert | Eigene Seite mit MDX-Artikeln + SEO (/community/artikel/[slug]) + Featured-Tools-API |
| 27 | Copy-Pass & Launch-Cleanup | 🆕 neu | Finales Wording, Dummy-Data raus, Meta/SEO-Pass, Signup-Go-Entscheidung |

**Dependencies:**
- Phase 20 / 20.5 / 20.6 müssen durch — sonst Nav + DS-Baseline nicht stabil
- Phase 21 (`/about`) blockt Phase 22 + 26 (Transparenz-Link auf `/about#verein`, FAQ-Deep-Link von Landing-Kurz-FAQ)
- Phase 22.7 (Tools-Polish) depends on Phase 23 (`/join` muss als Redirect-Target existieren für „Kostenlos registrieren")
- Phase 22.5 (`/events`) depends on Phase 23 (Signup-Gate) für Non-Member-Anmelde-Flow
- Phase 25 (Circle-Sync) aktiviert Live-Signup-Tech (Gate bleibt zu bis Phase 27)
- Phase 26 (`/community`) kann parallel zu 23/24/25 starten (MDX-Content ist unabhängig); Block B (API-Integration) wartet auf Phase 25
- Phase 27 (Copy-Pass) ist die letzte — alles andere muss durch sein

**Empfohlene Reihenfolge (Pfad A — B2B-Conversion priorisiert):**

```
20.6 → 21 /about → 22 /partner → 23 /join → 22.7 tools-polish → 22.5 /events → 24 /test → 25 circle-sync → 26 /community → 27 copy-pass → LAUNCH
```

Rationale:
- Partner-Seite früh, weil B2B-Leads für Vereinsarbeit wichtig (Spenden, Hochschul-Deals)
- `/join` muss vor 22.7 und 22.5, weil beide `/join` als Redirect-Target brauchen
- Tools-Polish vor Events, weil kleiner Scope (schnell done, Sichtbarer UX-Win)
- `/test` spät, weil Placeholder-Content OK und optional
- Circle-Sync nach allen UI-Seiten, weil aktiviert echte Live-Pipeline
- `/community` kann auch früher eingeschoben werden, wenn Content-Pipeline gewünscht
- Copy-Pass ganz am Ende

**Design-System Source of Truth (ab 2026-04-21):** `brand/Generation AI Design System/` ist canonical für alle UI-Arbeiten ab Phase 20.5. CSS-Variablen aus `colors_and_type.css`, Typografie per DS-Spec (Geist Sans für Body, Geist Mono für Display/H1/Buttons/Labels/Tags), Motion-Easings aus DS (`--ease-out: cubic-bezier(0.16, 1, 0.3, 1)`, `--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1)`, `--dur-fast|normal|slow`). Kein Gradient-Spam, kein Glassmorphism, keine Stock-Fotos, kein dekorativer Blob. Connection-Motif durchgezogen — Signal-Grid im Hero, Linien+Knoten+roter Faden als Leitsignatur.

---

### Phase 20: Navigation + Landing-Skeleton

**Goal:** Top-Nav + Landing auf das neue Layout umbauen — alle Sections gebaut mit Stub-Daten, damit Architektur und visuelles Gerüst steht. Echte Daten (Tool-Showcase, Community-Preview) kommen in Phase 26 nachträglich.
**Requirements:** R1.1-R1.10
**Depends on:** keine
**Out-of-Scope:** Echte Tool-Showcase- und Community-Preview-Daten (→ Phase 26), Final-Wording Hero + Final-CTA (bleibt Placeholder).
**Plans:** 6/6 plans complete

Plans:
- [x] 20-01-PLAN.md — Wave 1 Setup: motion + shadcn + Aceternity/MagicUI Copy-in, globals.css Keyframes, lighthouserc.json + landing.spec.ts skeleton, Alt-Sections löschen (D-21)
- [x] 20-02-PLAN.md — Wave 2 Layout-Shell: Header-Umbau (Dropdown + Mobile-Sheet), Footer-Erweiterung, 8 Section-Stubs + home-client.tsx wiring + MotionConfig nonce (R1.1 + R1.10 done, 4/4 Playwright R1.1+CSP green)
- [x] 20-03-PLAN.md — Wave 3 Wow-Peaks 1+2: Hero (Aurora) + Diskrepanz (Custom Bento-Split + 6 Number-Tickers + Scroll-Divergenz)
- [x] 20-04-PLAN.md — Wave 3 ruhige Mitte: 4-Card-Angebot (Bento) + Tool-Showcase (Infinite Cards + Beispiel-Badge) + Community-Preview (statisch + Beispiel-Badges)
- [x] 20-05-PLAN.md — Wave 3 Wow-Peak 3: Zielgruppen-Split + Trust (Marquee + reduced-motion) + Final-CTA (Lamp Effect) — R1.7/R1.8/R1.9 done, 8/8 Playwright green
- [x] 20-06-PLAN.md — Wave 4 Phase-Gate: Build/CSP/Playwright/Lighthouse + Manual UAT (Checkpoint) + Changeset v4.5.0 + VALIDATION.md sign-off

**Scope:**
- Top-Nav mit Dropdown "Für Partner" (a11y-korrekt, Desktop + Mobile-Burger)
- Hero, Diskrepanz-Section mit custom data-viz (scroll-triggered Animation), 4-Card-Angebot, Tool-Showcase (Stub), Community-Preview (Stub), Zielgruppen-Split, Trust-Strip, Final-CTA, Footer
- Design-Tokens aus `brand/` weiter verwenden (keine neuen Tokens)
- CSP-safe (nonce-aware Animationen, keine inline-scripts ohne Nonce)

**Success Criteria:**
- [ ] Lighthouse Landing > 90 in allen Kategorien
- [ ] Nav-Dropdown a11y-korrekt (keyboard + screen-reader)
- [ ] Diskrepanz-Viz läuft smooth (60fps, CLS ≤ 0.1)
- [ ] Stub-Content für Tool-Showcase + Community-Preview klar als Placeholder erkennbar (no fake trust signals)

**Release:** minor (v5.0.0-alpha oder v4.5.0) — Breaking UX-Change (neue Nav, neue Landing-Struktur)

---

### Phase 20.5: Landing Wow-Pass (Signal-Grid)

**Goal:** Hero + Discrepancy auf Design-System-Niveau heben (Signal-Grid, Connection-Motif). Polish-Pass, kein neuer Surface. Luca co-builds live in localhost.
**Requirements:** R1.2 (Hero-Wow), R1.3 (Discrepancy-Wow) — Phase 20 lieferte Skeleton, 20.5 liefert das Wow.
**Depends on:** Phase 20 (Skeleton complete 2026-04-21)
**Design-System Source of Truth:** `brand/Generation AI Design System/` (canonical ab 2026-04-21)
**Branch:** `feature/phase-20-landing-skeleton` (bleibt offen, baut on-top)
**Out-of-Scope:** Andere Sections (Offering/Tool-Showcase/Community/Audience-Split/Trust/Final-CTA bleiben unangetastet), neue Pages, neue Daten, Sign-up-Reactivation.
**Plans:** 3/5 delivered, 2 deferred to Phase 20.6

Plans:
- [x] 20.5-01-PLAN.md — Design-System Alignment (Tokens, Typography, Motion-Easings)
- [x] 20.5-02-PLAN.md — Signal-Grid Canvas Component (Nodes + Linien + Cursor-Propagation + Radial-Fade-Overlay)
- [x] 20.5-03-PLAN.md — Hero Rewrite with Signal-Grid (DS-Typography + DS-Button-States)
- [~] 20.5-04-PLAN.md — Discrepancy Polish — ⚠️ Code shipped (`26a5b76`), visuelle Richtung von Luca verworfen 2026-04-21 → redesign from scratch in Phase 20.6-01
- [~] 20.5-05-PLAN.md — Hero → Discrepancy Transition — ⚠️ Exploration only, deferred auf Phase 20.6-08 (Inter-section transitions)

**Scope:**
- GridBackground im Hero wird durch Signal-Grid ersetzt (DS-Spec)
- Tokens, Typografie, Motion-Easings in `apps/website` + `packages/config` mit Design-System abgeglichen
- Discrepancy-Chart wird smoother + bekommt honest Achsen
- Transition zwischen Hero und Discrepancy als bewusster Design-Moment

**Success Criteria:**
- [ ] Hero-Background matched DS Signal-Grid-Spec (Nodes + Cursor-Propagation + Radial-Fade-Overlay + reduced-motion Fallback)
- [ ] Discrepancy Scroll-Animation fühlt sich smooth an (subjektiv Luca-OK auf localhost)
- [ ] Chart-Achsen sind honest (keine semantisch strapazierten Label-Gruppierungen)
- [ ] Transition zwischen Hero und Discrepancy fühlt sich intentional an
- [ ] Alle UI nutzt DS-CSS-Vars, keine stray hardcoded Hex-Werte in Hero/Discrepancy
- [ ] Build, Lint, Playwright bleiben grün (keine Regression auf Phase-20-Skeleton-Gates)

**Working-Mode:**
- Iteratives Co-Build mit Luca auf localhost — kleine Commits, tight Feedback-Loops
- Alle Plans `autonomous: true` — kein formaler UAT-Checkpoint, Luca macht Live-Review
- Kein Push, kein Deploy während der Phase

**Release:** patch innerhalb v4.5.0 (Phase 20 Minor-Release bleibt zurück bis 20.5 durch ist)

---

### Phase 20.6: Landing Sections Rebuild

**Goal:** Bring all remaining landing sections to the quality level delivered by Hero in Phase 20.5. Re-design Discrepancy from scratch. Iterative co-build, Design-System continues as source of truth.
**Requirements:** R1.3 (Discrepancy re-thought), R1.4-R1.9 (polish remaining sections), R1.11 (transitions)
**Depends on:** Phase 20.5
**Branch:** `feature/phase-20-landing-skeleton` (stays open, builds on top)
**Out-of-Scope:** New sections, new pages, final copywriting (deferred to marketing pass), Hero changes (locked from Phase 20.5), sign-up reactivation (bleibt 503).
**Plans:** 9/9 plans complete

Plans:
- [x] 20.6-01-PLAN.md — New Discrepancy section (re-designed from scratch)
- [x] 20.6-02-PLAN.md — Offering polish
- [x] 20.6-03-PLAN.md — Tool-Showcase polish
- [x] 20.6-04-PLAN.md — Community-Preview polish
- [x] 20.6-05-PLAN.md — Audience-Split polish
- [x] 20.6-06-PLAN.md — Trust polish
- [x] 20.6-07-PLAN.md — Final-CTA polish
- [x] 20.6-08-PLAN.md — Inter-section transitions

**Scope:**
- Section-by-section co-build mit Luca in localhost:3000
- Jede Section bekommt Hero-Level-Treatment: Design-System-Tokens, crisp motion, two-color-system
- Discrepancy-Topic bleibt („Bedarf vs Realität"), Representation redesigned from scratch
- Inter-section transitions (inkl. des ursprünglich in Plan 20.5-05 geplanten Hero→Section-2-Übergangs) als letzter Plan, nachdem alle Sections stehen
- Finale Section-Copy bleibt Placeholder — finaler Marketing-Pass kommt nach Phase 20.6

**Success Criteria:**
- [ ] Alle 8 Sections visually kohärent mit Hero's Signal-Grid-Ästhetik
- [ ] Inter-section transitions fühlen sich intentional an
- [ ] Lighthouse Landing bleibt > 90 in allen Kategorien
- [ ] Reduced-motion Fallback funktioniert über alle neue Motion
- [ ] Playwright landing-suite (8/8) bleibt grün
- [ ] Build grün, `/` bleibt `ƒ`, CSP-Nonce intakt

**Working-Mode:**
- Iteratives Co-Build mit Luca auf localhost — kleine Commits, tight Feedback-Loops
- Alle Plans `autonomous: true` — kein formaler UAT-Checkpoint, Luca macht Live-Review
- Kein Push, kein Deploy während der Phase

**Release:** patch innerhalb Milestone v4.5.0. Phase 20 Changeset bleibt weiterhin zurückgehalten bis 20.6 durch ist — dann gemeinsamer Minor-Bump für das komplette neue Landing (Hero + alle polierten Sections + Transitions).

---

### Phase 21: `/about`-Seite

**Goal:** Mission, Story, Team, Sparringspartner, Verein als eigene Seite. Vertrauens-Anker.
**Requirements:** R2.1-R2.6
**Depends on:** Phase 20 (Nav + Layout-Shell)
**Out-of-Scope:** CMS-Integration für Team-Daten (bleibt im Code hardcoded).

**Scope:**
- Mission + Vision (aus `brand/VOICE.md`), Story, Team-Grid, Sparringspartner-Section, Verein-Block, CTA
- Responsive Team-Grid (3-col Desktop, 1-col Mobile)
- DSGVO-konformer Umgang mit Personenbildern (Einverständnis vorab dokumentiert)

**Success Criteria:**
- [ ] Alle Gründer + aktive Mitglieder mit korrekten Rollen gelistet
- [ ] Nav-Link "Über uns" zeigt auf `/about`
- [ ] Responsive auf Mobile grün (Team-Grid bricht korrekt um)

**Release:** patch

---

### Phase 22: `/partner`-Seite (REVIDIERT 2026-04-23 auf 4-Tab-System)

**Goal:** B2B-Landing für vier Partnertypen mit Tab-System statt Anker-Scroll — jede Zielgruppe bekommt eigenen Pfad ohne irrelevante Inhalte.
**Requirements:** R3.1-R3.6 (+ Initiativen als 4. Segment)
**Depends on:** Phase 20.6 (Nav + DS baseline), Phase 21 (Verein-Link-Target)
**Detailplan:** `.planning/phases/22-partner-page/22-CONTEXT.md`
**Out-of-Scope:** Sales-CRM, Partner-Portal, Testimonials, eigene partner@-Mail (deferred).

**Scope:**
- Hero „Lass uns zusammen was bewegen."
- Trust-Sektion „Keine zufälligen Bekannten" (Component-Reuse aus Phase 20.6-06)
- **4-Tab-System** statt 3-Anker: Unternehmen (Default) / Stiftungen / Hochschulen / **Initiativen** (neu)
- URL-Parameter `?typ=unternehmen|stiftungen|hochschulen|initiativen` für Deep-Linking
- Kein Scroll-Reset bei Tab-Wechsel, Smooth-Fade-In
- Dynamischer Bereich pro Tab mit Value-Prop + Vorteile + Formate + CTA
- Kontaktformular mit Dropdown vorausgefüllt je nach aktivem Tab, Honeypot-Spam-Schutz
- Submit → Resend → `admin@generation-ai.org` (ImprovMX-Alias)
- Ansprechpartner-Karten (Alex / Janna / Simon) unter dem Formular
- Transparenz-Hinweis mit Link auf `/about#verein`

**Success Criteria:**
- [ ] 4 Tabs switchable, URL-Param synced (pushState), Default Unternehmen
- [ ] Deep-Link `?typ=stiftungen` setzt Tab beim Mount
- [ ] Mobile: Tab-Leiste als horizontaler Scroll oder Dropdown
- [ ] Formular submittet, Mail landet in admin@, Honeypot blockt Bots
- [ ] Ansprechpartner-Karten mit Placeholder-Avatars bis Fotos vorhanden
- [ ] Lighthouse `/partner` > 90, A11y Tab-Pattern korrekt

**Release:** patch

---

### Phase 22.5: `/events`-Seite 🆕 (2026-04-23)

**Goal:** Members-Only-Akquisitionshebel — öffentlich sichtbare Events-Liste, Anmeldung gated hinter Signup.
**Requirements:** Aus Simons Konzept §5 (Website-Konzept-Dokument, April 2026)
**Depends on:** Phase 20.6 (Nav + DS), Phase 23 (`/join` als Signup-Gate-Target)
**Detailplan:** `.planning/phases/22.5-events-page/22.5-CONTEXT.md`
**Out-of-Scope:** Circle-API-Integration, Luma-Embed, ICS-Download V1, Event-Filter (Roadmap).

**Scope:**
- Hero + 3-Kachel-Grid „Kommende Events"
- Event-Metadaten: Titel, Datum+Uhrzeit, Format-Tag, Level-Tag, Ort, Partner (bei Masterclasses), Anmelde-Button
- Event-Modal bei Klick: Beschreibung, Agenda, Speaker, optional ICS
- Anmelde-Flow: Non-Member → `/join?redirect_after=/events/[slug]`, Member → direkt zu `ctaUrl`
- Formate-Sektion (Workshops / Speaker Sessions / Masterclasses)
- Members-Only-Hinweis („Kostenlos, 2 Minuten")
- Archiv (minimal, Foto + Titel + Datum + Recap, keine Modals)
- Abschluss-CTA „Jetzt beitreten"
- **MDX-Pipeline** in `apps/website/content/events/` als Content-Source (kein CMS)
- Event-Detail als Standalone-Route `/events/[slug]` für SEO + Share-Links

**Success Criteria:**
- [ ] MDX-Pipeline liest Files, rendert kommende Events chronologisch
- [ ] Modal mit Details öffnet, schließt via Escape
- [ ] Anmelde-Flow gegated korrekt (Auth-Check + Redirect)
- [ ] Archiv rendert minimal ohne Modals
- [ ] Lighthouse `/events` > 90, Mobile responsive, A11y-korrekt

**Release:** patch

---

### Phase 22.7: Tools-Subdomain Polish 🆕 (2026-04-23)

**Goal:** tools.generation-ai.org visuell und navigatorisch mit Hauptdomain harmonisieren — Logo-Link-Fix, Login-Button-Umbau, Tools-Hero, Sticky-Nav-Sync.
**Requirements:** Aus Simons Konzept §6
**Depends on:** Phase 20.6 (DS baseline), Phase 23 (`/join` als Redirect-Target für „Kostenlos registrieren")
**Detailplan:** `.planning/phases/22.7-tools-subdomain-polish/22.7-CONTEXT.md`
**Out-of-Scope:** Tool-Kachel-Redesign, Agent-Chat-Änderungen, Lite/Pro-Logik-Änderungen, Tool-Detailseiten, Suchfeld (alles Roadmap).

**Scope:**
- **Logo-Link-Fix (CRIT):** Header-Logo führt aktuell auf Community-Subdomain → muss auf `generation-ai.org`
- **Login-Button-Umbau:**
  - Primary: `Kostenlos registrieren` → `https://generation-ai.org/join`
  - Secondary: `Bereits Mitglied? → Einloggen` → tools-app `/login`
- **Tools-Hero** über Filter-Tabs: „// deine ki-tool-bibliothek / # KI-Tools, kuratiert für dich. / Über 100 Tools, sortiert nach Anwendungsfall. Brauchst du Hilfe? Frag unseren Agenten."
- **Sticky-Nav-Sync:** identisches Scroll-Verhalten wie Hauptdomain
- **Nav-Struktur-Alignment:** gleiche Items wie Hauptdomain, Tools aktiv markiert, andere Items führen auf Hauptdomain

**Success Criteria:**
- [ ] Logo-Link korrekt (landet auf Hauptdomain, nicht Community)
- [ ] Login-Button-Differenzierung sichtbar für ausgeloggte User
- [ ] Neue Hero-Sektion über Filter-Tabs
- [ ] Sticky-Nav-Verhalten identisch zur Hauptdomain
- [ ] Mobile Burger-Menü korrekt mit Primary-CTA
- [ ] Keine Regression in Lite/Pro-Sichtbarkeit oder Agent-Chat

**Release:** patch

---

### Phase 23: `/join` Fragebogen-Flow

**Goal:** Waitlist-V1-Landing (Single-Page + Inline-Success-Swap) mit Form-Validation, Rate-Limit, Supabase-Insert, Resend-Confirmation-Mail. Live-Signup-Reaktivierung bleibt auf Phase 25 verschoben — bis dahin sammelt `/join` Waitlist-Einträge.
**Requirements:** R4.1-R4.8
**Depends on:** Phase 20 (Nav + Layout-Shell), Phase 17 (Resend + React-Email Setup)
**Out-of-Scope:** Live-Backend (Circle-Sync in Phase 25), KI-Kompetenz-Assessment (Phase 24), Live-Signup-Reaktivierung (bleibt 503 bis Phase 27-Go).

**Plans:** 4/6 plans executed

Plans:
- [ ] 23-01-PLAN.md — Supabase `waitlist`-Table + RLS + TypeScript-Types in @genai/auth
- [x] 23-02-PLAN.md — React-Email-Template `WaitlistConfirmationEmail` in @genai/emails
- [x] 23-03-PLAN.md — Server-Action `submitJoinWaitlist` mit Zod + Upstash-Rate-Limit + Supabase-Insert + Resend-Mail
- [x] 23-04-PLAN.md — UniCombobox-Komponente + Universities-Liste (40 DE-Hochschulen + Fallback-Options)
- [ ] 23-05-PLAN.md — /join Route: Server-Component + Client-Wrapper + Hero + Form-Card + Success-Card (Inline-Swap)
- [ ] 23-06-PLAN.md — Sitemap + Playwright-Smoke-Tests + STATE.md-Update

**Scope (revidiert 2026-04-24 per CONTEXT.md D-17 bis D-22):**
- Single-Page-Flow mit Inline-Success-Swap (NICHT Multi-Step-Wizard, D-17)
- Reduziertes Hero (`min-h-[60vh]`, D-19) + Form direkt sichtbar auf Desktop
- 6 Form-Felder: Email, Name (Vor+Nachname), Uni-Combobox (Autocomplete + Freitext), Studiengang (optional), DSGVO-Checkbox (required), Marketing-Opt-in (optional default off)
- Submit → Waitlist-Insert + Confirmation-Mail (V1) — Interface stabil für Phase 25 Swap (D-10)
- Assessment-CTA post-submit (→ `/test`, D-15, Phase 24 baut die Seite)
- `?redirect_after=...` Query-Param round-trip für Phase 22.5 Events-Gate

**Success Criteria:**
- [ ] /join lädt mit HTTP 200, Lighthouse > 90 (alle 4 Kategorien)
- [ ] Hero + Form-Card + Success-Card DS-konform (UI-SPEC verbatim)
- [ ] Form Client-side + Server-side validated (Zod), deutsche Fehlermeldungen VOICE.md-konform
- [ ] Submit → Supabase `waitlist`-Row + Confirmation-Mail via Resend
- [ ] Rate-Limit 5/15min/IP via Upstash (graceful-degrade)
- [ ] Duplicate-Email → Silent-Success (no-leak Privacy)
- [ ] Build-Output zeigt `ƒ /join` (dynamic, CSP-safe per LEARNINGS.md)
- [ ] Playwright-Smoke-Test mit ≥9 Testcases grün

**Release:** patch (V1 Waitlist live-fähig; Live-Signup bleibt 503 bis Phase 25 Circle-Sync + Phase 27 Go-Decision)

---

### Phase 24: `/test` Assessment

**Goal:** Optionaler Kompetenz-Test mit Level-Score-Output, DSGVO-konform, Standalone-fähig.
**Requirements:** R5.1-R5.7
**Depends on:** Phase 23 (State-Contract für Score-Migration)
**Out-of-Scope:** Adaptive Test-Logik (nur gewichtete statische Fragen in v4.0).

**Scope:**
- 5-8 gewichtete Fragen mit Multiple-Choice-Antworten → Level 1-5
- DSGVO-Consent-Gate vor Test-Start
- Ergebnis-Screen mit Level + Erklärung + CTA zurück zu `/join` (oder Standalone-CTA bei direktem Einstieg)
- Score in SessionStorage + Migration ins Profile-Record bei späterem Signup
- Lösch-Flow dokumentiert (Link zu `/datenschutz` mit Passage)

**Success Criteria:**
- [ ] Test ohne Login durchführbar
- [ ] Consent blockt Submit wenn nicht aktiv
- [ ] Score landet korrekt in `/join` Step-State bei Rückkehr
- [ ] DSGVO-Passage in Datenschutzerklärung ergänzt

**Release:** patch

---

### Phase 25: Circle-API-Sync (Unified Signup)

**Goal:** Eine Mail statt zwei — Server-Action legt bei Submit Supabase-User + Circle-Member an, generiert SSO-Link, embedded in Welcome-Flow. Graceful-Degrade auf B-Fallback.
**Requirements:** R6.1-R6.7
**Depends on:** Phase 23 fertig (Submit-Payload-Contract), Circle-API-Token in Vercel aktiv
**Out-of-Scope:** Live-Signup-Reaktivierung (bleibt 503 — Phase aktiviert nur die Tech-Pipeline, Luca entscheidet Go separat), OAuth, SAML/OIDC.

**Scope:**
- `/api/join` Route-Handler in apps/website:
  1. Validate Payload
  2. `supabase.auth.admin.createUser` mit Metadata (status, uni, motivation, level)
  3. Circle Admin-API v2 call: Member anlegen mit Email + Name + Community-ID
  4. Circle-SSO-Link via Circle-API generieren (passwordless)
  5. Supabase Magic-Link mit `redirect_to` an unseren Welcome-Screen inkl. SSO-Link-Parameter
- Welcome-Screen `/join/welcome?token=...`:
  - "Willkommen, [Name]" + "Du bist jetzt Teil der Community"
  - Prominenter CTA "→ Zur Community" der per SSO-Link direkt in Circle landet (kein zweiter Login)
- Graceful-Degrade: Circle-API-Fail → UI-Fallback "Check dein Postfach für deinen Community-Zugang" + Circle schickt Standard-Invite-Mail
- Sentry-Tag `circle-api` für Error-Tracking
- `profiles.circle_member_id` Column befüllen
- Env-Vars `CIRCLE_API_TOKEN`, `CIRCLE_COMMUNITY_ID`, `CIRCLE_COMMUNITY_URL` aktiv verdrahten
- **Live-Signup bleibt 503** bis Luca explizit per Commit/Setting freigibt (Feature-Flag möglich)

**Manual Steps (Luca):**
- Circle-Business-Plan Admin-API-Token generieren + in Vercel Env einspielen
- Circle-Dashboard: verifizieren welcher Auto-Invitation-Mail-Flow aktiv ist (ggf. pausieren für SSO-Flow)

**Success Criteria:**
- [ ] Test-User via Preview-Env durchläuft Flow: Submit → unsere Mail → Confirm → Welcome-Screen → "Zur Community" → eingeloggt in Circle ohne 2. Login-Prompt
- [ ] Circle-Member im Circle-Dashboard existiert mit korrekten Metadaten
- [ ] `profiles.circle_member_id` ist gesetzt
- [ ] Simulierter Circle-API-Fail triggert Fallback-UI, kein 500-Error
- [ ] Sentry erfasst Circle-Errors mit `circle-api`-Tag
- [ ] Live-Signup-Gate dokumentiert (503 bleibt bis Go)

**Release:** minor (echter neuer Funnel, aber live-disabled — v5.0.0-beta oder v4.6.0)

---

### Phase 26: `/community` + Subdomain-Integration (REVIDIERT 2026-04-23, scope massiv erweitert)

**Goal:** Zwei Blöcke — (A) Eigene `/community`-Seite auf der Hauptdomain als SEO-Motor + Discovery-Kanal, (B) Featured-Tools-Preview auf Landing via public API.
**Requirements:** R7.1-R7.7 + Simons Konzept §7 (neue /community-Seite mit Blog-Artikel-Unterseiten)
**Depends on:** Phase 20.6 (Nav + DS), Phase 22.7 (tools-app nav consistent), Phase 25 (optional für Live-Post-API)
**Detailplan:** `.planning/phases/26-community-page-and-subdomain-integration/26-CONTEXT.md`
**Out-of-Scope:** Content-Management-UI, AI-Content-Agent (Roadmap), Live-Circle-Posts-API auf Landing (deferred bis Rate-Limits klar), Artikel-Kategorien/Tags/Suche/Kommentare.

**Scope Block A — /community Seite:**
- Hero + Direktlink zu `community.generation-ai.org` für Members
- 4-Kachel-Grid „Was dich drinnen erwartet": Austausch / Lernpfade / News & Insights / Exklusive Inhalte
- Blog-Teaser-Carousel (horizontales Scroll, neueste links)
- **Artikel-Unterseiten** `/community/artikel/[slug]` — eigene URLs für SEO (keine Modals!)
- MDX-Pipeline in `apps/website/content/community/` (Frontmatter + 2-3 Absätze Body + Circle-Link)
- KI-News-Beiträge mit Badge „KI-generiert, vom Team kuratiert"
- Schema.org Article Markup, OG-Tags, Sitemap-Einträge
- Abschluss-CTA „Wir sehen uns drinnen. [Kostenlos beitreten]"
- Start-Content bei Launch: **Placeholder-Artikel** (echter Content wird sukzessive nachgezogen)

**Scope Block B — Subdomain-Integration auf Landing:**
- Content-Schema-Migration: `featured: boolean` in tools-app Content-Package
- Backfill: 3-5 initial-featured Tools manuell markieren
- tools-app `GET /api/public/featured-tools` (kein Auth)
- Website konsumiert via Server-Component mit ISR (`revalidate: 300`)
- Community-Preview-Section auf Landing: MDX-Teaser (3 letzte Artikel) — Option A, Circle-Live-API als Roadmap-Item
- Fallback-UI bei API-Ausfall

**Success Criteria:**
- [ ] `/community` Route rendert alle 4 Sektionen
- [ ] Artikel-Unterseiten mit Meta-Tags + Schema.org Markup
- [ ] Sitemap enthält alle Artikel-URLs
- [ ] Featured-Tools-API liefert JSON, Landing konsumiert via ISR
- [ ] Community-Preview auf Landing zeigt MDX-Artikel
- [ ] Lighthouse `/community` + `/community/artikel/[slug]` > 90
- [ ] Fallback-UI bei API-Outage

**Release:** minor (v5.0.0 final oder v4.6.0)

---

### Phase 27: Copy-Pass & Launch-Cleanup 🆕 (2026-04-23)

**Goal:** Struktur steht, Copy wird geschärft. Alle Placeholder-Texte auf Simons Konzept + `brand/VOICE.md`. Dummy-Data raus, echte Inhalte rein. Finaler Durchgang vor Launch.
**Depends on:** Alle prior Phasen (20.6, 21, 22, 22.5, 22.7, 23, 24, 25, 26)
**Detailplan:** `.planning/phases/27-copy-pass-and-launch-cleanup/27-CONTEXT.md`
**Out-of-Scope:** Neue Features, Redesigns, neue Seiten.

**Scope:**
- Copy-Alignment alle Seiten (Hero-Claims, Belege, Value-Props, Formular-Labels, Error/Success-Messages)
- Dummy-Data-Cleanup (Beispiel-Badges raus, Team-Fotos, Partner-Logos, echte Events + Artikel)
- VOICE.md-Konsistenz-Check (Microcopy-Library durchgängig)
- Metadata-Pass (Titles, Descriptions, OG-Images, Twitter-Cards, Canonical URLs)
- SEO-Final (Sitemap, Robots, Schema.org Organization/Article/Event/FAQPage markup)
- Launch-Checklist (`~/projects/_shared/WEBSITE-CHECKLIST.md`)
- 404 + 500 + Error-Boundaries designed
- Email-Templates alle final
- **Signup-Reactivation-Entscheidung** (Luca-Approval-Gate)

**Success Criteria:**
- [ ] Alle Placeholder-Texte durch finales Wording ersetzt
- [ ] Alle „Beispiel"-Badges raus, echte Inhalte live
- [ ] Meta-Tags + OG + Schema.org vollständig
- [ ] Lighthouse > 90 auf allen 7 Hauptseiten
- [ ] A11y manual pass OK
- [ ] 404/500/Error-Boundaries designed
- [ ] Signup-Go-Entscheidung dokumentiert

**Release:** Launch-Minor (v5.0 Final) — Ship-Ready-State

---

## Backlog

Ideen & Follow-ups ohne feste Phase-Zuordnung. Mit `/gsd-review-backlog` in aktive Phase promoten, wenn reif.

### Phase 999.1: Phase 22 /partner — echte LinkedIn-URLs einsetzen (BACKLOG)

**Goal:** Placeholder `href="#"` mit `data-placeholder="linkedin"` Markern in `apps/website/components/partner/partner-person-card.tsx` durch echte LinkedIn-URLs für Alex, Janna und Simon ersetzen.
**Requirements:** TBD — URLs von den 3 Personen einholen.
**Plans:** 0 plans

Plans:
- [ ] TBD (promote with /gsd-review-backlog when ready)

### Phase 999.2: Phase 22 /partner — sitemap.ts Eintrag (BACKLOG)

**Goal:** `/partner` Route in `apps/website/app/sitemap.ts` aufnehmen, analog zum bestehenden `/about`-Eintrag (priority 0.8, changeFrequency monthly). Relevant für SEO-Crawling nach Launch.
**Requirements:** TBD
**Plans:** 0 plans

Plans:
- [ ] TBD (promote with /gsd-review-backlog when ready)

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
