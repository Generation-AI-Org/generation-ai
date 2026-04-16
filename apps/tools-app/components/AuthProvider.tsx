'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { User } from '@supabase/supabase-js'
import { createBrowserClient } from '@genai/auth'

type AuthContextType = {
  user: User | null
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType>({ user: null, isLoading: false })

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({
  children,
  initialUser,
}: {
  children: ReactNode
  initialUser: User | null
}) {
  const [user, setUser] = useState<User | null>(initialUser)
  const [isLoading, setIsLoading] = useState(false) // false! initialUser is ready
  const supabase = createBrowserClient()

  useEffect(() => {
    // Sync with initialUser on SSR navigation
    setUser(initialUser)

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [initialUser, supabase.auth])

  return (
    <AuthContext.Provider value={{ user, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}
