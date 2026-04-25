import * as Sentry from '@sentry/nextjs'

const DSN = process.env.SENTRY_DSN_WEBSITE

if (DSN) {
  Sentry.init({
    dsn: DSN,
    tracesSampleRate: 0.1,
    environment: process.env.VERCEL_ENV ?? 'development',
  })
}
