# Circle-Integration (Phase 25)

> Wie unified signup funktioniert + Setup + Troubleshooting.

## Architektur-Überblick

[wird in Plan I mit Content gefüllt]

## Email-Templates in Supabase-Dashboard einspielen

**Wann:** Nach jedem `pnpm --filter @genai/emails email:export` Run, oder wenn `packages/emails/src/templates/confirm-signup.tsx` geändert wurde.

**Schritte:**

1. Supabase-Dashboard öffnen → Project `wbohulnuwqrhystaamjc` → Authentication → Email Templates.
2. Template "Confirm signup" auswählen.
3. Inhalt aus `apps/website/emails/dist/confirm-signup.html` kopieren und in den Editor einfügen.
4. **Subject** setzen: `Willkommen bei Generation AI 👋`
5. **Speichern** (oben rechts).
6. Test-Mail an Luca's Email senden via "Send test email" Button → visuell prüfen.

**Supabase-Go-Template-Vars (NICHT manuell ersetzen — Supabase injected live):**

- `{{ .ConfirmationURL }}` → der Confirm-Link inkl. Token
- `{{ .Data.full_name }}` → Name aus `raw_user_meta_data.full_name` (wird in Plan E gesetzt)
- `{{ .Email }}` → User-Email

**Rollback:** Wenn neue Version kaputt ist, Git-History von `packages/emails/src/templates/confirm-signup.tsx` nutzen, `email:export` re-runnen, alte HTML ins Dashboard einfügen.

**Automation-Roadmap:** Supabase-Management-API könnte die Templates automatisiert setzen (post-v4.0), aktuell manueller Schritt.

## Waitlist Re-Invite (Q10)

Nach dem Phase-27-Flip von `SIGNUP_ENABLED=true` müssen die Phase-23-Waitlist-Entries informiert werden. One-Shot-Runbook:

### Pre-Check

Via Supabase-MCP `execute_sql`: `SELECT count(*) FROM public.waitlist WHERE notified_at IS NULL;`

### Dry-Run (always first)

```bash
pnpm tsx scripts/waitlist-reinvite.ts --dry-run
```

Prüfen:
- Zählt das Script die richtigen Entries?
- Keine Errors beim Fetching?

### Kleiner Testlauf

```bash
pnpm tsx scripts/waitlist-reinvite.ts --limit 1
```

Landet in deinem Postfach? (Voraussetzung: deine Email ist in der Waitlist.)

### Real Run

```bash
pnpm tsx scripts/waitlist-reinvite.ts
```

Abwarten. Summary zeigt success/failure.

### Post-Check

```sql
SELECT count(*) FILTER (WHERE notified_at IS NOT NULL) AS sent,
       count(*) FILTER (WHERE notified_at IS NULL)     AS pending
FROM public.waitlist;
```

`pending` sollte 0 sein (oder nur die failed-mails). `pending > 0 && failure == 0` ist impossible state — Bug.

### Rollback

Kein echter Rollback möglich (Mail ist raus). Aber wenn Mail-Template kaputt war:

1. `SELECT * FROM waitlist WHERE notified_at > now() - interval '1 hour';`
2. In Resend-Dashboard nach Mail-Sends filtern, Message-IDs sammeln.
3. **Nicht** `UPDATE waitlist SET notified_at = NULL` — das würde Re-Run auslösen.
4. Stattdessen: Korrektur-Mail manuell senden an die falsch-angeschriebenen Adressen.

### Env für Script

Script liest aus `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`

Nie service-role-Key committen.
