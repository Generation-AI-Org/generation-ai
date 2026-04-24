import * as Sentry from '@sentry/nextjs'

const DSN = process.env.SENTRY_DSN_WEBSITE

if (DSN) {
  Sentry.init({
    dsn: DSN,
    tracesSampleRate: 0.1,
    environment: process.env.VERCEL_ENV ?? 'development',
    beforeSend(event) {
      // Defense-in-depth: never let a CIRCLE_API_TOKEN substring leak
      // through to Sentry via message or extra payload.
      const stringified = JSON.stringify(event)
      if (stringified.includes('CIRCLE_API_TOKEN')) {
        return null
      }
      return event
    },
  })
} else if (process.env.NODE_ENV === 'production') {
  // eslint-disable-next-line no-console
  console.warn('[sentry] SENTRY_DSN_WEBSITE not set in production')
}
