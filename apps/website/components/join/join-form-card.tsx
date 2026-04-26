'use client'

import { useState, useRef, useId, useTransition, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  submitJoinWaitlist,
  type WaitlistFieldErrors,
} from '@/app/actions/waitlist'
import { UniCombobox } from '@/components/join/uni-combobox'
import { readStoredAssessmentResult } from '@/lib/assessment/storage'
import type { Level, LevelSlug } from '@/lib/assessment/types'
import { OTHER_UNIVERSITY, UNIVERSITIES } from '@/lib/universities'

// ---------------------------------------------------------------------------
// R4.7 — SessionStorage draft persistence
// ---------------------------------------------------------------------------

const DRAFT_KEY = 'join-form-draft'

type ApplicantStatus = 'student' | 'working' | 'alumni' | 'other'

interface FormDraft {
  email: string
  name: string
  status: ApplicantStatus
  university: string
  university_other: string
  study_field: string
  study_field_other: string
  marketing_opt_in: boolean
}

const emptyDraft: FormDraft = {
  email: '',
  name: '',
  status: 'student',
  university: '',
  university_other: '',
  study_field: '',
  study_field_other: '',
  marketing_opt_in: false,
}

const statusOptions: Array<{
  value: ApplicantStatus
  label: string
  helper: string
}> = [
  {
    value: 'student',
    label: 'Studierend',
    helper: 'Ich studiere aktuell.',
  },
  {
    value: 'working',
    label: 'Berufstätig',
    helper: 'Ich arbeite gerade.',
  },
  {
    value: 'alumni',
    label: 'Alumni',
    helper: 'Ich habe mein Studium abgeschlossen.',
  },
  {
    value: 'other',
    label: 'Sonstiges',
    helper: 'Ich passe in keine Kategorie.',
  },
]

const studyFieldOptions = [
  'BWL / Wirtschaft',
  'Informatik',
  'Medien / Kommunikation',
  'Ingenieurwissenschaften',
  'Naturwissenschaften',
  'Medizin / Gesundheit',
  'Recht',
  'Lehramt',
  'Sozialwissenschaften',
  'Design / Kunst',
  'Geisteswissenschaften',
  'Sonstiges',
]

const levelBySlug: Record<LevelSlug, Level> = {
  neugieriger: 1,
  einsteiger: 2,
  fortgeschritten: 3,
  pro: 4,
  expert: 5,
}

function isLevelSlug(value: string | null): value is LevelSlug {
  return (
    value === 'neugieriger' ||
    value === 'einsteiger' ||
    value === 'fortgeschritten' ||
    value === 'pro' ||
    value === 'expert'
  )
}

function isApplicantStatus(value: unknown): value is ApplicantStatus {
  return (
    value === 'student' ||
    value === 'working' ||
    value === 'alumni' ||
    value === 'other'
  )
}

