# Requirements — v4.0 Website Conversion-Layer & Onboarding-Funnel

> Website (generation-ai.org) vom One-Pager-Intro zum Conversion-Entry-Point mit klarem Funnel Richtung Mitgliedschaft.

**Scope-Quelle:** `.planning/research/v4-scoping/SCOPE.md` (Sparring-Session 2026-04-19, inkl. Value-Prop-v2 + Umfrage N=109).

---

## R1: Navigation & Landing-Page

**Problem:** Aktuelle Website ist One-Pager (Hero → Features → TargetAudience → Signup). Keine Navigation, kein Funnel, keine Deep-Dive-Pfade. Landing transportiert Generation AI als e.V. nicht.

**Requirements:**
- R1.1: ✅ Top-Nav mit `Tools · Community · Für Partner ▾ · Über uns · [Jetzt beitreten]`. Tools + Community als externe Links zu Subdomains. Kein Login-Button im Header. *(done in 20-02: Header umgebaut, Dropdown + Mobile-Sheet funktional, 3/3 R1.1 Playwright-Tests grün)*
- R1.2: Hero-Section — Claim + Subline + Primary CTA "Jetzt beitreten" (kein Login, keine Zahlen).
- R1.3: Diskrepanz-Section — zentraler Hook mit Gegenüberstellung "Was Wirtschaft will" vs "Was Studis mitbringen" (6 Kernzahlen aus Value-Prop-v2). Custom data-viz mit Scroll-Animation. Closer: *"Generation AI schließt diese Lücke."*
- R1.4: 4-Card-Angebot (Community, Wissensplattform, Events & Workshops, Expert-Formate) mit Icon + Titel + 1-Satz + Deep-Link.
- R1.5: Tool-Showcase Teaser — 3-5 featured Tools aus tools-app (Featured-Flag im Content-Schema). CTA zu `tools.generation-ai.org`.
- R1.6: Community-Preview — zweispaltig (letzte Artikel + kommende Events via Circle API). Fallback-Placeholder bei API-Down.
- R1.7: Zielgruppen-Split — Studi-Section groß mit CTA zu `/join`, dezenter B2B-Streifen Richtung `/partner`.
- R1.8: Trust — Logo-Strip Sparringspartner + Micro-Proof Survey-Quelle ("N=109 · März 2026").
- R1.9: Final CTA — Claim-Wiederholung + `[Jetzt beitreten]` + Sub-Line + kleiner Sekundär-Link "Erst mal umschauen → tools.generation-ai.org".
- R1.10: ✅ Footer — Legal, Sitemap, Social (LinkedIn), Kontakt-Mail, Copyright. *(done in 20-02: 4-Spalten-Grid mit Logo+Tagline, Sitemap (5 links), Legal (2 links), Kontakt (admin@generation-ai.org mailto + LinkedIn inline-SVG), Copyright mit Vereinsnennung)*

**Akzeptanzkriterien:**
- [ ] Nav-Dropdown "Für Partner" funktioniert auf Desktop + Mobile (a11y-korrekt)
- [ ] Diskrepanz-Viz animiert scroll-triggered, ohne Performance-Regression (CLS ≤ 0.1)
- [ ] Tool-Showcase + Community-Preview degraden graceful wenn API down
- [ ] Alle CTAs verlinken auf `/join` oder `/partner` (kein dead link)
- [ ] Lighthouse Landing > 90 in allen Kategorien

---

## R2: `/about`-Seite

**Problem:** Verein, Mission und Team sind aktuell nicht auf der Website repräsentiert. Kein Vertrauens-Anker für Partner und Member.

**Requirements:**
- R2.1: Mission + Vision (aus `brand/VOICE.md`).
- R2.2: Story "Warum gegründet".
- R2.3: Team-Section (Gründer + 6 aktive Mitglieder) mit Foto/Rolle/1-Satz.
- R2.4: Sparringspartner + Beirat als separate Section.
- R2.5: Verein-Block (e.V., Gemeinnützigkeit, Mitgliedsarten).
- R2.6: CTA am Ende (Beitreten + Kontakt).

