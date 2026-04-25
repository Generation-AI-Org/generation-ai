---
phase: 23
plan: 02
slug: email-template-waitlist-confirmation
type: execute
wave: 1
depends_on: []
files_modified:
  - packages/emails/src/templates/waitlist-confirmation.tsx
  - packages/emails/src/index.ts
autonomous: true
requirements:
  - R4.5
must_haves:
  truths:
    - "Waitlist-Confirmation-E-Mail-Template existiert in @genai/emails"
    - "Template rendert mit Brand-Look (Layout + tokens + fontStack analog partner-inquiry-confirmation)"
    - "Template ist per `import { WaitlistConfirmationEmail } from '@genai/emails'` nutzbar"
    - "Template akzeptiert `name` Prop und personalisiert damit den Body"
  artifacts:
    - path: "packages/emails/src/templates/waitlist-confirmation.tsx"
      provides: "React-Email-Template für Waitlist-Bestätigung"
      exports: ["default (WaitlistConfirmationEmail)", "WaitlistConfirmationEmailProps"]
    - path: "packages/emails/src/index.ts"
      provides: "Re-export des neuen Templates"
      contains: "WaitlistConfirmationEmail"
  key_links:
    - from: "@genai/emails"
      to: "WaitlistConfirmationEmail"
      via: "export { default as WaitlistConfirmationEmail }"
      pattern: "WaitlistConfirmationEmail"
---

<objective>
React-Email-Template für Waitlist-Bestätigung im Brand-Look erstellen.

Purpose: D-07 fordert eine simple Bestätigungs-E-Mail nach Waitlist-Submit. Reuse Phase 17 Setup (Layout, Tokens, fontStack). Plan 23-03 (Server-Action) rendert dieses Template via `@react-email/render` und schickt es über Resend.
Output: Template-File + Re-Export in @genai/emails.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/23-join-flow/23-CONTEXT.md
@.planning/phases/23-join-flow/23-UI-SPEC.md
@packages/emails/src/templates/partner-inquiry-confirmation.tsx
@packages/emails/src/index.ts
@packages/emails/src/components/Layout.tsx
@packages/emails/src/tokens.ts

<interfaces>
<!-- Existing @genai/emails barrel exports (from packages/emails/src/index.ts) -->
```typescript
export { Layout } from './components/Layout'
export type { LayoutProps } from './components/Layout'
export { BrandLogo } from './components/BrandLogo'
export { EmailButton } from './components/EmailButton'
export type { EmailButtonProps } from './components/EmailButton'
export { tokens, radius, space, fontStack } from './tokens'
export { default as PartnerInquiryEmail } from './templates/partner-inquiry'
export type { PartnerInquiryEmailProps } from './templates/partner-inquiry'
export { default as PartnerInquiryConfirmationEmail } from './templates/partner-inquiry-confirmation'
export type { PartnerInquiryConfirmationEmailProps } from './templates/partner-inquiry-confirmation'
```

<!-- partner-inquiry-confirmation.tsx structure as blueprint -->
```tsx
<Layout preview="...">
  <Heading style={{ fontFamily: fontStack.sans, fontSize: '24px', fontWeight: 700, color: tokens.light.text, margin: '0 0 16px 0' }}>...</Heading>
  <Text style={{ fontSize: '16px', color: tokens.light.text, fontFamily: fontStack.sans, lineHeight: '1.6' }}>...</Text>
</Layout>
```
</interfaces>
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Waitlist-Confirmation-Template erstellen</name>
  <files>packages/emails/src/templates/waitlist-confirmation.tsx</files>
  <read_first>
    - `packages/emails/src/templates/partner-inquiry-confirmation.tsx` (1:1 Blueprint — gleiches Pattern, gleiche Styles)
    - `packages/emails/src/components/Layout.tsx` (Layout-Props, preview-Support)
    - `packages/emails/src/tokens.ts` (tokens.light.text, fontStack.sans)
    - `.planning/phases/23-join-flow/23-CONTEXT.md` D-07 (Copy-Intention) + D-22 (Success-Copy für Konsistenz Web↔Mail)
    - `brand/VOICE.md` (Du-Form, echte Umlaute, konfident-casual)
  </read_first>
  <action>
Erstelle `packages/emails/src/templates/waitlist-confirmation.tsx` mit exakt folgendem Inhalt (Blueprint = partner-inquiry-confirmation.tsx, Copy = D-07 + D-22 + VOICE.md):

