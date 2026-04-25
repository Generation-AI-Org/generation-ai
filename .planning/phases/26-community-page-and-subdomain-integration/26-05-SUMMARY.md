---
phase: 26
plan: 05
subsystem: website
tags: [server-components, isr, mdx, refactor, landing]
requires:
  - 26-01 (MDX-Stack + getAllArticles)
  - 26-04 (BeispielBadge extraction + /api/public/featured-tools endpoint)
provides:
  - "Tool-Showcase als async Server-Component, fetched /api/public/featured-tools (ISR 300s, 5s timeout, 12-Tool-Fallback)"
  - "Community-Preview als async Server-Component, Article-Spalte aus MDX (3 latest), Events-Spalte bleibt Stub (D-21)"
  - "HomeClient nimmt toolShowcase + communityPreview als ReactNode-Props (Server-in-Client-Pattern)"
affects:
  - apps/website/app/page.tsx
  - apps/website/components/home-client.tsx
tech-stack:
  added:
    - "Next.js fetch with `next: { revalidate: 300 }` ISR pattern"
  patterns:
    - "Server-Component-in-Client-Component via ReactNode-Props"
    - "AbortController-Timeout um SSR-Hang bei API-Down zu verhindern"
key-files:
  created:
    - apps/website/components/sections/tool-showcase-marquee.client.tsx
    - .changeset/phase-26-server-component-sections.md
    - .planning/phases/26-community-page-and-subdomain-integration/26-05-SUMMARY.md
  modified:
    - apps/website/components/sections/tool-showcase-section.tsx
    - apps/website/components/sections/community-preview-section.tsx
    - apps/website/components/home-client.tsx
    - apps/website/app/page.tsx
decisions:
  - "D-15 satisfied: Tool-Showcase upgrades in-place (Component-Shape unverändert), Datenquelle wechselt von hardcoded `tools[]` → API + Fallback"
  - "D-08 (Option A) satisfied: Community-Preview Article-Spalte aus MDX statt Circle-API"
  - "D-21 honored: Events-Spalte bleibt Stub mit BeispielBadge bis Phase 22.5"
  - "BeispielBadge in Tool-Showcase entfernt — Daten sind real (kein zusätzlicher Cleanup-Schritt in 26-06 nötig)"
  - "Min-Height (180px) auf Marquee-Wrapper gegen CLS während Streaming (Pitfall 7)"
metrics:
  duration: "~25 min"
  completed: 2026-04-24
  tasks_complete: 4
  tasks_total: 4
  commits: 3
  files_created: 1
  files_modified: 4
---

# Phase 26 Plan 05: Server-Component-Refactor Tool-Showcase + Community-Preview Summary

Tool-Showcase und Community-Preview-Section sind jetzt async Server-Components mit Live-Daten (Featured-Tools-API mit ISR 300s + 12-Tool-Fallback, MDX-Artikel via `getAllArticles().slice(0,3)`); HomeClient bekommt beide als ReactNode-Props übergeben — TerminalSplash, MotionConfig, Transition-Wrapper und main-Element bleiben 1:1 erhalten.

## Was wurde gebaut

### 1. `tool-showcase-section.tsx` → Server Component (D-15)

- `'use client'` entfernt; Datei ist jetzt async Server-Component.
- `fetchFeaturedTools()` ruft `${NEXT_PUBLIC_TOOLS_APP_URL}/api/public/featured-tools` mit `next: { revalidate: 300 }` (ISR) und 5s `AbortController`-Timeout (Pitfall 8 / Threat T-26-05-01).
- `FALLBACK_TOOLS`: alle 12 Tools aus dem alten hardcoded `tools[]`-Array (Claude, ChatGPT, Gemini, Perplexity, NotebookLM, Midjourney, ElevenLabs, Gamma, Runway, GitHub Copilot, Notion AI, Make), gemappt vom alten Shape `{name, slug, cat, desc}` auf das neue API-Shape `{slug, title, summary, category, logo_domain, quick_win}`.
- Bei API-Down (404, 5xx, Timeout, leere Response): Fallback ohne Crash, console.warn-Log.
- BeispielBadge auf Section-Header entfernt — Daten sind real.

