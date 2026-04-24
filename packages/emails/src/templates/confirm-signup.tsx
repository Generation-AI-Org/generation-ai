import { Heading, Section, Text } from '@react-email/components'
import React from 'react'
import { EmailButton, Layout, tokens } from '../index'
import { fontStack } from '../tokens'

export interface ConfirmSignupEmailProps {
  name?: string
  /**
   * @deprecated Phase 25 — wir senden keinen eigenen Confirm-Link mehr.
   * Email wird via Circle's Set-Password-Mail validiert; unsere Welcome-Mail
   * hat nur Brand-Inhalt und einen Link zu tools. Prop bleibt nur für
   * abwärtskompatible Caller (z.B. admin-resend-Tools).
   */
  confirmationUrl?: string
}

/**
 * Welcome-Mail (Phase 25 onwards).
 *
 * Sent by signup-action right after the user signs up. Brand + onboarding
 * context, no action button — the action lives in Circle's separate
 * "Set Password" mail that arrives in parallel.
 */
export default function ConfirmSignupEmail({
  name = 'da',
}: ConfirmSignupEmailProps): React.ReactElement {
  return (
    <Layout preview="Willkommen bei Generation AI — die Community-Mail kommt gleich.">
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
        Hey {name} 👋
      </Heading>

      <Text
        className="email-text"
        style={{
          fontSize: '16px',
          lineHeight: 1.65,
          color: tokens.light.text,
          margin: '0 0 16px 0',
        }}
      >
        Willkommen bei Generation AI — der KI-Community für Studierende im DACH-Raum.
      </Text>

      <Text
        className="email-text"
        style={{
          fontSize: '16px',
          lineHeight: 1.65,
          color: tokens.light.text,
          margin: '0 0 16px 0',
        }}
      >
        <strong>Was als Nächstes passiert:</strong>
      </Text>

      <Text
        className="email-text"
        style={{
          fontSize: '16px',
          lineHeight: 1.65,
          color: tokens.light.text,
          margin: '0 0 16px 0',
        }}
      >
        Du bekommst gleich eine zweite Mail von <strong>Circle</strong> (unser
        Community-Host). Klick da auf <em>„Accept invitation"</em>, setz dir ein
        Passwort und einen Namen — dann bist du direkt in der Community drin und
        kannst loslegen.
      </Text>

      <Text
        className="email-text"
        style={{
          fontSize: '16px',
          lineHeight: 1.65,
          color: tokens.light.text,
          margin: '24px 0 32px 0',
        }}
      >
        Während du wartest: schau dir schon mal unsere KI-Tool-Bibliothek an.
      </Text>

      <Section style={{ textAlign: 'center', margin: '40px 0' }}>
        <EmailButton slug="tools-link" href="https://tools.generation-ai.org">Zu den KI-Tools</EmailButton>
      </Section>

      <Text
        className="email-muted"
        style={{
          fontSize: '13px',
          lineHeight: 1.55,
          color: tokens.light.textMuted,
          margin: '24px 0 0 0',
        }}
      >
        Falls du dich nicht angemeldet hast, ignorier diese Mail einfach.
      </Text>
    </Layout>
  )
}
