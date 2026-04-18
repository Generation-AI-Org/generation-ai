import { getPublishedTools } from '@/lib/content'
import HomeLayout from '@/components/HomeLayout'

// Auth-dependent page must be dynamic
export const dynamic = 'force-dynamic'

export default async function Home() {
  const items = await getPublishedTools()

  return <HomeLayout items={items} />
}