**Akzeptanzkriterien:**
- [ ] Alle Personen mit Einverständnis gelistet (DSGVO-konform)
- [ ] Responsive auf Mobile (Team-Grid zu 1-Spalte)
- [ ] Keine toten Links

---

## R3: `/partner`-Seite

**Problem:** B2B-Zielgruppen (Unternehmen, Stiftungen, Hochschulen) haben keine klare Landing. Kooperations-Anfragen laufen aktuell nur über persönliche Kanäle.

**Requirements:**
- R3.1: Hero "Kooperation statt Standard".
- R3.2: Anker-Section `#unternehmen` — Masterclasses, Talent-Zugang, Employer Branding, Paket-Andeutung, Kontakt-CTA.
- R3.3: Anker-Section `#stiftungen` — Impact, Gemeinnützigkeit, Fördermöglichkeiten, Kontakt-CTA.
- R3.4: Anker-Section `#hochschulen` — Kooperation, Gastvorträge, Career-Services, Kontakt-CTA.
- R3.5: Reihenfolge nach Einnahme-Potenzial (Unternehmen → Stiftungen → Hochschulen).
- R3.6: Kontakt-Formular (shared, Post-MVP erstmal mailto-Link oder simple Form → Resend-Mail an admin@).

**Akzeptanzkriterien:**
- [ ] Anker-Links aus Nav springen korrekt zu `#unternehmen`/`#stiftungen`/`#hochschulen`
- [ ] Kontakt-Formular spamgeschützt (Honeypot o.ä.)
- [ ] Submit triggert Mail an admin@generation-ai.org

---

## R4: `/join`-Fragebogen-Flow

**Problem:** Aktueller Signup ist monolithisch (Name/Email/Uni in einer Form, auf 503). Kein Self-Select-Level, kein Status-Flag (Student/Pre-Studium/Early-Career), kein Progress-Feel.

**Requirements:**
- R4.1: Linearer Flow mit Progress-Indicator ("Schritt X von 3").
- R4.2: Step 1 — Fragebogen: Name, Email, Status (Student/Pre-Studium/Early-Career), Uni (wenn Student), Motivation (Auswahl Karriere/Neugier/Vertiefung/Sonstiges + Freitext), Self-Select Level 1-5 mit Beschreibungen.
- R4.3: Step 2 — Assessment-Weiche: CTA "Genauer wissen, wo du stehst? → /level-test" oder "Überspringen". (Level-Test selbst ist R5.)
- R4.4: Step 3 — Account + Circle-Flow (Backend-Trigger, siehe R6).
- R4.5: Step 4 — Confirmation-Screen mit "Check dein Postfach" + Erklärung Next-Step.
- R4.6: Validation pro Step (Email-Format, Pflichtfelder, Uni-Autocomplete).
- R4.7: State zwischen Steps persistiert (SessionStorage), damit Reload nicht alles verliert.
- R4.8: Backend bleibt 503 bis Luca-Go — aber UI komplett bauen, Submit stubbed testbar.

**Akzeptanzkriterien:**
- [ ] Alle Steps a11y-korrekt (keyboard, screen-reader, focus-management)
- [ ] Progress-Indicator zeigt aktuellen Step
- [ ] State übersteht Reload innerhalb Session
- [ ] Validation-Errors inline + aria-live
- [ ] 503-Banner "Anmeldung ist momentan geschlossen" statt Submit-Success (solange Luca nicht freigegeben hat)

---

## R5: `/level-test` Assessment

**Problem:** Self-Select-Level ist ungenau (User überschätzt sich oft). Assessment gibt objektiveren Score, aber darf nicht Pflicht sein (Friction).

**Requirements:**
- R5.1: Einstiegs-CTA aus `/join` Step 2, direkter Deep-Link `/level-test?from=join` möglich.
- R5.2: Test-Logik — 5-8 Fragen, gewichtete Scores → Level 1-5 Mapping.
- R5.3: Ergebnis-Screen mit Level + Erklärung + CTA zurück zu `/join`.
- R5.4: Score überschreibt Self-Select in Fragebogen-State.
- R5.5: DSGVO-Consent vor Test-Start (Score = Personenbezug).
- R5.6: Lösch-Flow im DSGVO-Modul (User kann Score später entfernen).
- R5.7: Standalone-tauglich (nicht nur aus `/join` erreichbar — eigener Entry-Point für Curious).

