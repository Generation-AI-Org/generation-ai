---
phase: 17-auth-extensions
plan: 04
type: execute
wave: 2
depends_on: [17-01]
files_modified:
  - packages/emails/src/templates/email-change.tsx
  - packages/emails/src/templates/reauth.tsx
  - packages/emails/src/templates/invite.tsx
autonomous: true
requirements: [AUTH-EMAIL-07, AUTH-EMAIL-08, AUTH-EMAIL-09]
must_haves:
  truths:
    - "Email-Change template bestätigt die Adressänderung mit CTA und Security-Hint"
    - "Reauth template rendert den 6-stelligen Token ({{ .Token }}) prominent, kein CTA-Button"
    - "Invite template erwähnt Inviter-Name ({{ .Data.inviter_name }}) und CTA 'Account anlegen'"
    - "Alle drei nutzen Layout + EmailButton + tokens aus @genai/emails"
  artifacts:
    - path: "packages/emails/src/templates/email-change.tsx"
      provides: "Change-Email confirmation template"
      exports: ["default"]
    - path: "packages/emails/src/templates/reauth.tsx"
      provides: "Reauthentication OTP template"
      exports: ["default"]
    - path: "packages/emails/src/templates/invite.tsx"
      provides: "User-Invite template"
      exports: ["default"]
  key_links:
    - from: "packages/emails/src/templates/reauth.tsx"
      to: "Supabase {{ .Token }} variable"
      via: "Inline code-block rendering the 6-digit token"
      pattern: "\\.Token"
---

<objective>
Build the remaining three Supabase auth email templates: Change Email, Reauthentication (OTP), Invite. Each uses the shared Layout + EmailButton from Plan 17-01 and copy from `brand/VOICE.md` + `CONTEXT.md` subjects table.

Purpose: Complete the 6-template set so Supabase Dashboard can be fully populated in one go by Luca.
Output: Three additional `.tsx` files in `packages/emails/src/templates/`.
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
Subjects (reference — set in Supabase Dashboard, not in template):
- Change Email: "Neue Mail-Adresse bestätigen"
- Reauthentication: "Kurz bestätigen, dass du's bist"
- Invite: "[Name] hat dich zu Generation AI eingeladen"

Supabase template variables:
- `{{ .ConfirmationURL }}` — for Change-Email and Invite CTA
- `{{ .Token }}` — 6-digit numeric OTP for Reauthentication (NO button — user copies the code)
- `{{ .Email }}` — new email for Change-Email context
- `{{ .Data.inviter_name }}` — inviter's display name for Invite (fallback to "Jemand")

Preview texts (from CONTEXT.md §Die 6 Supabase-Templates):
- Change Email: "Klick, um die Änderung zu bestätigen."
- Reauthentication: "Aus Sicherheitsgründen — nur ein Klick."  (but note: Reauth uses OTP token, not click — copy below adjusts)
- Invite: "Leg deinen Account an und leg los."

CTA labels (from VOICE.md button library):
- Change Email: "Änderung bestätigen"
- Invite: "Account anlegen"
</interfaces>
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Build email-change.tsx + invite.tsx</name>
  <files>packages/emails/src/templates/email-change.tsx, packages/emails/src/templates/invite.tsx</files>
  <read_first>
    - packages/emails/src/templates/confirm-signup.tsx (from 17-03, reference structure)
    - packages/emails/src/components/Layout.tsx
    - brand/VOICE.md (button labels, Mail-Strukturelemente)
    - .planning/phases/17-auth-extensions/CONTEXT.md §Die 6 Supabase-Templates
  </read_first>
  <action>
    1. Create `packages/emails/src/templates/email-change.tsx`:
       - Default-export `EmailChangeEmail` with props `{ confirmationUrl?: string; newEmail?: string }` defaulting to `'{{ .ConfirmationURL }}'` and `'{{ .Email }}'`.
       - Preview: `Klick, um die Änderung zu bestätigen.`
       - Heading: `Neue Mail-Adresse bestätigen`
       - Body text: `Du willst deine Mail-Adresse zu {newEmail} ändern. Bestätige die Änderung mit einem Klick:`
       - Button href `{confirmationUrl}` label `Änderung bestätigen`
       - Muted footer: `Falls du das nicht warst, ignorier die Mail. Deine aktuelle Mail-Adresse bleibt.`
    2. Create `packages/emails/src/templates/invite.tsx`:
       - Default-export `InviteEmail` with props `{ confirmationUrl?: string; inviterName?: string }` defaulting to `'{{ .ConfirmationURL }}'` and `'{{ .Data.inviter_name }}'`.
       - Preview: `Leg deinen Account an und leg los.`
       - Heading: `{inviterName} hat dich eingeladen`
       - Body: `Willkommen bei Generation AI — der KI-Community für Studierende im DACH-Raum. Leg deinen Account an, dann geht's los.`
       - Button href `{confirmationUrl}` label `Account anlegen`
       - Muted footer: `Kein Interesse? Ignorier die Mail einfach.`
  </action>
  <verify>
    <automated>pnpm -F @genai/emails exec tsc --noEmit && grep -q "Änderung bestätigen" packages/emails/src/templates/email-change.tsx && grep -q "Account anlegen" packages/emails/src/templates/invite.tsx && grep -q "{{ .ConfirmationURL }}" packages/emails/src/templates/email-change.tsx && grep -q "{{ .ConfirmationURL }}" packages/emails/src/templates/invite.tsx && grep -q "{{ .Data.inviter_name }}" packages/emails/src/templates/invite.tsx && grep -q "{{ .Email }}" packages/emails/src/templates/email-change.tsx</automated>
  </verify>
  <done>
    - Both files compile and reference the correct Supabase variables
    - Copy matches VOICE.md button library
    - Umlauts are real (ä in "Änderung bestätigen", "für")
  </done>
  <acceptance_criteria>
    - grep `"Änderung bestätigen"` in email-change.tsx → matches
    - grep `"Account anlegen"` in invite.tsx → matches
    - grep `"{{ .ConfirmationURL }}"` in both files → matches
    - grep `"{{ .Email }}"` in email-change.tsx → matches
    - grep `"{{ .Data.inviter_name }}"` in invite.tsx → matches
    - grep `"Leg deinen Account an und leg los"` in invite.tsx → matches (VOICE.md preview)
    - No `ae\|oe\|ue\|ss` Umschrift (e.g. "Aenderung bestaetigen" fails)
    - `pnpm -F @genai/emails exec tsc --noEmit` exits 0
  </acceptance_criteria>
