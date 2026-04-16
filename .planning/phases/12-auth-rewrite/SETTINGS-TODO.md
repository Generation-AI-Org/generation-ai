# Settings-TODO für Auth Rewrite (Phase 12)

**Ziel:** Nach Merge des Auth-Rewrites die Dashboard-Einstellungen finalisieren, damit Login in Production funktioniert.

**Stand 2026-04-16:** Code fertig (4 Commits auf `main`). Vercel Production Env Vars gesetzt. Supabase Dashboard + Vercel Preview Env Vars offen.

---

## 1. Supabase Dashboard (Pflicht — sonst Magic Link broken)

**Wo:** https://supabase.com/dashboard/project/wbohulnuwqrhystaamjc

### 1a. Auth → URL Configuration → Redirect URLs

Folgende URLs müssen alle gelistet sein (mit Wildcards für Preview-Deploys):

```
https://tools.generation-ai.org/**
https://generation-ai.org/**
https://www.generation-ai.org/**
http://localhost:3000/**
http://localhost:3001/**
```

**Warum:** Supabase blockiert Magic Links zu Hosts, die nicht in dieser Liste stehen. Wildcards erlauben auch `/auth/confirm` und `/auth/callback`.

### 1b. Auth → URL Configuration → Site URL

Check:
```
https://tools.generation-ai.org
```
Sollte bereits korrekt sein — falls nicht: setzen.

### 1c. Auth → Email Templates → Magic Link

Template-Body (HTML oder Plain Text) muss enthalten:
```
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email
```

**NICHT:** `type=magiclink`. Der Code im `/auth/confirm/route.ts` erwartet `type=email` (Supabase-Standard für Email-OTP).

**Warum:** Der Link im Email führt zur `/auth/confirm`-Route (Server-Side), nicht mehr zu `/auth/callback` (Client-Side). Das ist der canonical Supabase-Pattern und löst das Cookie-Persistence-Problem.

### 1d. Auth → Policies & Rate Limits

Check:
- Magic Link Rate Limit: 100/5min (für Testing erhöht — kann später auf Default zurück, wenn Login stabil läuft)

---

## 2. Vercel Preview Environment Variables (optional, nice-to-have)

**Stand:** Production ist gesetzt (ich selbst via CLI). Preview blockte wegen Plugin-Bug im Non-Interactive Mode.

**Wenn Preview-Deploys cross-domain-cookies brauchen sollen:**

**Vercel Dashboard → tools-app → Settings → Environment Variables → Add**
- Name: `NEXT_PUBLIC_COOKIE_DOMAIN`
- Value: `.generation-ai.org`
- Environments: Preview (checkbox)
- Save

**Dasselbe für website Projekt.**

**Wenn NICHT gemacht:** Preview-Deploys funktionieren trotzdem, aber Cookies sind auf den Preview-Host (`*.vercel.app`) statt cross-domain. Für Prod-Fix irrelevant.

---

## 3. Zusätzlich empfohlen — Supabase Preview Env Vars in Vercel

Noch ein Blocker bei Preview-Testing: `NEXT_PUBLIC_SUPABASE_URL` und `NEXT_PUBLIC_SUPABASE_ANON_KEY` sind in Vercel nur für Production gesetzt, nicht Preview. Wenn du Preview-Deploys für Auth-Testing willst:

**Vercel Dashboard → tools-app → Settings → Environment Variables**
- Duplicate `NEXT_PUBLIC_SUPABASE_URL` und `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Environment: Preview

Gleiches für website.

---

## 4. Verifikation nach Setup

Nach den Settings-Changes und einem Production-Deploy:

1. **Magic Link test:** Gehe auf `https://tools.generation-ai.org/login`, Email eingeben, "Magic Link senden". Email abwarten, Link klicken → sollte direkt auf `/auth/confirm` gehen und dann zur Homepage redirecten, eingeloggt.
2. **Page Refresh test:** Nach Login F5 drücken → solltest eingeloggt bleiben.
3. **Navigation test:** Click irgendwohin (z.B. Settings) → nicht mehr rausfliegen.
4. **Logout test:** Rechts oben "Abmelden" → cookies weg, zurück zu /
5. **Cross-Domain test (nach Supabase Settings):** Login auf `tools.generation-ai.org`, dann `generation-ai.org` öffnen → Cookie sollte auch dort sichtbar sein (DevTools → Application → Cookies, `.generation-ai.org` Domain).

---

## 5. Troubleshooting wenn Login immer noch broken nach Setup

**Debug-Endpoint:** `https://tools.generation-ai.org/api/debug-auth`
- `cookieCount: 0` → Cookies gar nicht gesetzt → Env Var nicht aktiv? Deploy durch?
- `cookieCount > 0, hasUser: false` → Cookies gesetzt aber Supabase parse fehlschlägt → Template-Format falsch?
- `cookieCount > 0, hasUser: true` → Alles gut, Frontend-Problem

**Browser DevTools → Application → Cookies:**
- Erwartet: `sb-wbohulnuwqrhystaamjc-auth-token` auf Domain `.generation-ai.org`
- Format: Value beginnt mit `base64-` und ist ein chunked JSON. NICHT unsere alte `btoa()` Format.

**Console:**
- Keine `[Supabase]`-Logs mehr (wurden im Rewrite entfernt)
- Errors → Sentry check
