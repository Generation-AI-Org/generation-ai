'use client'

import { useState, useRef, useId, useTransition, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { submitJoinWaitlist, type WaitlistFieldErrors } from '@/app/actions/waitlist'
import { UniCombobox } from '@/components/join/uni-combobox'

// ---------------------------------------------------------------------------
// R4.7 — SessionStorage draft persistence
// ---------------------------------------------------------------------------

const DRAFT_KEY = 'join-form-draft'

interface FormDraft {
  email: string
  name: string
  university: string
  study_program: string
  marketing_opt_in: boolean
}

const emptyDraft: FormDraft = {
  email: '',
  name: '',
  university: '',
  study_program: '',
  marketing_opt_in: false,
}

function readDraft(): FormDraft | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.sessionStorage.getItem(DRAFT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<FormDraft>
    return {
      email: typeof parsed.email === 'string' ? parsed.email : '',
      name: typeof parsed.name === 'string' ? parsed.name : '',
      university: typeof parsed.university === 'string' ? parsed.university : '',
      study_program:
        typeof parsed.study_program === 'string' ? parsed.study_program : '',
      marketing_opt_in:
        typeof parsed.marketing_opt_in === 'boolean'
          ? parsed.marketing_opt_in
          : false,
    }
  } catch {
    return null
  }
}

function writeDraft(draft: FormDraft) {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
  } catch {
    // ignore quota / private-mode errors — persistence is a nice-to-have
  }
}

