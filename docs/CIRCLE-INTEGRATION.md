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
