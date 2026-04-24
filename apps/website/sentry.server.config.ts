import * as Sentry from '@sentry/nextjs'

const DSN = process.env.SENTRY_DSN_WEBSITE

/**
 * REVIEW MD-01 — Defense-in-depth secret denylist.
 *
 * Each entry lists:
 *   - `name`: the env-var NAME (caught if Sentry stringifies a stack frame
 *     that references it literally — e.g. a 500 body that contains
 *     "CIRCLE_API_TOKEN must be set").
 *   - `value()`: the actual secret VALUE resolved at module init. If the
 *     value ever appears inside a serialized Sentry event (a misconfigured
 *     gateway echoing the Bearer token back, a stack-frame leaking the
 *     literal), the whole event is dropped.
 *
 * The denylist is initialised once at module-load and frozen — adding a new
 * secret env var should mean adding an entry here, not a downstream
 * scrubber.
 */
const SECRET_ENV_VARS = [
  'CIRCLE_API_TOKEN',
  'SUPABASE_SERVICE_ROLE_KEY',
  'RESEND_API_KEY',
  'UPSTASH_REDIS_REST_TOKEN',
] as const

const SECRET_VALUES: readonly string[] = SECRET_ENV_VARS
  .map((name) => process.env[name])
  .filter((v): v is string => typeof v === 'string' && v.length > 0)

function eventContainsSecret(event: unknown): boolean {
  const s = JSON.stringify(event)
  for (const name of SECRET_ENV_VARS) {
    if (s.includes(name)) return true
  }
  for (const value of SECRET_VALUES) {
    if (s.includes(value)) return true
  }
  return false
}

if (DSN) {
  Sentry.init({
    dsn: DSN,
    tracesSampleRate: 0.1,
    environment: process.env.VERCEL_ENV ?? 'development',
    // REVIEW MD-01 — keep PII out of error-tracking unless strictly
    // necessary. `sendDefaultPii: false` is Sentry's default, but making it
    // explicit prevents accidental re-enablement from leaking IP + cookies.
    sendDefaultPii: false,
    beforeSend(event) {
      return eventContainsSecret(event) ? null : event
    },
    beforeBreadcrumb(breadcrumb) {
      return eventContainsSecret(breadcrumb) ? null : breadcrumb
    },
  })
} else if (process.env.NODE_ENV === 'production') {
  console.warn('[sentry] SENTRY_DSN_WEBSITE not set in production')
}