function clearDraft() {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.removeItem(DRAFT_KEY)
  } catch {
    // noop
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export interface JoinFormCardProps {
  onSuccess: (name: string) => void
}

export function JoinFormCard({ onSuccess }: JoinFormCardProps) {
  const formId = useId()
  const formRef = useRef<HTMLFormElement>(null)
  const searchParams = useSearchParams()
  const redirectAfter = searchParams.get('redirect_after') ?? ''

  // --- Controlled form state ---
  // Start from emptyDraft to keep SSR markup deterministic, then hydrate
  // from sessionStorage in a mount-only useEffect (avoids hydration mismatch).
  const [draft, setDraft] = useState<FormDraft>(emptyDraft)
  const [hydrated, setHydrated] = useState(false)

  const [isPending, startTransition] = useTransition()
  const [serverError, setServerError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<WaitlistFieldErrors>({})

  // R4.7 — Hydrate from sessionStorage on mount (client-only, post-SSR)
  useEffect(() => {
    const stored = readDraft()
    if (stored) setDraft(stored)
    setHydrated(true)
  }, [])

  // R4.7 — Debounced write on every field change (300ms) to avoid hammering
  // sessionStorage on every keystroke. Only runs after initial hydration so
  // we don't immediately overwrite stored draft with emptyDraft.
  useEffect(() => {
    if (!hydrated) return
    const handle = setTimeout(() => writeDraft(draft), 300)
    return () => clearTimeout(handle)
  }, [draft, hydrated])

  const updateField = <K extends keyof FormDraft>(key: K, value: FormDraft[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }))
  }

  const validateField = (name: string, value: string): string => {
    if (name === 'email') {
      const trimmed = value.trim()
      if (!trimmed) return 'Das Feld darf nicht leer sein.'
      // WR-02: use a permissive "looks like an email" check — the server-side
      // Zod `.email()` schema is authoritative (see waitlist.ts). Diverging
      // regexes cause UX confusion when the client accepts something the
      // server rejects (or vice versa). HTML5 `type="email"` already gates
      // browser-level validity; this is only for inline feedback before
      // submit. The server re-validates everything.
      if (!/^\S+@\S+\.\S+$/.test(trimmed))
        return 'Hmm, die Mail-Adresse passt noch nicht ganz.'
    }
    if (name === 'name' && !value.trim()) return 'Das Feld darf nicht leer sein.'
    if (name === 'university' && !value.trim()) return 'Das Feld darf nicht leer sein.'
    return ''
  }

  const handleTextBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const err = validateField(e.target.name, e.target.value)
    setFieldErrors((prev) => ({ ...prev, [e.target.name]: err || undefined }))
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = formRef.current
    if (!form) return

    const formData = new FormData(form)

    // Client-side pre-check required fields (server revalidates anyway)
    const email = (formData.get('email') as string) ?? ''
    const name = (formData.get('name') as string) ?? ''
    const uni = (formData.get('university') as string) ?? ''
    const consent =
      formData.get('consent') === 'on' || formData.get('consent') === 'true'

    const clientErrors: WaitlistFieldErrors = {}
    const e1 = validateField('email', email)
    if (e1) clientErrors.email = e1
    const e2 = validateField('name', name)
    if (e2) clientErrors.name = e2
    const e3 = validateField('university', uni)
    if (e3) clientErrors.university = e3
    if (!consent)
      clientErrors.consent =
        'Du musst der Datenschutzerklärung zustimmen, um fortzufahren.'

    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors)
      // Focus first invalid field (A11y: WCAG 2.4.3)
      const firstErrorName = Object.keys(clientErrors)[0]
      const input = form.querySelector<HTMLElement>(`[name="${firstErrorName}"]`)
      input?.focus()
      return
    }

    setFieldErrors({})
    setServerError(null)

    startTransition(async () => {
      const result = await submitJoinWaitlist(formData)
      if (result.ok) {
        clearDraft()
        onSuccess(name.trim())
      } else {
        if (result.fieldErrors) setFieldErrors(result.fieldErrors)
        setServerError(result.error)
      }
    })
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate
      className="rounded-2xl border border-[var(--border)]/60 bg-bg-card shadow-sm px-6 py-8 sm:px-8 sm:py-10 space-y-6"
      aria-label="Beitrittsformular"
    >
      {/* === E-Mail (required) === */}
      <div>
        <label
          htmlFor={`${formId}-email`}
          id={`${formId}-email-label`}
          className="block font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted mb-2"
        >
          E-MAIL
        </label>
        <input
          id={`${formId}-email`}
          name="email"
          type="email"
          required
          disabled={isPending}
          value={draft.email}
          onChange={(e) => updateField('email', e.target.value)}
          onBlur={handleTextBlur}
          autoComplete="email"
          placeholder="deine@uni.de"
          className="w-full rounded-2xl border border-[var(--border)] bg-bg px-4 py-3 text-text placeholder:text-text-muted focus-visible:outline-none focus-visible:border-[var(--border-accent)] transition-colors"
          style={{ fontSize: 'var(--fs-body)', minHeight: '44px' }}
          aria-invalid={!!fieldErrors.email}
          aria-describedby={
            fieldErrors.email ? `${formId}-email-error` : undefined
          }
        />
        {fieldErrors.email && (
          <p
            id={`${formId}-email-error`}
            role="alert"
            className="mt-1 text-sm"
            style={{ color: 'var(--status-error)' }}
          >
            {fieldErrors.email}
          </p>
        )}
      </div>

      {/* === Vor- und Nachname (required, combined — D-02 minimal friction) === */}
      <div>
        <label
          htmlFor={`${formId}-name`}
          className="block font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted mb-2"
        >
          VOR- UND NACHNAME
        </label>
        <input
          id={`${formId}-name`}
          name="name"
          type="text"
          required
          disabled={isPending}
          value={draft.name}
          onChange={(e) => updateField('name', e.target.value)}
          onBlur={handleTextBlur}
          autoComplete="name"
          placeholder="Dein Name"
          className="w-full rounded-2xl border border-[var(--border)] bg-bg px-4 py-3 text-text placeholder:text-text-muted focus-visible:outline-none focus-visible:border-[var(--border-accent)] transition-colors"
          style={{ fontSize: 'var(--fs-body)', minHeight: '44px' }}
          aria-invalid={!!fieldErrors.name}
          aria-describedby={
            fieldErrors.name ? `${formId}-name-error` : undefined
          }
        />
        {fieldErrors.name && (
          <p
            id={`${formId}-name-error`}
            role="alert"
            className="mt-1 text-sm"
            style={{ color: 'var(--status-error)' }}
          >
            {fieldErrors.name}
          </p>
        )}
      </div>

      {/* === Hochschule / Ausbildung (required, UniCombobox aus Plan 23-04) === */}
      <div>
        <label
          htmlFor={`${formId}-university`}
          id={`${formId}-university-label`}
          className="block font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted mb-2"
        >
          HOCHSCHULE ODER AUSBILDUNG
        </label>
        <UniCombobox
          id={`${formId}-university`}
          name="university"
          value={draft.university}
          onChange={(v) => updateField('university', v)}
          onBlur={() => {
            const err = validateField('university', draft.university)
            setFieldErrors((prev) => ({
              ...prev,
              university: err || undefined,
            }))
          }}
          required
          disabled={isPending}
          error={fieldErrors.university}
          labelId={`${formId}-university-label`}
          describedById={
            fieldErrors.university ? `${formId}-university-error` : undefined
          }
          placeholder="Such deine Hochschule oder tipp frei"
        />
        {fieldErrors.university && (
          <p
            id={`${formId}-university-error`}
            role="alert"
            className="mt-1 text-sm"
            style={{ color: 'var(--status-error)' }}
          >
            {fieldErrors.university}
          </p>
        )}
      </div>

      {/* === Studiengang (optional, D-13) === */}
      <div>
        <label
          htmlFor={`${formId}-study_program`}
          className="block font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted mb-2"
        >
          STUDIENGANG
          <span className="ml-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted opacity-60">
            OPTIONAL
          </span>
        </label>
        <input
          id={`${formId}-study_program`}
          name="study_program"
          type="text"
          disabled={isPending}
          value={draft.study_program}
          onChange={(e) => updateField('study_program', e.target.value)}
          placeholder="z.B. Wirtschaftsinformatik"
          className="w-full rounded-2xl border border-[var(--border)] bg-bg px-4 py-3 text-text placeholder:text-text-muted focus-visible:outline-none focus-visible:border-[var(--border-accent)] transition-colors"
          style={{ fontSize: 'var(--fs-body)', minHeight: '44px' }}
        />
      </div>

      {/* === DSGVO-Consent (required, D-14) === */}
      <div>
        <label
          htmlFor={`${formId}-consent`}
          className="flex items-start gap-3 min-h-[44px] cursor-pointer"
        >
          <input
            id={`${formId}-consent`}
            name="consent"
            type="checkbox"
            required
            disabled={isPending}
            aria-required="true"
            className="mt-1 h-5 w-5 flex-shrink-0 rounded border border-[var(--border)] bg-bg checked:bg-[var(--accent-soft)] checked:border-[var(--border-accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text)]"
          />
          <span
            className="text-text-secondary leading-[1.5]"
            style={{ fontSize: 'var(--fs-body)' }}
          >
            Ich habe die{' '}
            <a
              href="/datenschutz"
              target="_blank"
              rel="noopener"
              className="underline hover:no-underline"
              style={{ color: 'var(--accent)' }}
            >
              Datenschutzerklärung
            </a>{' '}
            gelesen und stimme ihr zu.
          </span>
        </label>
        {fieldErrors.consent && (
          <p
            role="alert"
            className="mt-1 text-sm"
            style={{ color: 'var(--status-error)' }}
          >
            {fieldErrors.consent}
          </p>
        )}
      </div>

      {/*
        === Marketing-Opt-in (optional, default off, D-14) ===
        NOTE: field name is `marketing_opt_in` — matches Zod schema in
        Plan 23-03 + DB column in Plan 23-01. UI-SPEC line 337 has a typo
        (`marketing_consent`) — this plan is source of truth for the `name`.
        Checkbox state is tracked in draft.marketing_opt_in so R4.7
        SessionStorage hydration restores it on reload.
      */}
      <div>
        <label
          htmlFor={`${formId}-marketing`}
          className="flex items-start gap-3 min-h-[44px] cursor-pointer"
        >
          <input
            id={`${formId}-marketing`}
            name="marketing_opt_in"
            type="checkbox"
            disabled={isPending}
            checked={draft.marketing_opt_in}
            onChange={(e) => updateField('marketing_opt_in', e.target.checked)}
            className="mt-1 h-5 w-5 flex-shrink-0 rounded border border-[var(--border)] bg-bg checked:bg-[var(--accent-soft)] checked:border-[var(--border-accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text)]"
          />
          <span
            className="text-text-secondary leading-[1.5]"
            style={{ fontSize: 'var(--fs-body)' }}
          >
            Ich möchte über Events und Neuigkeiten per E-Mail informiert werden.
          </span>
        </label>
      </div>

      {/* === Honeypot (spam protection) === */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        aria-hidden="true"
        className="sr-only"
        autoComplete="off"
      />

      {/*
        === redirect_after passthrough (D-03) ===
        WR-06: `redirect_after` is captured from the URL query param and
        persisted to the `waitlist` row by the Server Action (see
        app/actions/waitlist.ts). V1 does NOT consume it in the success UX
        (JoinSuccessCard hardcodes `/test` per D-15). Phase 25 Circle-Auth-
        Sync is the intended consumer: it reads the stored value during user
        activation to route the user back to the page they originally came
        from (e.g. `/events/[slug]` from the Phase 22.5 events gate).
        Validation against open-redirect is done server-side in CR-01; the
        consumer in Phase 25 MUST still re-validate the origin before
        navigating (`new URL(v, 'https://generation-ai.org').origin`).
      */}
      {redirectAfter && (
        <input type="hidden" name="redirect_after" value={redirectAfter} />
      )}

      {/* === Server error banner === */}
      {serverError && (
        <div
          role="alert"
          aria-live="polite"
          className="rounded-2xl border px-4 py-3 text-sm"
          style={{
            borderColor: 'var(--status-error)',
            color: 'var(--status-error)',
            background: 'rgba(220, 38, 38, 0.08)',
          }}
        >
          {serverError}
        </div>
      )}

      {/* === Submit === */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-full px-6 py-3 font-mono font-bold text-[14px] tracking-[0.02em] bg-[var(--accent)] text-[var(--text-on-accent)] hover:scale-[1.03] hover:shadow-[0_0_20px_var(--accent-glow)] active:scale-[0.98] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none mt-2"
        style={{
          minHeight: '44px',
        }}
      >
        {isPending ? (
          <span className="inline-flex items-center justify-center gap-2">
            <svg
              className="h-4 w-4 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeOpacity="0.25"
                strokeWidth="4"
              />
              <path
                d="M12 2a10 10 0 0 1 10 10"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
            <span>Einen Moment…</span>
            <span className="sr-only">Formular wird gesendet</span>
          </span>
        ) : (
          'Kostenlos beitreten'
        )}
      </button>
    </form>
  )
}
