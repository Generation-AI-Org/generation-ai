---
phase: 19-password-flow-and-test-baseline
reviewed: 2026-04-19T21:51:24Z
depth: standard
files_reviewed: 11
files_reviewed_list:
  - apps/tools-app/app/auth/confirm/route.ts
  - apps/tools-app/app/auth/set-password/page.tsx
  - apps/tools-app/app/auth/callback/page.tsx
  - apps/tools-app/app/settings/page.tsx
  - apps/tools-app/app/settings/PasswordSection.tsx
  - apps/tools-app/app/login/page.tsx
  - packages/e2e-tools/playwright.config.ts
  - packages/e2e-tools/tests/auth.spec.ts
  - packages/e2e-tools/tests/chat.spec.ts
  - turbo.json
  - .github/workflows/ci.yml
findings:
  critical: 1
  warning: 3
  info: 5
  total: 9
status: issues_found
---

# Phase 19: Code Review Report

**Reviewed:** 2026-04-19T21:51:24Z
**Depth:** standard
**Files Reviewed:** 11
**Status:** issues_found

## Summary

Phase 19 liefert den Password-Flow (First-Login-Prompt, Settings-Inline-Form mit Re-Auth) und repariert die E2E-Baseline gegen Prod. Die tri-state `has_password`-Logik (`true`/`false`/`undefined`) ist sauber implementiert und konsistent zwischen `confirm/route.ts`, `callback/page.tsx`, `set-password/page.tsx` und `PasswordSection.tsx`.

**Hauptbefund:** Eine Open-Redirect-Schwachstelle in `confirm/route.ts` — der `next`-Query-Param wird nur mit `startsWith('/')` validiert. Ein Angreifer kann `?next=//evil.com/path` in eine Magic-Link-URL einschleusen; der Check erlaubt den String (startet mit `/`), und der Browser interpretiert `//evil.com/path` als Protocol-Relative-URL → Redirect zu `https://evil.com/path` mit gültiger Session (die wurde bereits gesetzt).

Weitere Warnings betreffen Edge-Cases: Skip mit fehlgeschlagenem Metadata-Write führt zu inkonsistentem Re-Prompt; `callback/page.tsx` behandelt `getUser()=null` nicht; `chat.spec.ts` Test-Datei enthält `/settings`-Tests (Filename-Drift nach fix `c78a094`).

Das Recovery-Template (D-06) bleibt wie geplant unverändert. CSP-Regeln (`force-dynamic` in `/settings`) bleiben respektiert. Keine kritischen Supabase-Cookie-Regressionen entdeckt.

## Critical Issues

### CR-01: Open Redirect via `next`-Query-Param in `/auth/confirm`

