# Milestone v4.0 — Website Conversion-Layer & Onboarding-Funnel

> Scope-Dokument aus Sparring-Session 2026-04-19
> Input für `/gsd-new-milestone`

## Ausgangslage

- v3.0 (UX Polish & Feature Expansion) abgeschlossen, 5/5 Phasen, Release v4.3.0
- Aktuelle Website (generation-ai.org) ist One-Pager: Hero → Features → TargetAudience → Signup + Terminal-Splash, Legal-Seiten
- Navigation aktuell leer
- tools-app (tools.generation-ai.org) funktionsfähig mit Library/Chat/Auth
- Community (community.generation-ai.org) läuft via Circle Pro, Custom Domain
- Signup-Route aktuell 503 (bewusst deaktiviert)

**Ziel v4.0:** Website vom One-Pager-Intro zum **Conversion-Entry-Point** mit klarem Funnel Richtung Mitgliedschaft. Basis für Fördermitglieder-Wachstum und Partner-Ansprache.

## Quellen

- Google Drive "Strategy & Vision"-Ordner: `Generation AI_Value Proposition_v2.docx`, `Onboarding.pptx`, `Org Structure.pptx`
- Umfrage N=109 Studierende, März 2026 (in Value-Prop integriert)
- Code-Stand: `apps/website`, `apps/tools-app`, `brand/` (Design-System v1.0)
- LEARNINGS.md (CSP-Incident 2026-04-18)

## Korrekturen zu Granola-Meeting-Notes

Granola hatte Deutsch-Transkript auf English verarbeitet, viele Verzerrungen:

| Granola-Aussage | Korrigierter Stand |
|---|---|
| Cascadia Code für Headlines | Geist Mono (H1) + Geist Sans (Rest) — final |
| Grün als Primärfarbe | Theme-Duo: Dunkel = blau-grün (Default), Hell = rot-pink. Kein Welt-Pro-Touchpoint |
| Level "Explorer / Prompter / Automator/Agent" | 5 Level aus Umfrage: spontan / strukturiert / Tools kombinieren / Automatisierung / API+Agents |
| Favicon, Terminal-Animation, DESIGN.md TODO | Bereits vorhanden, NICHT Teil v4.0 |
| Tool-Seite Pro-Features / Upgrade | Nicht geplant — Mission kostenfrei |
| Multi-Modell/Token-Tracking/Web-Search in tools-app | Zukunft, NICHT v4.0 |

## Mission & Zielgruppen

**Mission:** "We shape talent for an AI-native future" — Generation AI als e.V. befähigt Studierende aller Fachrichtungen zur praktischen KI-Kompetenz für die Arbeitswelt.

**Zielgruppen:**

- **Primär (v4.0-Fokus):** Studierende DACH, alle Fachrichtungen. Self-Service-Funnel via `/join`.
- **Sekundär (v4.0 informativ):** Pre-Studium, Early-Career (2-3 Jahre nach Abschluss). Im Fragebogen als Status-Auswahl, kein eigener Flow.
- **Partner (v4.0 informativ):** Unternehmen, Stiftungen, Hochschulen. **Kein Self-Signup.** Lead-Capture via `/partner` → Kontakt.

## Website-Architektur

**Pattern:** Hybrid — Conversion-Landing + Deep-Dive-Unterseiten.

**Subdomains unverändert (externe Links aus Nav):**
- `tools.generation-ai.org` — tools-app (Library + Chat)
- `community.generation-ai.org` — Circle (Community + Events)

**Website-Unterseiten (generation-ai.org):**
- `/` — Conversion-Landing (umgebaut)
- `/about` — Mission, Team, Sparringspartner, Verein
- `/partner` — Drei Anker-Sections (Unternehmen, Stiftungen, Hochschulen)
- `/join` — Fragebogen + optionales Assessment + Signup-Flow (Backend 503 bis Go)
- `/datenschutz`, `/impressum` — bestehend

**Keine eigenen `/tools` und `/community`** auf der Website — die Subdomains leisten das.

## Navigation

**Top-Nav final:**
```
Tools · Community · Für Partner ▾ · Über uns · [Jetzt beitreten]
```

- **Tools** → extern `tools.generation-ai.org`
- **Community** → extern `community.generation-ai.org`
- **Für Partner ▾** → Dropdown mit Anker-Links
  - Unternehmen → `/partner#unternehmen`
  - Stiftungen → `/partner#stiftungen`
  - Hochschulen → `/partner#hochschulen`
- **Über uns** → `/about`
- **[Jetzt beitreten]** → `/join` (einziger prominenter CTA)

