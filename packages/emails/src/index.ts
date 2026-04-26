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

export { default as VereinInquiryEmail } from './templates/verein-inquiry'
export type { VereinInquiryEmailProps } from './templates/verein-inquiry'

export { default as VereinInquiryConfirmationEmail } from './templates/verein-inquiry-confirmation'
export type { VereinInquiryConfirmationEmailProps } from './templates/verein-inquiry-confirmation'

export { default as WaitlistConfirmationEmail } from './templates/waitlist-confirmation'
export type { WaitlistConfirmationEmailProps } from './templates/waitlist-confirmation'

export { default as WaitlistReinviteEmail } from './templates/waitlist-reinvite'
export type { WaitlistReinviteEmailProps } from './templates/waitlist-reinvite'

// REVIEW LO-01 — Re-exported for consistency even though the template is
// rendered offline (pasted into Supabase Dashboard) and has no runtime
// importer. Keeping the barrel complete avoids surprises for future callers
// (e.g. an admin "resend confirmation" tool).
export { default as ConfirmSignupEmail } from './templates/confirm-signup'
export type { ConfirmSignupEmailProps } from './templates/confirm-signup'
