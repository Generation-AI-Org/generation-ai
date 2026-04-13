import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface SendMagicLinkParams {
  email: string
  name: string
  magicLink: string
}

export async function sendMagicLinkEmail({ email, name, magicLink }: SendMagicLinkParams) {
  const { data, error } = await resend.emails.send({
    from: 'Generation AI <noreply@generation-ai.org>',
    to: email,
    subject: 'Willkommen bei Generation AI! 🚀',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <style>
    :root {
      color-scheme: light dark;
      supported-color-schemes: light dark;
    }
    @media (prefers-color-scheme: dark) {
      .email-body { background-color: #0a0a0a !important; }
      .email-container { background-color: #141414 !important; border-color: #262626 !important; }
      .email-title { color: #ffffff !important; }
      .email-accent { color: #22c55e !important; }
      .email-heading { color: #ffffff !important; }
      .email-text { color: #a3a3a3 !important; }
      .email-muted { color: #737373 !important; }
      .email-footer { color: #525252 !important; }
      .email-divider { border-top-color: #262626 !important; }
      .email-btn { background-color: #22c55e !important; color: #000000 !important; }
    }
  </style>
</head>
<body class="email-body" style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" class="email-body" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" class="email-container" style="max-width: 480px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e5e5e5;">
          <tr>
            <td style="padding: 40px 32px;">
              <!-- Logo/Header -->
              <div style="text-align: center; margin-bottom: 32px;">
                <h1 class="email-title" style="margin: 0; font-size: 24px; font-weight: 700; color: #171717;">
                  Generation <span class="email-accent" style="color: #e11d48;">AI</span>
                </h1>
              </div>

              <!-- Content -->
              <h2 class="email-heading" style="margin: 0 0 16px 0; font-size: 20px; font-weight: 600; color: #171717;">
                Hey ${name}! 👋
              </h2>

              <p class="email-text" style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #525252;">
                Willkommen bei der ersten kostenlosen KI-Community für Studierende im DACH-Raum. Klick auf den Button um dich einzuloggen:
              </p>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="${magicLink}" class="email-btn" style="display: inline-block; padding: 16px 32px; background-color: #e11d48; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 9999px;">
                  Einloggen
                </a>
              </div>

              <p class="email-muted" style="margin: 24px 0 0 0; font-size: 14px; line-height: 1.6; color: #737373;">
                Der Link ist 24 Stunden gültig. Falls du dich nicht angemeldet hast, ignoriere diese Email einfach.
              </p>

              <!-- Divider -->
              <hr class="email-divider" style="margin: 32px 0; border: none; border-top: 1px solid #e5e5e5;">

              <!-- Footer -->
              <p class="email-footer" style="margin: 0; font-size: 12px; color: #a3a3a3; text-align: center;">
                Generation AI · Die KI-Community für Studierende
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  })

  if (error) {
    console.error('Resend error:', error)
    throw error
  }

  return data
}
