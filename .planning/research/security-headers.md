# Security Headers & CSP — Generation AI Monorepo

**Recherchiert:** 2026-04-13
**Gilt für:** apps/website (Next.js 16), apps/tools-app (Next.js 16)
**Confidence:** HIGH (offizielle Next.js 16 Docs, Stand 2026-04-10)

---

## Executive Summary

Next.js 16 hat `middleware.ts` zu `proxy.ts` umbenannt — das ist der zentrale Unterschied zu allen älteren Tutorials. Die bestehenden Security Headers in tools-app sind gut, aber unvollständig: HSTS fehlt, CSP fehlt komplett. Die Website hat überhaupt nichts.

**Wichtigste Entscheidung: Nonce vs. `unsafe-inline`**

Nonces sind das sicherste Vorgehen, haben aber einen harten Trade-off: Alle Seiten werden dynamisch gerendert (kein Static Export, kein ISR, kein PPR). Für tools-app ist das akzeptabel — die App ist bereits dynamisch durch Auth und Chat. Für die Website (primär statisch) ist `unsafe-inline` + `'strict-dynamic'` oder der experimentelle SRI-Ansatz die bessere Wahl.

---

## Empfehlungen

### 1. Security Headers (beide Apps)

Die folgenden Header sollten in **beiden** Apps in `next.config.ts` gesetzt werden. tools-app hat bereits 4 davon, website hat noch gar nichts.

**Fehlende Header in tools-app:**
- `Strict-Transport-Security` (HSTS) — der wichtigste fehlende Header
- `Content-Security-Policy`

**Fehlende Header in website:**
- Alle Standard-Header + CSP

**Vollständige Header-Liste für Production:**

```typescript
// next.config.ts — headers() Konfiguration
{
  key: 'Strict-Transport-Security',
  value: 'max-age=63072000; includeSubDomains; preload',
},
{
  key: 'X-Content-Type-Options',
  value: 'nosniff',
},
{
  key: 'X-Frame-Options',
  value: 'DENY',
},
{
  key: 'Referrer-Policy',
  value: 'strict-origin-when-cross-origin',
},
{
  key: 'Permissions-Policy',
  value: 'camera=(), microphone=(), geolocation=()',
},
{
  key: 'Content-Security-Policy',
  value: '...', // siehe CSP-Abschnitt
},
```

**HSTS-Warnung:** HSTS mit `includeSubDomains` erst aktivieren wenn ALLE Subdomains HTTPS haben. Für generation-ai.org, tools.generation-ai.org und community.generation-ai.org sollte das der Fall sein. Trotzdem vor dem Setzen verifizieren.

---

### 2. CSP-Strategie: Zwei verschiedene Ansätze

#### tools-app — Nonce-basiert via proxy.ts

tools-app ist bereits dynamisch (Auth, Chat API). Nonces sind hier der richtige Ansatz.

**Datei:** `apps/tools-app/app/proxy.ts` (existiert bereits, muss aber erweitert werden — aktuell ist es leer bzw. nur ein Placeholder)

```typescript
import { NextRequest, NextResponse } from 'next/server'

export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const isDev = process.env.NODE_ENV === 'development'

  // Supabase Project URL aus Environment
  // Format: https://wbohulnuwqrhystaamjc.supabase.co
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://*.supabase.co'

  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ''};
    style-src 'self' 'nonce-${nonce}'${isDev ? " 'unsafe-inline'" : ''};
    img-src 'self' blob: data: https://logo.clearbit.com;
    font-src 'self';
    connect-src 'self' ${supabaseUrl} https://api.anthropic.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, ' ').trim()

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set('Content-Security-Policy', cspHeader)

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  })
  response.headers.set('Content-Security-Policy', cspHeader)

  return response
}

export const config = {
  matcher: [
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
}
```

#### website — unsafe-inline via next.config.ts

Die Website rendert primär statisch. Nonces würden das brechen. `unsafe-inline` ist hier der pragmatische Kompromiss, weil Tailwind v4 inline styles injiziert und Next.js selbst ebenfalls inline styles nutzt.

```typescript
// apps/website/next.config.ts
const isDev = process.env.NODE_ENV === 'development'

const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''};
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data:;
  font-src 'self';
  connect-src 'self' https://wbohulnuwqrhystaamjc.supabase.co;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`.replace(/\n/g, '').replace(/\s{2,}/g, ' ').trim()
```

---

### 3. Tailwind v4 und CSP

**Problem:** Tailwind v4 injiziert inline styles (z.B. für CSS-Custom-Properties, `@apply`-Direktiven im JS-Layer). Headless UI macht das ebenfalls.

**Lösung für tools-app (nonce-basiert):** Tailwind v4 selbst generiert primär ein externes Stylesheet, nicht inline styles. Das `style-src 'self' 'nonce-${nonce}'` sollte ausreichen. Falls Headless UI oder andere Bibliotheken inline styles setzen, die keinen nonce haben, muss temporär `'unsafe-inline'` in style-src ergänzt werden — dann aber Script-CSP streng lassen.

**Lösung für website:** `style-src 'self' 'unsafe-inline'` — kein Problem, da kein kritischer State auf der Website.

**Praktisch:** CSP im Browser-DevTools Console-Tab beobachten. Violations werden dort geloggt. Erst alle Violations fixen, dann in Production aktivieren.

---

### 4. Supabase connect-src

Das Projekt nutzt Supabase-Projekt `wbohulnuwqrhystaamjc.supabase.co`. In der CSP braucht connect-src folgende Domains:

```
connect-src 'self'
  https://wbohulnuwqrhystaamjc.supabase.co
  wss://wbohulnuwqrhystaamjc.supabase.co  (falls Realtime genutzt wird)
