---
phase: 26
slug: community-page-and-subdomain-integration
status: approved
created: 2026-04-25
last-updated: 2026-04-26
accepted_by: Luca
acceptance_note: "Owner accepted remaining UAT items in chat; no rerun performed in this update."
---

# Phase 26 — User Acceptance Test

> Schritt-für-Schritt Browser-Walkthrough für Luca. Klickbare Checkliste durchgehen, jeder Punkt grün → "approved" reichen, einzelne Fails → "issues: <Punktnummer + Beschreibung>" reichen.

---

## Setup

**Option 1 — Local Production-Build (empfohlen):**

```bash
cd /Users/lucaschweigmann/projects/generation-ai-phase-26
pnpm --filter @genai/website build
pnpm --filter @genai/website start
# → http://localhost:3000
```

Featured-Tools-API muss separat laufen falls echter 5-Tool-Pfad sichtbar werden soll:

```bash
# in zweitem Terminal
pnpm --filter @genai/tools-app build
pnpm --filter @genai/tools-app start
# → http://localhost:3001/api/public/featured-tools
# Stelle sicher dass NEXT_PUBLIC_TOOLS_APP_URL in apps/website/.env auf http://localhost:3001 zeigt
```

Ohne tools-app läuft der Fallback-Pfad mit allen 12 Tools — auch ein gültiger Test, aber UAT-Item B3-B4 prüfen explizit beide Pfade.

**Option 2 — Vercel Preview Deploy (falls Branch gepusht ist):**

Direkt die preview-URL nutzen. Featured-Tools-API ist dann automatisch der Production-Endpoint.

---

## Block A — `/community` Page

### Hero-Sektion

- [ ] Visit `http://localhost:3000/community` (oder Preview-URL). Page lädt, kein Console-Error.
- [ ] Section-Header zeigt „// generation ai · community" (LabeledNodes-Pattern wie auf Subpages /about, /partner, …).
- [ ] H1 zeigt **„Mehr als eine Community."** (Punkt am Ende, exakt diese Schreibweise).
- [ ] Sub-Copy zeigt „Austausch, Kurse, News, exklusive Inhalte. Von Studis, für Studis." (oder die in 26-02 finalisierte Variante).
- [ ] Hero-CTA „Direkt zur Community →" sichtbar — Klick öffnet **neuen Tab** auf `https://community.generation-ai.org`. Tab schließen, zurück zur Page.

### Pillars — „Was dich drinnen erwartet"

- [ ] 4 Bento-Kacheln in 2×2 Grid (Desktop) bzw. 1-Spalte (Mobile).
- [ ] Kachel 1 = **Austausch**, Lucide-Icon `Users` (Personen-Symbol), kurze Beschreibung Peer-to-Peer / Sparring.
- [ ] Kachel 2 = **Lernpfade & Kurse**, Lucide-Icon `BookOpen`, kurze Beschreibung „strukturiert / im eigenen Tempo".
- [ ] Kachel 3 = **News & Insights**, Lucide-Icon `Newspaper`, kurze Beschreibung „kuratiert / Signal statt Noise".
- [ ] Kachel 4 = **Exklusive Inhalte**, Lucide-Icon `Lock`, kurze Beschreibung „Prompt-Bibliotheken / Tool-Tiefgänge / Masterclass".
- [ ] **Keine Circle-Screenshots** in den Kacheln (D-12) — nur Icons + Text.

### Carousel — „Was wir gerade teilen"

- [ ] Section-Header „// aus der community" + H3 „Was wir gerade teilen." (oder finalisierte Variante).
- [ ] Carousel zeigt **4 Karten** (newest-first sortiert). Erste Karte sollte aktuelles Datum haben (KI-News-KW17-2026 oder neuestes aus `apps/website/content/community/`).
- [ ] Genau **1 Karte** trägt das Pill-Badge **„KI-News"** (mit Accent-Dot prefix). Das ist der `kind: "ki-news"`-Artikel.
- [ ] Pro Karte sichtbar: Titel + Lesezeit + (optional Datum/Excerpt).
- [ ] Auf **Mobile (375×812)**: Karten scrollen horizontal mit Finger-Drag, snappen zum Card-Edge (CSS scroll-snap-mandatory).
- [ ] Tab in das Carousel-Container (Tab-Key) → es bekommt sichtbaren Focus-Ring → Pfeil-Tasten ↔ scrollen das Carousel.

### Article-Detail Page

