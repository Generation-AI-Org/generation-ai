import { Heading, Section, Text } from '@react-email/components'
import React from 'react'
import { EmailButton, Layout, tokens } from '../index'
import { fontStack } from '../tokens'

export interface InviteEmailProps {
  confirmationUrl?: string
  inviterName?: string
}

/**
 * User Invite email template.
 *
 * Subject (set in Supabase Dashboard): "[Name] hat dich zu Generation AI eingeladen"
 * Supabase template variables are embedded as default prop values so that
 * render(...) produces HTML with Go-template syntax intact for Dashboard import.
 */
export default function InviteEmail({
  confirmationUrl = '{{ .ConfirmationURL }}',
  inviterName = '{{ .Data.inviter_name }}',
}: InviteEmailProps): React.ReactElement {
  return (
    <Layout preview="Leg deinen Account an und leg los.">
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
        {inviterName} hat dich eingeladen
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
          margin: '0 0 32px 0',
        }}
      >
        Leg deinen Account an, dann geht's los.
      </Text>

      <Section style={{ textAlign: 'center', margin: '40px 0' }}>
        <EmailButton href={confirmationUrl}>Account anlegen</EmailButton>
      </Section>

      <Text
        className="email-muted"
        style={{
          fontSize: '14px',
          lineHeight: 1.55,
          color: tokens.light.textMuted,
          margin: '24px 0 0 0',
        }}
      >
        Kein Interesse? Ignorier die Mail einfach.
      </Text>
    </Layout>
  )
}