```tsx
import { Heading, Text } from '@react-email/components'
import React from 'react'
import { Layout, tokens } from '../index'
import { fontStack } from '../tokens'

export interface WaitlistConfirmationEmailProps {
  name: string
}

/**
 * WaitlistConfirmationEmail — Bestätigung für /join Waitlist-Eintrag (Phase 23 V1).
 *
 * Subject: "Du stehst auf der Warteliste — Generation AI"
 * To: {submitter email}
 * From: noreply@generation-ai.org
 *
 * Triggered by: apps/website/app/actions/waitlist.ts (Plan 23-03)
 * after a successful insert into public.waitlist.
 *
 * Phase 25 (Circle-API-Sync) will swap this flow for a real signup + magic-link
 * confirmation chain. Until then, this mail is the single user-facing artifact
 * confirming their interest.
 */
export default function WaitlistConfirmationEmail({
  name,
}: WaitlistConfirmationEmailProps): React.ReactElement {
  const firstName = (name.trim().split(/\s+/)[0] ?? name).trim()

  return (
    <Layout preview="Danke — wir melden uns, sobald wir live gehen.">
      <Heading
        className="email-heading"
        style={{
          fontFamily: fontStack.sans,
          fontSize: '24px',
          fontWeight: 700,
          color: tokens.light.text,
          margin: '0 0 16px 0',
        }}
      >
        Du stehst auf der Warteliste.
      </Heading>

      <Text
        className="email-text"
        style={{
          fontSize: '16px',
          color: tokens.light.text,
          margin: '0 0 16px 0',
          fontFamily: fontStack.sans,
          lineHeight: '1.6',
        }}
      >
        Hey {firstName},
      </Text>

      <Text
        className="email-text"
        style={{
          fontSize: '16px',
          color: tokens.light.text,
          margin: '0 0 16px 0',
          fontFamily: fontStack.sans,
          lineHeight: '1.6',
        }}
      >
        danke, dass du dabei sein willst. Wir bereiten gerade den Launch vor und melden uns, sobald die Community für dich offen ist.
      </Text>

      <Text
        className="email-text"
        style={{
          fontSize: '16px',
          color: tokens.light.text,
          margin: '0 0 24px 0',
          fontFamily: fontStack.sans,
          lineHeight: '1.6',
        }}
      >
        Bis dahin — wenn du magst, schau dich auf{' '}
        <a
          href="https://generation-ai.org"
          style={{ color: tokens.light.text, textDecoration: 'underline' }}
        >
          generation-ai.org
        </a>{' '}
        um oder probier unsere kostenlosen KI-Tools auf{' '}
        <a
          href="https://tools.generation-ai.org"
          style={{ color: tokens.light.text, textDecoration: 'underline' }}
        >
          tools.generation-ai.org
        </a>.
      </Text>

      <Text
        className="email-muted"
        style={{
          fontSize: '14px',
          color: tokens.light.textMuted,
          margin: '0',
          fontFamily: fontStack.sans,
          lineHeight: '1.6',
        }}
      >
        Fragen? Schreib uns direkt an{' '}
        <a
          href="mailto:admin@generation-ai.org"
          style={{ color: tokens.light.textMuted, textDecoration: 'underline' }}
        >
          admin@generation-ai.org
        </a>.
      </Text>
    </Layout>
  )
}
```

Copy-Entscheidungen (per D-07 + D-22 + VOICE.md):
- Subject (wird von Plan 23-03 gesetzt, nicht hier): `"Du stehst auf der Warteliste — Generation AI"`
- Preview: `"Danke — wir melden uns, sobald wir live gehen."` (matcht Success-Card-Body-Copy)
- Headline: `"Du stehst auf der Warteliste."` (konsistent mit UI-SPEC Success-Card body)
- Greeting: `"Hey {firstName},"` (Du-Form, partner-confirmation Pattern)
- Body: zwei Paragraphen (ein Dank-Satz + optional Links), Schlusszeile mit admin@
- `firstName` via `name.trim().split(/\s+/)[0]` (gleiche Logik wie UI-SPEC Success-Card — erstes Wort des name-Feldes)
- Links: generation-ai.org + tools.generation-ai.org (ruhig, kein CTA-Button — wir wollen Waitlist-Dramaturgie, nicht neuen Conversion-Attempt)
  </action>
  <verify>
    <automated>test -f packages/emails/src/templates/waitlist-confirmation.tsx && grep -q "export default function WaitlistConfirmationEmail" packages/emails/src/templates/waitlist-confirmation.tsx && grep -q "WaitlistConfirmationEmailProps" packages/emails/src/templates/waitlist-confirmation.tsx && grep -q "Du stehst auf der Warteliste" packages/emails/src/templates/waitlist-confirmation.tsx</automated>
  </verify>
  <acceptance_criteria>
    - File existiert
    - `export interface WaitlistConfirmationEmailProps` mit nur `name: string`
    - `export default function WaitlistConfirmationEmail`
    - Layout importiert aus `'../index'`
    - tokens + fontStack analog partner-inquiry-confirmation genutzt
    - Kein Hardcoded Hex-Farben (alles über `tokens.light.*`)
    - `firstName`-Extraktion per `name.trim().split(/\s+/)[0]`
    - Echte Umlaute (ä/ö/ü/ß), keine ae/oe/ue/ss
  </acceptance_criteria>
  <done>Template kompiliert + rendert (wird in Task 2 verifiziert via Re-Export + tsc).</done>
