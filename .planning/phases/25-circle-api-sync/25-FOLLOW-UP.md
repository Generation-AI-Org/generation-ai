---
phase: 25
status: complete
created: 2026-04-24
completed: 2026-04-25
branch: feature/phase-25-circle-api-sync
merged_to: develop (commit 473edf9)
preview_url: https://website-git-feature-phase-25-cir-0af118-lucas-projects-e78962e9.vercel.app
---

# Phase 25 — Circle API Sync (DONE)

> Phase 25 ist **komplett funktional und auf `develop` gemerged** (nicht prod, awaiting other phases). Alle 6 entdeckten Bugs gefixed, Pivot dokumentiert, E2E auf Preview verifiziert.

---

## Endstand — was funktioniert E2E

1. **`/join` Form-Submit** → Zod → Rate-Limit → Supabase `admin.createUser({email_confirm:true})` → User direkt confirmed
2. **Atomic Circle createMember** → Member angelegt (in Welcome-Space) + Circle's Set-Password-Mail wird gesendet (`skip_invitation:false`, kein Password — sonst suppressed Circle die Mail)
3. **2 Mails kommen parallel an:**
   - **Circle Invitation** (customized in Circle Dashboard mit Generation-AI-Branding): "Letzter Schritt: Dein Account für die Generation AI Community"
   - **Unsere Welcome-Mail** (Resend, eigenes React-Email-Template): Brand-Header + Erklärung "Klick die Circle-Mail" + Auto-Login-Link zu tools.generation-ai.org
4. **User klickt Circle's "Accept invitation"** → Set Name + Password → ist `active:true` Member, in Community drin
5. **User klickt unseren "Zu den KI-Tools"-Link** → Supabase Magic-Link → tools-app `/auth/confirm` → verifyOtp → Cookie auf `.generation-ai.org` → **direkt eingeloggt auf tools.generation-ai.org** (kein Login-Screen)

**Verifizierte Test-Runs:**
- test10 → Bastian-Bug-Negativ-Test: korrekte Identität, in Community als test10 drin
- test11/12 → Magic-Link-Auto-Login funktioniert, Welcome-Copy iteriert

---

## Resolved Bugs (alle live verifiziert)

### Bug #1 — `addMemberToSpace` 404 (commit `860302b`)
Plan-B-Payload `{space_id:string, community_member_id}` war doppelt falsch:
- Circle resolved Member über `email`, nicht ID
- `space_id` muss `integer` sein, nicht String

Fix: Signatur `addMemberToSpace(email, spaceId)`, Body `{space_id: Number(spaceId), email}`.

### Bug #2 — Circle SSO Endpoint (commit `25c5f5b`)
Plan-B nutzte erfundenen Endpoint `/api/admin/v2/headless_auth_tokens`. Real:
- `POST /api/v1/headless/auth_token` (eigene API-Surface)
- Braucht **separat geminten** "Headless Auth"-Token (nicht der Admin-Token)
- Response ist JWT-Pair, kein `sso_url`-Feld — URL wird komponiert: `${COMMUNITY_URL}/session/cookies?access_token=<jwt>`

Fix: `circleFetch` kennt `tokenType: 'admin' | 'headless'`, neues Env `CIRCLE_HEADLESS_TOKEN`, `generateSsoUrl` rewritten.

### Bug #4 — Join-Success-Card Copy (commit `1588a28`)
Card war für Phase 23 Waitlist gebaut ("Du stehst auf der Warteliste..."). Copy auf real-signup confirmation umgestellt: "Willkommen, {firstName}! Du bist gleich drin."

### Bug #5 — `getMemberByEmail` SECURITY (DSGVO, commit `5b920d6`)
Plan-B-Endpoint `GET /community_members?email=X` ignoriert den `email`-Filter komplett und returnt die unfilterte Member-Liste. Code nahm `.records[0]` (= erster Member der Community) — **jeder Signup bekam denselben falschen `circle_member_id`**, beim Confirm-Click loggte sich der User als FREMDER User in Circle ein.

Fix: Endpoint umgestellt auf `GET /community_members/search?email=` (das einzige Endpoint das wirklich filtert). Tests inkl. Regression-Guard gegen das unfilterte Endpoint.

### Bug #6 — `createMember` Response-Parsing (commit `9ed3ae2`)
Circle wraps die POST-Response in `{message, community_member: {id, ...}}`, Code las `.id` direkt → `String(undefined)` = `"undefined"` String landete in Supabase. Versteckte sich bis Bug #5 fixed war (Idempotenz-Check schluckte den eigentlichen POST).

Fix: `response.community_member.id` parsen, Error wenn missing. Plus `CreateMemberResponse` type.

### Bug #7 — Password suppresses Invitation Mail (commit `fb716e7`)
Live-Test: POST `/community_members` MIT `password` → keine Mail. OHNE password → Mail. Circle interpretiert "User hat schon Password" als "kein Invitation nötig".

Fix: `password` nur senden wenn `skipInvitation:true` (headless flow). Bei `skipInvitation:false` (default, invitation flow) kein Password mitgeben — Circle generiert eigenes.

---

## Pivot mid-phase: Headless SSO → Circle Invitation Flow

