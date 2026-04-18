<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

## CSP / Proxy / Middleware — PFLICHTLEKTÜRE

**Vor jeder Änderung an `proxy.ts`, `lib/csp.ts`, oder `app/layout.tsx`: erst [../../LEARNINGS.md](../../LEARNINGS.md) lesen.**

Kurzversion der Regeln (siehe LEARNINGS.md für Kontext):

1. Nonce + CSP auf **Request**-Headers setzen (`request.headers.set(...)`), nicht auf Response. Next.js liest den Nonce request-seitig beim SSR.
2. CSP mit Nonce erzwingt **dynamic rendering** — `export const dynamic = "force-dynamic"` im Root-Layout muss bleiben, sonst wird HTML zur Build-Zeit ohne Nonce eingefroren → strict-dynamic blockt alle Scripts → schwarze Seite.
3. Nach Build prüfen: alle relevanten Routes müssen `ƒ` (dynamic) sein, nicht `○` (static).
4. Lokaler Prod-Check ist Pflicht: `pnpm build && NODE_ENV=production pnpm start`, dann Console auf CSP-Errors prüfen.
