---
phase: 24
slug: test-assessment
type: context
status: planning
created: 2026-04-23
last-updated: 2026-04-24
depends_on:
  - 20.6 (Landing Sections Rebuild — Nav + DS baseline)
  - 23 (/join — Assessment optional angeboten nach Signup oder eigenständig vorher)
branch: feature/phase-24-test-assessment
---

# Phase 24 — `/test` KI-Kompetenz-Assessment

> Leichtgewichtiges Self-Assessment für Studierende: „Wo stehe ich mit KI-Skills?" 10-12 Multiple-Choice-Fragen → Kurz-Auswertung mit Einstiegs-Empfehlungen (Workshop-Level, Lernpfade, erste Events). Kein Gate für Signup, kein hartes Ranking. Empfehlung und Orientierung.

---

## Context-Klärung

Simon §1.3 Leitprinzipien erwähnen **„Freemium-Logik für SEO und Aktivierung"** als generelles Prinzip. Simons Konzept hat `/test` nicht als eigene Sektion, sondern verweist im Roadmap-Teil §13.2 auf „KI-Kompetenz-Assessment im Registrierungsflow" als Roadmap-Item.

Luca hat `/test` in der v4.0-Roadmap als eigene Phase 24 verankert (Rename von ursprünglich `/level-test` auf `/test` in Commit `c6e8ce2`). Die Intention: als **Entry-Point** auch ohne Signup (SEO-Traffic via „ki-skills test" Keywords), und als **Onboarding-Tool** für Post-Signup-User („Wo passt du hin?").

---

## Mission

Besucher:innen (mit oder ohne Account) beantworten 10-12 Kurzfragen zu ihrem aktuellen KI-Stand (Tool-Kenntnis, Anwendungskontext, Level-Selfeinschätzung). Am Ende bekommen sie:

1. **Kurz-Auswertung**: „Du bist bei [Einsteiger / Fortgeschritten / Expert]" — kein hartes Ranking, sondern eine Einordnung
2. **Empfehlungen**: 3-5 konkrete nächste Schritte (Workshop-Event, Lernpfad, Tool-Kacheln, Artikel)
3. **Optionaler Follow-up**: „Willst du Updates bekommen?" → Signup-CTA oder Login-Prompt

Der Test ist **öffentlich zugänglich** (keine Auth-Gate). Ergebnis wird nicht persistent gespeichert (außer optional als Teil des Signup-Flows).

---

## Scope

**In-scope:**

### 1. Hero (§10-äquivalent im Pattern)
- H1 „Wo stehst du mit KI?"
- Subline: „10 Fragen, 3 Minuten. Am Ende weißt du, wo du anfangen solltest."
- Intro-Badge-Zeile: „Kostenlos · Keine Anmeldung · Anonym"
- Start-Button „Test starten"

