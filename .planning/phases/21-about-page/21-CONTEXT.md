---
phase: 21
slug: about-page
type: context
status: planning
created: 2026-04-23
last-updated: 2026-04-23
depends_on:
  - 20.6 (Landing Sections Rebuild — Nav + DS baseline, Kurz-FAQ-Link-Target)
branch: feature/phase-21-about-page
---

# Phase 21 — `/about` Seite

> Über-uns-Seite mit Mission, Story, Team, Werten, Vereinsstruktur, FAQ (10 Fragen), Mitmach-CTA und Kontaktbox. Credibility-Anker für alle drei Zielgruppen (Studis, Partner, Presse). Umsetzung nach Simons Konzept §9.

---

## Mission

Simon §9.1: **Glaubwürdigkeit für alles andere.** `/about` ist die Beweisführung hinter dem Rest der Website. Muss gleichzeitig **warm für Studierende** und **seriös für Partner** wirken. Sie beantwortet: Wer steht dahinter? Warum gibt's euch? Wie organisiert ihr euch? Wie finanziert ihr euch? Kann ich mitmachen?

Sekundäre Rolle: **FAQ-Ziel** vom Landing-Kurz-FAQ-Link „Mehr Fragen? → Über uns" (Phase 20.6-09). Der `#faq`-Anker auf dieser Seite greift.

---

## Scope

**In-scope:**

### 1. Hero (§9.3)
- Section-Header „Generation AI · Über uns"
- H1 „Warum es uns gibt."
- Bold-Claim: „We shape talent for an AI-native future."
- Intro-Absatz: „Wir bringen Studierenden die KI-Skills bei, die in Jobs heute schon erwartet werden. Kostenlos, praxisnah, für alle Fachrichtungen."

### 2. Story (§9.4)
- Section-Header-Pattern: `// unsere story` + H3 „Warum wir das machen."
- 3 Absätze über Janna + Simon (Gründung Feb 2026, Team heute 10 Leute, Zielbild)
- Inline-CTA am Ende: `Werde Teil davon →` (Link auf Mitmach-CTA-Anker weiter unten)