**Kein Login-Button** im Header — Marketing-Seite ist für Neue. Bestehende Member kommen über Bookmark/Circle-Mail direkt zur tools-app.

**Footer:** Legal, Sitemap, Social (LinkedIn), Kontakt-Mail, Copyright.

## Landing-Sections (`/`)

Reihenfolge von oben nach unten:

1. **Terminal-Splash** — bestehend, unverändert
2. **Hero** — Claim (wording TBD) + Subline + Primary CTA "Jetzt beitreten". **Keine Zahlen.**
3. **Die KI-Diskrepanz** — zentraler Hook. Gegenüberstellung:

   | Links: Was Wirtschaft will | Rechts: Was Studis mitbringen |
   |---|---|
   | 7× Nachfrage nach KI-Talent (2023→2025) | 83,5% auf Anfänger-Level |
   | 56% Lohnaufschlag für KI-Kompetenz | 75% "Studium bereitet mich nicht vor" |
   | 73% Unternehmen können KI nicht ausschöpfen | 6,4% intensive KI-Lehre im Studium |

   Visualisierung: **custom data-viz mit Animation** (Divergenz-Chart / Gap-Viz, scroll-triggered). "Aufwand egal, soll geil sein." Abschluss-Zeile: *"Generation AI schließt diese Lücke."*

4. **Was wir bieten** — 4 Cards:

   | # | Card | Inhalt |
   |---|---|---|
   | 1 | Community | Austausch, Peer-Learning via Circle |
   | 2 | Wissensplattform | Kuratierte Tool-Bibliothek, Artikel, Deep-Dives |
   | 3 | Events & Workshops | Webinare, Build Sessions, Hackathons, In-Person |
   | 4 | Expert-Formate | Gast-Speaker, Masterclasses (weiches Wording) |

   Jede Card: Icon, Titel, 1-Satz, Deep-Link.

5. **Tool-Showcase Teaser** — 3-5 **featured Tools** (Featured-Flag im Tool-Schema, manuell kuratiert). Cards mit Logo/Name/1-Satz. "→ Alle N Tools ansehen" → `tools.generation-ai.org`.

6. **Community-Preview** — zweispaltig:
   - Links: Letzte Artikel aus Tools-Space (3-4 via Circle API)
   - Rechts: Upcoming Events (2-3 via Circle API)
   - "→ Zur Community" → `community.generation-ai.org`
   - Fallback-Placeholder bei API-Down

7. **Zielgruppen-Split** (Variante B):
   - Studi-Section groß, primärer CTA → `/join`
   - Dezenter B2B-Streifen: "Du vertrittst ein Unternehmen/Stiftung/Hochschule? → /partner"

8. **Trust**:
   - Logo-Strip der Sparringspartner (Unis/Firmen)
   - Micro-Proof Quellen-Angabe Survey ("N=109 · März 2026")

9. **Final CTA** — Claim-Wiederholung + "[Jetzt beitreten]" + Sub-Line ("Kostenfrei · 5 Minuten · Circle-Zugang inklusive") + kleiner Sekundär-Link "Erst mal umschauen → tools.generation-ai.org"

10. **Footer**

## Unterseiten-Inhalte (grob)

### `/about`
- Mission + Vision
- Story "Warum gegründet"
- Team (Gründer + 6 aktive Mitglieder)
- Sparringspartner + Beirat
- Verein (e.V., Gemeinnützigkeit, Mitgliedsarten)
- CTA: Beitreten / Kontakt

### `/partner`
- Hero: "Kooperation statt Standard"
- `#unternehmen` — Masterclasses, Talent-Zugang, Employer Branding, Pakete, Kontakt-CTA
- `#stiftungen` — Impact, Gemeinnützigkeit, Fördermöglichkeiten, Kontakt-CTA
- `#hochschulen` — Kooperation, Gastvorträge, Career-Services, Kontakt-CTA
- Shared: Testimonials (sobald vorhanden), Kontakt-Formular

Reihenfolge: Unternehmen → Stiftungen → Hochschulen (nach Einnahme-Potenzial).

### `/join`
Optionaler, linearer Flow mit Progress-Indicator ("Schritt X von 3"):

```
Step 1: Fragebogen
  - Name, Email
  - Status: Student / Pre-Studium / Early-Career
  - Uni (falls Student)
  - Motivation (Auswahl: Karriere / Neugier / Vertiefung / Sonstiges + Freitext)
  - Self-Select Level (1-5 mit Beschreibungen)

Step 2: Assessment [OPTIONAL]
  - CTA: "Genauer wissen, wo du stehst? → Assessment" [machen | überspringen]
  - Bei machen: Test-Logik (Details in eigener Phase)
  - Assessment-Ergebnis überschreibt Self-Select

Step 3: Account + Circle
  - Backend: Account bei uns anlegen + Circle-API-Trigger
  - Magic Link von uns + Magic Link von Circle
  - (Live-Signup 503 bis Luca Go gibt)

Step 4: Confirmation
  - "Check dein Postfach: 2 Magic Links"
  - Erklärung was jetzt passiert
```