- [ ] Klick auf eine Carousel-Karte (z.B. "Bachelorarbeit mit Claude") → URL ändert sich zu `/community/artikel/bachelorarbeit-mit-claude` (**echte Subpage, kein Modal**, kein History-State-Trick).
- [ ] Article-Page rendert:
  - h1 mit Artikel-Titel
  - Meta-Zeile mit Datum (z.B. „20. April 2026 · 6 min Lesezeit") in deutscher Schreibweise
  - MDX-Body (2-3 Absätze, Markdown-Headings rendern korrekt)
  - Bottom-CTA „Weiterlesen in der Community →" — Klick öffnet **neuen Tab** zur jeweiligen Circle-URL
- [ ] Browser-Back → zurück auf `/community`, Carousel-Position erhalten.
- [ ] Visit `http://localhost:3000/community/artikel/ki-news-kw17-2026` direkt — am Top der Page sichtbar das Badge **„KI-generiert · vom Team kuratiert"** (Border-Pill mit Accent-Dot).
- [ ] Visit `http://localhost:3000/community/artikel/nonexistent` → 404-Page (korrekt, `dynamicParams=false`).

### SEO + Crawling

- [ ] Auf einer Article-Page: View Source (Cmd+Option+U). Im `<head>`-Block sichtbar:
  - `<title>...| Generation AI</title>` mit Article-Titel
  - `<meta property="og:title" content="...">`
  - `<meta property="og:description" content="...">` (= excerpt)
  - `<meta property="og:type" content="article">`
  - `<meta property="og:url" content="https://generation-ai.org/community/artikel/...">`
  - `<meta name="twitter:card" content="summary_large_image">`
  - **Kein** `<meta property="og:image">`-Override (Root-OG erbt — D-22).
- [ ] Im `<body>` der Article-Page: View Source enthält `<script type="application/ld+json">{"@type":"Article",...}</script>`. `<` characters in dem JSON sollten als `\u003c` escaped sein.
- [ ] Visit `http://localhost:3000/sitemap.xml` → XML mit **6 Einträgen**:
  - `https://generation-ai.org/`
  - `https://generation-ai.org/community`
  - 4× `https://generation-ai.org/community/artikel/<slug>`
- [ ] Visit `http://localhost:3000/robots.txt` → enthält `Allow: /` und `Sitemap: https://generation-ai.org/sitemap.xml`.

### Final-CTA

- [ ] Scroll auf `/community` ganz nach unten → Final-CTA-Section sichtbar.
- [ ] H2 zeigt **„Wir sehen uns drinnen."**.
- [ ] Body-Copy „Kostenlos, keine Haken, kein Spam. Einfach beitreten und loslegen." (oder finalisierte Variante).
- [ ] Button **„Kostenlos beitreten"** → Klick navigiert zu `/join` (internal, **same Tab**).

---

## Block B — Subdomain-Integration auf Landing

### Featured-Tools-API

- [ ] In Terminal: `curl -s http://localhost:3001/api/public/featured-tools | head -40` → JSON-Response mit `{ tools: [...], generated_at: "..." }`. Tools-Array hat **5 Einträge** mit slugs `chatgpt`, `claude`, `lovable`, `cursor`, `perplexity`.
- [ ] In Terminal: `curl -sI http://localhost:3001/api/public/featured-tools` → Response-Header enthält `Cache-Control: public, s-maxage=300, stale-while-revalidate=1800`.
- [ ] Alternativ via Browser: Open `http://localhost:3001/api/public/featured-tools` direkt — JSON sichtbar.

### Landing Tool-Showcase-Section

- [ ] Visit `http://localhost:3000/`. Scroll zur **„Tool-Showcase"**-Section (Marquee).
- [ ] **Live-Pfad**: Marquee zeigt 5 Featured-Tools (chatgpt, claude, lovable, cursor, perplexity) — diese animieren in einer endlosen Marquee-Loop.
- [ ] **Fallback-Pfad** (manuell triggern): Stoppe tools-app (`Ctrl+C` im 2. Terminal) ODER setze `NEXT_PUBLIC_TOOLS_APP_URL` auf einen unerreichbaren Host. Reload Landing → Marquee zeigt jetzt **alle 12 Fallback-Tools** (Claude, ChatGPT, Gemini, Perplexity, NotebookLM, Midjourney, ElevenLabs, Gamma, Runway, GitHub Copilot, Notion AI, Make). Page **crashed nicht**. Optional: Im Server-Terminal `console.warn("[tool-showcase] API fetch failed, using fallback: ...")` sichtbar.
- [ ] **Kein** „Beispiel"-Badge mehr im Section-Header (Phase 26 hat das entfernt — Daten sind real).

### Landing Community-Preview-Section

- [ ] Auf `/`: Scroll zur **„Community-Preview"**-Section.
- [ ] **Article-Spalte** (linke / obere Spalte): zeigt **die 3 neuesten Artikel** aus `apps/website/content/community/` (newest-first sortiert).
- [ ] Bei dem `kind: "ki-news"`-Artikel sichtbar das **KI-News-Badge** (Pill mit Accent-Dot).
- [ ] Klick auf eine Article-Card → navigiert auf `/community/artikel/[slug]` (internal, same Tab).
- [ ] Footer-Link **„Alle Artikel ansehen →"** → navigiert auf `/community` (internal, same Tab — nicht extern zu Circle).
- [ ] **Events-Spalte** (rechte / untere Spalte): zeigt Stub-Events mit **„Beispiel"-Badges** pro Card (D-21 — Phase 22.5 territory, weiterhin Stub).

### Layout-Stability

- [ ] Beim Reload von `/`: **kein** sichtbarer Layout-Shift während die Section streamt. Marquee-Bereich hat `min-h-[180px]` damit der Cards-Bereich nicht „springt".
- [ ] Sub-line der Community-Preview lautet „Drei aktuelle Artikel aus der Community — und kommende Termine." (NICHT mehr „Sobald die Community-API live ist...").

