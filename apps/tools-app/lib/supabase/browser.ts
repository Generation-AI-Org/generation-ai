import { createClient as createAuthClient } from '@genai/auth/browser'

export function createClient() {
  return createAuthClient({
    domain: '.generation-ai.org',
    path: '/',
    sameSite: 'lax',
    secure: true,
  })
}
