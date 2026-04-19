---
phase: 17-auth-extensions
plan: 03
type: execute
wave: 2
depends_on: [17-01]
files_modified:
  - packages/emails/src/templates/confirm-signup.tsx
  - packages/emails/src/templates/recovery.tsx
  - packages/emails/src/templates/magic-link.tsx
autonomous: true
requirements: [AUTH-EMAIL-04, AUTH-EMAIL-05, AUTH-EMAIL-06]
must_haves:
  truths:
    - "Confirm-Signup template renders welcome copy + CTA 'E-Mail bestätigen' linking to Supabase {{ .ConfirmationURL }}"
    - "Recovery (Reset Password) template mentions 60-minute validity and CTA 'Passwort zurücksetzen'"
    - "Magic Link template mentions 15-minute validity and CTA 'Anmelden'"
    - "All three templates use Layout wrapper + EmailButton from @genai/emails"
    - "All three templates embed correct Supabase template variables ({{ .ConfirmationURL }} etc.)"
    - "All three templates use VOICE.md copy verbatim for subject and body openers"
  artifacts:
    - path: "packages/emails/src/templates/confirm-signup.tsx"
      provides: "Welcome/Signup confirmation email React Email component"
      exports: ["default"]
    - path: "packages/emails/src/templates/recovery.tsx"
      provides: "Reset-Password email"
      exports: ["default"]
    - path: "packages/emails/src/templates/magic-link.tsx"
      provides: "Magic-Link login email"
      exports: ["default"]
  key_links:
    - from: "packages/emails/src/templates/confirm-signup.tsx"
      to: "packages/emails/src/components/Layout.tsx"
      via: "import { Layout } from '../components/Layout'"
      pattern: "from.*Layout"
    - from: "packages/emails/src/templates/confirm-signup.tsx"
      to: "Supabase template variable {{ .ConfirmationURL }}"
      via: "href prop on EmailButton"
      pattern: "\\.ConfirmationURL"
---

<objective>
Build the first three Supabase auth email templates as React Email components in `packages/emails/src/templates/`: Confirm Signup, Reset Password (recovery), Magic Link. Each composes the shared `Layout` + `EmailButton` from Plan 17-01 and uses copy verbatim from `brand/VOICE.md`.

Purpose: Replace Supabase's default email templates with brand-consistent, theme-adaptive versions. These three are the highest-traffic auth flows.
Output: Three `.tsx` files, each a default-exported React Email template accepting props for preview data but using Supabase Go-template variables (`{{ .ConfirmationURL }}`) at runtime.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/17-auth-extensions/CONTEXT.md
@brand/VOICE.md
@packages/emails/src/components/Layout.tsx
@packages/emails/src/components/EmailButton.tsx
@packages/emails/src/tokens.ts

