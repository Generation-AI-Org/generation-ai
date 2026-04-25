'use server'

import { Resend } from 'resend'
import { render } from '@react-email/render'
import { PartnerInquiryEmail, PartnerInquiryConfirmationEmail } from '@genai/emails'

const resend = new Resend(process.env.RESEND_API_KEY)

export type PartnerInquiryResult =
  | { success: true }
  | { success: false; error: string }

const VALID_TYPES = ['Unternehmen', 'Stiftung', 'Hochschule', 'Initiative'] as const
type PartnerTyp = (typeof VALID_TYPES)[number]

export async function submitPartnerInquiry(
  formData: FormData,
): Promise<PartnerInquiryResult> {
  // 1. Honeypot check (D-06)
  const honeypot = formData.get('website')
  if (honeypot !== '' && honeypot !== null) {
    // Silent reject — don't hint to bots that they were caught
    return { success: false, error: 'Ungültige Anfrage.' }
  }

  // 2. Extract + validate required fields
  const name = (formData.get('name') as string | null)?.trim() ?? ''
  const email = (formData.get('email') as string | null)?.trim() ?? ''
  const organisation = (formData.get('organisation') as string | null)?.trim() ?? ''
  const typRaw = (formData.get('typ') as string | null)?.trim() ?? ''
  const nachricht = (formData.get('nachricht') as string | null)?.trim() || undefined

  if (!name) return { success: false, error: 'Name ist erforderlich.' }
  if (!email) return { success: false, error: 'E-Mail ist erforderlich.' }
  if (!organisation) return { success: false, error: 'Organisation ist erforderlich.' }
  if (!typRaw) return { success: false, error: 'Partnertyp ist erforderlich.' }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { success: false, error: 'Bitte gib eine gültige E-Mail-Adresse ein.' }
  }

  // Typ validation
  if (!VALID_TYPES.includes(typRaw as PartnerTyp)) {
    return { success: false, error: 'Ungültiger Partnertyp.' }
  }
  const typ = typRaw as PartnerTyp

  try {
    // 3. Send admin notification (PartnerInquiryEmail → admin@generation-ai.org)
    const adminHtml = await render(
      PartnerInquiryEmail({ name, email, organisation, typ, nachricht }),
    )

    await resend.emails.send({
      from: 'noreply@generation-ai.org',
      to: 'admin@generation-ai.org',
      subject: `Neue Partner-Anfrage: ${organisation} (${typ})`,
      html: adminHtml,
    })

    // 4. Send confirmation to submitter (PartnerInquiryConfirmationEmail → submitter email)
    // NOTE: requires noreply@generation-ai.org to be a verified sender in Resend.
    // If domain not verified, this call will throw — catch separately to not block admin notification.
    try {
      const confirmHtml = await render(
        PartnerInquiryConfirmationEmail({ name, typ }),
      )

      await resend.emails.send({
        from: 'noreply@generation-ai.org',
        to: email,
        subject: 'Deine Anfrage bei Generation AI ist eingegangen.',
        html: confirmHtml,
      })
    } catch (confirmError) {
      // TODO: If this fails consistently, check that noreply@generation-ai.org is
      // a verified sender domain in Resend dashboard (D-10 prerequisite).
      console.error('[partner-inquiry] Confirmation email failed:', confirmError)
      // Do NOT fail the whole action — admin@ notification already sent
    }

    return { success: true }
  } catch (error) {
    console.error('[partner-inquiry] Failed to send admin notification:', error)
    return {
      success: false,
      error:
        'Etwas ist schiefgelaufen. Bitte versuche es erneut oder schreibe uns direkt an admin@generation-ai.org.',
    }
  }
}
