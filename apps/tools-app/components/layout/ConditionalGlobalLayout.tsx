'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import GlobalLayout from '@/components/layout/GlobalLayout'
import { ChatContextProvider } from '@/components/layout/ChatContextProvider'
import type { ChatMode } from '@/lib/types'

/**
 * Routes that should render WITHOUT the GlobalLayout (no Header, no Chat).
 * Legal-Seiten sind reading-only — kein Chat-Noise.
 */
const BARE_ROUTES = ['/login', '/impressum', '/datenschutz']

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
  return (
    <ChatContextProvider>
      <GlobalLayout mode={mode}>{children}</GlobalLayout>
    </ChatContextProvider>
  )
}