<interfaces>
Supabase Go-template variables (https://supabase.com/docs/guides/auth/auth-email-templates):
- `{{ .ConfirmationURL }}` — full URL for Confirm-Signup, Recovery, Magic-Link actions
- `{{ .Email }}` — recipient email
- `{{ .Token }}` — raw OTP code
- `{{ .TokenHash }}` — hashed token
- `{{ .SiteURL }}` — configured site URL
- `{{ .Data.name }}` — user metadata name (fallback to "" if unset)

Copy from VOICE.md:
- Confirm Signup Subject: "Willkommen bei Generation AI 👋"
- Confirm Signup Preview: "Schön dass du da bist. Hier geht's weiter."
- Confirm Signup Greeting: "Hey {{ .Data.name }}, schön dass du da bist."
- Confirm Signup CTA: "E-Mail bestätigen"
- Recovery Subject: "Neues Passwort für Generation AI"
- Recovery Preview: "Setz dein Passwort in 60 Minuten zurück."
- Recovery Body: "Hey, klick auf den Button, um ein neues Passwort zu setzen. Der Link gilt 60 Minuten."
- Recovery CTA: "Passwort zurücksetzen"
- Magic-Link Subject: "Dein Anmelde-Link"
- Magic-Link Preview: "Dein Login-Link, gültig 15 Minuten."
- Magic-Link Body: "Hey, hier ist dein Login-Link. Klick drauf und du bist drin. Der Link gilt 15 Minuten."
- Magic-Link CTA: "Anmelden"

Footer/closing (Utility tone from VOICE.md): rendered by Layout — do not duplicate in template.

Layout import pattern (from 17-01):
```tsx
import { Layout, EmailButton, tokens } from '@genai/emails';
```

Each template exports a default function component accepting props with sensible defaults so React Email dev-server can preview it without Supabase variables.
</interfaces>
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Build confirm-signup.tsx + recovery.tsx</name>
  <files>packages/emails/src/templates/confirm-signup.tsx, packages/emails/src/templates/recovery.tsx</files>
  <read_first>
    - packages/emails/src/components/Layout.tsx (from 17-01 — confirm prop signature)
    - packages/emails/src/components/EmailButton.tsx (from 17-01 — confirm prop signature)
    - packages/emails/src/tokens.ts (from 17-01 — for inline text color references)
    - brand/VOICE.md lines ~60-146 (Mail-Microcopy, Passwörter + Auth section)
  </read_first>
  <action>
    1. Create `packages/emails/src/templates/confirm-signup.tsx`:
       - Default-export `ConfirmSignupEmail` component with props `{ name?: string; confirmationUrl?: string }` defaulting to `name = '{{ .Data.name }}'` and `confirmationUrl = '{{ .ConfirmationURL }}'` (so the raw Supabase variables are rendered at render-to-HTML time, usable by preview with literal defaults).
       - Inside `<Layout preview="Schön dass du da bist. Hier geht's weiter.">`:
         * `<Heading>` styled as `{ fontFamily: tokens.fontStack.sans, fontSize: '24px', fontWeight: 700, color: tokens.light.text, margin: '0 0 16px 0' }` with className `email-heading`. Text: `Hey {name} 👋`
         * `<Text className="email-text" style={{ fontSize: '16px', lineHeight: 1.65, color: tokens.light.text, margin: '0 0 24px 0' }}>` with copy: `Willkommen bei Generation AI — der KI-Community für Studierende im DACH-Raum. Bestätige kurz deine Mail-Adresse, dann geht's los.`
         * `<Section style={{ textAlign: 'center', margin: '32px 0' }}>` containing `<EmailButton href={confirmationUrl}>E-Mail bestätigen</EmailButton>`
         * `<Text className="email-muted" style={{ fontSize: '14px', lineHeight: 1.55, color: tokens.light.textMuted, margin: '24px 0 0 0' }}>` with copy: `Falls du dich nicht angemeldet hast, ignorier die Mail einfach.`
    2. Create `packages/emails/src/templates/recovery.tsx` with same structure:
       - Props `{ name?: string; confirmationUrl?: string }` with same defaults.
       - Preview: `Setz dein Passwort in 60 Minuten zurück.`
       - Heading: `Hey {name},`
       - Body: `klick auf den Button, um ein neues Passwort zu setzen. Der Link gilt 60 Minuten.`
       - Button href `{confirmationUrl}` label `Passwort zurücksetzen`
       - Muted footer: `Falls du das nicht warst, ignorier die Mail. Dein Passwort bleibt unverändert.`
    3. Both files must import Layout, EmailButton, tokens from `@genai/emails` and use React Email primitives (`Heading`, `Text`, `Section`) from `@react-email/components`.
    4. Both files must contain the literal strings `{{ .ConfirmationURL }}` and `{{ .Data.name }}` as the default prop values so that `render(...)` produces HTML with Supabase's template syntax intact.
  </action>
  <verify>
    <automated>pnpm -F @genai/emails exec tsc --noEmit && grep -q "E-Mail bestätigen" packages/emails/src/templates/confirm-signup.tsx && grep -q "Passwort zurücksetzen" packages/emails/src/templates/recovery.tsx && grep -q "60 Minuten" packages/emails/src/templates/recovery.tsx && grep -q "{{ .ConfirmationURL }}" packages/emails/src/templates/confirm-signup.tsx && grep -q "{{ .ConfirmationURL }}" packages/emails/src/templates/recovery.tsx</automated>
  </verify>
  <done>
    - Both files compile clean
    - Copy is exact verbatim per VOICE.md (umlauts intact — ä, ö, ü, ß)
    - Supabase template variables preserved as default prop values
  </done>
  <acceptance_criteria>
    - grep `"Willkommen bei Generation AI"` in confirm-signup.tsx → matches
    - grep `"Schön dass du da bist"` in confirm-signup.tsx → matches (echte ö, per VOICE.md)
    - grep `"E-Mail bestätigen"` in confirm-signup.tsx → matches
    - grep `"Neues Passwort"` NOT required (that's the subject, set in Supabase Dashboard, not the body)
    - grep `"Passwort zurücksetzen"` in recovery.tsx → matches
    - grep `"60 Minuten"` in recovery.tsx → matches
    - grep `"{{ .ConfirmationURL }}"` in both files → matches
    - grep `"{{ .Data.name }}"` in both files → matches
    - grep `from '@react-email/components'` in both files → matches
    - grep `from '@genai/emails'` OR `from '../'` in both files → matches
    - No `ae\|oe\|ue\|ss` Umschrift for Umlaut-Wörter (spot-check: no "Passwort zuruecksetzen", no "Schoen", no "laesst")
    - `pnpm -F @genai/emails exec tsc --noEmit` exits 0
  </acceptance_criteria>
</task>

<task type="auto" tdd="false">
  <name>Task 2: Build magic-link.tsx</name>
  <files>packages/emails/src/templates/magic-link.tsx</files>
  <read_first>
    - packages/emails/src/templates/confirm-signup.tsx (from Task 1 — use as structural template)
    - brand/VOICE.md lines 99-106 (Magic-Link copy)
  </read_first>
  <action>
    Create `packages/emails/src/templates/magic-link.tsx`:
    - Same structure as confirm-signup: default export, props `{ name?: string; confirmationUrl?: string }` with defaults `'{{ .Data.name }}'` and `'{{ .ConfirmationURL }}'`.
    - Preview: `Dein Login-Link, gültig 15 Minuten.`
    - Heading: `Hey {name},`
    - Body: `hier ist dein Login-Link. Klick drauf und du bist drin. Der Link gilt 15 Minuten.`
    - Button href `{confirmationUrl}` label `Anmelden`
    - Muted footer: `Falls du den Link nicht angefordert hast, ignorier die Mail.`
  </action>
  <verify>
    <automated>pnpm -F @genai/emails exec tsc --noEmit && grep -q "15 Minuten" packages/emails/src/templates/magic-link.tsx && grep -q "Anmelden" packages/emails/src/templates/magic-link.tsx && grep -q "{{ .ConfirmationURL }}" packages/emails/src/templates/magic-link.tsx && grep -q "Dein Login-Link" packages/emails/src/templates/magic-link.tsx</automated>
  </verify>
  <done>
    - magic-link.tsx compiles, uses Layout + EmailButton, references Supabase {{ .ConfirmationURL }}
    - Copy matches VOICE.md ("Anmelden" label, 15 Minuten, not 24 Stunden)
  </done>
  <acceptance_criteria>
    - grep `"15 Minuten"` in magic-link.tsx → matches (VOICE.md says 15min, existing email.ts said 24h — new copy wins)
    - grep `"Anmelden"` in magic-link.tsx → matches
    - grep `"{{ .ConfirmationURL }}"` in magic-link.tsx → matches
    - grep `"Dein Login-Link"` in magic-link.tsx → matches
    - No `24 Stunden` in magic-link.tsx (rejects legacy copy from apps/website/lib/email.ts)
    - `pnpm -F @genai/emails exec tsc --noEmit` exits 0
  </acceptance_criteria>
</task>

</tasks>

<verification>
- All three templates compile as valid React Email components
- Copy matches VOICE.md verbatim with correct German Umlauts (never oe/ae/ue/ss)
- Supabase Go-template vars preserved so Dashboard import works out-of-the-box
- All templates share Layout + EmailButton (DRY confirmed by grep)
</verification>

<success_criteria>
- [ ] 3 template files exist under packages/emails/src/templates/
- [ ] Each file default-exports a component
- [ ] Each uses Layout + EmailButton + tokens from @genai/emails
- [ ] All copy matches VOICE.md with real Umlauts
- [ ] `pnpm -F @genai/emails exec tsc --noEmit` passes
</success_criteria>

<output>
After completion, create `.planning/phases/17-auth-extensions/17-03-SUMMARY.md`
</output>
