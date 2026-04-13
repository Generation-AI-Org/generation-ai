'use client'

import Image from 'next/image'
import { useTheme } from '@/components/ThemeProvider'

export default function DetailHeaderLogo() {
  const { theme } = useTheme()

  return (
    <Image
      src={theme === 'dark' ? '/logo-blue-neon-new.jpg' : '/logo-pink-red.jpg'}
      alt="Generation AI"
      width={120}
      height={36}
      className="h-9 w-auto object-contain"
      priority
      key={theme}
    />
  )
}
