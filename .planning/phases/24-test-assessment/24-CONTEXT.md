---
phase: 24
slug: test-assessment
type: context
status: planning
created: 2026-04-23
last-updated: 2026-04-24
depends_on:
  - 20.6 (Landing Sections Rebuild — Nav + DS baseline)
  - 23 (/join — Signup-Target mit pre-fill Query-Params)
  - Gemini-3-Flash-Agent-Infra aus tools-app (wiederverwendbar für Assessment-Agent)
branch: feature/phase-24-test-assessment
---

# Phase 24 — `/test` KI-Literacy-Assessment

> **Echter** Wissenstest für DACH-Studierende: „AI Literacy Test" — 8-10 interaktive Aufgaben in max. 15 Min (Ziel 10 Min), deterministisches Scoring, Level + Skill-Radar als Ergebnis, abschließend **Sparring mit Assessment-Agent** für personalisierte Community-Empfehlungen. Kein Selbsteinschätzungs-Quiz, sondern implizites Abfragen über Szenario-MC, Prompt-Improvement, Output-Beurteilung, Fakten-Check. Kein Gate für Signup — `/test` ist SEO-Entry und Onboarding-Tool.

---

## Vision (2026-04-24, Luca)

Der Test soll:
1. **Deterministisch** sein — gleicher User mit gleichen Antworten bekommt immer dasselbe Ergebnis. Kein LLM-Scoring.
2. **Echt** sein — tests what you know, not what you think you know. User soll implizit abgefragt werden, auch wenn er sein Level nicht selbst einschätzen kann/will.
3. **Interaktiv & spannend** — kein 08/15-Quiz. Verschiedene Aufgaben-Typen, visuelle Abwechslung, Micro-Interactions.
4. **Schnell** — max 15 Min, Ziel 10 Min, sonst Drop-Off.
5. **Follow-up-wertig** — nach dem Ergebnis Chat mit einem Agenten, der das Ergebnis + Community-Content kennt und echte Empfehlungen gibt („schau mal in Space X vorbei", „Event Y wäre gut für dich").

---

## Mission

Besucher:innen (mit oder ohne Account) durchlaufen einen **echten Kompetenz-Test** — 8-10 Aufgaben mit gemischten Typen — und bekommen am Ende:

1. **Level (1-5)** — deterministisch berechnet aus Score-Summe (Schwellen in Code hart definiert).
2. **Skill-Profile-Radar** — 5 Dimensionen: Tool-Kenntnis / Prompting / Agents & Advanced / Anwendung / Critical Literacy. Pro Dimension ein Score aus den zugehörigen Fragen.
3. **Empfehlungs-Cards** (3-5) — Workshop, Lernpfad, Community-Artikel, Tool-Tipps. Static pro Level-Profil.
4. **Agent-Sparring** (NEU) — auf Results-Page öffnet sich ein Chat-Fenster mit einem **dedizierten Assessment-Agent** (Gemini 3 Flash, streaming). Agent hat Ergebnis + Community-Content-Index im Context. User kann Fragen stellen, Agent gibt personalisierte Empfehlungen.
5. **Signup-CTA** — prominent: „Jetzt beitreten" → `/join?pre={level}&source=test`.

Der Test ist **öffentlich** (keine Auth-Gate). Ergebnis wird nicht persistent gespeichert (V1). Bei Signup-Click: Level + Profile als Query-Params an `/join` weitergereicht.

---

## Scope

### In-Scope

#### 1. Landing-Hero (`/test`)
- H1: „Wo stehst du wirklich mit KI?"
- Subline: „15 Minuten, 10 Aufgaben. Deterministisches Scoring, ehrliches Ergebnis."
- Intro-Badge: „Kostenlos · Keine Anmeldung · Anonym · Max 15 Min"
- Start-Button „Test starten"
- Vertrauens-Zeile: „Kein Self-Assessment — wir fragen ab, was du kannst, nicht was du glaubst zu können."

#### 2. Test-Flow (8-10 Aufgaben)

**Aufgaben-Typen (Mix, alle deterministisch scorebar):**
- **Szenario-MC** — „Du willst X. Welcher Tool/Ansatz passt?" → 4 Optionen mit subtilen Distraktoren. Testet Tool-Verständnis.
- **Prompt-Improvement-MC** — „Hier ist ein schwacher Prompt. Welche Version ist am besten?" → 4 Varianten (naiv / leicht verbessert / strukturiert / overkill). Testet Prompting implizit.
- **Output-Beurteilung-MC** — „Hier ist ein KI-Output. Was ist das Hauptproblem?" → 4 Optionen (Halluzination / Verbosität / Off-Topic / Bias). Testet Critical AI Literacy.
- **Fakten-Check-MC** — „Welches Modell hat Feature X?" / „Was ist Chain-of-Thought?" → Schnell, 30 Sek. Testet Grundwissen.

