'use client'

import { Logo } from '@genai/ui'
import { useTheme } from '@/components/ThemeProvider'

export default function DetailHeaderLogo() {
  const { theme } = useTheme()
  return <Logo context="header" theme={theme} size="md" />
}