**Akzeptanzkriterien:**
- [ ] Test funktioniert ohne Login
- [ ] Consent-Checkbox blockt Submit solange nicht aktiv
- [ ] Score wird in SessionStorage geschrieben und beim Rückkehr nach `/join` gelesen
- [ ] Score erscheint in Profil-Tabelle wenn User später Account anlegt (Migration via Submit-Payload)

---

## R6: Circle-API-Sync (Unified Signup)

**Problem:** Aktuell signt User sich zweimal: einmal bei Supabase (unsere Mail), einmal manuell bei Circle (separate Circle-Mail). 2 Klicks, 2 Bestätigungen, verwirrend. Circle-API (Business-Plan $200) erlaubt aber Headless-Member-Creation + passwordless SSO-Link.

**Requirements:**
- R6.1: `/api/join` Server-Action (oder Route Handler) die bei Submit:
  - Supabase User via `admin.createUser` + Metadata (status, uni, motivation, level) anlegt
  - Circle-Member via Circle Admin-API v2 anlegt (`POST /api/admin/v2/community_members` o.ä.)
  - Circle-SSO-Link (passwordless Login) via Circle-API generiert
  - Supabase Magic-Link mit custom `redirect_to` an unseren Welcome-Screen sendet
- R6.2: Welcome-Screen (`/join/welcome?session=...`) zeigt "Willkommen" + Prominent CTA "→ Zur Community" der per SSO-Link direkt in Circle eingeloggt landet.
- R6.3: Graceful-Degrade — wenn Circle-API fehlschlägt (HTTP-Error, Timeout), schreiben wir das in Logs + zeigen Fallback-UI "Check dein Postfach für deinen Community-Zugang" (B-Fallback: Circle schickt eigene Invite-Mail).
- R6.4: Env-Vars aktivieren + dokumentieren: `CIRCLE_API_TOKEN`, `CIRCLE_COMMUNITY_ID`, `CIRCLE_COMMUNITY_URL` (sind schon in Vercel provisioniert, aktuell `not yet wired`).
- R6.5: `profiles.circle_member_id` Column befüllen (Schema existiert, Column ist leer).
- R6.6: Live-Signup bleibt 503 bis Luca-Go — aber Integration end-to-end testbar via Preview-Env mit Test-Flag.
- R6.7: Monitoring — Circle-API-Errors via Sentry erfassen (neue Tag `circle-api`).

**Akzeptanzkriterien:**
- [ ] Test-User in Preview-Env durchläuft Flow: Submit → Mail → Confirm → Welcome → "Zur Community" → ist in Circle eingeloggt ohne zweiten Passwort-Prompt
- [ ] Circle-Member-Record in Circle-Dashboard existiert mit korrekten Metadaten (Name, Email)
- [ ] `profiles.circle_member_id` ist gesetzt
- [ ] Circle-API-Fail in Test-Simulation → Fallback-UI erscheint, kein 500-Error für User
- [ ] Sentry erfasst Circle-Errors mit Tag

**Entscheidung Tech-Ansatz:** Server-Action in Next.js App Router (App-Code, testbar via Unit+E2E). **Kein** Supabase Database Webhook oder Edge Function — wollen explizite Code-Pfade, keinen versteckten DB-Magic.

---

## R7: Subdomain-Integration

**Problem:** Landing braucht echte Daten aus tools-app (Featured-Tools) und Circle (Artikel + Events). Aktuell wären das Stubs.

