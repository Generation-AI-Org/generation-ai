# Requirements — v2.0 Production Hardening

> Generation AI Apps production-ready und professional-grade machen

## R1: Security Headers

**Problem:** Beide Apps haben unvollständige Security Headers. HSTS fehlt komplett, CSP fehlt komplett.

**Requirements:**
- R1.1: HSTS Header in beiden Apps (`max-age=63072000; includeSubDomains; preload`)
- R1.2: Standard Security Headers in beiden Apps (X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy)
- R1.3: CSP in tools-app (nonce-basiert via proxy.ts für dynamische Inhalte)
- R1.4: CSP in website (unsafe-inline via next.config.ts für statische Inhalte)
- R1.5: CSP erst in Report-Only-Mode testen, dann enforcing

**Akzeptanzkriterien:**
- [ ] securityheaders.com zeigt A+ für beide Domains
- [ ] Keine CSP-Violations in Browser-Console (Production)
- [ ] Supabase Auth funktioniert weiterhin (connect-src korrekt)

---

## R2: DSGVO / Legal Compliance

**Problem:** Impressum und Datenschutzerklärung müssen geprüft/vervollständigt werden. DPAs mit Drittanbietern fehlen.

**Requirements:**
- R2.1: Impressum auf beiden Domains prüfen (Pflichtangaben nach DDG §5)
- R2.2: Datenschutzerklärung aktualisieren (TDDDG-Bezeichnung, alle Drittanbieter)
- R2.3: Supabase DPA anfordern und unterzeichnen
- R2.4: Vercel DPA aktivieren
- R2.5: Resend DPA prüfen
- R2.6: Supabase Region prüfen (EU Frankfurt empfohlen)
- R2.7: Account-Delete-Funktion in tools-app (Art. 17 DSGVO)

**Akzeptanzkriterien:**
- [ ] Impressum enthält alle Pflichtangaben (Name, Adresse, E-Mail, Telefon)
- [ ] Datenschutzerklärung nennt Supabase, Vercel, Resend, Claude API
- [ ] DPAs mit Supabase, Vercel, Resend dokumentiert
- [ ] User kann Account selbst löschen oder Löschanfrage stellen

---

## R3: Error Tracking & Monitoring

**Problem:** Aktuell kein Error Tracking, kein Uptime Monitoring, keine strukturierten Logs.

**Requirements:**
- R3.1: Sentry in beiden Apps einrichten (Free Tier)
- R3.2: Sentry Source Maps Upload bei Vercel Build
- R3.3: Sentry Alert-Regeln (neue Errors, Error-Spikes)
- R3.4: Better Stack Uptime Monitoring (3-4 Monitore)
- R3.5: Vercel Speed Insights aktivieren
- R3.6: /api/health Endpoint in tools-app

**Akzeptanzkriterien:**
- [ ] Errors erscheinen in Sentry Dashboard mit Stack Traces
- [ ] Downtime-Alert kommt per E-Mail bei Site-Ausfall
- [ ] Core Web Vitals sichtbar im Vercel Dashboard
- [ ] /api/health gibt 200 OK zurück

---

## R4: Testing Infrastructure

**Problem:** Keine Tests vorhanden. Kein CI/CD.

**Requirements:**
- [x] R4.1: Vitest + React Testing Library in apps/tools-app (07-01)
- R4.2: Vitest in apps/website
- [x] R4.3: Vitest in packages/auth (Unit Tests für Helpers) (07-01)
- R4.4: API Route Tests mit next-test-api-route-handler
- R4.5: Playwright E2E Package für kritische Flows (Auth, Chat)
- R4.6: GitHub Actions CI Workflow (Build, Lint, Test)
- R4.7: turbo.json Test-Tasks für Caching

**Akzeptanzkriterien:**
- [ ] `pnpm test` läuft durch ohne Fehler
- [ ] CI blockiert PRs mit failing Tests
- [ ] Auth-Flow E2E Test besteht
- [ ] Chat-Flow E2E Test besteht

---

## R5: Performance & Accessibility

**Problem:** Keine systematische Performance- oder A11y-Prüfung.

**Requirements:**
- R5.1: Lighthouse Audit dokumentieren (Performance, A11y, Best Practices, SEO)
- R5.2: Kritische A11y-Issues fixen (falls vorhanden)
- R5.3: Google Fonts lokal hosten (kein Google CDN)

**Akzeptanzkriterien:**
- [ ] Lighthouse Score > 90 in allen Kategorien
- [ ] Keine WCAG 2.1 AA Violations
- [ ] Keine Third-Party-Requests zu Google Fonts

---

## Priorisierung

| Requirement | Priorität | Begründung |
|-------------|-----------|------------|
| R2 (DSGVO) | **KRITISCH** | Rechtlich Pflicht, Abmahngefahr |
| R1 (Security) | **HOCH** | Professional-grade Security |
| R3 (Monitoring) | **HOCH** | Production-Readiness |
| R4 (Testing) | **MITTEL** | Qualitätssicherung |
| R5 (Performance) | **MITTEL** | Polish |

---

## Out of Scope

- Cookie Banner (nicht nötig, nur technische Cookies)
- Analytics (kommt später, Plausible empfohlen)
- Audit Logging (overkill für MVP)
- Dependency Scanning (nice-to-have, später)
