'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'
import type { ChatContext } from '@/lib/types'

interface ChatContextValue {
  chatContext: ChatContext | null
  setChatContext: (ctx: ChatContext | null) => void
}

const Ctx = createContext<ChatContextValue | null>(null)

export function ChatContextProvider({ children }: { children: ReactNode }) {
  const [chatContext, setChatContext] = useState<ChatContext | null>(null)
  return (
    <Ctx.Provider value={{ chatContext, setChatContext }}>
      {children}
    </Ctx.Provider>
  )
}

/**
 * Safe consumer: returns a no-op if called outside a provider (e.g. /login bare route
 * or tests). Detail pages that mutate context must be wrapped in ChatContextProvider
 * — which ConditionalGlobalLayout does for all non-bare routes.
 */
export function useChatContext(): ChatContextValue {
  const v = useContext(Ctx)
  if (!v) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[ChatContextProvider] useChatContext called outside provider — returning no-op.')
    }
    return { chatContext: null, setChatContext: () => {} }
  }
  return v
}