### 2. Test-Flow
- **Single-Page-App-Style** (Framer Motion Page-Transitions zwischen Fragen)
- Pro Frage: Question-Text + 3-5 Answer-Options (Radio oder Multi-Select je nach Frage)
- Progress-Bar oben („Frage 3/10")
- Back-Button (optional — verhindert Frustration bei Misclick)
- Weiter-Button prominent
- Keyboard-Nav: 1-5 für Options, Enter für Next

### 3. Frage-Katalog (10-12 Fragen — Drafting mit Luca)
Beispiel-Dimensionen (Luca finalisiert Inhalte):
- **Tool-Kenntnis:** „Welche Tools hast du schon benutzt?" (Multi-Select: ChatGPT / Claude / Perplexity / Midjourney / Notion AI / …)
- **Anwendungs-Tiefe:** „Wie oft nutzt du KI für deine Studienarbeit?" (Nie / Gelegentlich / Wöchentlich / Täglich)
- **Prompting-Erfahrung:** „Kennst du Begriffe wie Zero-Shot, Few-Shot, Chain-of-Thought?" (Ja/Teilweise/Nein)
- **Agenten/Advanced:** „Hast du schon mit Agenten/Tool-Use/Automations gearbeitet?" (Ja/Nein/Was ist das?)
- **Selfeinschätzung:** „Wie würdest du dein Level einschätzen?" (Einsteiger/Fortgeschritten/Expert/Weiß nicht)
- **Kontext:** „Was ist deine Studienrichtung?" (STEM / Wirtschaft / Kommunikation / Medizin / Andere)
- **Bedarf:** „Wofür willst du KI hauptsächlich nutzen?" (Recherche / Schreiben / Coding / Bilder / Automation / Andere)

### 4. Auswertungs-Logic
- Einfache Score-basierte Zuordnung (kein KI-Modell dahinter, keine API-Calls)
- Score 0-10 → Einsteiger, 11-20 → Fortgeschritten, 21+ → Expert (Beispiel, Luca finalisiert)
- Zuweisung zu Empfehlungs-Profilen mit pre-written Content

### 5. Results-Page
- **Level-Badge:** „Du bist: Einsteiger" (mit Pendant-Visualisierung — Farbe + Icon aus DS)
- **Einordnung-Text:** 1-2 Absätze „Was das heißt und wo du anfangen solltest"
- **3-5 Empfehlungen:** Cards mit Link-Out:
  - Workshop-Event (Link zu `/events` gefiltert auf Level)
  - Lernpfad / Tool-Kacheln (Links zu tools.generation-ai.org)
  - Community-Artikel passend zum Level (Link zu /community)
- **CTA:** „Jetzt beitreten & loslegen" → `/join`
- **Secondary:** „Test nochmal machen" (resets)
- **Optional Share-Line:** „Teile dein Ergebnis" (Share-Links — später, nicht V1)

### 6. No-Auth-Path
- Ergebnis wird client-side gehalten (React-State)
- Kein Supabase-Write ohne Auth
- Bei Signup-Click nach Test: Ergebnis als URL-Query-Param zu `/join?pre=einsteiger&source=test` weiterreichen (Waitlist-Entry bekommt Level-Flag)

### 7. Auth-Path (optional, V2)
- Wenn User eingeloggt ist: Ergebnis wird in User-Profil gespeichert (`user_metadata.ki_level`)
- Können wir in Community-Plattform nutzen für Event-Recommendations
- **Out-of-scope V1**, prüfen in Phase 25 ob Signup-Integration sinnvoll

**Out-of-scope:**
- KI-basierte adaptive Fragen (jede Frage dynamisch an Vorantworten anpassen) — Roadmap
- Benchmarking mit anderen Usern (Leaderboards) — nope, nicht die Zielgruppe
- Zertifikat oder PDF-Export — Roadmap
- Persistence des Ergebnisses für anonyme User (Cookie-State) — nicht V1
- Skill-Badges mit Gamification — nicht Brand-fit
- Finales Wording der Fragen/Antworten — Simon + Luca iterieren, Marketing-Pass in Phase 27

---

## Decisions

- **D-01** — **Client-side-Only V1**: Test-Logic, Scoring, Empfehlungen läuft komplett im Browser. Kein API-Call, kein Backend. Reduziert Latency + Cost, vereinfacht Deploy.
- **D-02** — **Keine Auth-Pflicht**: Test ist public. Attraktiv für SEO (Keyword-Entry „ki skills test studenten"), low Friction für CTAs.
- **D-03** — **Score-basierte Zuordnung**, kein ML. Simpel, transparent, wartbar.
- **D-04** — **Fragen-Content als MDX oder JSON** in `apps/website/content/assessment/questions.json` — editable ohne Code-Änderung. Empfehlungs-Content analog in `apps/website/content/assessment/results.mdx` (3 Varianten: Einsteiger, Fortgeschritten, Expert).
- **D-05** — **URL-State für Deep-Linking:** Jede Frage hat eine URL (`/test?q=3`), damit Back-Button im Browser funktioniert. Ergebnis-Seite als `/test/ergebnis` (oder `/test/result` EN — vermutlich `/test/ergebnis` wegen DE-Konsistenz).
- **D-06** — **Ergebnis-Share-Link:** `/test/ergebnis?level=einsteiger` — wenn User den Link teilt, sehen andere dieselbe Ergebnis-Seite (ohne Tests-Run). Für V1 akzeptabel, Privacy ist hier kein Thema (Ergebnis enthält keine Personal-Info).
- **D-07** — **Design-Aspekte:** Jede Frage nimmt ~50% der Viewport-Höhe ein, sauber zentriert, keine visuellen Ablenkungen. Framer-Motion-Transitions zwischen Fragen (Slide-In + Fade). Mobile: Full-Screen-Frage pro Screen.
- **D-08** — **Post-Test CTA-Priorisierung:** Primary = „Jetzt beitreten" (Signup), Secondary = Empfehlungen-Cards, Tertiary = „Nochmal testen". Signup-Conversion ist Hauptziel.
- **D-09** — **Keine Analytics V1** (außer Standard-Vercel-Analytics). Konversionsrate von `/test` → `/join` messen wir in Phase 27 falls relevant.
- **D-10** — **Empfehlungs-Links:** Zu `/events?level=einsteiger`, `tools.generation-ai.org/?category=...`, `/community/artikel/[slug]`. Einige Targets existieren erst in späteren Phasen — für V1 placeholder oder leere Targets akzeptabel.

---

## Success Criteria

- [ ] `/test` Route existiert in `apps/website/app/test/page.tsx`
- [ ] `/test/ergebnis` Route existiert für Result-Display
- [ ] Hero mit H1 + Subline + Start-Button
- [ ] 10-12 Fragen abbildbar via JSON-Content-File
- [ ] Frage-Navigation: Next/Back/Progress-Bar funktional
- [ ] URL-State: `?q=N` synced mit aktueller Frage
- [ ] Score-Berechnung läuft client-side nach letzter Frage
- [ ] Result-Page zeigt Level-Badge + Text + 3-5 Empfehlungs-Cards + CTAs
- [ ] Shared-Link mit `?level=X` zeigt Ergebnis ohne Test
- [ ] „Test nochmal" Reset funktioniert
- [ ] Signup-CTA reicht Level als Query-Param an `/join?pre=X&source=test` weiter
- [ ] Mobile responsive (Single-Frage-per-Screen)
- [ ] A11y: Keyboard-Nav (Tab/1-5/Enter), aria-live für Progress-Bar
- [ ] Lighthouse `/test` und `/test/ergebnis` > 90
- [ ] Meta-Tags: SEO-optimiert auf „ki kompetenz test studenten" oder ähnliche Keywords (Luca bestätigt Keyword-Strategie)
- [ ] Playwright-Smoke: Start → 10 Fragen durchklicken → Result rendert → CTA funktional
- [ ] Reduced-motion: Transitions werden zu Crossfades reduziert

---

## Offene Fragen — Resolved 2026-04-24 (via /gsd-autonomous --interactive)

1. **Frage-Content:** Claude drafted alle 10-12 Fragen + 5 Level-Empfehlungs-Profile als Erstentwurf. Luca reviewt + schärft. Inhalte landen in JSON (`questions.json`) + MDX (`results.mdx`), editierbar ohne Code-Änderung.
2. **SEO-Keyword-Fokus:** „AI Literacy Test" als primärer Keyword-Ziel (Meta-Description, Meta-Keywords, OG-Tags). H1 bleibt deutsch („Wo stehst du mit KI?"). Zweite Keyword-Welle: „KI Kompetenz Test", „KI Skills".
3. **Ergebnis-Visualisierung:** **Radar-Chart** über 5 Dimensionen (Tool-Kenntnis / Prompting-Erfahrung / Agents-Advanced / Anwendungs-Tiefe / Selfeinschätzung). Ergänzt durch Level-Badge oben. Chart-Library: leichtgewichtig (Recharts oder custom SVG) — Plan-Phase entscheidet final. **Scope-Hinweis:** dies ist Scope-Up gegenüber ursprünglicher Pill-Empfehlung — akzeptiert.
4. **Signup-Flow:** Result-Page hat „Jetzt beitreten"-CTA → **Redirect zu `/join?pre={level}&source=test`**. Kein Inline-Email-Field (Konsistenz mit /join als einzigem Signup-Surface).
5. **Auth-Integration:** **V1 ohne Auth-Integration**. Reine Client-Side-Logic, kein Supabase-Write. `user_metadata.ki_level` kommt in Phase 25 (Unified Signup).
6. **Fragen-Typ:** **Mix** — 2-3 Fragen als Multi-Select (Tool-Kenntnis, Bedarf), Rest Single-Select. Scoring: Multi mit Cap (z.B. max 3 Tools zählen für Score).
7. **Level-Kategorien:** **5 Stufen** — Neugieriger / Einsteiger / Fortgeschritten / Pro / Expert. Jedes Level bekommt eigenes Empfehlungs-Profil mit 3-5 Cards. Score-Schwellen von Plan-Phase definiert.

---

## Release

Patch innerhalb Milestone v4.0. Reine Page-Addition mit statischen Content-Files. Kein Backend, keine Migration, keine Breaking Changes.
