// Phase 25 — Sentry instrumentation entry.
// Exports `register` so Next.js 16 loads Sentry per runtime, and
// `onRequestError` so Route-Handler errors are reported.

import * as Sentry from '@sentry/nextjs'

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config')
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config')
  }
}

export const onRequestError = Sentry.captureRequestError
