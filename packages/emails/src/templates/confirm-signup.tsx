import { Heading, Link, Section, Text } from '@react-email/components'
import React from 'react'
import { Layout, tokens } from '../index'
import { fontStack } from '../tokens'

export interface ConfirmSignupEmailProps {
  name?: string
  /**
   * Per-user Supabase magic-link URL pointing at tools-app's /auth/confirm.
   * When supplied, the "Zu den KI-Tools" CTA auto-logs the user into
   * tools.generation-ai.org via verifyOtp + cross-subdomain Supabase cookie.
   * Falls back to the bare tools URL (login required) if generation failed.
   */
  toolsLoginUrl?: string
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
  toolsLoginUrl,
}: ConfirmSignupEmailProps): React.ReactElement {
  // Auto-login fallback: if magic-link generation failed in signup-action,
  // ship the bare URL so the mail still works (user just has to log in).
  const toolsHref = toolsLoginUrl ?? 'https://tools.generation-ai.org'
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
          margin: '24px 0 16px 0',
        }}
      >
        <strong>Während du wartest:</strong>
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
        Mit deinem Account hast du ab jetzt Zugriff auf den{' '}
        <strong>Pro-Assistenten</strong> (Gemini 3 Flash mit Web-Suche und
        Tools) und die komplette KI-Tool-Bibliothek mit allen Member-Tipps.
        Klick einmal — du bist direkt eingeloggt:
      </Text>

      <Section style={{ textAlign: 'center', margin: '40px 0' }}>
        <Link
          href={toolsHref}
          style={{
            display: 'inline-block',
            padding: '14px 32px',
            backgroundColor: tokens.light.text,
            color: tokens.light.bg,
            fontFamily: fontStack.mono,
            fontSize: '15px',
            fontWeight: 700,
            textDecoration: 'none',
            borderRadius: '999px',
            letterSpacing: '0.02em',
          }}
        >
          Zu den KI-Tools →
        </Link>
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
