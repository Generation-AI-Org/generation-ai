import { NextRequest, NextResponse } from 'next/server'

// TEMPORARILY DISABLED — restore from git history to re-enable signups
export async function POST(_request: NextRequest) {
  return NextResponse.json(
    { error: 'Anmeldung ist momentan geschlossen. Wir öffnen bald wieder!' },
    { status: 503 }
  )
}