**Requirements:**
- R7.1: Featured-Flag im Tool-Content-Schema (Boolean `featured`, default false). Migration + Backfill für 3-5 initial-featured Tools.
- R7.2: Public API-Endpoint in tools-app: `GET /api/public/featured-tools` → Array mit Logo/Name/Slug/1-Satz. Cache via Vercel Edge/ISR.
- R7.3: Website konsumiert diese API in Landing-Tool-Showcase (Server-Component, cached).
- R7.4: Community-Preview via Circle API v2:
  - `GET /api/community/posts?space=tools&limit=4` → 3-4 letzte Artikel
  - `GET /api/community/events?upcoming=true&limit=3` → 2-3 kommende Events
- R7.5: Rate-Limit-bewusst (Circle-API hat Limits) — Cache via Route-Segment `revalidate: 300` oder KV.
- R7.6: Fallback-Placeholder für beide Preview-Blöcke (statisches Placeholder-Content wenn API down).
- R7.7: Klären was im Tools-Space public-lesbar via Circle API ist (nicht alle Circle-Spaces sind public).

**Akzeptanzkriterien:**
- [ ] Featured-Tools erscheinen in Landing, manuell togglebar via DB-Update
- [ ] Circle-Posts + Events erscheinen in Preview-Block
- [ ] API-Outage triggert Fallback (kein 500-Error für User)
- [ ] No-Layout-Shift bei Skeleton → Real-Content

---

## Priorisierung

| Requirement | Priorität | Begründung |
|-------------|-----------|------------|
| R1 (Nav + Landing) | **KRITISCH** | Conversion-Entry-Point. Ohne R1 keine neue UX. |
| R6 (Circle-Sync) | **KRITISCH** | Funnel-Enabler. Eine-Mail-Flow ist der Kern-UX-Win. |
| R4 (Join-UI) | **HOCH** | Pflicht-Pfad zum Conversion-Ziel. |
| R7 (Subdomain-Integration) | **HOCH** | Landing ohne echte Daten wirkt hohl. |
| R2 (about) | **MITTEL** | Vertrauen, aber nicht conversion-kritisch. |
| R3 (partner) | **MITTEL** | B2B-Kanal. Lead-Qualität zählt mehr als Volume. |
| R5 (level-test) | **MITTEL** | Nice-to-have, darf /join nicht blocken. |

---

## Constraints & Risiken

| Punkt | Relevanz |
|---|---|
| **LEARNINGS.md CSP-Incident** | Pflicht-Lektüre vor Änderungen an `proxy.ts`, `lib/csp.ts`, `app/layout.tsx`. Nonce auf Request, force-dynamic, Prod-Build verifizieren. |
| **Circle-API-Failover** | R6 + R7 müssen graceful degraden, nicht User blockieren |
| **DSGVO Assessment-Daten** | R5 Score = Personenbezug → Consent + Lösch-Flow |
| **Signup-503 bleibt** | R4/R6 UI komplett bauen, Backend als Stub bis Luca-Go |
| **Circle Public-Content-Scope** | R7 klären: was im Tools-Space ist public via API |
| **Circle-API-Rate-Limits** | R7 Cache-Strategie vor erstem Deploy |
| **Content-Schema-Migration (Featured-Flag)** | R7.1 setzt Änderung in content-package voraus |

---

## Out of Scope

- **Signup-Live-Reaktivierung** — entscheidet Luca separat, nicht Teil v4.0
- **Kurs-CMS** — spätere Milestone
- **Mitgliedschafts-Upgrade-Flow** (Förder → Ordentlich mit Vorstandswahl)
- **Payment-Infrastruktur** — aktuell alles kostenfrei
- **tools-app Evolution** (Multi-Modell, Token-Tracking, Web-Search, Pro-Tier) — spätere Milestone
- **Brand-Polish** (Favicon, Terminal-Animation, DESIGN.md-Update) — bereits vorhanden/erledigt
- **B2B-Sales-CRM / Partner-Management-Tool**
- **Social-Proof-Section** mit Member-Avataren/Count — "später"
- **Claim-Wording Hero + Final-CTA** — wird außerhalb dieser Milestone formuliert
- **OAuth Google + Apple** — geparkt in BACKLOG (v4.1+)
- **2FA** — geparkt in BACKLOG (v5.0)

---

*Requirements v4.0 erstellt: 2026-04-19*