---

## Header Navigation (Plan 26-06)

### Desktop (≥ md)

- [ ] Auf irgendeiner Page (z.B. `/`): Header sichtbar. Nav zeigt: Tools | Community | Für Partner ▾ | Über uns.
- [ ] Klick auf **„Community"** → URL wechselt zu `localhost:3000/community`. **Same Tab**, **no full reload** (next/link client-side navigation — beobachtbar daran, dass Layout/Header nicht flackert).
- [ ] Klick auf **„Tools"** → öffnet **neuen Tab** zu `https://tools.generation-ai.org` (extern bleibt extern).
- [ ] Klick auf **„Über uns"** → URL wechselt zu `/about` (internal, no reload).
- [ ] Klick auf **„Für Partner"** → Dropdown öffnet mit 3 Items, jedes ist internal Link auf `/partner#unternehmen|stiftungen|hochschulen`.
- [ ] **Regression-Check:** Andere internal-Nav-Links wie „Über uns" funktionieren weiterhin als client-side routing (kein Reload, kein neuer Tab).

### Mobile (< md, Burger-Menu)

- [ ] DevTools auf 375×812 (iPhone 12 Pro). Header zeigt Logo + Theme-Toggle + Burger-Icon (kein Desktop-Nav sichtbar).
- [ ] Burger drücken → Sheet öffnet von rechts.
- [ ] Im Sheet sichtbar: Tools / Community / Für Partner / Über uns / Jetzt-Beitreten-CTA.
- [ ] Klick auf **„Community"** → Sheet schließt, URL wechselt zu `/community` (same Tab).
- [ ] Burger erneut drücken, Klick auf **„Tools"** → öffnet neuen Tab zu `https://tools.generation-ai.org`.
- [ ] Burger erneut drücken, Klick auf **„Für Partner"** → Accordion öffnet, 3 Sub-Items klickbar, navigieren auf `/partner#...`.

### Cross-Check: Hero-CTA bleibt extern

- [ ] Visit `/community`. Hero-CTA „Direkt zur Community →" → öffnet weiterhin **neuen Tab** zu `https://community.generation-ai.org`. Diese Zeile ist die Members-Gateway, NICHT vom Header-Nav-Change betroffen.

---

## Lighthouse-Verifikation (optional Re-Run)

Phase-Validation hat bereits gemessen (Werte in `26-VALIDATION.md`):

| Konfig             | Perf | A11y | BP  | SEO | Status |
| ------------------ | ---- | ---- | --- | --- | ------ |
| /community Desktop | 99   | 100  | 96  | 100 | ✅ ≥ 90 |
| /community Mobile  | 91   | 100  | 100 | 100 | ✅ ≥ 90 |
| Article Desktop    | 100  | 100  | 96  | 100 | ✅ ≥ 90 |
| Article Mobile     | 96   | 100  | 100 | 100 | ✅ ≥ 90 |

**Re-Run-Befehle** (falls Luca selbst messen will):

```bash
cd /tmp
lighthouse http://localhost:3000/community --preset=desktop --view --chrome-flags="--headless"
lighthouse http://localhost:3000/community --form-factor=mobile --screenEmulation.mobile=true --view --chrome-flags="--headless"
lighthouse "http://localhost:3000/community/artikel/bachelorarbeit-mit-claude" --preset=desktop --view --chrome-flags="--headless"
lighthouse "http://localhost:3000/community/artikel/bachelorarbeit-mit-claude" --form-factor=mobile --screenEmulation.mobile=true --view --chrome-flags="--headless"
```

`--view` öffnet den HTML-Report automatisch im Browser für visuelle Inspektion.

---

## Sign-off

```
Phase 26 UAT signed off by Luca on 2026-04-26.
Open issues for follow-up: none blocking for Phase 27 readiness.
```

**Resume-Signal an Executor:**

- ✅ Type **"approved"** wenn alle Items grün
- ⚠️ Type **"issues: <Punktnummer + kurze Beschreibung>"** für jeden Fail → Gap-Liste für `/gsd-plan-phase 26 --gaps`
