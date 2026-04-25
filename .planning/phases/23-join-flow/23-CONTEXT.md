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
- **D-15** — **Assessment-Weiche kommt POST-Submit, nicht als inline Step (revidiert).** Flow bleibt **Single-Page** (siehe D-17). Auf dem Success-Screen (Inline-Swap, D-19) erscheint ein Primär-Button `„Jetzt Level testen (2 min)"` → leitet nach Phase 24 auf `/test` weiter. Secondary-Link: `„Später im Dashboard"`. Post-Signup wird Assessment zusätzlich via Welcome-Mails und Circle-Push erneut forciert — die mittelfristige Community-Mechanik (Level-Progression, nächste Level) baut auf dem Test-Score auf. Phase 23 rendert den CTA; die `/test`-Seite selbst kommt in Phase 24 (der Link führt initial auf einen 503-/Placeholder, analog Signup-503).
- **D-16** — **Social-Share-Buttons auf Success-Screen: V1 ohne.** Phase 27 Copy-Pass entscheidet ob Viral-Coefficient eine Aufnahme rechtfertigt.
- **D-17** — **Flow-Struktur: Single-Page mit Inline-Success-Swap** (nicht Multi-Step-Wizard). Alle Felder auf einer Route, Submit triggert Card-Swap (Form → Success), kein Progress-Indicator, keine Step-Header. Entscheidung gegen ROADMAP-Wording „3-Step-Flow" → Conversion-Minimalismus > Wizard-Feeling. Self-Select-Level ist **raus** (D-18), Assessment-Weiche ist post-submit CTA.
- **D-18** — **Self-Select-Level (1-5) raus.** ROADMAP listete das als Step-1-Feld — gestrichen. Begründung: Self-Rating ist ungenau; der /test-Flow (Phase 24) liefert den Score deutlich besser. Weniger Felder = mehr Conversion.
- **D-19** — **Hero-Layout: reduziertes Hero (`min-h-[60vh]`) + Form direkt darunter.** Unterseiten-Blueprint (`min-h-[calc(100vh-5rem)]` bei /about, /partner) ist zu hoch für Simon §10 „Formular sofort sichtbar". Kompromiss: LabeledNodes-Background + max-w-4xl Hero-Container bleibt Blueprint-konform (Eyebrow-Pill, H1 mit `--fs-display`, text-shadows), aber vertikale Höhe reduziert, sodass Form auf Desktop ohne Scroll angeteasert ist. Auf Mobile kein Split-Layout; Form scrollt einfach unter Hero.
- **D-20** — **Form-Style: Card mit Border + Subtle Shadow, max-w-lg, zentriert.** `border border-border/60 rounded-2xl` + `shadow-sm` (DS-Token-konform, keine inline-magic). Card-Style + zentriert anstatt Split-Layout (gegen Simon §10 „kein FAQ / keine Ablenkung"). Abstand Hero→Form via `<SectionTransition variant="soft-fade" />`.
- **D-21** — **Hero-Copy finale:** Eyebrow = `„// jetzt beitreten"` (konsistent mit /about `„// Generation AI · Über uns"`, /partner `„// für partner"`). H1 = „2 Minuten — dann bist du dabei." (D-11). **KEINE H2-Subline** — Simon §10 `„kein FAQ, kein scroll-heavy Marketing"`, wir halten das Hero lean. Intro-Lede kurz: `„Kostenlos. Für alle Fachrichtungen. Keine Haken."` (max-w-2xl, `text-lg sm:text-xl`). 3 Benefit-Icons darunter als Pattern-Row: `„Kostenlos · Keine Verpflichtung · In 2 Minuten"` (Simon §10 explizit).
- **D-22** — **Success-State = Inline-Swap in der Form-Card.** Submit erfolgreich → Form-Card animiert raus (motion opacity+y), Success-Card animiert rein im gleichen Container. Kein Route-Change, kein Full-Page-Takeover. Inhalt Success-Card: Dankeschoen-Headline („Danke, [Name]! Wir melden uns, sobald wir live gehen."), Assessment-Primär-CTA (D-15), Secondary-Link.

---

## Success Criteria

- [ ] `/join` Route existiert in `apps/website/app/join/page.tsx` (Server-Component mit `await headers()` für Nonce + Client-Wrapper analog `about-client.tsx`)
- [ ] Reduziertes Hero (`min-h-[60vh]`) mit LabeledNodes + Eyebrow + H1 (`--fs-display`) + Lede + 3 Benefit-Icons — **keine H2-Subline** (D-21)
- [ ] Form-Card direkt unter Hero (max-w-lg, `border border-border/60 rounded-2xl shadow-sm`, zentriert) — Desktop teased Form ohne Scroll an
- [ ] Form-Felder: Email (required), Vor- + Nachname (oder kombiniert, required), Uni-Combobox (required, Autocomplete + Freitext), Studiengang (optional), DSGVO-Checkbox (required, verlinkt auf `/datenschutz`), Marketing-Opt-in (optional, default off)
- [ ] **Kein** Self-Select-Level-Feld (D-18), **keine** Multi-Step-Progress-Bar (D-17)
- [ ] Client-side Validation (Email-Format, Required-Fields, Inline-Fehler mit aria-live)
- [ ] Server-side Validation (Zod), Fehler werden inline angezeigt (deutsch, VOICE.md-konform)
- [ ] Submit → Server-Action → Waitlist-Insert (Supabase `waitlist` Table, RLS) + Confirmation-Mail (React-Email-Template in `packages/emails`)
- [ ] Rate-Limit (5/15min per IP via Upstash)
- [ ] Success-State = **Inline-Swap** (D-22): Form-Card animiert raus, Success-Card mit „Danke, [Name]"-Headline + Primär-CTA `„Jetzt Level testen (2 min)"` (→ `/test`, aktuell 503/placeholder) + Secondary-Link „Später im Dashboard" animiert rein
- [ ] `?redirect_after=...` Query-Param wird nach erfolgreichem Submit gespeichert und bei späterem Auth-Flow wieder aufgegriffen (Phase 25)
- [ ] Sticky-Header + Footer aus Layout-Shell (Phase 20), MotionConfig mit Nonce
- [ ] Mobile responsive, Form-Felder groß genug für Touch (≥44px)
- [ ] A11y: Labels korrekt, Focus-States sichtbar (DS-Tokens), Submit per Enter auslösbar, Combobox keyboard-navigierbar, Fehler mit `aria-live="polite"`
- [ ] Visuelle Konsistenz zu /about + /partner: gleicher Hero-Eyebrow-Style, gleicher Font-Token, gleiche Section-Transitions (`<SectionTransition variant="soft-fade" />`), **keine** `border-b border-border` auf Section-Level
- [ ] Lighthouse `/join` > 90 (Performance + A11y + SEO + Best Practices)
- [ ] Meta-Tags: `<title>Jetzt beitreten · Generation AI</title>`, überzeugende Description
- [ ] Nav-Item „Jetzt beitreten" highlightet `/join` (sollte bereits funktionieren aus Phase 20)
- [ ] Sitemap-Eintrag `/join` in `app/sitemap.ts` (Priority 0.8, changeFrequency monthly, analog /about)
- [ ] Playwright-Smoke unter `packages/e2e-tools/tests/join.spec.ts`: Route lädt, Form submittet, Success-Card rendert, Invalid-Email zeigt Error, Rate-Limit nach 6 Submits aktiv
- [ ] Supabase `waitlist` Table existiert mit RLS (Migration im Repo, via Supabase MCP oder `supabase/migrations/`)

---

## Resolved Questions (2026-04-24, `/gsd-autonomous --interactive` Batch 1+2)

Alle ursprünglich offenen Fragen und die Architektur-Fragen geklärt und in D-11..D-22 kodifiziert:

**Batch 1 — Ursprüngliche offene Fragen:**
1. **Hero-Copy** → D-11 („2 Minuten — dann bist du dabei.")
2. **Uni-Feld** → D-12 (Combobox + Autocomplete + Freitext)
3. **Studiengang** → D-13 (optional)
4. **Marketing vs. DSGVO** → D-14 (2 getrennte Checkboxen)
5. **Waitlist-Mail-Template** → D-07 (React-Email im Brand-Look, Phase 17 Setup)
6. **Social-Share** → D-16 (V1 ohne, Phase 27 Review)
7. **Waitlist-Table** → D-05 (separate `waitlist`-Table)
8. **Assessment-Integration** → D-15 (als post-submit CTA, nicht inline Step)

**Batch 2 — Architektur + Copy + UX:**
9. **Flow-Struktur** → D-17 (Single-Page statt Multi-Step-Wizard)
10. **Self-Select-Level** → D-18 (raus — nur Assessment-Weiche post-submit)
11. **Hero-Layout Konflikt Simon §10 vs. Blueprint** → D-19 (reduziertes Hero `min-h-[60vh]`)
12. **Form-Style** → D-20 (Card mit Border + Shadow, max-w-lg, zentriert)
13. **Waitlist-Backend-Scope** → D-05 bestätigt (volle Supabase-Migration jetzt)
14. **Hero-Copy-Details** → D-21 (Eyebrow `// jetzt beitreten`, keine H2, kurze Lede, 3 Benefit-Icons)
15. **Success-State-Präsentation** → D-22 (Inline-Card-Swap, kein Redirect)
16. **Assessment-CTA-Hierarchie** → D-15 (Primär-Button + Secondary-Link)

**Batch 3 — Danach (YOLO-Autonomie, Luca 2026-04-24):** Alle verbleibenden Detail-Entscheidungen werden vom Plan-Agent und Execute-Agent nach bestem Wissen getroffen (Empfehlungen + AGENTS.md-Blueprint + brand/VOICE.md + bestehende `/about` + `/partner` als Referenz-Konsistenz).

---

## Release

Patch innerhalb Milestone v4.0. Page-Addition + Waitlist-Table-Migration. Breaking Change-Potenzial: keines (signup ist ja eh disabled).

**Re-Activation bleibt Phase 27 Go-Decision** — `/join` funktioniert in V1 als Waitlist-Sammler, Phase 25 Circle-API-Sync ersetzt Waitlist-Submit durch echten Supabase-Flow, Phase 27 Copy-Pass entscheidet den Live-Go mit Luca.
