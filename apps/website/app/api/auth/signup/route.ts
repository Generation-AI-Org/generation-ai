import { NextRequest, NextResponse } from 'next/server'
import { submitJoinSignup } from '@/app/actions/signup'

/**
 * Phase 25 — Unified Signup POST endpoint.
 *
 * Accepts the same multipart/form-data shape as the /join form. Delegates
 * to the server action `submitJoinSignup` for identical behavior. Provided
 * as a REST surface for:
 *   - E2E tests that want to POST directly
 *   - Future native clients / admin tools
 *
 * Feature-flagged via SIGNUP_ENABLED (Q11). Default: 503.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  if (process.env.SIGNUP_ENABLED !== 'true') {
    return NextResponse.json(
      { error: 'Anmeldung ist momentan geschlossen. Wir öffnen bald wieder!' },
      { status: 503 },
    )
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const result = await submitJoinSignup(formData)
  if (result.ok) {
    return NextResponse.json({ ok: true })
  }
  return NextResponse.json(result, { status: 400 })
}