</task>

<task type="auto">
  <name>Task 2: Re-Export in packages/emails/src/index.ts</name>
  <files>packages/emails/src/index.ts</files>
  <read_first>
    - `packages/emails/src/index.ts` (existing exports — nur erweitern, nie überschreiben)
  </read_first>
  <action>
Füge am Ende von `packages/emails/src/index.ts` folgende Zeilen hinzu (existing exports NICHT anfassen):

```typescript
export { default as WaitlistConfirmationEmail } from './templates/waitlist-confirmation'
export type { WaitlistConfirmationEmailProps } from './templates/waitlist-confirmation'
```

Pattern ist identisch zu den bestehenden PartnerInquiryEmail/PartnerInquiryConfirmationEmail re-exports direkt darüber.
  </action>
  <verify>
    <automated>grep -q "WaitlistConfirmationEmail" packages/emails/src/index.ts && grep -q "WaitlistConfirmationEmailProps" packages/emails/src/index.ts && pnpm -w exec tsc --noEmit --project packages/emails/tsconfig.json 2>&1 | tail -20</automated>
  </verify>
  <acceptance_criteria>
    - `packages/emails/src/index.ts` exportiert `WaitlistConfirmationEmail` (default-Import-Re-Export-Pattern)
    - Exportiert `WaitlistConfirmationEmailProps` als type
    - Bestehende 6 Exports (Layout, BrandLogo, EmailButton, tokens, PartnerInquiryEmail, PartnerInquiryConfirmationEmail) unverändert
    - `pnpm -w exec tsc --noEmit` (auf emails-Package) grün
  </acceptance_criteria>
  <done>`import { WaitlistConfirmationEmail, type WaitlistConfirmationEmailProps } from '@genai/emails'` funktioniert für Server-Action (Plan 23-03).</done>
</task>

<task type="auto">
  <name>Task 3: Optional — Template via react-email preview renderbar machen</name>
  <files>(keine Datei-Änderung — nur Smoke-Test)</files>
  <read_first>
    - `packages/emails/package.json` (email:dev Script: `email dev --dir ./src/templates --port 3030`)
  </read_first>
  <action>
Optionaler Smoke-Test (nicht blockierend): Starte `pnpm --filter @genai/emails email:dev` im Background (port 3030), dann:

```bash
curl -sSf http://localhost:3030/preview/waitlist-confirmation >/dev/null && echo OK
```

Falls react-email preview routes anders aufgebaut sind, reicht es dass der Dev-Server ohne Fehler startet und das Template in der Liste erscheint. Dann Background-Prozess beenden.

Falls lokaler Preview aus Umgebungs-Gründen nicht klappt (Port blockiert o.ä.), überspringe diesen Task — die Acceptance-Criteria von Task 2 sind ausreichend (tsc compile).
  </action>
  <verify>
    <automated>pnpm -w exec tsc --noEmit 2>&1 | tail -20</automated>
  </verify>
  <acceptance_criteria>
    - Optional: react-email preview listet `waitlist-confirmation` auf
    - Fallback: repo-wide tsc ist clean
  </acceptance_criteria>
  <done>Template ist build- und importierbar; manueller Preview ist nice-to-have.</done>
</task>

</tasks>

<verification>
- Template-File im Repo
- Re-Export im Barrel
- TSC clean
- Copy folgt VOICE.md (Du-Form, echte Umlaute, keine Ausrufezeichen in CTAs)
</verification>

<success_criteria>
- Plan 23-03 kann `import { WaitlistConfirmationEmail } from '@genai/emails'` + `render(WaitlistConfirmationEmail({ name }))` aufrufen
- HTML enthält "Du stehst auf der Warteliste." + "Hey {firstName},"
- Brand-Layout konsistent mit partner-inquiry-confirmation
</success_criteria>

<output>
Create `.planning/phases/23-join-flow/23-02-SUMMARY.md` with:
- Template file path
- Exported symbols
- Copy-Block (Subject + Preview + Headline + Body)
- TSC-Status
</output>
