# Agent-Briefing tools-app

## CSP / Proxy / Middleware — PFLICHTLEKTÜRE

**Vor jeder Änderung an `proxy.ts`, `lib/csp.ts`, oder `app/layout.tsx`: erst [../../LEARNINGS.md](../../LEARNINGS.md) lesen.**

Kurzversion (siehe LEARNINGS.md für Kontext — echter Prod-Incident am 2026-04-18 hat die Website komplett schwarz gemacht):

1. Nonce + CSP auf **Request**-Headers setzen (`request.headers.set(...)`), nicht auf Response. Next.js liest den Nonce request-seitig beim SSR.
2. CSP mit Nonce erzwingt **dynamic rendering**. Dieses Layout ist durch `await getUser()` bereits dynamic — aber wenn jemand `getUser()` entfernt oder in ein Client-Component verschiebt, `export const dynamic = "force-dynamic"` explizit setzen.
3. Nach Build prüfen: alle relevanten Routes müssen `ƒ` (dynamic) sein, nicht `○` (static).
4. Lokaler Prod-Check ist Pflicht: `pnpm build && NODE_ENV=production pnpm start`, dann Console auf CSP-Errors prüfen.
