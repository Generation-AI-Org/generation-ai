'use client'

import React, { useState, useEffect } from 'react'
import { Mic } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'

interface VoiceInputButtonProps {
  isRecording: boolean
  isConnecting?: boolean
  isSupported: boolean
  onToggle: () => void
  className?: string
  audioLevels?: number[]
}

export function VoiceInputButton({
  isRecording,
  isConnecting = false,
  isSupported,
  onToggle,
  className = '',
  audioLevels = [],
}: VoiceInputButtonProps) {
  const [time, setTime] = useState(0)

  // Timer for recording duration
  useEffect(() => {
    let intervalId: NodeJS.Timeout

    if (isRecording) {
      intervalId = setInterval(() => {
        setTime((t) => t + 1)
      }, 1000)
    } else {
      setTime(0)
    }

    return () => clearInterval(intervalId)
  }, [isRecording])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <motion.button
        type="button"
        onClick={onToggle}
        disabled={!isSupported}
        className={`flex p-2 items-center justify-center rounded-full cursor-pointer transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
          isRecording
            ? 'bg-red-500/20 border border-red-500/50'
            : 'hover:bg-[var(--accent)]/10 border border-transparent hover:border-[var(--accent)]/30'
        }`}
        layout
        transition={{
          layout: {
            duration: 0.4,
          },
        }}
        title={isSupported ? (isConnecting ? 'Verbinde...' : isRecording ? 'Aufnahme stoppen' : 'Spracheingabe starten') : 'Nicht unterstützt'}
      >
        <div className="h-5 w-5 items-center justify-center flex">
          {isConnecting ? (
            <motion.div
              className="w-4 h-4 border-2 border-[var(--accent)]/30 border-t-[var(--accent)] rounded-full"
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Number.POSITIVE_INFINITY,
                ease: 'linear',
              }}
            />
          ) : isRecording ? (
            <motion.div
              className="w-3 h-3 bg-red-500 rounded-sm"
              animate={{
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: 'easeInOut',
              }}
            />
          ) : (
            <Mic className="w-4 h-4 text-[var(--accent)]/60 group-hover:text-[var(--accent)]" />
          )}
        </div>
        <AnimatePresence mode="wait">
          {isRecording && (
            <motion.div
              initial={{ opacity: 0, width: 0, marginLeft: 0 }}
              animate={{ opacity: 1, width: 'auto', marginLeft: 8 }}
              exit={{ opacity: 0, width: 0, marginLeft: 0 }}
              transition={{
                duration: 0.4,
              }}
              className="overflow-hidden flex gap-2 items-center justify-center"
            >
              {/* Frequency Animation - Real Audio Bars */}
              <div className="flex gap-0.5 items-center justify-center">
                {Array.from({ length: 12 }).map((_, i) => {
                  const level = audioLevels[i] ?? 0
                  const minHeight = 2
                  const maxHeight = 16
                  const height = minHeight + level * (maxHeight - minHeight)

                  return (
                    <motion.div
                      key={i}
                      className="w-0.5 bg-red-500 rounded-full"
                      animate={{ height }}
                      transition={{
                        duration: 0.05,
                        ease: 'linear',
                      }}
                    />
                  )
                })}
              </div>
              {/* Timer */}
              <div className="text-xs text-red-400 w-10 text-center font-mono">
                {formatTime(time)}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  )
}
