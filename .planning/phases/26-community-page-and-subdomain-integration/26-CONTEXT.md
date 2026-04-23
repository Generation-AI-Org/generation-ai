---
phase: 26
slug: community-page-and-subdomain-integration
type: context
status: planning
created: 2026-04-23
last-updated: 2026-04-23
depends_on:
  - 20.6 (Nav + DS baseline)
  - 22.7 (Tools-Subdomain polish — tools-app nav consistent)
  - 25 (Circle-API-Sync active — optional für Live-Post-Pull, nicht blocking)
branch: feature/phase-26-community
---

# Phase 26 — `/community` Seite + Subdomain-Integration

> Eigene `/community`-Seite auf der Hauptdomain als **SEO-Motor + Discovery-Kanal** für die Circle-Community. 4 Content-Pillars, Blog-Teaser mit eigenen Artikel-URLs, MDX-basierte Artikel-Pipeline. Zusätzlich: Featured-Tools-Preview auf der Landing via public API. Umsetzung nach Simons Konzept §7.

---

## Scope-Klärung gegenüber Original-Roadmap

Die ursprüngliche v4.0-Roadmap hatte Phase 26 nur als **„Subdomain-Integration"** (Featured-Tools-API + Community-Preview-API auf der Landing). Simons Konzept erweitert das zu einer vollwertigen `/community`-Seite mit SEO-relevanten Artikel-Unterseiten. Diese Phase deckt beides ab.

Teilung in zwei logische Blöcke:
- **Block A — /community als eigene Seite** (neu, Scope-Erweiterung aus Simons Konzept §7)
- **Block B — Featured-Tools-Preview auf Landing** (original Phase 26 Scope, plus Community-Preview)

---

## Mission (Block A)

Circle (community.generation-ai.org) ist login-gated — für Google unsichtbar, für Nicht-Mitglieder unerreichbar. Die `/community`-Seite auf der Hauptdomain übernimmt drei Rollen gleichzeitig:

1. **Landingpage für Circle** — erklärt Non-Members was drinnen ist, bevor sie sich anmelden
2. **Direkt-Kanal für Members** — „Zur Community →" Link direkt ins Circle
3. **SEO-Motor** — Blog-Teaser mit eigenen URLs (`/community/artikel/[slug]`) generieren organischen Traffic

## Mission (Block B)

Landing bekommt echte Daten statt Stubs — Featured-Tools aus tools-app via public API, Community-Preview-Sektion zeigt aktuelle Circle-Posts (wenn API-Integration ab Phase 25 steht) oder bleibt als MDX-Teaser-Set.

---

## Scope

### Block A — `/community` Seite

**In-scope:**
- Hero-Sektion §7.3:
  - Section-Header „Generation AI · Community"
  - H1 „Mehr als eine Community."
  - Subhead „Austausch, Kurse, News, exklusive Inhalte. Von Studis, für Studis."
  - Direktlink „Direkt zur Community →" (für Members, führt auf `community.generation-ai.org`)

- **„Was dich drinnen erwartet"** §7.4: 4-Kachel-Grid mit Content-Pillars
  - **Austausch** — Peer-to-Peer, Fragen, Sparring
  - **Lernpfade & Kurse** — strukturiert, im eigenen Tempo
  - **News & Insights** — kuratiert, „Signal statt Noise"
  - **Exklusive Inhalte** — Prompt-Bibliotheken, Tool-Tiefgänge, Masterclass-Materialien
  - Mockup-Visualisierungen im Stil der Landing „Drei Säulen"-Sektion, keine Circle-Screenshots

- **„Was wir gerade teilen" Blog-Teaser** §7.5 — SEO-Kern:
  - Header nach DS-Pattern: `// aus der community` + H3 „Was wir gerade teilen."
  - Horizontales Scroll-Carousel mit Artikel-Kacheln
  - Chronologisch sortiert, neueste links
  - Pro Kachel: Titel, Lesezeit, Klickbar
  - Klick → `/community/artikel/[slug]` (**echte Unterseite**, keine Modal!)