**Pro Frage:**
- Question-Text (max 2 Sätze) + Code-/Text-Block bei Bedarf (Prompt-Beispiele, Outputs)
- 3-5 Answer-Options (Radio, einige Multi-Select bei „welche 3 Schritte?")
- Progress-Bar oben („Aufgabe 3/10" + Time-Tracker optional)
- Weiter-Button prominent (disabled bis Auswahl)
- Kein Back-Button (Determinismus-Hinweis: „Antworten sind final" — verhindert Reverse-Engineering via Back/Forward)
- Keyboard: 1-5 für Options, Enter für Next

**Interaktivität / Spannung:**
- Framer-Motion-Transitions zwischen Fragen (Slide + Fade, reduced-motion → Crossfade)
- Code-Blöcke mit Syntax-Highlighting (shiki oder ähnlich)
- Progress-Bar animiert, bei Checkpoint (z.B. Frage 5) Micro-Celebration („Halbzeit! 💡")
- Mobile: Full-Screen pro Frage, große Touch-Targets

#### 3. Frage-Katalog (10 Fragen finalisiert)
- Claude drafted Erstentwurf aller 10 Aufgaben mit Scoring-Schema (Punkte pro Option, 0-3 je Frage).
- Content in `apps/website/content/assessment/questions.json` — editierbar ohne Code-Änderung.
- Scoring-Schema embedded im JSON: pro Option `points: number` und `dimension: 'tools' | 'prompting' | 'agents' | 'application' | 'literacy'`.
- Luca reviewt + schärft Inhalte nach Execute.

#### 4. Scoring (deterministisch, client-side)
- Nach letzter Aufgabe: Summe aller Points → Gesamt-Score (z.B. 0-30).
- Level-Schwellen hart definiert: `0-5 → Neugieriger`, `6-12 → Einsteiger`, `13-19 → Fortgeschritten`, `20-25 → Pro`, `26-30 → Expert`. (Schwellen von Plan-Phase final bestätigt.)
- Pro Dimension: Sum der Points-Dimension-Tuples → Skill-Scores (0-6 pro Dimension, normalisiert auf 0-100%).
- **Keine LLM-Eval, keine API-Calls im Scoring.** Pur math in JS.

#### 5. Results-Page (`/test/ergebnis`)

**Layout:**
- **Top:** Level-Badge groß („Level 3: Fortgeschritten" + Icon + Level-Color aus DS).
- **Einordnung:** 2-3 Absätze Level-Profile-Text (pre-written, 5 Varianten, MDX in `apps/website/content/assessment/profiles/`).
- **Skill-Radar:** Chart über 5 Dimensionen mit User-Scores. Library: `recharts` (bereits bekannt in Next.js-Ökosystem) oder custom SVG (leichter). Plan-Phase entscheidet.
- **Empfehlungs-Cards (3-5):** pre-written pro Level:
  - Workshop-Event (Link zu `/events?level=X`)
  - Lernpfad / Tool-Kacheln (Links zu tools.generation-ai.org)
  - Community-Artikel passend zum Level
- **Agent-Sparring-Panel:** Chat-Widget mit **PRISMA** (Community-Agent auf Anthropic-Agent-SDK-Harness, lebt bereits in Circle). Streaming. PRISMA bekommt User-Ergebnis (Level + Skills) als Context-Injection in System-Prompt, plus sein existierender Community-Knowledge-Stack. Opening-Message: „Hey, du bist [Level]. Willst du reden wo du hin willst?"
- **CTAs:**
  - Primary: „Jetzt beitreten & loslegen" → `/join?pre={level}&source=test`
  - Secondary: „Test nochmal machen" (reset → `/test`)
- **Optional Share-Line** (V2): „Teile dein Ergebnis" → `/test/ergebnis?level=X&share=true` ohne Chat/Profile-Details.

#### 6. PRISMA-Integration (Community-Agent)

**PRISMA** ist der existierende Community-Agent in Circle — Luca migriert ihn aktuell auf eigenes Harness über Anthropic Agent SDK. Für Phase 24 wird PRISMA auf der Results-Page eingebunden, statt einen neuen Assessment-Agent zu bauen.

- **Endpoint:** Abhängig vom PRISMA-Harness-Status zum Zeit-Punkt Phase 24 startet:
  - **V1 (ideal):** Public PRISMA-Endpoint via Anthropic-Agent-SDK-Harness — wir rufen ihn aus `/test/ergebnis` auf, schicken User-Level + Skills als Context-Injection.
  - **V1-Fallback:** PRISMA noch nicht public ready → temporärer Stub-Endpoint `apps/website/app/api/assessment-sparring/route.ts` (Anthropic SDK direct, Claude Haiku 4.5 als günstiges Default, System-Prompt matcht PRISMA-Stil). Swap auf PRISMA sobald Harness ready.
- **Context-Injection:** PRISMA bekommt pro Session:
  - User-Level + Skill-Scores (vom Test)
  - Level-Profile-Text
  - „Assessment-Source"-Flag (damit PRISMA weiß: User ist aus Test, nicht aus Circle)
  - Kein Circle-Auth-Identity (User ist anonymous pre-Signup)
- **Verhalten:** Streaming-Responses, max 5-6 Turns, dann CTA „Bei der Community anmelden um mit mir weiterzureden" → `/join?pre={level}&source=test-prisma`.
- **Rate-Limit:** Upstash Redis (wie existing public-chat) — z.B. 10 Messages per IP pro 5 Min. Schutz gegen PRISMA-API-Cost.
- **No Auth:** Agent läuft public. Anonymous Sessions, keine Persistence V1.
- **Plan-Phase-Decision:** Plan klärt PRISMA-Harness-Status bei Luca VOR Task-Breakdown. Falls Harness nicht ready → Fallback-Stub planen, PRISMA-Swap als Phase-25-Followup oder Phase 24 V2.

#### 7. No-Auth-Path
- Ergebnis client-side in React-State.
- Kein Supabase-Write V1.
- Bei Signup-Click: Level + Skills als Query-Params an `/join?pre=fortgeschritten&source=test&skills=tools:80,prompting:60,agents:40,application:70,literacy:55`.

#### 8. URL-State
- `/test` — Landing
- `/test/aufgabe/[n]` — Question n (1-10). URL-State für Deep-Linking UND Browser-Back-Verhalten (Back führt zu `/test`, NICHT zur vorherigen Frage — Determinismus).
- `/test/ergebnis` — Results.
- `/test/ergebnis?level=X` — Shareable Result (zeigt Level + Profile-Text, **ohne** User-Skills-Radar, **ohne** Agent).

### Out-of-Scope

- **Persistence für anonyme User** (Cookie-State) — V2
- **User-Profile-Speicherung für Eingeloggte** (`user_metadata.ki_level`) — kommt Phase 25 (Unified Signup)
- **Adaptive Fragen** (Folgefrage abhängig von Vorantwort) — Roadmap
- **Share-Cards / OG-Images** mit Level — V2
- **Multi-Language** (EN-Version) — Roadmap
- **Zertifikat / PDF-Export** — Roadmap
- **Leaderboards / Benchmarking** — nicht Brand-fit
- **LLM-basiertes Scoring** — widerspricht Determinismus
- **Adaptive Agent mit Tool-Use** (Web-Search, Circle-API-Lookup in Echtzeit) — V2, erstmal statisches System-Prompt mit Community-Index

---

## Decisions

- **D-01** — **Deterministisches Scoring, client-side.** Jede Option hat feste Points. Kein LLM, kein API-Call im Scoring-Pfad. Gleicher User + gleiche Antworten → garantiert gleiches Ergebnis.
- **D-02** — **Echter Wissenstest, keine Selbsteinschätzung.** Aufgaben-Typen: Szenario-MC, Prompt-Improvement, Output-Beurteilung, Fakten-Check. Testet implizit was User kann, nicht was er glaubt.
- **D-03** — **15 Min max, 10 Min Ziel.** 8-10 Aufgaben, ~60-90 Sek pro Aufgabe.
- **D-04** — **Level 1-5 + Skill-Radar.** Neugieriger / Einsteiger / Fortgeschritten / Pro / Expert. Radar über 5 Dimensionen: Tools / Prompting / Agents / Anwendung / Critical Literacy.
- **D-05** — **Keine Auth V1.** Pure client-side, Results in React-State. `user_metadata.ki_level` kommt Phase 25.
- **D-06** — **Kein Back-Button im Test.** Verhindert Reverse-Engineering der Scoring-Logic über Back/Forward + Determinismus-Feeling ("deine Antworten sind final").
- **D-07** — **PRISMA-Integration statt neuer Assessment-Agent.** PRISMA ist existierender Community-Agent in Circle auf Anthropic-Agent-SDK-Harness (in Migration durch Luca). Results-Page injectet User-Level + Skills in PRISMA-System-Prompt. Streaming, max 5-6 Turns, Rate-Limited via Upstash. Fallback: wenn PRISMA-Harness bei Phase-24-Execute nicht ready → temporärer Stub-Endpoint (Anthropic SDK + Claude Haiku 4.5, PRISMA-Persona-Prompt), swap auf PRISMA sobald verfügbar.
- **D-08** — **Signup-Integration via Query-Params.** „Jetzt beitreten" → `/join?pre={level}&source=test&skills={dimensionScores}`. Kein Inline-Email-Field.
- **D-09** — **Content editierbar ohne Code.** Fragen in `questions.json`, Level-Profile in MDX unter `apps/website/content/assessment/profiles/`. Claude drafted Erstentwurf, Luca reviewt.
- **D-10** — **SEO: „AI Literacy Test" als Primär-Keyword.** Meta-Description + OG-Tags auf Englisch für Keyword-Match, H1 bleibt Deutsch für Target-Audience.
- **D-11** — **URL-State für Deep-Linking.** Jede Aufgabe hat eigene URL (`/test/aufgabe/3`), aber Browser-Back springt zu `/test`-Start (Determinismus-Policy). Result-Share via `?level=X`.
- **D-12** — **Community-Content-Index als statisches JSON V1.** `apps/website/content/assessment/community-index.json` — Spaces, Events, Artikel kuratiert, Agent fetcht beim System-Prompt-Build. V2: Circle-API-Live-Query.

---

## Success Criteria

- [ ] `/test` Landing-Route mit Hero + Start-Button
- [ ] `/test/aufgabe/[n]` Routes für Aufgaben 1-10 mit URL-State-Sync
- [ ] `/test/ergebnis` Route mit Level-Badge + Skill-Radar + Empfehlungen + Agent-Chat
- [ ] 10 Aufgaben in `questions.json` mit Scoring-Schema (Points + Dimension pro Option)
- [ ] 5 Level-Profile in MDX (`profiles/neugieriger.mdx`, `einsteiger.mdx`, …)
- [ ] Deterministisches Scoring-Modul in `lib/assessment/scoring.ts` mit Unit-Tests (gleicher Input → gleiches Level + Skills)
- [ ] Framer-Motion-Transitions zwischen Aufgaben (reduced-motion → Crossfade)
- [ ] Code-Blöcke mit Syntax-Highlighting in Aufgaben (wo relevant)
- [ ] Progress-Bar animiert, aria-live für Screen-Reader
- [ ] Keyboard-Nav: 1-5 für Options, Enter für Next
- [ ] Skill-Radar via `recharts` oder custom SVG (Plan-Phase entscheidet)
- [ ] PRISMA-Integration auf `/test/ergebnis` (oder Fallback-Stub wenn PRISMA-Harness nicht ready) mit Streaming + Rate-Limit
- [ ] PRISMA-Context-Injection: User-Level + Skills + Assessment-Source-Flag im System-Prompt
- [ ] Community-Index-JSON mit 10-20 kuratieten Spaces/Events/Artikeln
- [ ] Signup-CTA reicht Level + Skills als Query-Params an `/join` weiter
- [ ] Mobile responsive (Full-Screen pro Aufgabe, Touch-Targets ≥44px)
- [ ] A11y: Keyboard-Nav, aria-live, Focus-Management zwischen Aufgaben
- [ ] Lighthouse `/test`, `/test/aufgabe/1`, `/test/ergebnis` > 90
- [ ] Meta-Tags: SEO auf „AI Literacy Test" (EN-Keyword, DE-H1)
- [ ] Playwright-Smoke: Start → 10 Aufgaben durchklicken → Result rendert → Agent-Chat sendet Message → CTA funktional
- [ ] Reduced-motion: Transitions zu Crossfades, keine Auto-Animations
- [ ] Scoring-Unit-Tests verifizieren Determinismus (fixture-basiert: input array → exact expected level + skills)

---

## Offene Technische Fragen (Plan-Phase entscheidet)

- **Radar-Chart-Library:** `recharts` (bekannt, 80kb+) vs custom SVG (leichter, mehr Aufwand). Plan-Phase wägt ab.
- **PRISMA-Harness-Status:** Plan-Phase klärt mit Luca VOR Task-Breakdown: Ist PRISMA-Harness (Anthropic Agent SDK) zum Phase-24-Execute-Zeitpunkt public ready? Falls ja → direkte Integration via PRISMA-Endpoint. Falls nein → Fallback-Stub `/api/assessment-sparring` (Anthropic SDK + Haiku 4.5 + PRISMA-Persona-Prompt), später swappen.
- **Community-Index-Content:** Wer kuratiert die 10-20 Empfehlungen? Claude drafted, Luca reviewt — analog zu Fragen-Content.
- **Level-Schwellen:** Plan bestätigt finale Punkteschwellen nach Fragen-Draft (Score-Range hängt an Fragenzahl × max-Points).
- **Rate-Limit-Werte:** 10/5Min pro IP für Agent vs niedriger. Plan nutzt existing Upstash-Setup aus tools-app als Baseline.

---

## Release

Patch innerhalb Milestone v4.0. Neue Page + neuer API-Endpoint (Agent). Static Content-Files. Kein Supabase-Schema-Change. Kein Breaking Change.
