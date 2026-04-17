import { NextRequest, NextResponse } from 'next/server'

// DISABLED BY DESIGN — pre-launch, we do not accept public signups yet.
// Restore from git history when ready to open signups to the community.
export async function POST(_request: NextRequest) {
  return NextResponse.json(
    { error: 'Anmeldung ist momentan geschlossen. Wir öffnen bald wieder!' },
    { status: 503 }
  )
}
