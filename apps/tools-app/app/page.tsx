import { getPublishedTools } from '@/lib/content'
import { getUser } from '@/lib/auth'
import AppShell from '@/components/AppShell'
import type { ChatMode } from '@/lib/types'

export const revalidate = 60

export default async function Home() {
  const [items, user] = await Promise.all([
    getPublishedTools(),
    getUser(),
  ])

  const mode: ChatMode = user ? 'member' : 'public'

  return <AppShell items={items} mode={mode} />
}