- **Artikel-Unterseiten** `/community/artikel/[slug]`:
  - Überschrift + 2-3 Absätze Content (aus Circle-Post extrahiert + gekürzt)
  - CTA am Ende: „Weiterlesen in der Community →" führt auf Circle-Post
  - Meta-Tags (OG + Twitter), Schema.org Article Markup
  - Crawlbar für Google (robots.txt OK, Sitemap-Eintrag)

- **KI-News-Beiträge**: normale Artikel in gleicher Pipeline, mit Badge „KI-generiert, vom Team kuratiert". Keine separate Sektion.

- **Abschluss-CTA** §7.6:
  - H2 „Wir sehen uns drinnen."
  - Body „Kostenlos, keine Haken, kein Spam. Einfach beitreten und loslegen."
  - Button „Kostenlos beitreten" → `/join`

- **MDX-Pipeline** in `apps/website/content/community/`:
  ```
  apps/website/content/community/
  ├── bachelorarbeit-mit-claude.mdx
  ├── prompting-fuer-einsteiger.mdx
  └── ki-news-kw17-2026.mdx  # mit badge: "ki-generiert"
  ```
- Frontmatter-Schema:
  ```yaml
  ---
  title: string
  slug: string
  date: ISO-Date
  readingTime: number (Minuten)
  kind: "artikel" | "ki-news"
  circleUrl: string   # Link zum Original-Post in Circle
  excerpt: string     # für Teaser-Kachel und OG-Description
  ---
  Body (2-3 Absätze Markdown + Link „Weiterlesen in der Community →")
  ```
- Sort: neueste zuerst auf /community und in Sitemap

### Block B — Subdomain-Integration auf Landing

**In-scope:**
- **Featured-Tools-Preview-Section** auf Landing (ersetzt aktuellen Tool-Showcase-Stub aus Phase 20.6-03):
  - Content-Schema-Migration: `featured: boolean` Flag in tools-app Content-Package
  - Initial 3-5 Tools manuell als `featured: true` markieren
  - tools-app exposed `GET /api/public/featured-tools` (Server-Component-cached, kein Auth nötig)
  - Website konsumiert via Server-Component mit ISR (`revalidate: 300`)
  - Fallback-UI falls API down: Placeholder-Cards
- **Community-Preview-Section** auf Landing:
  - Option A (einfach): MDX-Teaser-Files (letzte 3 aus `apps/website/content/community/`) auf Landing ziehen
  - Option B (ambitioniert): Circle-API-Call für live Posts (wenn Phase 25 durch ist)
  - Empfehlung: **Start mit Option A**, Option B als Roadmap-Item wenn API-Token stabil läuft

**Out-of-scope:**
- Content-Management-UI für Featured-Flag (bleibt DB/Admin-Update)
- AI-Content-Agent für automatisierte KI-News (Roadmap-Item)
- Circle-Posts-API live auf Landing (Option B oben) — deferred bis API-Rate-Limit klar
- Search auf /community-Artikel
- Artikel-Kategorien/Tags
- Kommentare oder Reactions auf Artikel-Unterseiten (Community bleibt in Circle)

---

## Decisions

- **D-01** — `/community` ist eigene Seite auf Hauptdomain, nicht nur Landing-Section. Begründung: SEO-Crawl, Blog-Teaser als organischer Traffic-Kanal, Landing für Non-Members, Gateway für Members.
- **D-02** — Blog-Teaser öffnen als **echte Unterseite** (`/community/artikel/[slug]`), nicht Modal. SEO-kritisch.
- **D-03** — MDX-Files im Repo als Content-Source. Parallel-Pipeline zu `/events` (Phase 22.5). Kein CMS, keine Circle-API-Abhängigkeit für Phase-26-Launch.
- **D-04** — KI-News-Beiträge laufen in gleicher Pipeline wie normale Artikel, unterschieden nur durch `kind: "ki-news"` Frontmatter und Badge-Rendering.
- **D-05** — Artikel-Unterseiten haben 2-3 Absätze echten Inhalts + Link auf Original-Post in Circle. Teaser-Strategie: genug Content damit Google indexiert, nicht so viel dass Circle-Klick unnötig wird.
- **D-06** — Start-Content bei Launch: **Placeholder-Artikel** (noch keine echten Circle-Posts da — bestätigt von Luca 2026-04-23). Echter Content wird sukzessive nachgezogen, pro Artikel ~20 Min Aufwand (Copy-Paste aus Circle + kürzen + MDX-File anlegen + committen).
- **D-07** — Featured-Tools-API: tools-app bekommt Public-Endpoint ohne Auth. Rate-Limit via Vercel-Edge-Cache, kein eigenes Rate-Limiting nötig für Publikums-Traffic.
- **D-08** — Community-Preview-Section auf Landing nutzt **Option A (MDX-Teaser)** für V1. Circle-Live-API bleibt Roadmap.
- **D-09** — Schema.org Article Markup auf Artikel-Unterseiten → strukturierte Daten für Google (Rich Snippets möglich).