</task>

<task type="auto" tdd="false">
  <name>Task 2: Build reauth.tsx (OTP template without button)</name>
  <files>packages/emails/src/templates/reauth.tsx</files>
  <read_first>
    - packages/emails/src/templates/email-change.tsx (from Task 1, copy structure, then remove button)
    - packages/emails/src/components/Layout.tsx
    - packages/emails/src/tokens.ts
    - brand/VOICE.md
  </read_first>
  <action>
    Create `packages/emails/src/templates/reauth.tsx`:
    - Default-export `ReauthEmail` with props `{ token?: string }` defaulting to `'{{ .Token }}'`.
    - Preview: `Aus Sicherheitsgründen — dein Code kommt hier.`
    - Heading: `Kurz bestätigen, dass du's bist`
    - Body: `Gib diesen Code in Generation AI ein, um fortzufahren:`
    - **No EmailButton.** Instead, render the token as a centered monospace block:
      ```tsx
      <Section style={{ textAlign: 'center', margin: '32px 0' }}>
        <Text style={{
          display: 'inline-block',
          fontFamily: tokens.fontStack.mono,
          fontSize: '32px',
          fontWeight: 700,
          letterSpacing: '0.2em',
          color: tokens.light.text,
          backgroundColor: '#EFEFEF',
          padding: '16px 24px',
          borderRadius: tokens.radius['2xl'],
          margin: 0,
        }} className="email-code">
          {token}
        </Text>
      </Section>
      ```
    - Extend Layout's `<style>` block NOT — instead, rely on existing `email-text` override. Add one more className override by embedding a local `<style>` via `<Head>`… but Layout already owns `<Head>`. Solution: keep code styling single-theme (light bg with dark text) and accept that in dark-mode mail clients the code block will look slightly off — acceptable for a 6-digit token.
      Actually, better: use tokens.light values only for the code block (OTP readability is critical). Document this in-file via a code comment: `// OTP code is rendered with static light-theme colors for maximum contrast/readability in all mail clients.`
    - Muted footer: `Der Code gilt 10 Minuten. Falls du das nicht angefordert hast, ignorier die Mail.`
  </action>
  <verify>
    <automated>pnpm -F @genai/emails exec tsc --noEmit && grep -q "{{ .Token }}" packages/emails/src/templates/reauth.tsx && grep -q "tokens.fontStack.mono\|Geist Mono" packages/emails/src/templates/reauth.tsx && ! grep -q "EmailButton" packages/emails/src/templates/reauth.tsx && grep -q "Kurz bestätigen" packages/emails/src/templates/reauth.tsx</automated>
  </verify>
  <done>
    - reauth.tsx compiles
    - Renders `{{ .Token }}` in a monospace code block (no button)
    - Copy matches Subject+Preview from CONTEXT.md
  </done>
  <acceptance_criteria>
    - grep `"{{ .Token }}"` in reauth.tsx → matches
    - grep `"Kurz bestätigen"` in reauth.tsx → matches
    - `! grep -q "EmailButton" packages/emails/src/templates/reauth.tsx` → no CTA button (OTP uses code, not link)
    - grep `letterSpacing.*0\\.2em` OR `letter-spacing: 0.2em` in reauth.tsx → matches (spacing for OTP readability)
    - grep `fontStack.mono\|Geist Mono\|ui-monospace` in reauth.tsx → matches (monospace for code)
    - `pnpm -F @genai/emails exec tsc --noEmit` exits 0
  </acceptance_criteria>
</task>

</tasks>

<verification>
- All 6 templates now exist in packages/emails/src/templates/
- Each of the 3 in this plan uses Layout + tokens; only email-change + invite have buttons
- reauth renders OTP token in monospace, no button
- All copy from VOICE.md / CONTEXT.md, Umlauts real
</verification>

<success_criteria>
- [ ] email-change.tsx, invite.tsx, reauth.tsx exist and compile
- [ ] reauth.tsx uses `{{ .Token }}` in a monospace code block (no EmailButton)
- [ ] email-change and invite use correct Supabase variables and CTA labels from VOICE.md
- [ ] `pnpm -F @genai/emails exec tsc --noEmit` passes
</success_criteria>

<output>
After completion, create `.planning/phases/17-auth-extensions/17-04-SUMMARY.md`
</output>
