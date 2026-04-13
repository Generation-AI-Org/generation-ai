'use client'

import { useEffect, useState, useCallback } from 'react'

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*<>[]{}αβγδεζηθ'

interface TextScrambleProps {
  text: string
  className?: string
  /** Trigger scramble on hover */
  scrambleOnHover?: boolean
  /** Auto-scramble on mount */
  autoScramble?: boolean
  /** Speed in ms per frame */
  speed?: number
}

export function TextScramble({
  text,
  className = '',
  scrambleOnHover = true,
  autoScramble = true,
  speed = 30,
}: TextScrambleProps) {
  const [displayText, setDisplayText] = useState(text)
  const [isScrambling, setIsScrambling] = useState(false)

  const scramble = useCallback(() => {
    if (isScrambling) return
    setIsScrambling(true)

    const duration = text.length * 3
    let frame = 0

    const interval = setInterval(() => {
      frame++
      const progress = frame / duration
      const revealedLength = Math.floor(progress * text.length)

      const newText = text
        .split('')
        .map((char, i) => {
          if (char === ' ') return ' '
          if (i < revealedLength) return text[i]
          return CHARS[Math.floor(Math.random() * CHARS.length)]
        })
        .join('')

      setDisplayText(newText)

      if (frame >= duration) {
        clearInterval(interval)
        setDisplayText(text)
        setIsScrambling(false)
      }
    }, speed)
  }, [text, speed, isScrambling])

  useEffect(() => {
    if (autoScramble) {
      const timeout = setTimeout(scramble, 500)
      return () => clearTimeout(timeout)
    }
  }, [autoScramble, scramble])

  return (
    <span
      className={`font-mono tracking-wider ${className}`}
      onMouseEnter={scrambleOnHover ? scramble : undefined}
    >
      {displayText}
    </span>
  )
}
