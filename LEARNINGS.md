# LEARNINGS

Harte Lektionen aus Prod-Incidents. **Vor jeder Änderung an den hier genannten Systemen durchlesen.**

---

## 2026-04-18 — Website komplett schwarz durch CSP + static prerendering

**Symptom:** `generation-ai.org` lieferte HTTP 200, aber die Seite war komplett schwarz. Browser-Console: 16 Errors — alle `<script>`-Chunks von Next.js durch CSP geblockt ("violates Content Security Policy directive").

**Root Cause — zwei Bugs übereinander:**

1. **Nonce auf der falschen Header-Seite.** In `apps/*/proxy.ts` wurde der Nonce erst auf die **Response** gesetzt (`response.headers.set("x-nonce", ...)`). Next.js liest den Nonce aber vom **Request**-Header, *bevor* gerendert wird. Folge: Keine `nonce="..."`-Attribute in den gerenderten Script-Tags. CSP `'strict-dynamic'` blockt dann alle Scripts, weil kein Script einen Nonce hat.

2. **Static prerendering killt den Nonce komplett.** Selbst wenn Bug 1 gefixt wäre: Pages mit `○` (static prerendered) werden beim Build einmal gerendert und das HTML eingefroren. Zur Build-Zeit gibt es keinen Request → keinen Nonce → HTML hat keine Nonce-Attribute. Beim Request liefert die Middleware dann einen *anderen* Nonce im CSP-Header → Browser blockt alle Scripts.

**Fix (Commit `<hash>`):**
- `proxy.ts`: Nonce + CSP auf `request.headers.set()` **vor** `updateSession()`. `updateSession()` ruft intern `NextResponse.next({ request })` und reicht die mutierten Request-Headers durch.
- `app/layout.tsx`: `export const dynamic = "force-dynamic"` — CSP-mit-Nonce ZWINGT dynamic rendering. Siehe Next-Doc `content-security-policy.md`: *"When you use nonces in your CSP, all pages must be dynamically rendered."*

**Warum nicht erkannt:**
- HTTP 200 Check von Better Stack war grün (HTML wurde geliefert — nur die Scripts wurden client-side geblockt).
- Kein Playwright-Smoke-Test vor Prod-Promotion, der Console-Errors + DOM-Content prüft.
- CSP hat keine `report-to` Directive → Violations landeten nirgendwo.

---

## Regeln für zukünftige Arbeit an CSP / Proxy / Middleware

**Vor JEDER Änderung an `apps/*/proxy.ts` oder `apps/*/lib/csp.ts`:**

1. **Nonce gehört auf den REQUEST, nicht die Response.** Pattern aus `node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md`:
   ```ts
   request.headers.set("x-nonce", nonce)
   request.headers.set("Content-Security-Policy", csp)
   // dann erst updateSession() oder NextResponse.next({ request: { headers } })
   response.headers.set("Content-Security-Policy", csp)  // Browser muss sie auch sehen
   ```

2. **CSP mit Nonce = force-dynamic Pflicht.** Alle betroffenen Pages müssen dynamic gerendert werden. Entweder `export const dynamic = "force-dynamic"` im Root-Layout, oder `await connection()` pro Page, oder ein `await headers()`/`await cookies()`-Call der automatisch dynamic macht.

3. **Nach Build `next build`-Output prüfen:** `ƒ` = dynamic (ok), `○` = static (KAPUTT wenn CSP-Nonce aktiv). Pages die `○` haben und die nicht API-only / robots / sitemap sind → Problem.

4. **Nach JEDER CSP-Änderung lokal prod-verifizieren:**
   ```bash
   pnpm --filter @genai/website build && cd apps/website && NODE_ENV=production pnpm start
   ```
   Dann via Playwright auf `http://localhost:3000` gehen, Console-Errors prüfen. **Keine** CSP-Violations im Log = grün. Speed-Insights-404 ist normal (Vercel-only).

5. **Vor Prod-Deploy Preview-URL testen.** Vercel Preview läuft auf echter Prod-Infra — wenn dort CSP-Errors auftauchen, Preview-Promotion stoppen.

---

## Noch offen (Prevention to-dos)

- [ ] Playwright-Smoke-Test als Vercel Check (blockt Prod-Promotion bei Console-Errors)
- [ ] Better Stack Check auf "DOM hat Text + keine JS-Errors" umstellen (nicht nur HTTP 200)
- [ ] CSP `report-to` Directive + Sentry-Endpoint
- [ ] Sentry-Alarm auf Frontend-Error-Rate-Spike (>50 % in 5 min → Push)
