# LEARNINGS

Harte Lektionen aus Prod-Incidents. **Vor jeder Änderung an den hier genannten Systemen durchlesen.**

---

## 2026-04-25 — Circle SSO loggte neue Signups als FREMDE User ein (DSGVO-kritisch)

**Symptom:** Nach `/auth/confirm` landete der neue Signup-User mit `+p25-test3@gmail.com` als **Bastian Gedon** in Circle eingeloggt. Reproducierbar bei allen Phase-25-Test-Signups (test1, test2, test3 — alle hatten in Supabase `user_metadata.circle_member_id = "80552151"` (Bastians ID) gespeichert).

**Root Cause — `getMemberByEmail` in `packages/circle/src/client.ts` nutzte das falsche Endpoint:**

Der ursprüngliche Code (Plan-B aus Phase-25-Planung, explizit als "best guess" markiert):
```ts
GET /community_members?email=<X>&community_id=<Y>
```

**Circle's Admin v2 ignoriert den `email` Query-Parameter auf der `/community_members`-Collection-Endpoint stillschweigend** und liefert die unfilterte Member-Liste. Der Code nahm `.records[0]` — also den ersten Member der Community — und gab dessen ID als "gefundener Member" zurück. Dann griff `createMember`'s Idempotenz-Check (`if (existing) return alreadyExists:true`) und verhinderte die echte `POST /community_members`. → Jeder Signup bekam denselben (falschen) `circle_member_id` ins Supabase-`user_metadata`. Beim Confirm-Click holte `generateSsoUrl(circle_member_id)` einen Headless-Auth-JWT für den FALSCHEN User → seamless-Login als fremder Account.

**Fix (Commit `<hash>`):**
- `packages/circle/src/client.ts` — Endpoint umgestellt auf `GET /community_members/search?email=<X>` (das einzige Admin-v2-Endpoint das tatsächlich nach Email filtert: 200+single-object bei Match, 404 bei Miss).
- Tests in `packages/circle/src/__tests__/client.test.ts` — Regression-Guard: Test asserted explizit dass der URL `/community_members/search` enthält UND **nicht** das unfilterte `/community_members?` (sonst kommt der Bug zurück).

**Warum nicht erkannt:**
- Plan-B-Endpoint wurde als "best guess" geshipped ohne Live-Probe gegen Circle. Circle's API hat keine Validation — der Server ignoriert unbekannte Query-Params silently statt 400 zurückzugeben.
- Phase-25-Tests vorher schienen "voll durch bis Login" zu laufen — weil `generateSsoUrl` zu der Zeit noch broken war (Bug #2) und der Fallback-Pfad griff. Erst NACH dem `generateSsoUrl`-Fix wurde der Cross-User-Login sichtbar.
- Lokale Tests mockten `fetch` mit dem erwarteten Single-Object-Shape, ohne den echten Server-Roundtrip zu prüfen.

---

## Regeln für zukünftige Arbeit an Circle-API (oder vergleichbaren externen APIs)

**Vor jeder neuen Circle-API-Funktion:**

1. **Niemals "best guess"-Endpoints shippen.** Wenn die Doku unklar ist oder Plan-B markiert "exact endpoint may be X or Y" — STOPPEN, vor Code-Commit live probieren (Circle-MCP, curl, oder Postman).
2. **Live-Probe gegen den ECHTEN Server, nicht gegen Mocks.** Mocks bestätigen nur dass der Code mit dem erwarteten Response-Shape klarkommt — sie sagen NICHTS darüber aus ob der Server tatsächlich diese Response liefert oder eine andere (z.B. unfilterte Liste statt 404).
3. **Bei "Lookup by Field"-Operations: Negativ-Test mit non-existent Wert.** Wenn Lookup mit `email=does-not-exist` 200 statt 404 liefert → Filter wird ignoriert → ALLES rote Flagge.
4. **Cross-User-Identity ist DSGVO.** Jede Funktion die Identitäten zuordnet (Email → Member-ID, Token → User, Session → Account) muss in Tests mit mehreren echten Identitäten geprüft werden, nicht nur Single-User-Happy-Path.
5. **Idempotenz-Checks sind gefährlich wenn die Lookup-Quelle broken ist.** `if (existing) return alreadyExists` schluckt den Bug — der echte `createMember`-POST wird nie getriggert, der Fehler bleibt unsichtbar bis der "existing" User in einem anderen Kontext (SSO, Posts) auftaucht.

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
