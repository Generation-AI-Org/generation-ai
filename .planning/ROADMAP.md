# Roadmap — Generation AI

## Milestone v1.0: Monorepo Migration ✅ COMPLETE

| Phase | Name | Status |
|-------|------|--------|
| 1 | App Migration | ✅ Complete |
| 2 | Shared Packages | ✅ Complete |
| 3 | Deploy & Archive | ✅ Complete |

---

## Milestone v2.0: Production Hardening (Current)

| Phase | Name | Goal | Requirements |
|-------|------|------|--------------|
| 4 | DSGVO & Legal | Rechtliche Compliance sicherstellen | R2 |
| 5 | Security Headers | Security Headers + CSP implementieren | R1 |
| 6 | Monitoring | Error Tracking + Uptime Monitoring | R3 |
| 7 | Testing | Test-Infrastruktur aufbauen | R4 |
| 8 | Performance & A11y | Lighthouse Audit + Fixes | R5 |

---

## Phase 4: DSGVO & Legal

**Goal:** Rechtliche Compliance für DACH-Markt sicherstellen.

**Scope:**
- Impressum auf beiden Domains prüfen/vervollständigen
- Datenschutzerklärung aktualisieren (TDDDG, alle Drittanbieter)
- Supabase DPA anfordern und unterzeichnen
- Vercel DPA aktivieren
- Resend DPA prüfen
- Supabase Region verifizieren (EU)
- Account-Delete-Funktion in tools-app

**Success Criteria:**
- [ ] Impressum enthält alle Pflichtangaben (Name, Adresse, E-Mail, Telefon)
- [ ] Datenschutzerklärung nennt Supabase, Vercel, Resend, Claude API
- [ ] DPAs dokumentiert (Screenshot/PDF)
- [ ] Account-Delete oder Löschanfrage-E-Mail möglich

**Manual Steps (Luca):**
- Supabase Dashboard → Legal → DPA anfordern
- Vercel Dashboard → Legal → DPA aktivieren
- Resend Dashboard → DPA prüfen

---

## Phase 5: Security Headers

**Goal:** Security Headers auf A+ Niveau bringen.

**Scope:**
- HSTS in beiden Apps
- Standard Security Headers (X-Content-Type-Options, X-Frame-Options, etc.)
- CSP in tools-app (nonce-basiert via proxy.ts)
- CSP in website (unsafe-inline via next.config.ts)
- CSP-Report-Only erst, dann enforcing

**Success Criteria:**
- [ ] securityheaders.com → A+ für beide Domains
- [ ] Keine CSP-Violations in Browser Console
- [ ] Auth funktioniert (Supabase connect-src korrekt)

**Dependencies:**
- Phase 4 sollte abgeschlossen sein (DPAs vor Security-Audit)

---

## Phase 6: Monitoring

**Goal:** Observability für Production.

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
- [ ] CWV sichtbar im Vercel Dashboard
- [ ] /api/health → 200 OK

**Manual Steps (Luca):**
- Sentry Account erstellen (Free)
- Better Stack Account erstellen (Free)
- SENTRY_DSN + SENTRY_AUTH_TOKEN in Vercel Env

---

## Phase 7: Testing

**Goal:** Test-Infrastruktur für Qualitätssicherung.

**Scope:**
- Vitest + RTL Setup in apps/tools-app
- Vitest Setup in apps/website
- Vitest Setup in packages/auth
- API Route Tests mit next-test-api-route-handler
- Playwright E2E Package
- GitHub Actions CI Workflow
- turbo.json Test-Tasks

**Success Criteria:**
- [ ] `pnpm test` läuft durch
- [ ] CI blockiert PRs mit failing Tests
- [ ] Auth E2E Test besteht
- [ ] Chat E2E Test besteht

**Dependencies:**
- Phase 6 (Monitoring) kann parallel laufen

---

## Phase 8: Performance & Accessibility

**Goal:** Polish und Professionalisierung.

**Scope:**
- Lighthouse Audit dokumentieren
- Kritische A11y Issues fixen
- Google Fonts lokal hosten (falls extern)
- Performance-Optimierungen (falls nötig)

**Success Criteria:**
- [ ] Lighthouse > 90 in allen Kategorien
- [ ] Keine WCAG 2.1 AA Violations
- [ ] Keine Third-Party Google Fonts Requests

**Dependencies:**
- Alle anderen Phasen abgeschlossen

---

## Timeline

| Phase | Geschätzt | Abhängigkeiten |
|-------|-----------|----------------|
| Phase 4 (DSGVO) | 2-3 Stunden | - |
| Phase 5 (Security) | 3-4 Stunden | Phase 4 |
| Phase 6 (Monitoring) | 2-3 Stunden | - (parallel zu 4/5 möglich) |
| Phase 7 (Testing) | 4-6 Stunden | - (parallel zu 6 möglich) |
| Phase 8 (Performance) | 1-2 Stunden | alle anderen |

**Gesamt:** ~2-3 Tage bei fokussierter Arbeit

---

*v2.0 Roadmap erstellt: 2026-04-13*