**Problem:** Headless SSO funktioniert technisch (`/session/cookies?access_token=<JWT>` returnt 302 + Cookies), aber **die Session wird für `active:false` Members vom Community-Backend abgelehnt** → User landet auf `login.circle.so` statt in Community. Live-verifiziert mit DevTools (8x 401 auf `/internal_api/pundit_users`).

**Was wir nicht können:**
- Member programmatisch aktivieren — Admin `PATCH active:true` returnt 200, ignoriert das Field silently
- Set-Password via API — kein Endpoint vorhanden (Headless `/community_member` PATCH gibt 404 für password, kein dedicated password-set-endpoint)
- Circle's `invitation_token` aus API holen — IMMER null in API-Response

**Lösung:** User muss EINMAL durch Circle's Set-Password-Page (Activation). Danach ist Headless SSO permanent verfügbar für future logins. Wir senden:
1. **Circle Invitation Mail** (`skip_invitation:false`, customized im Dashboard) — User setzt Name + Password, Member wird `active:true`
2. **Eigene Welcome-Mail** (Resend, branded) — erklärt was kommt + Auto-Login-Magic-Link zu tools-app

---

## Files Changed (Summary)

| File | Change |
|---|---|
| `packages/circle/src/client.ts` | `getMemberByEmail` /search-endpoint, `createMember` rewrite (atomic + skip_invitation + space_ids + conditional password), `addMemberToSpace` email-payload, `generateSsoUrl` Headless-API-rewrite |
| `packages/circle/src/types.ts` | `CreateMemberInput` (spaceIds, skipInvitation), `CreateMemberResponse` (wrapped), `CircleSsoToken` JWT-shape, `GenerateSsoInput` simplified |
| `packages/circle/src/__tests__/client.test.ts` | 21 tests, alle Bugs als Regression-Guards |
| `apps/website/app/actions/signup.ts` | `email_confirm:true` (auto-confirm), createMember mit spaceIds, drop addMemberToSpace, drop generateLink/Resend confirm-chain, add Magic-Link für tools-app |
| `apps/website/app/api/admin/circle-reprovision/route.ts` | Symmetrisch zu signup |
| `apps/website/app/auth/confirm/route.ts` | Headless-SSO-Call (jetzt nur fallback path, nicht happy-path) |
| `packages/emails/src/templates/confirm-signup.tsx` | Welcome-Mail rewrite — Brand + Pro-Assistant-Pitch + Auto-Login-CTA |
| `packages/emails/src/components/EmailButton.tsx` | Slug-Type erweitert um `'tools-link'` |
| `packages/emails/scripts/generate-logo-pngs.ts` | + `tools-link` Button-PNG |
| `apps/website/public/brand/logos/btn-tools-link.png` | NEU |
| `LEARNINGS.md` | Phase-25 Lessons (Plan-B-Best-Guess track-record + Live-Probe-Mandatory rule) |
| `.changeset/phase-25-*.md` | 5 changesets dokumentiert |

---

## Open Items (low priority, nicht launch-blocker)

- [ ] **PR + main-merge** — wenn alle Phasen fertig sind, develop → main → production. Aktuell: develop hat den vollen Phase-25-Stack. Nicht eilig.
- [ ] **PNG-Button reaktivieren** nach Production-Deploy. Aktuell nutzt Welcome-Mail inline-HTML-Pill (sieht clean aus). PNG-Asset `btn-tools-link.png` ist ready, nur production hat es noch nicht. Nach prod-deploy: switch back zu `<EmailButton slug="tools-link">`.
- [ ] **Cleanup Probe-Member im Circle** (`probe-skipinv-…`, `circle-test-…`, alte test5–test12) — kosmetisch, MCP needs re-auth. Liste in 25-DEBUG-CLEANUP.md ggf. nachreichen.
- [ ] **Circle Mail-Sender-From-Address** — falls Plan erlaubt: `noreply@generation-ai.org` statt `notify@circle.so` (Circle Dashboard → Settings → Email).

---

## Bug #3 (`/welcome → /` Redirect) — OBSOLET durch Pivot

War nur im Headless-SSO-Fallback-Pfad relevant. Mit Invitation-Flow als Happy-Path wird `/welcome` praktisch nie betreten — User landet entweder direkt in Circle (via Accept-Invitation) oder via Magic-Link in tools-app. Kein Fix nötig, kann gelöscht werden falls die Page komplett unbenutzt ist.

---

## Test-Email-Cleanup-Script (für nächste Sessions)

```sql
-- Supabase SQL für test-user cleanup (alle p25-test-Aliase)
DELETE FROM public.user_circle_links WHERE user_id IN (SELECT id FROM auth.users WHERE email LIKE 'movo.fitness+p25-test%');
DELETE FROM auth.users WHERE email LIKE 'movo.fitness+p25-test%';
SELECT email FROM auth.users WHERE email LIKE 'movo.fitness%';
```

```js
// Circle MCP für member cleanup (per ID)
// IDs aus probe-Tests:
// - test5: 80568846
// - probe-skipinv-A: 80568995
// - probe-skipinv-B: 80568996
// - probe-test99: 80568902
// - circle-test-noinvite: 80570142
// - circle-test-withpw: 80570143
// - probe-inv (forgot-password test): 80569672
// - test7: 80569531
// - test6: 80569247
// - test9: 80570057
// - test8: 80569611
// - test10: ?
// - test11/12: ?
mcp__circle__delete_member_community_member({id: <id>})
```