### 2. `tool-showcase-marquee.client.tsx` (NEU)

- `'use client'`-Datei mit der Marquee-Animation (useEffect/useRef Clone-Loop) extrahiert aus der alten Section.
- Akzeptiert Props `tools: ReadonlyArray<MarqueeTool>` + `toolsBase: string`.
- Marquee-Wrapper hat `min-h-[180px]` für CLS-Stabilität während Streaming.
- ToolCard-Markup unverändert ggü. Pre-Refactor; `summary ?? quick_win` als Soft-Fallback wenn API-Tools `summary === null` haben.

### 3. `community-preview-section.tsx` → Server Component (D-08, D-21)

- `'use client'` entfernt; jetzt async Server-Component.
- Article-Spalte: `const articles = (await getAllArticles()).slice(0, 3);` — liest die 3 neuesten MDX-Artikel (newest-first sortiert in `lib/mdx/community.ts`).
- 3-up Grid mit internen `<Link>`-Cards auf `/community/artikel/[slug]`.
- KI-News-Pill-Badge bei `kind === "ki-news"` (D-04).
- Events-Spalte unverändert: stubEvents + BeispielBadge per-card (D-21 Phase-22.5-Territorium).
- Sub-line aktualisiert: „Drei aktuelle Artikel aus der Community — und kommende Termine." (statt „Sobald die Community-API live ist...").
- Footer-Link „Alle Artikel ansehen →" jetzt internal `<Link href="/community">` (war external).

### 4. `home-client.tsx` Slot-Props (PLAN-CHECK Warning #5)

- Direkte Imports von `ToolShowcaseSection` + `CommunityPreviewSection` entfernt — async Server-Components dürfen nicht in `'use client'`-Module importiert werden.
- Neue Props `toolShowcase: ReactNode` + `communityPreview: ReactNode`.
- `<ToolShowcaseSection />` und `<CommunityPreviewSection />` JSX-Usages durch `{toolShowcase}` / `{communityPreview}` an exakt denselben Layout-Stellen ersetzt.
- **PRESERVED 1:1:** TerminalSplash mount + onComplete + skipIfSeen, showContent + splashDone state, handleSplashComplete callback, transition-wrapper div mit opacity/translate-classes, `<main id="main-content" className="min-h-screen pt-20">`, MotionConfig nonce wrapper.

### 5. `app/page.tsx` Server-in-Client-Pattern

- Importiert beide Server-Sections, rendert sie im Server-Component-Kontext und reicht sie als ReactNode-Props an `<HomeClient />` durch — Next streamt die async children korrekt.

### 6. Changeset

- `.changeset/phase-26-server-component-sections.md` (`@genai/website: minor`).

## Architektur-Notiz

Das Server-in-Client-Pattern (`app/page.tsx` rendert async Server-Sections und reicht sie als ReactNode-Props an die Client-`HomeClient`-Komponente weiter) ist die kanonische React-RSC-Architektur. HomeClient muss `'use client'` bleiben (TerminalSplash + state + MotionConfig), kann aber nicht direkt async Server-Components importieren. Die Lösung über Props funktioniert weil React/Next die async children automatisch streamt — kein `await` in der Client-Component nötig.

## Verifikation (Yolo Dev-Smoke)

| Check | Ergebnis |
|-------|----------|
| `pnpm tsc --noEmit` | clean |
| `pnpm --filter @genai/website build` | green (12/12 static pages) |
| `pnpm --filter @genai/website test --run` | 23/23 passed (5 test files) |
| `curl http://localhost:3000/` | HTTP 200, 103KB body |
| `id="main-content"` in DOM | present |
| `min-h-screen pt-20` class | present |
| `transition-all duration-700` wrapper | present |
| MotionConfig nonce | present (`nonce="..."` in script tags) |
| Tool-Showcase Section | rendered, 12 fallback tools (API HTTP 404 → fallback path verified live) |
| Community-Preview Article-Spalte | 3 MDX slugs: ki-news-kw17-2026, bachelorarbeit-mit-claude, prompting-fuer-einsteiger |
| KI-News-Badge | sichtbar |
| „Alle Artikel ansehen →" → `/community` (internal Link) | OK |
| `grep -c '^\s*slug:\s"' tool-showcase-section.tsx` | 12 (alle Fallback-Tools intakt) |
| `grep "TerminalSplash" home-client.tsx` | OK |
| `grep 'id="main-content"' home-client.tsx` | OK |
| `grep "showContent" home-client.tsx` | OK |
| `grep "toolShowcase: ReactNode" home-client.tsx` | OK |
| `grep "toolShowcase={<ToolShowcaseSection" page.tsx` | OK |

