/**
 * Test-User-Credential-Loader.
 * Werte kommen aus .env.test.local (via dotenv in playwright.config).
 * Wenn fehlend → wirft explizit (damit Tests skip'en können via test.skip(!user.email)).
 */
type TestUser = {
  email: string
  password: string
}

export function getTestUser(): TestUser | null {
  const email = process.env.TEST_USER_EMAIL
  const password = process.env.TEST_USER_PASSWORD
  if (!email || !password) return null
  return { email, password }
}

export function requireTestUser(): TestUser {
  const u = getTestUser()
  if (!u) {
    throw new Error(
      "TEST_USER_EMAIL / TEST_USER_PASSWORD missing — copy .env.test.local.example to .env.test.local and fill in a real Supabase test user."
    )
  }
  return u
}
