'use client'

import { useEffect, type ReactNode } from 'react'
import { useChatContext } from '@/components/layout/ChatContextProvider'
import type { ContentItem } from '@/lib/types'

interface Props {
  item: ContentItem
  children: ReactNode
}

/**
 * Client-wrapper for the /[slug] detail route. On mount, it publishes the tool's
 * metadata (slug/title/type/summary) into ChatContextProvider — that powers:
 * 1. FloatingChat Sidebar-Mode (400px rail on Desktop when expanded).
 * 2. Dynamic Empty-State ("Fragen zu {title}?" + 3 chips).
 * 3. System-Message-Prefix sent to /api/chat.
 *
 * On unmount (navigate away) we clear the context so Home/Settings fall back to
 * the floating/popup render path.
 */
export default function DetailPageShell({ item, children }: Props) {
  const { setChatContext } = useChatContext()

  useEffect(() => {
    setChatContext({
      slug: item.slug,
      title: item.title,
      type: item.type,
      summary: item.summary,
    })
    return () => setChatContext(null)
  }, [item.slug, item.title, item.type, item.summary, setChatContext])

  return <>{children}</>
}