### 3. Team (§9.5)
- Section-Header: `// wer dahintersteckt` + H3 „Wir sind Generation AI."
- **Gründer-Karten (oben prominent):** Janna + Simon — Foto + Name + Rolle „Co-Founder" + kurze Bio (1-2 Sätze) + LinkedIn-Link
- **Aktive Mitglieder (darunter, kleinere Kacheln):** nur Foto + Name, keine Rollen (Simon §9.5: „lässt sich später ergänzen")
- Sub-Zeile: „Stand: April 2026 · Wir wachsen." (leicht aktualisierbar)
- Placeholder-Avatars bis echte Fotos vorliegen (Initialen auf Brand-Background, DS-Pattern)

### 4. Was uns antreibt / Werte (§9.6)
- Section-Header: `// was uns antreibt` + H3 „Worauf wir Wert legen."
- 4 Werte-Blöcke (Bold-Claim + Absatz):
  - **Offen für alle.** — KI-Kompetenz ist keine Frage des Studiengangs
  - **Anwenden statt auswendig lernen.** — Hands-on, Workshops erfolgreich nur wenn Bau-Output
  - **Signal statt Noise.** — Filter-Ansatz gegen KI-Gurus und Tool-Flood
  - **Voneinander lernen, zusammen wachsen.** — Community als Kernangebot, nicht Content

### 5. Vereinsstruktur (§9.7)
- Section-Header: `// verein` + H3 „Gemeinnützig. Transparent. Offen."
- Erklärung Verein e.V. i.G. — keine Profit-Orientierung, Finanzierung durch Fördermittel/Partnerschaften/Sachleistungen
- Mitgliedschaft kostenlos, aktives Mitmachen möglich
- **Anker `#verein`** — wird von Phase 22 Partner-Page-Transparenz-Link angesprungen

### 6. Mitmach-CTA (§9.8)
- Eigene Section zwischen Verein und FAQ
- H2 „Bock, mitzumachen?"
- Body: „Wir suchen Leute, die mit aufbauen wollen. Events, Content, Strategie, Tech — sag uns, wo du anpacken würdest."
- CTA `[Melde dich]` → öffnet Mailto oder Kontakt-Anker

### 7. FAQ (§9.9) — KERN-FEATURE
- Section-Header: `// fragen & antworten` + H3 „Was du wissen solltest."
- **Accordion mit 10 Fragen, multi-open** (mehrere gleichzeitig öffenbar — konsistent mit Landing-Kurz-FAQ aus 20.6-09)
- Anker: `#faq` — Target vom Landing-Kurz-FAQ-Link „Mehr Fragen? →"
- 10 Fragen (Simons Erstaufschlag):
  1. Was ist Generation AI?
  2. Wer kann Mitglied werden?
  3. Kostet die Mitgliedschaft etwas?
  4. Wie melde ich mich an?
  5. Brauche ich technisches Vorwissen?
  6. Wie viel Zeit muss ich investieren?
  7. Muss ich an einer bestimmten Uni sein?
  8. Wer steckt hinter Generation AI? (inkl. Inline-Link zu Team-Sektion)
  9. Wie finanziert ihr euch?
  10. Kann ich aktiv im Verein mitarbeiten? (inkl. Inline-Link zu Mitmach-CTA)
- **Accordion-Component wird wahrscheinlich aus Plan 20.6-09 reused** (dort angelegt, hier zweimal gemountet: Kurz-FAQ auf Landing + 10-FAQ auf /about)

### 8. Abschluss-CTA (§9.10)
- H2 „Wir freuen uns auf dich."
- Body: „Mitgliedschaft ist kostenlos und in 2 Minuten erledigt. Du willst Partner werden oder mitmachen? Auch das geht →"
- Primary CTA `[Kostenlos Mitglied werden]` → `/join`
- Secondary „Auch das geht →" (Simon §9.10 TBD: Mini-Popup mit zwei Links vs. direkter Link) — Empfehlung: Hover/Click-Popover mit zwei Links (Partner + Mitmach)

### 9. Kontaktbox (§9.11)
- Section-Header: `// kontakt` + H3 „Hier erreichst du uns."
- 3 Kontaktwege:
  - **Allgemeine Anfragen:** `info@generation-ai.org`
  - **Partnerschaften:** Link auf `/partner`
  - **Aktiv mitmachen:** Anker-Link zu Mitmach-CTA

**Out-of-scope:**
- Team-Detailseiten pro Person (Roadmap)
- Werte-Visualisierungen über reine Typo hinaus (Roadmap)
- Blog/Presse-Archiv (Roadmap)
- Finanzreport-PDF-Download (deferred, erst wenn Verein-i.G. offiziell eingetragen)
- Echte Team-Fotos (Placeholder bis Luca Fotos liefert, Phase 27 Cleanup)
- Finales Copywriting-Feintuning — Simon §9-Wording ist Startpunkt, Marketing-Pass in Phase 27

---

## Decisions

- **D-01** — **Single-Page-Layout**, alle 9 Sections untereinander scrollbar, keine Tabs. Begründung: Über-uns ist Credibility-Flow, nicht Tool. User liest chronologisch von oben nach unten.
- **D-02** — FAQ nutzt gleichen Accordion-Component wie Landing-Kurz-FAQ (20.6-09). Component wird entweder in `packages/ui` ausgezogen oder lokal re-exported. **Entscheidung im 20.6-09-Plan**, nicht hier.
- **D-03** — Multi-open-Accordion auf `/about` (Simon §9.9 explizit). Landing-Kurz-FAQ-Verhalten muss konsistent sein (auch multi-open, siehe 20.6-CONTEXT D-10).
- **D-04** — Anker-Links für alle Sektionen (`#story`, `#team`, `#werte`, `#verein`, `#mitmach`, `#faq`, `#kontakt`) — Deep-Linking aus anderen Seiten, Smooth-Scroll mit `scroll-behavior: smooth` (existiert bereits global).
- **D-05** — Team-Bilder: Placeholder-Avatars (Initialen + DS-Background) bis echte Fotos vorliegen. Layout so designen, dass Foto-Swap keinen Layout-Shift triggert (feste Aspect-Ratio + `object-cover`).
- **D-06** — LinkedIn-Links Janna + Simon: werden nachgeliefert (Luca). Bis dahin disabled oder Placeholder-#.
- **D-07** — „We shape talent for an AI-native future." bleibt auf Englisch (Simon §9.3 explizit), rest in Deutsch. Reflection: bewusster Design-Moment für internationale Credibility-Signalisierung.
- **D-08** — Mitmach-CTA öffnet Mailto oder einfaches Kontakt-Formular? Empfehlung: **Mailto `info@generation-ai.org?subject=Mitmachen` in V1** — einfach, kein Form-Backend für diese CTA nötig. Kann in Phase 27 zu Form upgegraded werden wenn Volumen steigt.
- **D-09** — Verein-Anker `#verein` ist kritisch: wird von Phase 22 Partner-Page verlinkt. Muss im URL bleiben auch bei späteren Änderungen.
- **D-10** — FAQ-Antworten sind bereits Simon-gescripted und können 1:1 übernommen werden. Nur Voice-Check in Phase 27.

---

## Success Criteria

- [ ] `/about` Route existiert in `apps/website/app/about/page.tsx`
- [ ] Alle 9 Sektionen gerendert, in korrekter Reihenfolge
- [ ] Hero mit H1 + Bold-Claim + Intro-Absatz
- [ ] Story mit 3 Absätzen + Inline-CTA
- [ ] Team mit Gründer-Karten (prominent) + Mitglieder-Kacheln (klein)
- [ ] 4 Werte-Blöcke
- [ ] Verein-Abschnitt mit Anker `#verein`
- [ ] Mitmach-CTA als eigene Section mit Mailto-Button
- [ ] 10-FAQ Accordion mit Anker `#faq`, multi-open, keyboard-navigierbar
- [ ] Abschluss-CTA zu `/join` + „Auch das geht →" Secondary
- [ ] Kontaktbox mit 3 Links
- [ ] Alle Section-Header folgen DS-Pattern (`// kommentar` + H3)
- [ ] Anker-Links funktionieren (`#story`, `#team`, `#werte`, `#verein`, `#mitmach`, `#faq`, `#kontakt`)
- [ ] Mobile responsive, A11y korrekt (Accordion aria-expanded, Anker Focus)
- [ ] Lighthouse `/about` > 90 in allen Kategorien
- [ ] Meta-Tags: `<title>Über uns · Generation AI</title>`, Meta-Description aus Simon-Copy
- [ ] OG-Image (Hero-basiert oder dediziertes /about OG)
- [ ] Nav-Item „Über uns" highlightet `/about`
- [ ] Playwright-Smoke: Route lädt, alle 9 Sections gemounted, FAQ-Accordion öffnet per Klick, Anker-Scroll funktioniert, `/about#faq`-Deep-Link öffnet korrekt

---

## Offene Fragen (zu klären vor Planning)

1. **Team-Fotos:** Wie viele Team-Mitglieder zum Launch sichtbar? Gründer (2) fix, aktive Mitglieder (laut Simon „zehn") — alle 10 oder eine kuratierte Auswahl?
2. **Gründer-Bios:** 1-2 Sätze pro Person — Luca liefert oder ich formuliere Drafts aus Simons Konzept + Team-Wissen?
3. **LinkedIn-URLs:** Janna + Simon + Alex (Head of Partnerships, Phase 22)
4. **„Auch das geht →" UX:** Popover mit 2 Links vs. direkter Link auf Partner vs. auf Mitmach? Lucas Entscheidung.
5. **Mitmach-CTA-Mechanik:** Mailto (V1, empfohlen) vs. inline Kontakt-Form?
6. **FAQ vs. Kurz-FAQ-Sync:** Die 5 Kurz-FAQ-Fragen aus Simon §4.10 sind eine Teilmenge der 10 aus §9.9. Sind die Antworten **identisch** oder kürzer/länger pro Seite? Empfehlung: identisch für Konsistenz, Kurz-FAQ zeigt nur 5 davon.
7. **Accordion-Component-Heimat:** In `packages/ui` ausziehen (wiederverwendbar für /about + Landing) oder lokal in apps/website? Entscheidung fällt im Plan 20.6-09 (Kurz-FAQ).

---

## Release

Patch innerhalb Milestone v4.0. Reine Page-Addition ohne Breaking Change.
