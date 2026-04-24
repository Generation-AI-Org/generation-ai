'use client'

import { useState, useRef, useId } from "react"
import { submitPartnerInquiry } from "@/app/actions/partner-inquiry"
import type { PartnerTyp } from "./partner-tab-content"

type FormState = 'idle' | 'submitting' | 'success' | 'error'

interface PartnerContactFormProps {
  initialTyp?: PartnerTyp
}

// Dropdown options: value must match PartnerInquiryEmailProps.typ
const TYP_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'Unternehmen', label: 'Unternehmen' },
  { value: 'Stiftung', label: 'Stiftung' },
  { value: 'Hochschule', label: 'Hochschule' },
  { value: 'Initiative', label: 'Initiative' },
]

// Map tab slug → dropdown value
const SLUG_TO_TYP: Record<PartnerTyp, string> = {
  unternehmen: 'Unternehmen',
  stiftungen: 'Stiftung',
  hochschulen: 'Hochschule',
  initiativen: 'Initiative',
}

export function PartnerContactForm({ initialTyp }: PartnerContactFormProps) {
  const formId = useId()
  const formRef = useRef<HTMLFormElement>(null)

  const defaultTyp = initialTyp ? SLUG_TO_TYP[initialTyp] : 'Unternehmen'
  const [selectedTyp, setSelectedTyp] = useState(defaultTyp)
  const [formState, setFormState] = useState<FormState>('idle')
  const [serverError, setServerError] = useState<string | null>(null)

  // Client-side field errors
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateField = (name: string, value: string): string => {
    if (name === 'name' && !value.trim()) return 'Dieses Feld ist erforderlich.'
    if (name === 'email') {
      if (!value.trim()) return 'Dieses Feld ist erforderlich.'
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
        return 'Bitte gib eine gültige E-Mail-Adresse ein.'
    }
    if (name === 'organisation' && !value.trim()) return 'Dieses Feld ist erforderlich.'
    if (name === 'typ' && !value) return 'Dieses Feld ist erforderlich.'
    return ''
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    const error = validateField(name, value)
    setErrors((prev) => ({ ...prev, [name]: error }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = formRef.current
    if (!form) return

    // Validate all required fields before submission
    const formData = new FormData(form)
    const fieldErrors: Record<string, string> = {}
    for (const field of ['name', 'email', 'organisation', 'typ']) {
      const val = (formData.get(field) as string) ?? ''
      const err = validateField(field, val)
      if (err) fieldErrors[field] = err
    }
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors)
      return
    }

    setFormState('submitting')
    setServerError(null)

    const result = await submitPartnerInquiry(formData)

    if (result.success) {
      setFormState('success')
    } else {
      setFormState('error')
      setServerError(
        result.error ??
          'Etwas ist schiefgelaufen. Bitte versuche es erneut oder schreibe uns direkt an admin@generation-ai.org.',
      )
    }
  }

  // Success state: replace form entirely
  if (formState === 'success') {
    return (
      <div
        className="rounded-2xl border border-border bg-bg-card px-6 py-8 sm:p-10 text-center"
        role="alert"
        aria-live="polite"
      >
        <p
          className="font-sans font-bold text-text"
          style={{ fontSize: "var(--fs-h2)", lineHeight: "var(--lh-headline)" }}
        >
          Anfrage eingegangen.
        </p>
        <p className="mt-4 text-text-secondary leading-[1.65]" style={{ fontSize: "var(--fs-body)" }}>
          Wir melden uns innerhalb von 48 Stunden bei dir. Bis dahin — schau dich gerne auf der Seite um.
        </p>
      </div>
    )
  }

  const isSubmitting = formState === 'submitting'

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate
      className="rounded-2xl border border-border bg-bg-card px-6 py-8 sm:p-10 space-y-6"
    >
      {/* Name */}
      <div>
        <label
          htmlFor={`${formId}-name`}
          className="block font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted mb-2"
        >
          Name
        </label>
        <input
          id={`${formId}-name`}
          name="name"
          type="text"
          required
          disabled={isSubmitting}
          onBlur={handleBlur}
          className="w-full rounded-lg border border-border bg-bg px-4 py-3 text-text placeholder:text-text-muted focus-visible:outline-none focus-visible:border-[var(--border-accent)] transition-colors"
          style={{ fontSize: "var(--fs-body)" }}
          aria-describedby={errors.name ? `${formId}-name-error` : undefined}
          aria-invalid={!!errors.name}
        />
        {errors.name && (
          <p
            id={`${formId}-name-error`}
            role="alert"
            className="mt-1 text-sm"
            style={{ color: "var(--status-error)" }}
          >
            {errors.name}
          </p>
        )}
      </div>

      {/* E-Mail */}
      <div>
        <label
          htmlFor={`${formId}-email`}
          className="block font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted mb-2"
        >
          E-Mail
        </label>
        <input
          id={`${formId}-email`}
          name="email"
          type="email"
          required
          disabled={isSubmitting}
          onBlur={handleBlur}
          className="w-full rounded-lg border border-border bg-bg px-4 py-3 text-text placeholder:text-text-muted focus-visible:outline-none focus-visible:border-[var(--border-accent)] transition-colors"
          style={{ fontSize: "var(--fs-body)" }}
          aria-describedby={errors.email ? `${formId}-email-error` : undefined}
          aria-invalid={!!errors.email}
        />
        {errors.email && (
          <p
            id={`${formId}-email-error`}
            role="alert"
            className="mt-1 text-sm"
            style={{ color: "var(--status-error)" }}
          >
            {errors.email}
          </p>
        )}
      </div>

      {/* Organisation */}
      <div>
        <label
          htmlFor={`${formId}-organisation`}
          className="block font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted mb-2"
        >
          Organisation
        </label>
        <input
          id={`${formId}-organisation`}
          name="organisation"
          type="text"
          required
          disabled={isSubmitting}
          onBlur={handleBlur}
          className="w-full rounded-lg border border-border bg-bg px-4 py-3 text-text placeholder:text-text-muted focus-visible:outline-none focus-visible:border-[var(--border-accent)] transition-colors"
          style={{ fontSize: "var(--fs-body)" }}
          aria-describedby={errors.organisation ? `${formId}-organisation-error` : undefined}
          aria-invalid={!!errors.organisation}
        />
        {errors.organisation && (
          <p
            id={`${formId}-organisation-error`}
            role="alert"
            className="mt-1 text-sm"
            style={{ color: "var(--status-error)" }}
          >
            {errors.organisation}
          </p>
        )}
      </div>

      {/* Ich interessiere mich als … (controlled dropdown) */}
      <div>
        <label
          htmlFor={`${formId}-typ`}
          className="block font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted mb-2"
        >
          Ich interessiere mich als …
        </label>
        <select
          id={`${formId}-typ`}
          name="typ"
          required
          disabled={isSubmitting}
          value={selectedTyp}
          onChange={(e) => setSelectedTyp(e.target.value)}
          onBlur={handleBlur}
          className="w-full rounded-lg border border-border bg-bg px-4 py-3 text-text focus-visible:outline-none focus-visible:border-[var(--border-accent)] transition-colors"
          style={{ fontSize: "var(--fs-body)" }}
          aria-describedby={errors.typ ? `${formId}-typ-error` : undefined}
          aria-invalid={!!errors.typ}
        >
          {TYP_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {errors.typ && (
          <p
            id={`${formId}-typ-error`}
            role="alert"
            className="mt-1 text-sm"
            style={{ color: "var(--status-error)" }}
          >
            {errors.typ}
          </p>
        )}
      </div>

      {/* Nachricht (optional) */}
      <div>
        <label
          htmlFor={`${formId}-nachricht`}
          className="block font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted mb-2"
        >
          Nachricht (optional)
        </label>
        <textarea
          id={`${formId}-nachricht`}
          name="nachricht"
          rows={4}
          disabled={isSubmitting}
          className="w-full rounded-lg border border-border bg-bg px-4 py-3 text-text placeholder:text-text-muted focus-visible:outline-none focus-visible:border-[var(--border-accent)] transition-colors resize-none"
          style={{ fontSize: "var(--fs-body)" }}
        />
      </div>

      {/* Honeypot (D-06) — hidden from humans */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        aria-hidden="true"
        className="sr-only"
        autoComplete="off"
      />

      {/* Server error banner */}
      {formState === 'error' && serverError && (
        <div
          role="alert"
          aria-live="polite"
          className="rounded-lg border px-4 py-3 text-sm"
          style={{
            borderColor: "var(--status-error)",
            color: "var(--status-error)",
            background: "rgba(220, 38, 38, 0.08)",
          }}
        >
          {serverError}
        </div>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full sm:w-auto rounded-full px-6 py-3 font-mono font-bold text-[14px] tracking-[0.02em] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
        style={{
          background: "var(--accent)",
          color: "var(--text-on-accent)",
        }}
        onMouseEnter={(e) => {
          if (!isSubmitting) {
            e.currentTarget.style.boxShadow = "0 0 20px var(--accent-glow)"
            e.currentTarget.style.transform = "scale(1.03)"
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = ""
          e.currentTarget.style.transform = ""
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.transform = "scale(0.98)"
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.transform = "scale(1.03)"
        }}
      >
        {isSubmitting ? 'Wird gesendet…' : 'Anfrage senden'}
      </button>
    </form>
  )
}