function readDraft(): FormDraft | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.sessionStorage.getItem(DRAFT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<FormDraft> & {
      study_program?: unknown
    }
    return {
      email: typeof parsed.email === 'string' ? parsed.email : '',
      name: typeof parsed.name === 'string' ? parsed.name : '',
      status: isApplicantStatus(parsed.status) ? parsed.status : 'student',
      university:
        typeof parsed.university === 'string' ? parsed.university : '',
      university_other:
        typeof parsed.university_other === 'string'
          ? parsed.university_other
          : '',
      study_field:
        typeof parsed.study_field === 'string'
          ? parsed.study_field
          : typeof parsed.study_program === 'string'
            ? parsed.study_program
            : '',
      study_field_other:
        typeof parsed.study_field_other === 'string'
          ? parsed.study_field_other
          : '',
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
  compact?: boolean
  onSuccess: (name: string) => void
}

export function JoinFormCard({ compact = false, onSuccess }: JoinFormCardProps) {
  const formId = useId()
  const formRef = useRef<HTMLFormElement>(null)
  const searchParams = useSearchParams()
  const redirectAfter = searchParams.get('redirect_after') ?? ''
  const source = searchParams.get('source')
  const pre = searchParams.get('pre')
  const skills = searchParams.get('skills')

  // --- Controlled form state ---
  // Start from emptyDraft to keep SSR markup deterministic, then hydrate
  // from sessionStorage in a mount-only useEffect (avoids hydration mismatch).
  const [draft, setDraft] = useState<FormDraft>(emptyDraft)
  const [hydrated, setHydrated] = useState(false)
  const [storedTestResultPayload, setStoredTestResultPayload] = useState('')

  const [isPending, startTransition] = useTransition()
  const [serverError, setServerError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<WaitlistFieldErrors>({})
  const needsUniversity =
    draft.status === 'student' || draft.status === 'alumni'
  const hasCustomUniversity =
    !!draft.university && !UNIVERSITIES.includes(draft.university)
  const showUniversityOther =
    draft.university === OTHER_UNIVERSITY || hasCustomUniversity
  const showStudyFieldOther = draft.study_field === 'Sonstiges'

  // R4.7 — Hydrate from sessionStorage on mount (client-only, post-SSR)
  useEffect(() => {
    const stored = readDraft()
    if (stored) setDraft(stored)
    const storedTestResult = readStoredAssessmentResult()
    if (storedTestResult) {
      setStoredTestResultPayload(JSON.stringify(storedTestResult))
    }
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

  const updateField = <K extends keyof FormDraft>(
    key: K,
    value: FormDraft[K],
  ) => {
    setDraft((prev) => ({ ...prev, [key]: value }))
  }

  const updateStatus = (status: ApplicantStatus) => {
    setDraft((prev) => ({
      ...prev,
      status,
      university: status === 'working' ? '' : prev.university,
      university_other: status === 'working' ? '' : prev.university_other,
    }))
    setFieldErrors((prev) => ({
      ...prev,
      status: undefined,
      university: undefined,
    }))
  }

  const updateStudyField = (studyField: string) => {
    setDraft((prev) => ({
      ...prev,
      study_field: studyField,
      study_field_other:
        studyField === 'Sonstiges' ? prev.study_field_other : '',
    }))
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
    if (name === 'name' && !value.trim())
      return 'Das Feld darf nicht leer sein.'
    if (name === 'university' && needsUniversity && !value.trim())
      return 'Das Feld darf nicht leer sein.'
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
    const universityRaw = ((formData.get('university') as string) ?? '').trim()
    const normalizedUniversity =
      universityRaw && !UNIVERSITIES.includes(universityRaw)
        ? OTHER_UNIVERSITY
        : universityRaw

    if (normalizedUniversity !== universityRaw) {
      formData.set('university', normalizedUniversity)
      formData.set('university_other', universityRaw)
    } else if (normalizedUniversity !== OTHER_UNIVERSITY) {
      formData.delete('university_other')
    }

    const studyField = ((formData.get('study_field') as string) ?? '').trim()
    const studyFieldOther = (
      (formData.get('study_field_other') as string) ?? ''
    ).trim()
    const universityOther = (
      (formData.get('university_other') as string) ?? ''
    ).trim()
    const contextParts = [
      studyField === 'Sonstiges' && studyFieldOther
        ? `Studienfeld: ${studyFieldOther}`
        : '',
      normalizedUniversity === OTHER_UNIVERSITY && universityOther
        ? `Hochschule: ${universityOther}`
        : '',
    ].filter(Boolean)

    formData.set(
      'study_program',
      contextParts.length > 0 ? contextParts.join(' | ') : studyField,
    )
    if (studyField !== 'Sonstiges') formData.delete('study_field_other')

    // Client-side pre-check required fields (server revalidates anyway)
    const email = (formData.get('email') as string) ?? ''
    const name = (formData.get('name') as string) ?? ''
    const uni = (formData.get('university') as string) ?? ''
    const status = (formData.get('status') as string) ?? ''
    const consent =
      formData.get('consent') === 'on' || formData.get('consent') === 'true'

    const clientErrors: WaitlistFieldErrors = {}
    const e1 = validateField('email', email)
    if (e1) clientErrors.email = e1
    const e2 = validateField('name', name)
    if (e2) clientErrors.name = e2
    if (!isApplicantStatus(status))
      clientErrors.status = 'Wähl eine Option aus.'
    const e3 = validateField('university', uni)
    if (e3) clientErrors.university = e3
    if (!consent)
      clientErrors.consent =
        'Du musst der Datenschutzerklärung zustimmen, um fortzufahren.'

    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors)
      // Focus first invalid field (A11y: WCAG 2.4.3)
      const firstErrorName = Object.keys(clientErrors)[0]
      const input = form.querySelector<HTMLElement>(
        `[name="${firstErrorName}"]`,
      )
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
      className={
        compact
          ? 'space-y-2.5 rounded-2xl border border-[var(--border)]/60 bg-bg-card px-4 py-4 shadow-sm sm:space-y-3 sm:px-5 sm:py-5'
          : 'space-y-6 rounded-2xl border border-[var(--border)]/60 bg-bg-card px-6 py-8 shadow-sm sm:px-8 sm:py-10'
      }
      aria-label="Beitrittsformular"
    >
      {/* === E-Mail (required) === */}
      <div>
        <label
          htmlFor={`${formId}-email`}
          id={`${formId}-email-label`}
          className={`block font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted ${compact ? 'mb-1.5' : 'mb-2'}`}
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
          className={`w-full rounded-2xl border border-[var(--border)] bg-bg px-4 text-text placeholder:text-text-muted transition-colors focus-visible:border-[var(--border-accent)] focus-visible:outline-none ${compact ? 'py-2.5' : 'py-3'}`}
          style={{
            fontSize: 'var(--fs-body)',
            minHeight: compact ? '40px' : '44px',
          }}
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
          className={`block font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted ${compact ? 'mb-1.5' : 'mb-2'}`}
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
          className={`w-full rounded-2xl border border-[var(--border)] bg-bg px-4 text-text placeholder:text-text-muted transition-colors focus-visible:border-[var(--border-accent)] focus-visible:outline-none ${compact ? 'py-2.5' : 'py-3'}`}
          style={{
            fontSize: 'var(--fs-body)',
            minHeight: compact ? '40px' : '44px',
          }}
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

      {/* === Status-Switch (required, Phase 22.8-06) === */}
      <fieldset>
        <legend
          className={`block font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted ${compact ? 'mb-2' : 'mb-3'}`}
        >
          STATUS
        </legend>
        <div className="grid grid-cols-2 gap-2" role="radiogroup">
          {statusOptions.map((option) => {
            const selected = draft.status === option.value
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={selected}
                disabled={isPending}
                onClick={() => updateStatus(option.value)}
                className={`rounded-2xl border px-3 text-left transition-all duration-300 hover:scale-[1.015] hover:shadow-[0_0_20px_var(--accent-glow)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100 disabled:hover:shadow-none ${compact ? 'py-2 sm:py-2.5' : 'py-3'}`}
                style={{
                  borderColor: selected
                    ? 'var(--border-accent)'
                    : 'color-mix(in srgb, var(--border) 70%, transparent)',
                  background: selected ? 'var(--accent-soft)' : 'var(--bg)',
                }}
              >
                <span className="block font-mono text-[12px] font-bold uppercase tracking-[0.02em] text-text">
                  {option.label}
                </span>
                <span
                  className={`mt-1 block font-sans text-text-secondary ${compact ? 'text-[12px] leading-[1.2] sm:text-[13px] sm:leading-[1.25]' : 'text-sm leading-[1.35]'}`}
                >
                  {option.helper}
                </span>
              </button>
            )
          })}
        </div>
        <input type="hidden" name="status" value={draft.status} />
        {fieldErrors.status && (
          <p
            role="alert"
            className="mt-1 text-sm"
            style={{ color: 'var(--status-error)' }}
          >
            {fieldErrors.status}
          </p>
        )}
      </fieldset>

      {/* === Hochschule / Kontext (conditional, UniCombobox aus Plan 23-04) === */}
      {(needsUniversity || draft.status === 'other') && (
        <div>
          <label
            htmlFor={`${formId}-university`}
            id={`${formId}-university-label`}
            className={`block font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted ${compact ? 'mb-1.5' : 'mb-2'}`}
          >
            {draft.status === 'other' ? 'KONTEXT' : 'HOCHSCHULE'}
            {!needsUniversity && (
              <span className="ml-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted opacity-60">
                OPTIONAL
              </span>
            )}
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
            required={needsUniversity}
            disabled={isPending}
            error={fieldErrors.university}
            labelId={`${formId}-university-label`}
            describedById={
              fieldErrors.university ? `${formId}-university-error` : undefined
            }
            placeholder={
              draft.status === 'other'
                ? 'z.B. Gründer, Schüler, Quereinsteiger'
                : 'Such deine Hochschule'
            }
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
      )}

      {showUniversityOther && (
        <div>
          <label
            htmlFor={`${formId}-university-other`}
            className={`block font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted ${compact ? 'mb-1.5' : 'mb-2'}`}
          >
            Welche Hochschule?
            <span className="ml-2 opacity-60">OPTIONAL</span>
          </label>
          <input
            id={`${formId}-university-other`}
            name="university_other"
            type="text"
            disabled={isPending}
            value={
              hasCustomUniversity ? draft.university : draft.university_other
            }
            onChange={(e) =>
              hasCustomUniversity
                ? updateField('university', e.target.value)
                : updateField('university_other', e.target.value)
            }
            placeholder="z.B. HdM Stuttgart"
            className={`w-full rounded-2xl border border-[var(--border)] bg-bg px-4 text-text placeholder:text-text-muted transition-colors focus-visible:border-[var(--border-accent)] focus-visible:outline-none ${compact ? 'py-2.5' : 'py-3'}`}
            style={{
              fontSize: 'var(--fs-body)',
              minHeight: compact ? '40px' : '44px',
            }}
          />
        </div>
      )}

      {/* === Studienfeld (structured, Phase 22.8-06) === */}
      <div>
        <label
          htmlFor={`${formId}-study_field`}
          className={`block font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted ${compact ? 'mb-1.5' : 'mb-2'}`}
        >
          STUDIENFELD
          <span className="ml-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted opacity-60">
            OPTIONAL
          </span>
        </label>
        <select
          id={`${formId}-study_field`}
          name="study_field"
          disabled={isPending}
          value={draft.study_field}
          onChange={(e) => updateStudyField(e.target.value)}
          className={`w-full rounded-2xl border border-[var(--border)] bg-bg px-4 text-text placeholder:text-text-muted transition-colors focus-visible:border-[var(--border-accent)] focus-visible:outline-none ${compact ? 'py-2.5' : 'py-3'}`}
          style={{
            fontSize: 'var(--fs-body)',
            minHeight: compact ? '40px' : '44px',
          }}
        >
          <option value="">Auswählen</option>
          {studyFieldOptions.map((field) => (
            <option key={field} value={field}>
              {field}
            </option>
          ))}
        </select>
        {showStudyFieldOther && (
          <div className={compact ? 'mt-2' : 'mt-3'}>
            <label
              htmlFor={`${formId}-study-field-other`}
              className={`block font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted ${compact ? 'mb-1.5' : 'mb-2'}`}
            >
              Welches Studienfeld?
              <span className="ml-2 opacity-60">OPTIONAL</span>
            </label>
            <input
              id={`${formId}-study-field-other`}
              name="study_field_other"
              type="text"
              disabled={isPending}
              value={draft.study_field_other}
              onChange={(e) => updateField('study_field_other', e.target.value)}
              placeholder="z.B. Data Science, Psychologie"
              className={`w-full rounded-2xl border border-[var(--border)] bg-bg px-4 text-text placeholder:text-text-muted transition-colors focus-visible:border-[var(--border-accent)] focus-visible:outline-none ${compact ? 'py-2.5' : 'py-3'}`}
              style={{
                fontSize: 'var(--fs-body)',
                minHeight: compact ? '40px' : '44px',
              }}
            />
          </div>
        )}
        <input
          type="hidden"
          name="study_program"
          value={
            showStudyFieldOther && draft.study_field_other.trim()
              ? `Studienfeld: ${draft.study_field_other.trim()}`
              : draft.study_field
          }
        />
      </div>

      {/* === DSGVO-Consent (required, D-14) === */}
      <div>
        <label
          htmlFor={`${formId}-consent`}
          className={`flex cursor-pointer items-start gap-3 ${compact ? 'min-h-0' : 'min-h-[44px]'}`}
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
            style={{ fontSize: compact ? '15px' : 'var(--fs-body)' }}
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
          className={`flex cursor-pointer items-start gap-3 ${compact ? 'min-h-0' : 'min-h-[44px]'}`}
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
            style={{ fontSize: compact ? '15px' : 'var(--fs-body)' }}
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

      {source === 'test' && <input type="hidden" name="source" value="test" />}
      {isLevelSlug(pre) && (
        <>
          <input type="hidden" name="pre" value={pre} />
          <input type="hidden" name="level" value={levelBySlug[pre]} />
        </>
      )}
      {source === 'test' && skills && (
        <input type="hidden" name="skills" value={skills} />
      )}
      {storedTestResultPayload && (
        <input
          type="hidden"
          name="test_result"
          value={storedTestResultPayload}
        />
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
        className={`w-full rounded-full bg-[var(--accent)] px-6 font-mono text-[14px] font-bold tracking-[0.02em] text-[var(--text-on-accent)] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_20px_var(--accent-glow)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100 disabled:hover:shadow-none ${compact ? 'mt-1 py-2.5' : 'mt-2 py-3'}`}
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