**Design-Constraint:** Kein Gatekeeping. Test ist optional, Level kann später nachgeholt werden.

## Tech-Entscheidungen

- **Circle-Integration:** Custom-UI via Circle Pro API (kein iFrame). Brand-konsistent, CSP-sauber, server-renderbar.
- **Tool-Showcase Daten:** via shared content-package oder tools-app API (Detail in Phase).
- **data-viz (Diskrepanz):** custom, mit Animation, scroll-triggered.
- **Featured-Flag:** Boolean im Tool-Content-Schema für Landing-Auswahl.

## Constraints & Risiken

| Punkt | Relevanz |
|---|---|
| **LEARNINGS.md (CSP-Incident)** | PFLICHTLEKTÜRE vor jeder Änderung an `proxy.ts`, `lib/csp.ts`, `app/layout.tsx`. Nonce auf Request, force-dynamic, Prod-Build verifizieren. |
| **Circle-API-Failover** | Community-Preview + Signup-Sync müssen graceful degraden bei Circle-Down |
| **DSGVO Assessment-Daten** | Level-Score ist Personenbezug → Consent + Lösch-Flow im DSGVO-Modul klären |
| **Signup-503 bleibt** | `/join`-UI komplett bauen, Backend-Call als Stub/503 bis Luca freigibt |
| **Abbruchrate /join** | Progress-Indicator, Assessment optional, Self-Select als Low-Friction-Pfad |
| **Tool-Showcase Content-Pfad** | Featured-Flag setzt Schema-Änderung voraus (content-package) |
| **Circle Public-Content** | Muss geklärt werden: was im Tools-Space ist public-lesbar via API |

## Phase-Outline (vorläufig)

Reihenfolge und Dependencies finalisiert `/gsd-new-milestone`.

```
Phase A — Navigation-Redesign + Landing-Umbau
  (Hero, Diskrepanz-Viz, 4 Cards, Tool-Showcase, Community-Preview,
   Zielgruppen-Split, Trust, Final CTA)

Phase B — /about
Phase C — /partner (3 Anker-Sections)

Phase D — /join Fragebogen + Self-Select [UI, kein Live-Signup]
Phase E — Self-Assessment (Test-Logik, optional) [eigene Detail-Planung]
Phase F — Circle-API-Sync (Double-Magic-Link, Preview-testbar)
Phase G — Subdomain-Integrationen (Tool-Featured via API, Community-Preview via Circle API)
```

**Dependencies grob:**
- G blockt vollständige A (Landing-Teaser brauchen API-Integration), kann aber mit Stub-Daten vorgezogen werden
- E blockt nicht D (Assessment ist optional)
- F blockt produktiven /join, aber /join-UI kann ohne F gebaut werden

## Out-of-Scope für v4.0 (explizit)

- **Signup-Live-Reaktivierung** — entscheidet Luca separat, nicht Teil v4.0
- **Kurs-Content-Management-System** — kommt in späterer Milestone
- **Mitgliedschafts-Upgrade-Flow** (Förder→Ordentlich mit Vorstandswahl)
- **Payment-Infrastruktur** — aktuell alles kostenfrei
- **tools-app Evolution** (Multi-Modell, Token-Tracking, Web-Search, Pro-Tier) — spätere Milestone
- **Brand-Polish** (Favicon, Terminal-Animation, DESIGN.md-Update) — bereits vorhanden/erledigt
- **B2B-Sales-CRM / Partner-Management-Tool**
- **Social-Proof-Section** mit Member-Avataren/Count — "später"
- **Claim-Wording Hero + Final-CTA** — wird außerhalb dieser Phase formuliert

## Offene Wording-Arbeit (außerhalb v4.0-Scope)

- Hero-Claim
- Final-CTA-Claim
- Zielgruppen-Split Copy
- Diskrepanz-Section Intro + Closer
- 4-Card-Formulierungen

Wording ist Marketing-Arbeit — Phase liefert Struktur + Placeholder, Final-Wording später.

## Nächste Schritte

1. Review dieses Dokuments
2. `/gsd-new-milestone` mit diesem Scope als Input
3. Milestone-Structure + ROADMAP.md generieren
4. Erste Phase (vermutlich A) planen via `/gsd-discuss-phase` → `/gsd-plan-phase`

