---
phase: 27
slug: copy-pass-and-launch-cleanup
type: context
status: planning
created: 2026-04-23
last-updated: 2026-04-23
depends_on:
  - all prior phases (20.6, 21, 22, 22.5, 22.7, 23, 24, 25, 26)
branch: feature/phase-27-copy-cleanup
---

# Phase 27 — Copy-Pass & Launch-Cleanup

> Struktur steht, Copy wird geschärft. Alle Placeholder-Texte werden auf Simons Konzept-Wording und `brand/VOICE.md` gebracht. Dummy-Data raus, echte Inhalte rein. Finaler Durchgang vor dem großen Launch.

---

## Mission

In allen vorherigen Phasen galt Simons Konzept-Wording nur als **Richtung**, finale Copy wurde deferred. In dieser Phase gehen wir jede Seite systematisch durch und bringen die Texte auf Launch-Niveau. Parallel: Dummy-Data („Beispiel"-Badges, Placeholder-Events, Platzhalter-Artikel) raus oder durch echte Inhalte ersetzt.

---

## Scope

**In-scope:**

### 1. Copy-Alignment alle Seiten
- **Startseite** — Hero-Claim, Problem-Block (3 Belege), Offering-Claims, Tool-Showcase-Intro, Community-Preview-Intro, Trust-Header, Final-CTA, Kurz-FAQ-Antworten
- **`/about`** — Mission, Story, Team-Rollen-Texte, Werte-Paragraphen, Verein-Text, FAQ-Antworten, Abschluss-CTAs, Kontakt-Box
- **`/partner`** — Hero, alle 4 Tab-Value-Props (Unternehmen/Stiftungen/Hochschulen/Initiativen), Vorteile-Listen, CTA-Labels, Formular-Labels, Transparenz-Hinweis
- **`/events`** — Hero, Formate-Beschreibungen, Members-Only-Hinweis, Abschluss-CTA
- **`/join`** — Fragebogen-Fragen, Validation-Messages, Confirmation-Texte
- **`/test`** — Intro, Consent-Text, Fragen, Ergebnis-Screens
- **`/community`** — Hero, 4 Content-Pillars-Texte, Blog-Abschluss-CTA, Artikel-Teaser-Intro
- **tools-app** — Hero „KI-Tools kuratiert", Login-Button-Copy, Lite/Pro-Badges-Copy
- **Footer** — Tagline, Link-Labels, „Made with care in Berlin & Hamburg"
- **Legal** — Impressum, Datenschutz: Branding-Zeilen ja/nein?

### 2. Dummy-Data-Cleanup
- **Tool-Showcase auf Landing** — „Beispiel"-Badges raus, echte Featured-Tools eingespielt (depends on Phase 26 Block B)
- **Community-Preview auf Landing** — echte MDX-Teaser statt Placeholder
- **Events** — mindestens 2-3 echte kommende Events als MDX
- **Archiv** — mindestens 3 vergangene Events als Social Proof
- **Trust-Sektion** — Sparringspartner-Stubs durch echte Logos/Namen ersetzen (wenn vorhanden)
- **Team-Bilder auf `/about`** — Placeholder-Avatars durch echte Fotos ersetzen
- **Ansprechpartner-Karten auf `/partner`** — Placeholder durch echte Fotos + LinkedIn-Links

### 3. VOICE.md-Konsistenz-Check
- `brand/VOICE.md` enthält Tonalitäts-Guidelines + Microcopy-Library
- Alle Button-Labels, Error-Messages, Empty-States, Toast-Texte, Form-Validation gegen VOICE.md abgleichen
- Inkonsistenzen dokumentieren und fixen

### 4. Metadata-Pass
- Alle Seiten haben korrekte Meta-Tags:
  - `<title>` spezifisch pro Seite (nicht nur „Generation AI")
  - `meta description` überzeugend, max. 160 Zeichen
  - OG-Image pro Hauptseite (Hero-basiert oder dedicated)
  - Twitter-Card korrekt
  - Canonical URLs

### 5. SEO-Final-Checks
- Sitemap.xml vollständig (alle neuen Routen drin)
- Robots.txt erlaubt alle public Routen, disallowed `/api`, `/settings`, etc.
- Schema.org Organization Markup auf Landing
- Schema.org Article Markup auf `/community/artikel/[slug]`
- Schema.org Event Markup auf `/events/[slug]`
- Schema.org FAQPage Markup auf `/about` + Landing-Kurz-FAQ

### 6. Launch-Checklist durchgehen
- `~/projects/_shared/WEBSITE-CHECKLIST.md` als Grundlage
- A11y final pass (Contrast, Focus-Rings, Screen-Reader)
- Performance final pass (Lighthouse > 90 alle Seiten)
- Cookie-Banner-Check (falls relevant — Datenschutz ohne Tracker aktuell)
- 404-Seite designed
- 500-Seite designed
- Error-Boundaries an sinnvollen Stellen
- Email-Templates alle final (6 Supabase-Templates + Partner-Contact-Mail)

### 7. Signup-Reactivation-Go?
- Signup ist aktuell auf 503 disabled
- In Phase 25 Circle-API-Sync wurde die Tech-Pipeline aktiviert
- **Luca entscheidet in Phase 27**: Signup live-schalten ja/nein?
- Falls ja: 503-Block aus `apps/website/app/api/auth/signup/route.ts` entfernen, manuellen Test durchlaufen, monitoren

**Out-of-scope:**
- Neue Features (alles was neu ist, kommt post-Launch)
- Redesign bestehender Sections (Scope nur Copy + Content)
- Neue Seiten
- Redirects für Alt-URLs (wird separat gehandhabt falls nötig)

---

## Decisions (vorläufig, werden im Planning finalisiert)

- **D-01** — Copy-Pass ist die letzte Phase vor Launch. Keine Struktur-Änderungen mehr in dieser Phase.
- **D-02** — Signup-Reactivation ist Luca-Approval-Gate, nicht in Phase-Execution enthalten.
- **D-03** — Launch = wenn Phase 27 done + Luca gibt „go" → Deploy zu Production + öffentliche Kommunikation.
- **D-04** — Dummy-Data-Cleanup erfordert echte Inhalte von Luca (Events, Team-Fotos, Partner-Logos, Circle-Content-Extracts). Phase kann nicht abschließen ohne diese Lieferungen.

---

## Success Criteria

- [ ] Alle Placeholder-Texte durch finales Wording ersetzt (Simons Konzept + VOICE.md)
- [ ] Alle „Beispiel"-Badges raus, echte Inhalte live
- [ ] Meta-Tags + OG-Images + Schema.org markup vollständig
- [ ] Sitemap + Robots.txt final
- [ ] Lighthouse > 90 auf allen 7 Hauptseiten (`/`, `/about`, `/partner`, `/events`, `/join`, `/test`, `/community`)
- [ ] A11y manual pass OK
- [ ] 404 + 500 + Error-Boundaries designed
- [ ] Alle Mail-Templates (Supabase + Partner-Contact) final
- [ ] Signup-Reactivation-Entscheidung getroffen und dokumentiert
- [ ] Launch-Checklist durchgearbeitet

---

## Release

Launch-Minor oder v5.0 Final. Phase 27 = Ship-Ready-State.
