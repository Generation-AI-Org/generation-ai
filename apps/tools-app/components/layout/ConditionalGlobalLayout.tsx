'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import GlobalLayout from '@/components/layout/GlobalLayout'
import type { ChatMode } from '@/lib/types'

/**
 * Routes that should render WITHOUT the GlobalLayout (no Header, no Chat).
 * Currently: `/login`. Legal-Seiten + Settings bekommen bewusst den globalen
 * Shell — Chat ist dort hilfreich statt störend.
 */
const BARE_ROUTES = ['/login']

interface Props {
  mode: ChatMode
  children: ReactNode
}

export default function ConditionalGlobalLayout({ mode, children }: Props) {
  const pathname = usePathname()
  const isBare = BARE_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/'),
  )

  if (isBare) return <>{children}</>
  return <GlobalLayout mode={mode}>{children}</GlobalLayout>
}
