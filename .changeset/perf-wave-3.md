---
"@genai/website": patch
---

Perf Wave 3: Bundle-Split via `next/dynamic` + Speed-Insights-Cleanup.

- **Splash lazy:** `TerminalSplash` via `next/dynamic({ ssr: false })` → Wiederkehrer (sessionStorage) laden den Chunk nicht mehr.
- **Under-the-fold Sections dynamic:** `ToolShowcase`, `CommunityPreview`, `Trust`, `FinalCTA` → kleinerer Critical-Path. Above-fold (`Hero`, `Offering`) bleiben sync.
- **Vercel Speed Insights entfernt:** War nur in tools-app provisioniert (Free-Plan, 1 Projekt). Layout-Import + Package-Dep raus, CSP bereinigt. Behebt die 3 Console-Errors pro Load.
- **Prefetch-Fixes:** `/join`, `/about`, `/partner` als `prefetch={false}` — die Routen existieren noch nicht, Next.js-Prefetch hat 404-Errors in der Console produziert.
