---
status: pending
phase: 25-circle-api-sync
source: [25-VERIFICATION.md, 25-CONTEXT.md, all 25-*-SUMMARY.md]
started: 2026-04-24
updated: 2026-04-24
---

# Phase 25 — HUMAN-UAT Checkliste

> Manuelle Steps die Luca vor/während/nach dem Phase-27-Launch erledigt. Alle Code-Änderungen + Automated-Tests sind durch die Plans A-H abgedeckt.

---

## Pre-Launch (vor Phase 27)

### Circle-Setup

- [ ] **Circle Business-Plan aktiv:** In Circle-Admin → Billing prüfen dass API-Access enabled ist.
- [ ] **Circle-Admin-Token generieren:**
  - Circle-Admin → Settings → Developer → Generate Token
  - Scope: Full admin (oder minimum: read members, create members, add to space)
  - Token kopieren, nicht verlieren (erscheint nur einmal)
- [ ] **Circle-Headless-Auth-Token generieren:**
  - Circle-Admin → Settings → Developer → Generate Token
  - Typ: Headless Auth
  - Wird für Website-`/auth/confirm` SSO-Fallback/Bestandslinks benötigt
  - Token kopieren, nicht verlieren (erscheint nur einmal)
- [ ] **Community-ID notiert:** `511295` (discovered via Circle-MCP `get_community`)
- [ ] **Welcome-Space-ID notiert:** `2574363` ("How to" — Circle's eigener `default_new_member_space_id`, via `list_spaces` bestätigt)

### Vercel-Env-Push (prod + preview + dev)

- [ ] 5 Circle-Vars in Vercel (prod + preview + dev):
  ```bash
  vercel env add CIRCLE_API_TOKEN            # <real token> — aus Circle-Admin
  vercel env add CIRCLE_HEADLESS_TOKEN       # <real headless token> — Typ Headless Auth
  vercel env add CIRCLE_COMMUNITY_ID         # 511295
  vercel env add CIRCLE_DEFAULT_SPACE_ID     # 2574363
  vercel env add CIRCLE_COMMUNITY_URL        # https://community.generation-ai.org
  ```
- [ ] `SIGNUP_ENABLED=false` für prod, `=true` für preview+dev (E2E-Tests):
  ```bash
  vercel env add SIGNUP_ENABLED production   # false (bis Phase 27)
  vercel env add SIGNUP_ENABLED preview      # true
  vercel env add SIGNUP_ENABLED development  # true
  ```
- [ ] `ADMIN_EMAIL_ALLOWLIST` in prod+preview:
  ```bash
  vercel env add ADMIN_EMAIL_ALLOWLIST       # luca@generation-ai.org
  ```
- [ ] Sentry-DSN:
  - [ ] Sentry → Projects → Create "generation-ai-website" → Copy DSN
  - [ ] `vercel env add SENTRY_DSN_WEBSITE` (prod+preview)
  - [ ] `vercel env add NEXT_PUBLIC_SENTRY_DSN_WEBSITE` (prod+preview, same value)

### Supabase-Setup

- [x] **Migration applied** via Supabase-MCP während Plan-A execution — `public.user_circle_links` live mit RLS.
- [ ] **Verify table present:** Supabase-MCP `list_tables` zeigt `user_circle_links` (rls_enabled: true).
- [ ] **Email-Template in Supabase-Dashboard einspielen:**
  - Aktueller Happy-Path: Circle Invitation-Mail + Resend-Welcome-Mail; Supabase Confirm-Template ist Legacy/Fallback.
  - Circle-Dashboard Invitation-Mail prüfen: `[accept invitation]` raus, Generation-AI-Branding und klare Set-Password-Anleitung rein.
  - Resend-Welcome-Mail visuell prüfen: Button-Kontrast, Umlaute, Mobile-Responsive.

### Bundle-Safety Check

Nach Build:

- [ ] `pnpm --filter @genai/website build`
- [ ] `grep -r "CIRCLE_API_TOKEN" apps/website/.next/static/` — muss 0 Matches liefern
- [ ] `grep -r "SUPABASE_SERVICE_ROLE_KEY" apps/website/.next/static/` — muss 0 Matches liefern

### Preview-E2E

- [ ] Preview-URL öffnen (mit `SIGNUP_ENABLED=true` in preview)
- [ ] `/join` aufrufen, Form mit Test-Email (z.B. `luca+test1@generation-ai.org`) ausfüllen, submitten
- [ ] Mail landet im Postfach (ca. 10s)
- [ ] Circle Invitation-Mail öffnen → Passwort/Name setzen → lande in Circle als korrekter Test-User
- [ ] Resend-Welcome-Mail öffnen → "Zu den KI-Tools" → lande in tools-app eingeloggt
- [ ] Circle-Admin → Members: Test-User existiert, ist in Welcome-Space (2574363)
- [ ] Sentry: keine Events (happy-path sollte clean sein)
- [ ] Supabase-SQL: `SELECT raw_user_meta_data FROM auth.users WHERE email = 'luca+test1@generation-ai.org'` → `circle_member_id` gesetzt
- [ ] Supabase-SQL: `SELECT * FROM user_circle_links WHERE user_id = '<id>'` → Row existiert

### Negativtest Preview (Fallback-UX)

- [ ] In Vercel preview env temporär `CIRCLE_API_TOKEN=bad_token` setzen → redeploy
- [ ] Neuer Signup mit anderer Test-Email → `{ ok: true }` (D-03 non-blocking), Mail kommt
- [ ] Resend-Welcome-Mail weist korrekt auf manuelle Community-Freischaltung hin und enthält keinen falschen "Circle-Mail kommt gleich"-Text
- [ ] Sentry: Event mit Tag `circle-api:true` + `op:createMember` gelandet
- [ ] Token wieder zurücksetzen + redeploy

---

## Launch-Day (Phase 27)

- [ ] Code-Freeze: alle geplanten Phases für v4.0 sind merged
- [ ] Release-Notes finalisiert (siehe `.changeset/phase-25-circle-api-sync.md`)
- [ ] `SIGNUP_ENABLED=true` in Vercel **production** setzen
- [ ] Redeploy (Vercel auto-trigger bei env-change)
- [ ] Production-E2E (mit echter Test-Email):
  - [ ] Signup-Flow end-to-end
  - [ ] Sentry sauber, keine Flood
- [ ] Better Stack: `/api/auth/signup` Check anpassen — sollte jetzt 200 liefern (nicht mehr 503)

---

## Post-Launch (Phase 27+)

- [ ] Waitlist-Re-Invite-Script ausführen (siehe `docs/CIRCLE-INTEGRATION.md`):
  - [ ] Pre-check: `SELECT count(*) FROM waitlist WHERE notified_at IS NULL;`
  - [ ] Dry-Run: `pnpm tsx scripts/waitlist-reinvite.ts --dry-run`
  - [ ] Limit-1-Run: `pnpm tsx scripts/waitlist-reinvite.ts --limit 1` (an luca+test@)
  - [ ] Real-Run: `pnpm tsx scripts/waitlist-reinvite.ts`
  - [ ] Verify `notified_at` in DB: pending-count = 0
- [ ] Sentry-Dashboard-Check: 24h nach Launch, `circle-api:true` Events-Rate prüfen
  - [ ] Falls >5% Failure-Rate: Alert-Rule in Sentry aktivieren (R6.7-Followup)
- [ ] Check Circle-Dashboard: Neue Member-Count ≈ Supabase-Signup-Count (±1%)

## Rollback-Plan

Wenn Phase 25 live Probleme macht:

1. **Sofort-Fallback:** `SIGNUP_ENABLED=false` in Vercel prod setzen. Signup returnt wieder 503, bestehende User sind nicht betroffen.
2. **Tiefer-Rollback:** Git-Revert der Phase-25-Commits. Migration `user_circle_links` bleibt (safe, leer wenn kein neuer Signup).
3. **Circle-Cleanup:** Falls Test-User oder falsch-provisionierte User in Circle → Circle-Admin → Members → manual delete.

---

## Summary

total: 0 items checked yet (awaiting Luca HUMAN-UAT execution)
passed: 0
issues: 0
pending: [all items above]
skipped: 0
blocked: 0

## Gaps

(none yet — populate if issues found during UAT)
