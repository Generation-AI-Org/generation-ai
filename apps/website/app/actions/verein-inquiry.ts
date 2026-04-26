'use server'

import { Resend } from 'resend'
import { render } from '@react-email/render'
import { VereinInquiryEmail, VereinInquiryConfirmationEmail } from '@genai/emails'

const resend = new Resend(process.env.RESEND_API_KEY)

export type VereinInquiryResult =
  | { success: true }
  | { success: false; error: string }

const VALID_AREAS = [
  'Events',
  'Content',
  'Tech',
  'Strategie',
  'Partnerschaften',
  'Allgemein',
] as const
type VereinArea = (typeof VALID_AREAS)[number]

export async function submitVereinInquiry(
  formData: FormData,
): Promise<VereinInquiryResult> {
  const honeypot = formData.get('website')
  if (honeypot !== '' && honeypot !== null) {
    return { success: false, error: 'Ungültige Anfrage.' }
  }

  const name = (formData.get('name') as string | null)?.trim() ?? ''
  const email = (formData.get('email') as string | null)?.trim() ?? ''
  const areaRaw = (formData.get('area') as string | null)?.trim() ?? ''
  const nachricht = (formData.get('nachricht') as string | null)?.trim() || undefined

  if (!name) return { success: false, error: 'Name ist erforderlich.' }
  if (!email) return { success: false, error: 'E-Mail ist erforderlich.' }
  if (!areaRaw) return { success: false, error: 'Bereich ist erforderlich.' }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { success: false, error: 'Bitte gib eine gültige E-Mail-Adresse ein.' }
  }

  if (!VALID_AREAS.includes(areaRaw as VereinArea)) {
    return { success: false, error: 'Ungültiger Bereich.' }
  }
  const area = areaRaw as VereinArea

  try {
    const adminHtml = await render(
      VereinInquiryEmail({ name, email, area, nachricht }),
    )

    await resend.emails.send({
      from: 'noreply@generation-ai.org',
      to: 'info@generation-ai.org',
      subject: `Neue Vereins-Anfrage: ${name} (${area})`,
      html: adminHtml,
    })

    try {
      const confirmHtml = await render(
        VereinInquiryConfirmationEmail({ name, area }),
      )

      await resend.emails.send({
        from: 'noreply@generation-ai.org',
        to: email,
        subject: 'Deine Nachricht bei Generation AI ist angekommen.',
        html: confirmHtml,
      })
    } catch (confirmError) {
      console.error('[verein-inquiry] Confirmation email failed:', confirmError)
    }

    return { success: true }
  } catch (error) {
    console.error('[verein-inquiry] Failed to send admin notification:', error)
    return {
      success: false,
      error:
        'Etwas ist schiefgelaufen. Bitte versuche es erneut oder schreibe uns direkt an info@generation-ai.org.',
    }
  }
}
