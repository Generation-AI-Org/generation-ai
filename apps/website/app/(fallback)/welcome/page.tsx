import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getUser } from '@genai/auth/helpers'
import WelcomeClient from './welcome-client'

export const dynamic = 'force-dynamic'
export const metadata = {
  robots: { index: false, follow: false },
}

export default async function WelcomePage({
  searchParams,
}: {
  searchParams: Promise<{ circle?: string }>
}) {
  const hdrs = await headers()
  const nonce = hdrs.get('x-nonce') ?? ''
  const params = await searchParams

  const user = await getUser()
  if (!user) {
    redirect('/')
  }

  const communityUrl = process.env.CIRCLE_COMMUNITY_URL ?? 'https://community.generation-ai.org'
  const fullName = (user.user_metadata?.full_name as string) ?? null
  const showFallback = params.circle === 'pending'

  return (
    <WelcomeClient
      nonce={nonce}
      name={fullName}
      communityUrl={communityUrl}
      showFallback={showFallback}
    />
  )
}
