'use client'

import { useId, useRef, useState } from "react"
import { submitVereinInquiry } from "@/app/actions/verein-inquiry"

type FormState = "idle" | "submitting" | "success" | "error"

const AREA_OPTIONS = [
  "Events",
  "Content",
  "Tech",
  "Strategie",
  "Partnerschaften",
  "Allgemein",
] as const

export function AboutVereinForm() {
  const formId = useId()
  const formRef = useRef<HTMLFormElement>(null)
  const [formState, setFormState] = useState<FormState>("idle")
  const [serverError, setServerError] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateField = (name: string, value: string): string => {
    if (name === "name" && !value.trim()) return "Dieses Feld ist erforderlich."
    if (name === "email") {
      if (!value.trim()) return "Dieses Feld ist erforderlich."
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return "Bitte gib eine gültige E-Mail-Adresse ein."
      }
    }
    if (name === "area" && !value) return "Dieses Feld ist erforderlich."
    return ""
  }

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target
    const error = validateField(name, value)
    setErrors((prev) => ({ ...prev, [name]: error }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = formRef.current
    if (!form) return

    const formData = new FormData(form)
    const fieldErrors: Record<string, string> = {}
    for (const field of ["name", "email", "area"]) {
      const value = (formData.get(field) as string) ?? ""
      const error = validateField(field, value)
      if (error) fieldErrors[field] = error
    }

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors)
      return
    }

    setFormState("submitting")
    setServerError(null)

    const result = await submitVereinInquiry(formData)

    if (result.success) {
      setFormState("success")
    } else {
      setFormState("error")
      setServerError(
        result.error ??
          "Etwas ist schiefgelaufen. Bitte versuche es erneut oder schreibe uns direkt an info@generation-ai.org.",
      )
    }
  }

  if (formState === "success") {
    return (
      <div
        className="rounded-2xl border border-border bg-bg-card px-6 py-8 text-center sm:p-10"
        role="alert"
        aria-live="polite"
      >
        <p
          className="font-sans font-bold text-text"
          style={{ fontSize: "var(--fs-h2)", lineHeight: "var(--lh-headline)" }}
        >
          Nachricht angekommen.
        </p>
        <p
          className="mt-4 text-text-secondary"
          style={{ fontSize: "var(--fs-body)", lineHeight: "var(--lh-body)" }}
        >
          Wir melden uns bei dir. Bis dahin kannst du dich weiter auf der Seite umschauen.
        </p>
      </div>
    )
  }

  const isSubmitting = formState === "submitting"

  return (
    <form
      ref={formRef}
      id="verein-form"
      onSubmit={handleSubmit}
      noValidate
      className="scroll-mt-28 rounded-2xl border border-border bg-bg-card px-6 py-8 sm:p-10 space-y-5"
    >
      <FormField
        id={`${formId}-name`}
        label="Name"
        error={errors.name}
      >
        <input
          id={`${formId}-name`}
          name="name"
          type="text"
          required
          disabled={isSubmitting}
          onBlur={handleBlur}
          className="w-full rounded-2xl border border-border bg-bg px-4 py-3 text-text placeholder:text-text-muted transition-colors focus-visible:border-[var(--border-accent)] focus-visible:outline-none"
          style={{ fontSize: "var(--fs-body)" }}
          aria-describedby={errors.name ? `${formId}-name-error` : undefined}
          aria-invalid={!!errors.name}
        />
      </FormField>

      <FormField
        id={`${formId}-email`}
        label="E-Mail"
        error={errors.email}
      >
        <input
          id={`${formId}-email`}
          name="email"
          type="email"
          required
          disabled={isSubmitting}
          onBlur={handleBlur}
          className="w-full rounded-2xl border border-border bg-bg px-4 py-3 text-text placeholder:text-text-muted transition-colors focus-visible:border-[var(--border-accent)] focus-visible:outline-none"
          style={{ fontSize: "var(--fs-body)" }}
          aria-describedby={errors.email ? `${formId}-email-error` : undefined}
          aria-invalid={!!errors.email}
        />
      </FormField>

      <FormField
        id={`${formId}-area`}
        label="Wobei willst du mitmachen?"
        error={errors.area}
      >
        <select
          id={`${formId}-area`}
          name="area"
          required
          disabled={isSubmitting}
          defaultValue=""
          onBlur={handleBlur}
          className="w-full rounded-2xl border border-border bg-bg px-4 py-3 text-text transition-colors focus-visible:border-[var(--border-accent)] focus-visible:outline-none"
          style={{ fontSize: "var(--fs-body)" }}
          aria-describedby={errors.area ? `${formId}-area-error` : undefined}
          aria-invalid={!!errors.area}
        >
          <option value="" disabled>
            Bereich auswählen
          </option>
          {AREA_OPTIONS.map((area) => (
            <option key={area} value={area}>
              {area}
            </option>
          ))}
        </select>
      </FormField>

      <div>
        <label
          htmlFor={`${formId}-nachricht`}
          className="mb-2 block font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted"
        >
          Nachricht (optional)
        </label>
        <textarea
          id={`${formId}-nachricht`}
          name="nachricht"
          rows={4}
          disabled={isSubmitting}
          onBlur={handleBlur}
          className="w-full resize-none rounded-2xl border border-border bg-bg px-4 py-3 text-text placeholder:text-text-muted transition-colors focus-visible:border-[var(--border-accent)] focus-visible:outline-none"
          style={{ fontSize: "var(--fs-body)" }}
        />
      </div>

      <input
        type="text"
        name="website"
        tabIndex={-1}
        aria-hidden="true"
        className="sr-only"
        autoComplete="off"
      />

      {formState === "error" && serverError && (
        <div
          role="alert"
          aria-live="polite"
          className="rounded-2xl border px-4 py-3 text-sm"
          style={{
            borderColor: "var(--status-error)",
            color: "var(--status-error)",
            background: "rgba(220, 38, 38, 0.08)",
          }}
        >
          {serverError}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-full bg-[var(--accent)] px-6 py-3 font-mono text-[14px] font-bold tracking-[0.02em] text-[var(--text-on-accent)] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_20px_var(--accent-glow)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100 disabled:hover:shadow-none sm:w-auto"
      >
        {isSubmitting ? "Wird gesendet…" : "Nachricht senden"}
      </button>
    </form>
  )
}

function FormField({
  id,
  label,
  error,
  children,
}: {
  id: string
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted"
      >
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1 text-sm" style={{ color: "var(--status-error)" }}>
          {error}
        </p>
      )}
    </div>
  )
}
