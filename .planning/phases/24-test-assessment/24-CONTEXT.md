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
4. **Sparring-Slot (Placeholder V1)** — auf Results-Page ist ein Chat-Widget sichtbar, das später PRISMA (Community-Agent auf Anthropic Agent SDK, in Migration) hosten wird. In V1 zeigt es eine Static-Opening-Message + CTA zu `/join`. UX-Rahmen ist da, damit Layout final ist; echte Integration folgt in separater Phase.
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

**Prinzip:** Jede Aufgabe ist eine **interaktive closed-choice-Aufgabe** — deterministisch scorebar, aber NICHT stures Multiple-Choice. Variety der Widgets ist Kern der „spannend/interaktiv"-Prämisse. Jeder User bei identischen Antworten bekommt identisches Ergebnis (Fairness).

**Aufgaben-Typ-Katalog (8-10 Aufgaben, Mix aus mehreren Typen):**

- **Szenario-Pick** — „Du willst X. Welcher Tool/Ansatz passt?" → 4 Tool-Karten zum Klicken, subtile Distraktoren. Single-Select, aber Karten-Layout statt Radio-Buttons.
- **Prompt-Ranking** (Drag-Drop) — „Ordne diese 4 Prompts von schlecht zu gut." → User sortiert 4 Prompt-Cards. Scoring: Levenshtein-Distanz zu korrekter Reihenfolge (oder exact-match-Schwelle).
- **Prompt-Best-Pick** — „Welche dieser 4 Varianten ist der beste Prompt für X?" → Card-Select, alle 4 Prompts sichtbar nebeneinander mit Syntax-Highlighting.
- **Output-Side-by-Side** — „Hier sind 2 KI-Outputs. Welcher ist besser — und warum?" → User wählt A oder B, danach Multi-Select „Warum?" (Halluzination / Verbosität / Format / Bias). Scoring: A/B korrekt + richtiger Grund = voll, nur A/B = halb.
- **Output-Fehler-Spot** — „Markiere den problematischen Satz in diesem Output." → User klickt auf einen von 4-6 hervorgehobenen Textabschnitten. Testet Critical Literacy haptischer als stumpfes MC.
- **Tool-zu-Task-Matching** — „Welcher Tool passt zu welcher Aufgabe?" → 4 Tasks, 4 Tools, Drag-Drop-Matching oder Dropdown-Pairing. Scoring: Anzahl korrekter Matches.
- **Confidence-Slider** — „Wie sicher bist du, dass dieser Output halluziniert ist?" → Diskreter Slider (0/25/50/75/100%). Scoring: Abstand zur Ground-Truth-Stufe (5 Stufen deterministisch).
- **Fill-in-Parameter** — „Der richtige Parameter für X ist: [Dropdown]." → Inline-Dropdown im Code-Block, deterministisch korrekt/falsch.
- **Fakten-Check-MC** — „Welches Modell hat Feature X?" → Klassisch MC für schnelle Wissens-Checks. 2-3 Aufgaben davon reichen.

**Rules für alle Typen:**
- Jede Aufgabe-Interaktion ist **deterministisch scorebar** (kein LLM, kein Free-Text-Eval).
- Scoring-Schema pro Aufgabe explizit im `questions.json` (z.B. `{ type: "rank", correctOrder: [2,0,3,1], scoring: "levenshtein", maxPoints: 3 }`).
- Plan-Phase definiert genaues Schema pro Aufgaben-Typ (TypeScript-Discriminated-Union).