**File:** `apps/tools-app/app/auth/confirm/route.ts:42-43`
**Issue:** Der `next`-Parameter wird nur mit `next.startsWith('/')` validiert. Ein Wert wie `//evil.com/path` oder `/\evil.com` besteht diesen Check, wird aber vom Browser als Protocol-Relative-URL (`https://evil.com/path`) interpretiert. Da `verifyOtp` bereits erfolgreich war, geht der User mit gültiger Session + Cookie auf die externe Domain. Das ist eine klassische Open-Redirect-Vulnerability, die in Phishing-Kampagnen gegen Magic-Link-Flows gezielt ausgenutzt wird (Angreifer versendet Mail „Bestätige dein Konto", Link führt über legitimen confirm-Handler und dann zu phish.evil.com).

Zusätzlich: `redirectPath` wird als Suffix an `origin` gehängt, aber `//evil.com` nach einem `origin` wie `https://tools.generation-ai.org` wird vom Browser als `https://evil.com` aufgelöst (Schema-Relative statt Pfad).

**Fix:**
```ts
// Strenger Check: muss mit '/' starten UND darf nicht mit '//' oder '/\' starten
function isSafeRedirectPath(path: string): boolean {
  if (!path.startsWith('/')) return false
  if (path.startsWith('//') || path.startsWith('/\\')) return false
  // Reject absolute URLs that somehow slipped in
  try {
    const parsed = new URL(path, 'https://example.invalid')
    if (parsed.origin !== 'https://example.invalid') return false
  } catch {
    return false
  }
  return true
}

const redirectPath = isSafeRedirectPath(next) ? next : '/'
return NextResponse.redirect(`${origin}${redirectPath}`)
```

Gleiche Härtung sollte in `callback/page.tsx` für den `window.location.href = '/'`-Fallback-Pfad geprüft werden, falls dort jemals ein `next`-Param eingeführt wird (aktuell hardcoded auf `/` → safe).

## Warnings

### WR-01: Skip-Path bei Metadata-Write-Fehler hinterlässt inkonsistenten State

**File:** `apps/tools-app/app/auth/set-password/page.tsx:54-65`
**Issue:** `handleSkip` redirected immer auf `/`, auch wenn `updateUser({ data: { has_password: false } })` fehlschlägt. Der Error wird nur geloggt (`console.error`). Das bricht die Skip-Semantik aus D-02: Bei nächstem Magic-Link liest `confirm/route.ts` `has_password === undefined` und prompted den User erneut — obwohl er explizit „Später setzen" geklickt hat. User-Experience: „Ich hab doch schon geskippt, warum fragt er wieder?"

Das ist by design laut Plan 02, aber die UX-Konsequenz ist real. Ohne User-Feedback merkt weder User noch Support, dass der Skip tatsächlich nicht persistiert wurde.

**Fix:**
```ts
async function handleSkip() {
  setSkipping(true)
  const supabase = createBrowserClient()
  const { error } = await supabase.auth.updateUser({
    data: { has_password: false },
  })
  if (error) {
    // Persistenter Error: User bleibt auf der Page, kann retry oder Passwort setzen
    setSkipping(false)
    setMessage({
      type: 'error',
      text: 'Konnte Einstellung nicht speichern. Bitte versuch es erneut oder setz ein Passwort.',
    })
    return
  }
  window.location.href = '/'
}
```

### WR-02: `callback/page.tsx` behandelt `getUser()=null` nicht

**File:** `apps/tools-app/app/auth/callback/page.tsx:63-70, 75-81`
**Issue:** Nach dem Hash-basierten Session-Setup (Zeile 42-45) und im PKCE-Fallthrough-Pfad wird `supabase.auth.getUser()` aufgerufen und `user?.user_metadata?.has_password` destrukturiert. Wenn aber die Session nicht etabliert werden konnte (z.B. Cookie-Domain-Mismatch, Network-Fehler), ist `user` null. Dann ist `hasPassword === undefined` → User wird auf `/auth/set-password?first=1` geschickt, wo `updateUser({ password })` sofort mit „401 Unauthorized" failen wird. User sieht generischen Supabase-Error statt klaren Login-Redirect.

**Fix:**
```ts
const { data: { user }, error: userError } = await supabase.auth.getUser()
if (userError || !user) {
  window.location.href = '/login?error=session_not_established'
  return
}
const hasPassword = user.user_metadata?.has_password
if (hasPassword !== true && hasPassword !== false) {
  window.location.href = '/auth/set-password?first=1'
  return
}
window.location.href = '/'
```

### WR-03: Misleading Dateiname `chat.spec.ts` testet `/settings`

**File:** `packages/e2e-tools/tests/chat.spec.ts:1-52`
**Issue:** Die Datei heißt `chat.spec.ts`, der `test.describe` trägt den Titel `'Auth Gate (prod smoke)'`, und alle 3 aktiven Tests hitten `/settings`. Der Doc-Kommentar (Zeile 9) erwähnt sogar explizit „`/chat` existiert als eigene Route NICHT". Das ist aus Fix-Commit `c78a094` so entstanden, aber nie umbenannt. Die zwei `test.skip(...)`-Blöcke unten ARE Chat-Tests (mit `/chat` goto) — die dürften auch nicht mehr passen, da „`/chat` existiert nicht".

**Fix:** Datei umbenennen zu `auth-gate.spec.ts` (oder splitten in `auth-gate.spec.ts` + `chat.spec.ts.skip`), und die beiden `test.skip('can send message in chat'...)`-Blöcke löschen (unreachable — kein `/chat` endpoint) oder zu einem korrekten Chat-Widget-Test umschreiben. Aktueller Stand ist False-Positive-Dokumentation: ein Engineer der später nach „chat tests" sucht, findet Auth-Gate-Tests.

## Info

### IN-01: `searchParams.get('first') === '1'` ist eine Stringified-Boolean-Falle

**File:** `apps/tools-app/app/auth/set-password/page.tsx:10`
**Issue:** `isFirstLogin = searchParams.get('first') === '1'`. Wenn `confirm/route.ts` eines Tages `?first=true` oder `?firstLogin=1` statt `?first=1` setzt, bricht die Page still (kein Skip-Button, kein Back-Link-Hide). Kein Warning an den Developer.

**Fix:** Konstante in einem shared helper:
```ts
// apps/tools-app/lib/auth/first-login.ts
export const FIRST_LOGIN_QUERY_KEY = 'first'
export const FIRST_LOGIN_QUERY_VALUE = '1'
export function isFirstLoginUrl(searchParams: URLSearchParams): boolean {
  return searchParams.get(FIRST_LOGIN_QUERY_KEY) === FIRST_LOGIN_QUERY_VALUE
}
```
Und in beiden Call-Sites (`confirm/route.ts` + `set-password/page.tsx`) nutzen.

### IN-02: `PasswordSection` — `email`-Prop kann leerer String sein

**File:** `apps/tools-app/app/settings/PasswordSection.tsx:39-42`
**File (caller):** `apps/tools-app/app/settings/page.tsx:55`
**Issue:** `email={user.email ?? ''}` in settings/page.tsx — falls User irgendwie ohne email (theoretisch bei OAuth ohne email-scope) → Change-Mode Re-Auth ruft `signInWithPassword({ email: '', password: currentPassword })` auf. Supabase gibt dann einen generischen Error „Invalid login credentials" zurück, der in die Inline-Message „Aktuelles Passwort stimmt nicht" transformiert wird — irreführend.

**Fix:** In `page.tsx` guarden und Section ausblenden wenn `!user.email`:
```tsx
{user.email && (
  <section className="mb-12">
    {/* ...PasswordSection */}
  </section>
)}
```
Oder in `PasswordSection.tsx` ein early return / disabled state.

### IN-03: `NEXT_PUBLIC_SUPABASE_ANON_KEY` fehlt im CI-e2e-env

**File:** `.github/workflows/ci.yml:82-89`
**Issue:** Der E2E-env-Block injiziert `NEXT_PUBLIC_SUPABASE_URL` und `SUPABASE_SERVICE_ROLE_KEY`, aber nicht `NEXT_PUBLIC_SUPABASE_ANON_KEY`. `packages/e2e-tools/helpers/supabase-admin.ts` nutzt den service_role-Key — OK. Aber falls irgendein Test-Helper oder Fixture den anon-Key erwartet (für Non-Admin-Calls), wäre er leer. Tests gegen Prod-Deployment nutzen das gebaute Client-Bundle mit inlined Env → no-op. Für lokale Dev-Runs (`.env.test.local`) ist der Key aber im MANUAL-STEPS dokumentiert. Nur für Konsistenz erwähnen.

**Fix:** Optional, wenn irgendein zukünftiger Helper client-side anon-calls macht, `NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}` in den e2e-env aufnehmen.

### IN-04: `confirm/route.ts` — fehlendes `runtime = 'nodejs'` / `dynamic = 'force-dynamic'`

**File:** `apps/tools-app/app/auth/confirm/route.ts:1-5`
**Issue:** Route Handler in App Router ist default dynamic, aber explicit `export const dynamic = 'force-dynamic'` + `export const runtime = 'nodejs'` ist die sichere Belt-and-Suspenders-Variante. LEARNINGS.md (2026-04-18 CSP-Incident) empfiehlt, bei Auth-Routes dynamic explizit zu forcen, damit ein späterer Refactor (z.B. Mover zu Edge Runtime) nicht unabsichtlich Static-Generation triggert, was bei Supabase-Cookie-Handling auseinanderfällt.

**Fix:** Am File-Top hinzufügen:
```ts
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
```

### IN-05: Doppelte `has_password`-Check-Logic in 3 Files

**File:** `apps/tools-app/app/auth/confirm/route.ts:37-40`
**File:** `apps/tools-app/app/auth/callback/page.tsx:63-67, 75-78`
**Issue:** Die tri-state-Logic `hasPassword !== true && hasPassword !== false → /auth/set-password?first=1` ist 3× dupliziert (confirm-route, callback-page Hash-Pfad, callback-page PKCE-Pfad). Bei Schema-Änderungen (z.B. neue has_password-Werte wie `'opted-out'`) müsste man alle 3 Stellen finden.

**Fix:** Kleiner Helper:
```ts
// packages/auth/src/password-status.ts
export type PasswordStatus = 'set' | 'skipped' | 'unprompted'
export function getPasswordStatus(user: { user_metadata?: Record<string, unknown> } | null): PasswordStatus {
  if (!user) return 'unprompted'
  const flag = user.user_metadata?.has_password
  if (flag === true) return 'set'
  if (flag === false) return 'skipped'
  return 'unprompted'
}
export function shouldPromptFirstLogin(user: Parameters<typeof getPasswordStatus>[0]): boolean {
  return getPasswordStatus(user) === 'unprompted'
}
```
Dann in allen 3 Call-Sites `if (shouldPromptFirstLogin(user))` statt die Inline-Logik.

---

_Reviewed: 2026-04-19T21:51:24Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