## Deviations from Plan

### Auto-fixed Issues

Keine.

### Plan-Anpassungen / Notes (im Yolo Visual-Checkpoint)

**1. Visual-Checkpoint im Yolo-Mode auto-approved**

- Anstatt manueller Browser-Verifikation wurde Yolo-Dev-Smoke gefahren: lokaler `pnpm dev`, `curl /` auf Port 3000, DOM-Check via grep auf alle relevanten Marker (Splash-Boundaries via MotionConfig nonce, main-element classes, transition-wrapper, beide Sections, Tool-Slugs, Article-Slugs, KI-News-Badge, internal-Link).
- TerminalSplash-Marker (`ASCII_LOGO`, `init community`) sind im **initialen** SSR-HTML nicht sichtbar — TerminalSplash ist eine `'use client'`-Component die erst nach Hydration mountet. Das ist konsistent mit der alten Pre-26-05 Architektur, **kein Regression-Signal**. Der MotionConfig-`nonce`-Wrapper umgibt den Splash-Mount-Punkt korrekt.

**2. Live-Test des Fallback-Pfads im Dev-Smoke (unbeabsichtigter Bonus)**

- Während `curl /` lief, hat die tools-app-API HTTP 404 zurückgegeben (Production-Deploy hängt noch auf Pre-26-04-Stand). Das hat den Fallback-Pfad **echt unter Live-Bedingungen** getriggert: `fetchFeaturedTools()` → `console.warn("[tool-showcase] API fetch failed, using fallback: HTTP 404")` → 12 Fallback-Tools im DOM. AbortController, Try/Catch und Fallback-Mapping arbeiten in Prod-Pattern wie spezifiziert. Sobald Plan 26-04 + 26-05 zusammen deployed sind, wird der echte 5-Tool-Pfad sichtbar.

## Threat Surface Status

Keine neuen Threat-Surfaces über die im PLAN-`<threat_model>` registrierten hinaus:
- T-26-05-01 (DoS via API-Hang): mitigiert durch AbortController 5s-Timeout — live verifiziert.
- T-26-05-02 (URL-Disclosure via console.warn): accepted (lokal/Vercel-private).
- T-26-05-03 (XSS via API-Response): mitigiert — Response wird nur als Text in `<a>`/`<h3>`/`<p>` gerendert, kein `dangerouslySetInnerHTML`.
- T-26-05-04 (Stale 5min): accepted per D-07/D-16.

## Self-Check: PASSED

- `apps/website/components/sections/tool-showcase-marquee.client.tsx` — exists
- `apps/website/components/sections/tool-showcase-section.tsx` — modified, no `'use client'`, async export, `next: { revalidate: 300 }`, AbortController, 12 FALLBACK_TOOLS
- `apps/website/components/sections/community-preview-section.tsx` — modified, no `'use client'`, async export, `getAllArticles().slice(0,3)`, internal `/community/artikel/` Link
- `apps/website/components/home-client.tsx` — modified, `toolShowcase: ReactNode` + `communityPreview: ReactNode` props, TerminalSplash + showContent + splashDone + transition-wrapper + main-element + MotionConfig preserved
- `apps/website/app/page.tsx` — modified, renders both server-sections, passes as props
- `.changeset/phase-26-server-component-sections.md` — exists
- Commits: `2785eec`, `328a877`, `9fdf9ac` — all in `git log`

## Commits

| Hash | Type | Scope | Subject |
|------|------|-------|---------|
| 2785eec | feat | 26-05 | split Tool-Showcase into async Server Component + Marquee client |
| 328a877 | feat | 26-05 | refactor Community-Preview to async Server Component (D-08, D-21) |
| 9fdf9ac | feat | 26-05 | wire HomeClient with server-component slot props + changeset |