**Pro Aufgabe (UI):**
- Aufgabe-Text (max 2 Sätze) + Aufgaben-spezifisches Widget (Card-Grid / Drag-Drop-List / Slider / Matching-Board).
- Code-/Text-Blöcke mit Syntax-Highlighting (shiki) wo relevant.
- Progress-Bar oben („Aufgabe 3/10"), aria-live-Update.
- Weiter-Button prominent (disabled bis valide Interaktion erfolgt — pro Widget-Typ definiert, z.B. Drag-Drop: alle Items platziert).
- Kein Back-Button (Fairness + Determinismus-Feeling: „Antworten sind final").
- Keyboard-Alternativen: Tab/Arrow-Keys für Drag-Drop, 1-5 für Card-Select, Slider via Arrow-Keys, Enter für Next.

**Interaktivität / Spannung:**
- Framer-Motion-Transitions zwischen Aufgaben (Slide + Fade, reduced-motion → Crossfade).
- Drag-Drop mit haptic feedback (Scale-Up beim Pick-Up, Drop-Zone-Highlight).
- Card-Select mit Hover-Preview (expandiert kurz bei Hover, zeigt Mini-Detail).
- Progress-Bar animiert, bei Checkpoint (z.B. Aufgabe 5) Micro-Celebration („Halbzeit! 💡").
- Mobile: Full-Screen pro Aufgabe, Drag-Drop als Tap-to-Select-Fallback wenn Touch-Support-Limitation.
- A11y: Alle interaktiven Widgets keyboard-bedienbar + screen-reader-freundlich (announced drag state, matching state, etc.).

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
- **Sparring-Panel (V1 = Rahmen/Placeholder):** Chat-Widget-Container auf Results-Page, sichtbar + styled als Teil des Ergebnis-Layouts, aber **ohne echten Agent-Backend in V1**. Zeigt statische Opening-Message (z.B. „Chat mit PRISMA kommt bald — deine Sparring-Partner:in für deinen Lernweg.") + disabled Input oder einfache FAQ-Antworten. Der Rahmen ist da, damit Layout/UX final ist. **Echte PRISMA-Integration** (Anthropic Agent SDK) kommt in späterer Phase, sobald PRISMA-Harness public ready.
- **CTAs:**
  - Primary: „Jetzt beitreten & loslegen" → `/join?pre={level}&source=test`
  - Secondary: „Test nochmal machen" (reset → `/test`)
- **Optional Share-Line** (V2): „Teile dein Ergebnis" → `/test/ergebnis?level=X&share=true` ohne Chat/Profile-Details.

#### 6. Sparring-Slot (Placeholder V1, PRISMA-Integration später)

**PRISMA** ist der existierende Community-Agent in Circle, den Luca aktuell auf eigenes Anthropic-Agent-SDK-Harness migriert. **PRISMA-Integration kommt NICHT in Phase 24.** Phase 24 baut nur den **UX-Rahmen**, damit Results-Page-Layout + Interaktions-Flow final ist und später ohne Re-Design ergänzt werden kann.

**V1 Scope:**
- **Sichtbares Chat-Widget** auf Results-Page — Layout, Container, Opening-Message, CTA. Visuell integriert.
- **Static Opening-Message:** z.B. „PRISMA wird deine KI-Sparring-Partner:in für deinen Lernweg — sie kommt bald. Für jetzt: schau dir unten die Empfehlungen an oder tritt bei, um mit PRISMA zu chatten sobald sie live ist." + CTA zu `/join`.
- **Disabled Input** ODER **einfache Pre-Written-FAQ-Antworten** (Plan entscheidet — „Frequently Asked" mit 3-4 statischen Buttons, die auf vorbereitete Texte verweisen).
- **Kein Backend-Endpoint in V1.** Kein Anthropic-API-Call, kein Streaming, kein Rate-Limit nötig.
- **Agent-Placeholder-Komponente** ist so designt, dass sie später ohne Re-Style gegen echten Streaming-Chat getauscht werden kann (gleiche Props/Slots).

**Out-of-Scope Phase 24 (→ spätere Phase):**
- Echter PRISMA-Endpoint-Call
- Context-Injection (Level + Skills ins System-Prompt)
- Streaming-Response-Handling
- Rate-Limiting via Upstash
- Multi-Turn-Conversation-State

Plan-Phase definiert Props-Interface des Sparring-Slots (z.B. `<SparringSlot level={level} skills={skills} mode="placeholder" />` → später `mode="live"`).

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
- **PRISMA-Backend-Integration** (Anthropic Agent SDK Harness, Streaming, Rate-Limit, Context-Injection) — kommt als spätere Phase sobald PRISMA-Harness public ready. V1 nur UX-Placeholder.
- **LLM-basierte Ergebnis-Interpretation** — Level-Profile-Texte sind V1 statisch pre-written. LLM-Personalisierung des Profile-Texts („hier ist was DEIN Antwort-Muster aussagt…") ist V2-Option. Scoring bleibt NIE LLM-basiert.
- **Adaptive Agent mit Tool-Use** (Web-Search, Circle-API-Lookup in Echtzeit) — V2+

---

## Decisions

- **D-01** — **Deterministisches Scoring, client-side.** Jede Option hat feste Points. Kein LLM, kein API-Call im Scoring-Pfad. Gleicher User + gleiche Antworten → garantiert gleiches Ergebnis.
- **D-02** — **Echter Wissenstest mit Widget-Variety, keine Selbsteinschätzung, kein stures MC.** Interaktive closed-choice-Aufgaben: Szenario-Pick (Card-Grid), Prompt-Ranking (Drag-Drop), Prompt-Best-Pick, Output-Side-by-Side + Grund-Select, Output-Fehler-Spot (Click-to-Mark), Tool-zu-Task-Matching, Confidence-Slider, Fill-in-Parameter (Dropdown), Fakten-Check-MC. Alle deterministisch scorebar. Interpretation des Ergebnisses (Level-Text) bleibt pre-written V1 — LLM-Interpretation kann später ergänzt werden, aber Scoring NIE.
- **D-03** — **15 Min max, 10 Min Ziel.** 8-10 Aufgaben, ~60-90 Sek pro Aufgabe.
- **D-04** — **Level 1-5 + Skill-Radar.** Neugieriger / Einsteiger / Fortgeschritten / Pro / Expert. Radar über 5 Dimensionen: Tools / Prompting / Agents / Anwendung / Critical Literacy.
- **D-05** — **Keine Auth V1.** Pure client-side, Results in React-State. `user_metadata.ki_level` kommt Phase 25.
- **D-06** — **Kein Back-Button im Test.** Verhindert Reverse-Engineering der Scoring-Logic über Back/Forward + Determinismus-Feeling ("deine Antworten sind final").
- **D-07** — **Sparring-Slot als Placeholder V1, echte PRISMA-Integration später.** Phase 24 baut nur UX-Rahmen auf Results-Page (Chat-Widget, Static Opening-Message, Placeholder-Komponente). Kein Anthropic-API-Call, kein Backend. Komponente so entwickelt, dass sie später ohne Re-Design gegen echten PRISMA-Stream getauscht werden kann (gleiche Props, `mode="placeholder"` → `mode="live"`). Grund: Fokus Phase 24 = geiler deterministischer Test. PRISMA-Harness entwickelt sich parallel separat.
- **D-08** — **Signup-Integration via Query-Params.** „Jetzt beitreten" → `/join?pre={level}&source=test&skills={dimensionScores}`. Kein Inline-Email-Field.
- **D-09** — **Content editierbar ohne Code.** Fragen in `questions.json`, Level-Profile in MDX unter `apps/website/content/assessment/profiles/`. Claude drafted Erstentwurf, Luca reviewt.
- **D-10** — **SEO: „AI Literacy Test" als Primär-Keyword.** Meta-Description + OG-Tags auf Englisch für Keyword-Match, H1 bleibt Deutsch für Target-Audience.
- **D-11** — **URL-State für Deep-Linking.** Jede Aufgabe hat eigene URL (`/test/aufgabe/3`), aber Browser-Back springt zu `/test`-Start (Determinismus-Policy). Result-Share via `?level=X`.
- **D-12** — **Community-Content-Index als statisches JSON V1.** `apps/website/content/assessment/community-index.json` — Spaces, Events, Artikel kuratiert, Agent fetcht beim System-Prompt-Build. V2: Circle-API-Live-Query.

---

## Success Criteria

- [ ] `/test` Landing-Route mit Hero + Start-Button
- [ ] `/test/aufgabe/[n]` Routes für Aufgaben 1-10 mit URL-State-Sync
- [ ] `/test/ergebnis` Route mit Level-Badge + Skill-Radar + Empfehlungen + Sparring-Placeholder
- [ ] 8-10 Aufgaben in `questions.json` mit Scoring-Schema pro Widget-Typ (Discriminated-Union TypeScript-Types: `{type:'pick'|'rank'|'match'|'spot'|'slider'|'fill'|'mc', ...}`)
- [ ] Mindestens 5 verschiedene Widget-Typen vertreten im Aufgaben-Mix (nicht nur MC)
- [ ] Widget-Komponenten: Card-Pick, Drag-Drop-Rank, Matching-Board, Click-to-Spot, Confidence-Slider, Dropdown-Fill, MC-Radio — alle keyboard-bedienbar
- [ ] 5 Level-Profile in MDX (`profiles/neugieriger.mdx`, `einsteiger.mdx`, `fortgeschritten.mdx`, `pro.mdx`, `expert.mdx`)
- [ ] Deterministisches Scoring-Modul in `lib/assessment/scoring.ts` mit Unit-Tests (gleicher Input → exakt gleiches Level + Skills, reproducible)
- [ ] Framer-Motion-Transitions zwischen Aufgaben (reduced-motion → Crossfade)
- [ ] Code-Blöcke mit Syntax-Highlighting in Aufgaben (shiki oder äquivalent)
- [ ] Progress-Bar animiert, aria-live für Screen-Reader
- [ ] Keyboard-Nav pro Widget-Typ dokumentiert + implementiert
- [ ] Skill-Radar via `recharts` (entschieden D-07/D-recharts)
- [ ] **Sparring-Slot (Placeholder V1):** sichtbares Chat-Widget auf Results-Page mit Static Opening-Message + Props-Interface für späteren Live-Swap. Kein Backend-Call in V1.
- [ ] Community-Index-JSON mit 10-20 kuratierten Spaces/Events/Artikeln für Empfehlungs-Cards (nicht Agent-Context, kommt mit PRISMA-Integration später)
- [ ] Signup-CTA reicht Level + Skills als Query-Params an `/join` weiter
- [ ] Mobile responsive (Full-Screen pro Aufgabe, Touch-Targets ≥44px, Drag-Drop mit Tap-Fallback)
- [ ] A11y: Keyboard-Nav, aria-live, Focus-Management zwischen Aufgaben, Screen-Reader-Announcements für Drag-Drop/Matching-State
- [ ] Lighthouse `/test`, `/test/aufgabe/1`, `/test/ergebnis` > 90
- [ ] Meta-Tags: SEO auf „AI Literacy Test" (EN-Keyword, DE-H1)
- [ ] Playwright-Smoke: Start → durchspielt mindestens 3 verschiedene Widget-Typen → Result rendert → Signup-CTA funktional
- [ ] Reduced-motion: Transitions zu Crossfades, keine Auto-Animations
- [ ] Scoring-Unit-Tests verifizieren Determinismus (fixture-basiert: input array → exact expected level + skills, Fairness: 3 verschiedene Answer-Patterns getestet)

---

## Offene Technische Fragen (Plan-Phase entscheidet)

- **Radar-Chart-Library:** ✅ ENTSCHIEDEN — `recharts`. Bekannt in Next.js-Ökosystem, deklarativ, gute A11y-Defaults.
- **Widget-Typ-Auswahl pro Aufgabe:** Plan-Phase entscheidet welche 8-10 Aufgaben welchen Widget-Typ bekommen — basierend auf Skill-Dimension + Aufgaben-Content. Constraint: mindestens 5 verschiedene Widget-Typen im Test.
- **Drag-Drop-Library:** `@dnd-kit/core` (A11y-first, keyboard-support) vs native HTML5 DnD vs Framer-Motion-Reorder. Plan wägt ab (A11y ist hart required).
- **Sparring-Placeholder-Variante:** Statisches „Chat kommt bald"-Panel ODER Pre-Written-FAQ mit 3-4 Button-Antworten? Plan entscheidet basierend auf UI-Weight vs Conversion.
- **Community-Index-Content:** Wer kuratiert die 10-20 Empfehlungen für Level-Cards? Claude drafted, Luca reviewt — analog zu Fragen-Content.
- **Level-Schwellen:** Plan bestätigt finale Punkteschwellen nach Fragen-Draft (Score-Range hängt an Fragenzahl × max-Points pro Widget-Typ).

---

## Release

Patch innerhalb Milestone v4.0. Neue `/test`-Routes + Static Content-Files + Sparring-Placeholder-Komponente. **Kein neuer API-Endpoint in V1** (PRISMA-Backend folgt separat). Kein Supabase-Schema-Change. Kein Breaking Change. Deterministisches Scoring als wichtigste neue Infrastruktur.
