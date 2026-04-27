# Agent-Briefing tools-app

## CSP / Proxy / Middleware — PFLICHTLEKTÜRE

**Vor jeder Änderung an `proxy.ts`, `lib/csp.ts`, oder `app/layout.tsx`: erst [../../LEARNINGS.md](../../LEARNINGS.md) lesen.**

Kurzversion (siehe LEARNINGS.md für Kontext — echter Prod-Incident am 2026-04-18 hat die Website komplett schwarz gemacht):

1. Nonce + CSP auf **Request**-Headers setzen (`request.headers.set(...)`), nicht auf Response. Next.js liest den Nonce request-seitig beim SSR.
2. CSP mit Nonce erzwingt **dynamic rendering**. Dieses Layout ist durch `await getUser()` bereits dynamic — aber wenn jemand `getUser()` entfernt oder in ein Client-Component verschiebt, `export const dynamic = "force-dynamic"` explizit setzen.
3. Nach Build prüfen: alle relevanten Routes müssen `ƒ` (dynamic) sein, nicht `○` (static).
4. Lokaler Prod-Check ist Pflicht: `pnpm build && NODE_ENV=production pnpm start`, dann Console auf CSP-Errors prüfen.

## Header- und Scroll-Standard

Tools-App und Website teilen denselben Marketing-Header-Standard.

- Tools rendert `MarketingHeader` aus `@genai/ui` über `components/layout/ToolsHeader.tsx`.
- Der Header bleibt `fixed`; der Inhalt startet mit `main#main-content.pt-20`.
- Normale Tools-Seiten scrollen über das Dokument, nicht über eine `h-screen overflow-hidden` Shell mit innerem `overflow-y-auto`.
- Die Tools-Suche ist nur ein zusätzlicher Slot im bereits reservierten rechten Header-Bereich. Sie darf Logo, Navigation, Theme-Toggle oder CTA nicht verschieben.
- Bei jeder Header-Änderung Website und Tools im Browser gegeneinander messen: Logo, Nav, Theme-Toggle und CTA müssen gleiche `x/y/width/right` Werte haben; nur die Tools-Suche darf zusätzlich sichtbar sein.