---

## Success Criteria

### Block A
- [ ] `/community` Route existiert und rendert alle 4 Sektionen
- [ ] 4 Content-Pillar-Kacheln mit Mockup-Visualisierungen (kein Circle-Screenshot)
- [ ] Blog-Teaser-Carousel: mindestens 3 Placeholder-Artikel chronologisch
- [ ] Horizontales Scroll auf Mobile funktioniert
- [ ] Klick auf Kachel öffnet `/community/artikel/[slug]` (echte Unterseite, nicht Modal)
- [ ] Artikel-Unterseite rendert Title + Body + „Weiterlesen in Community →" CTA
- [ ] Meta-Tags (OG, Twitter) korrekt
- [ ] Schema.org Article markup vorhanden
- [ ] Sitemap.xml enthält alle Artikel-URLs
- [ ] Robots.txt erlaubt Crawl
- [ ] KI-News-Badge auf Artikeln mit `kind: "ki-news"` sichtbar
- [ ] Direktlink „Direkt zur Community →" im Hero führt auf `community.generation-ai.org`
- [ ] Abschluss-CTA führt auf `/join`
- [ ] Lighthouse `/community` und `/community/artikel/[slug]` > 90
- [ ] Mobile responsive, A11y korrekt

### Block B
- [ ] tools-app `/api/public/featured-tools` Endpoint liefert JSON mit 3-5 Featured-Tools
- [ ] Website Landing Tool-Showcase-Section konsumiert API via Server-Component
- [ ] ISR-Cache funktioniert (`revalidate: 300` gesetzt)
- [ ] Fallback-UI falls API down (Placeholder-Cards)
- [ ] Community-Preview-Section auf Landing zeigt 3 letzte MDX-Artikel
- [ ] Keine Layout-Shift beim Data-Swap

---

## Offene Fragen (zu klären vor Planning)

1. **MDX-Stack finalisieren:** `@next/mdx` + `next-mdx-remote`, oder Contentlayer, oder Custom-Frontmatter-Parsing? Sollte für `/events` und `/community` einheitlich sein (beide nutzen gleiche Mechanik).
2. **Start-Artikel:** Wie viele Placeholder bei Launch? Empfehlung: 3 Artikel, damit Carousel nicht leer wirkt. Luca liefert Titel + 2-3 Absätze, Claude formatiert als MDX.
3. **Content-Pillar-Visualisierungen:** Custom SVG-Mockups oder einfache Icon-basierte Cards? Stil der Landing „Drei Säulen"-Section wiederverwenden — prüfen ob Component reusable ist.
4. **OG-Image pro Artikel:** Dynamisch generiert (Next.js `opengraph-image.tsx`) oder statisches Default-Image?
5. **Circle-Link-Validation:** Sollen wir prüfen ob der `circleUrl` im Frontmatter erreichbar ist (bei Build), oder trust-the-author?
6. **Tool-Showcase vs. Featured-Tools-Migration:** Phase 20.6-03 baut gerade den Stub-Showcase. Wird der in Phase 26 ersetzt, oder upgraded? → Empfehlung: upgrade in-place (gleiche Component, andere Datenquelle).
7. **Community-Preview-Refresh-Strategie:** Wenn MDX-Artikel neu gepusht werden, triggert das ein Re-Deploy. Für Live-Updates reicht das. OK?

---

## Release

Minor innerhalb Milestone v4.0 oder Bump zu v5.0. Abhängig davon wann Phase 25 (Circle-API-Sync) live geht.
