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
        </a>
        .
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
        </a>
        .
      </Text>
    </Layout>
  )
}