```

Wildcard `*.supabase.co` geht auch, ist aber weniger restriktiv. Konkrete Project-URL ist besser. `wss://` (WebSocket) nur eintragen wenn Supabase Realtime tatsächlich verwendet wird — im aktuellen Code nicht erkennbar.

**Für tools-app zusätzlich:** Claude API Calls laufen über den eigenen API-Route (`/api/chat`), die dann serverseitig die Anthropic API aufruft. D.h. `api.anthropic.com` muss **nicht** in connect-src stehen — das ist ein Server-zu-Server Call, kein Browser-Request.

---

### 5. Cookie Security

Supabase SSR (`@supabase/ssr`) setzt Cookies bereits richtig, wenn die Standard-Konfiguration verwendet wird. Die empfohlenen Attribute:

```typescript
// Beim createServerClient in @supabase/ssr
cookieOptions: {
  httpOnly: true,           // JavaScript kann Cookie nicht lesen (XSS-Schutz)
  secure: process.env.NODE_ENV === 'production',  // Nur über HTTPS
  sameSite: 'lax',          // CSRF-Schutz, erlaubt aber normale Navigation
  maxAge: 60 * 60 * 24 * 7, // 1 Woche
}
```

**Überprüfen:** Aktuell wird in `lib/supabase.ts` `createClient` direkt verwendet, ohne cookieOptions. Die @supabase/ssr-Integration sollte das aber intern korrekt handhaben. Im Browser-DevTools unter Application > Cookies prüfen ob die Auth-Cookies `HttpOnly` haben.

---

### 6. CORS für API Routes

Die tools-app API Routes (`/api/chat`, `/api/agent/*`) sind interne Routes — sie werden vom Browser derselben Origin aufgerufen. Kein CORS nötig.

**Regel:** Kein CORS konfigurieren, wenn nicht explizit benötigt. Kein `Access-Control-Allow-Origin: *`.

Falls in Zukunft externe Clients (z.B. mobile App, third-party Integration) die API nutzen sollen:

```typescript
// In der Route Handler Datei
const allowedOrigins = [
  'https://generation-ai.org',
  'https://tools.generation-ai.org',
]

export async function OPTIONS(request: Request) {
  const origin = request.headers.get('origin')
  const isAllowed = allowedOrigins.includes(origin ?? '')

  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': isAllowed ? origin! : '',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  })
}
```

---

## Implementation Notes

### Rollout-Reihenfolge

1. **Zuerst: CSP-Only-Report-Mode** — CSP mit `Content-Security-Policy-Report-Only` testen, bevor sie enforced wird. Violations werden geloggt, nichts geblockt.
2. **Dann: tools-app** — dynamisch, Nonce-Ansatz, proxy.ts
3. **Dann: website** — statisch, unsafe-inline, next.config.ts
4. **HSTS zuletzt** — erst wenn CSP stabil läuft und alle Subdomains HTTPS haben

### CSP Report-Only Header

```typescript
{
  key: 'Content-Security-Policy-Report-Only',
  value: '<gleicher CSP-Wert>',
}
```

Violations erscheinen in Browser-Konsole. Erst wenn keine unerwarteten Violations mehr auftreten, auf `Content-Security-Policy` (enforcing) wechseln.

### X-Frame-Options vs. frame-ancestors

`X-Frame-Options: DENY` ist bereits gesetzt. `frame-ancestors 'none'` in der CSP macht dasselbe, wird von modernen Browsern bevorzugt. Beide parallel setzen schadet nicht — ältere Browser brauchen X-Frame-Options, moderne nutzen die CSP-Direktive.

### Experimentelle SRI-Alternative

Next.js 16 hat experimentelle SRI-Unterstützung (Subresource Integrity). Das würde hash-basierte CSP für statische Assets erlauben, ohne Nonces, ohne dynamic rendering. Stand April 2026 noch experimental und kann sich ändern. Für jetzt nicht empfohlen, aber im Blick behalten.

---

## Quellen

- [Next.js 16 CSP Docs](https://nextjs.org/docs/app/guides/content-security-policy) — Stand 2026-04-10, HIGH confidence
- [Next.js 16 — What's New for Auth](https://auth0.com/blog/whats-new-nextjs-16/) — proxy.ts rename
- [Supabase SSR Cookie Konfiguration](https://supabase.com/docs/guides/auth/server-side/creating-a-client)
- [MDN style-src Directive](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/style-src)
- [Next.js CORS Discussion](https://github.com/vercel/next.js/discussions/52933)
- [HTTP-Only Cookies in Next.js 16](https://github.com/vercel/next.js/discussions/85600)
