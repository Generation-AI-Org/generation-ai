---
phase: 23
slug: join-flow
type: context
status: planning
created: 2026-04-23
last-updated: 2026-04-24
depends_on:
  - 20.6 (Landing Sections Rebuild — Nav + DS baseline, CTAs zeigen auf /join)
  - 21 (/about — FAQ als Fallback-Link „Offene Fragen?")
blocks:
  - 22.5 (Events-Anmelde-Gate redirected hierher)
  - 22.7 (Tools-Subdomain Login-Button zeigt hierher)
branch: feature/phase-23-join-flow
---

# Phase 23 — `/join` Fragebogen-Flow

> Signup-Zielseite mit maximaler Conversion, minimaler Reibung. Hero mit direktem Einstieg ins Formular, keine Inhalte-Distraction. Backend-Anbindung bleibt bis Phase 25 **503 disabled** (Form rendert + validiert, Submit zeigt Coming-Soon-State). Umsetzung nach Simons Konzept §10.

---

## Mission

`/join` ist der **Top-Conversion-Endpunkt** der gesamten Website. Alle CTAs von Landing, Partner, Events, tools-app führen hierher. Die Seite muss:

1. In unter 3 Sekunden kommunizieren: „Du bist richtig hier, das geht schnell, das kostet nichts."
2. Den Signup-Flow **so reibungsarm wie möglich** gestalten — kein FAQ, kein scroll-heavy Marketing, kein Optional-Field-Overkill
3. Den technischen Backend-Block (503-Gate bleibt bis Phase 25) eleganter abfangen als mit HTTP-Fehler — z.B. Waitlist-Pattern: „Wir benachrichtigen dich, sobald die Registrierung offen ist."

Simons Prinzipien §10: „Maximale Conversion, minimale Reibung, kein FAQ (das ist auf Startseite und Über uns verteilt). Hero mit direktem Einstieg ins Formular, Formular sofort auf der Seite sichtbar, nicht erst nach Scrollen."

---

## Scope

**In-scope:**

### 1. Hero mit sofortigem Form-Entry
- H1-Claim (Simon §10 noch nicht gescripted, Vorschlag: „Willkommen in der Community." oder „2 Minuten — dann bist du dabei.")
- Subline mit Eigenschaften (Simon TBD)
- **3 Benefit-Icons unter H1**: „Kostenlos · Keine Verpflichtung · In 2 Minuten" (Pattern analog Hero-Landing-Trust-Badges)
- **Formular sofort sichtbar** — kein „erst scrollen bitte"

### 2. Signup-Formular — Minimal-Scope V1
Felder (Minimum Viable):
- **Email** (Pflicht, Validation)
- **Name** (Vorname + Nachname, oder ein Feld)
- **Uni / Ausbildungsstand** (Dropdown oder Textfeld — Option für Non-Students? Simon §1.3: „Für alle Fachrichtungen" → Uni-Dropdown mit Freitext-Option „andere")
- **Studiengang** (optional, Textfeld)
- **DSGVO-Consent** (Checkbox, mit Link auf /datenschutz)
- **Marketing-Opt-in** (Checkbox, optional, default unchecked — E-Mail-Benachrichtigungen zu Events)

Später optional (Phase 24 Assessment, Phase 27):
- KI-Kompetenz-Level-Selfassessment
- Interesse-Tags (Recherche, Coding, Content, …)

### 3. Submit-Handling (V1)
- **Aktuell: `/api/auth/signup` Route ist 503** (seit Phase 4, bewusst deaktiviert)
- **V1-Verhalten:** Form submitted → zeigt eleganten „Wir benachrichtigen dich sobald wir live gehen" State. Email wird in eine separate Waitlist-Table eingelagert (Supabase `waitlist` table) oder an `admin@` per Mail gesendet. Kein Signup-through.
- **Nach Phase 25 (Circle-API-Sync):** 503-Block entfernen, echter Signup-Flow aktivieren. Phase 27 entscheidet den Launch-Go.

### 4. Success/Confirm-Flow
- Nach Submit (V1 Waitlist): „Danke, [Name]! Wir melden uns, sobald es losgeht." + Social-Share-Buttons „Teile Generation AI" (optional, nice-to-have)
- Nach Submit (V2 live): Redirect zu Supabase-Email-Confirm-Page mit „Check deine Mail"-Screen (existiert bereits aus Phase 17)

### 5. Return-URL-Handling (Kritisch für Phase 22.5)
- Query-Param `?redirect_after=/events/[slug]` oder `?next=/events/[slug]` bei Events-Anmelde-Gate
- Nach Signup + Email-Confirm: Auto-Redirect zum Ziel
- Siehe Phase 22.5 D-08

### 6. Page-Hierarchy — strikt Minimal
- Kein FAQ auf der Seite (Simon §10 explizit)
- Keine „Was kannst du hier?" Sektion (das ist Job der Landing)
- Kein Team/Social-Proof-Scroll (das ist Job von /about)
- Nur: Hero + Form + Submit + Footer

**Out-of-scope:**
- **Aktive Backend-Signup-Pipeline** — bleibt 503 bis Phase 25
- Google OAuth, Apple Sign-in (Backlog seit Phase 17)
- Magic-Link als Primary-Flow (Phase 12+13 haben PKCE etabliert, bleibt Secondary)
- KI-Kompetenz-Assessment-Integration — eigenständige Phase 24
- Circle-Sync-Auto-Provisioning — Phase 25
- Inline-Event-Anmelde-Flow (das ist Phase 22.5 Responsibility)

---

## Decisions

- **D-01** — **Waitlist-Pattern als V1**. Solange Signup 503 ist, sammelt `/join` Waitlist-Einträge (Supabase-Table `waitlist` oder Mail an `admin@`). Das ist **ehrlicher** als ein „Coming Soon"-Placeholder und **generiert Data** für Launch-Kommunikation.
- **D-02** — Minimal-Felder V1: Email, Name, Uni/Ausbildung, DSGVO-Consent. Marketing-Opt-in und Studiengang-Freitext sind optional. Assessment-Fragen NICHT hier — eigene Phase 24.
- **D-03** — Return-URL-Param-Name: `?redirect_after=` konsistent für Cross-Phase-Routing (Phase 22.5 Events-Gate nutzt denselben).
- **D-04** — Kein FAQ auf `/join` (Simon §10 explizit). FAQ-Traffic wird auf Landing (Kurz-FAQ) + /about (10-FAQ) gelenkt.
- **D-05** — Supabase-Table für Waitlist: `waitlist` mit Feldern `email, name, university, study_program, created_at, source (varchar default 'join-page'), notified_at (nullable)`. RLS: nur Service-Role darf lesen, niemand schreiben (außer via Server-Action mit Rate-Limit).
- **D-06** — Rate-Limit auf Waitlist-Submit: Upstash-Redis (bereits im Projekt), 5 Requests/15min pro IP. Analog zu Phase 6 Rate-Limiting für Chat.
- **D-07** — Confirmation-Mail an Waitlist-Eintrag: Ja, simpel („Wir haben deine Anmeldung empfangen — du bekommst Bescheid sobald wir live gehen."). Template in `packages/emails` (React Email Setup aus Phase 17 wiederverwenden).
- **D-08** — Form-Validation Client-side (instant) + Server-side (Zod-Schema, bereits projektweit verwendet). Fehler-Messages deutsch (VOICE.md-konform).
- **D-09** — Visual-Design: zwei CTA-Buttons im Hero **nicht** sinnvoll (es gibt nur einen primären Pfad). Nur ein Submit-Button „Kostenlos beitreten".
- **D-10** — Nach Phase 25 Circle-API-Sync wird V1-Waitlist-Logic umgeswitcht auf echten Supabase-Signup + Magic-Link + Circle-Auto-Enrollment. Der V1-Code muss so strukturiert sein, dass der Submit-Handler atomar austauschbar ist (Interface bleibt stabil).
- **D-11** — **Hero-Copy H1:** „2 Minuten — dann bist du dabei." (Conversion-fokussiert, baut auf Benefit-Icon „In 2 Minuten" auf).
- **D-12** — **Uni/Ausbildung-Feld:** Combobox mit Autocomplete über deutsche Unis + Freitext-Option für „Andere / Ausbildung / Berufstätig". Non-Students dürfen frei eintippen (Simon §1.3-konform).
- **D-13** — **Studiengang:** optional (Minimal-Friction). Kein Pflicht-Gate.
- **D-14** — **DSGVO + Marketing = 2 getrennte Checkboxen.** DSGVO required, Marketing optional + default unchecked. Rechtlich sauber (Kopplungsverbot).
- **D-15** — **Assessment-Integration als optionaler Step 2 in /join** (nicht als separater Post-Signup-Link). Step 2 ist Assessment-Weiche mit Link zu `/test` (Phase 24) + Skip-Button. Der Flow bleibt übersichtlich 3+1 (Fragebogen → Assessment-Weiche → Submit → Confirmation). Post-Signup wird Assessment zusätzlich via Welcome-Mails und Circle-Push erneut forciert — die mittelfristige Community-Mechanik (Level-Progression, nächste Level) baut auf dem Test-Score auf. Skipbar bleibt wichtig für User ohne Zeit. **Phase 23 baut Step 2 als Weiche — die `/test`-Seite selbst kommt in Phase 24.**
- **D-16** — **Social-Share-Buttons auf Success-Screen: V1 ohne.** Phase 27 Copy-Pass entscheidet ob Viral-Coefficient eine Aufnahme rechtfertigt.

---

## Success Criteria

- [ ] `/join` Route existiert in `apps/website/app/join/page.tsx`
- [ ] Hero mit H1 + Subline + 3 Benefit-Icons + Form sofort sichtbar (ohne Scroll)
- [ ] Form hat Felder: Email, Name, Uni/Ausbildung, DSGVO-Consent (plus optional: Studiengang, Marketing-Opt-in)
- [ ] Client-side Validation (Email-Format, Required-Fields)
- [ ] Server-side Validation (Zod), Fehler werden inline angezeigt
- [ ] Submit → Server-Action → Waitlist-Insert (Supabase) + Confirmation-Mail (Resend)
- [ ] Rate-Limit (5/15min per IP via Upstash)
- [ ] Success-Screen „Danke, [Name]" rendert
- [ ] `?redirect_after=...` Query-Param wird nach erfolgreichem Submit gespeichert und bei späterem Auth-Flow wieder aufgegriffen (Phase 25)
- [ ] DSGVO-Consent-Checkbox verlinkt auf `/datenschutz`
- [ ] Mobile responsive, Form-Felder groß genug für Touch
- [ ] A11y: Labels korrekt, Focus-States sichtbar, Submit-Button per Enter auslösbar
- [ ] Lighthouse `/join` > 90
- [ ] Meta-Tags: `<title>Jetzt beitreten · Generation AI</title>`, überzeugende Description
- [ ] Nav-Item „Jetzt beitreten" highlightet `/join` (sollte bereits funktionieren aus Phase 20)
- [ ] Playwright-Smoke: Route lädt, Form submittet, Success-Screen rendert, Invalid-Email zeigt Error, Rate-Limit nach 6 Submits aktiv
- [ ] Supabase `waitlist` Table existiert mit RLS (Migration im Repo)

---

## Resolved Questions (2026-04-24, `/gsd-autonomous --interactive`)

Alle ursprünglich offenen Fragen geklärt und in D-11..D-16 kodifiziert:

1. **Hero-Copy** → D-11 („2 Minuten — dann bist du dabei.")
2. **Uni-Feld** → D-12 (Combobox + Autocomplete + Freitext)
3. **Studiengang** → D-13 (optional)
4. **Marketing vs. DSGVO** → D-14 (2 getrennte Checkboxen)
5. **Waitlist-Mail-Template** → D-07 / D-14-Referenz (React-Email im Brand-Look, Phase 17 Setup)
6. **Social-Share** → D-16 (V1 ohne, Phase 27 Review)
7. **Waitlist-Table** → D-05 (separate `waitlist`-Table)
8. **Assessment-Integration** → D-15 (optionaler Step 2 in /join als Weiche, nicht Post-Signup-Link)

---

## Release

Patch innerhalb Milestone v4.0. Page-Addition + Waitlist-Table-Migration. Breaking Change-Potenzial: keines (signup ist ja eh disabled).

**Re-Activation bleibt Phase 27 Go-Decision** — `/join` funktioniert in V1 als Waitlist-Sammler, Phase 25 Circle-API-Sync ersetzt Waitlist-Submit durch echten Supabase-Flow, Phase 27 Copy-Pass entscheidet den Live-Go mit Luca.
