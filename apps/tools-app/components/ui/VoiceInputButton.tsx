'use client'

import React, { useState, useEffect } from 'react'
import { Mic } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'

interface VoiceInputButtonProps {
  isRecording: boolean
  isProcessing?: boolean
  isSupported: boolean
  onToggle: () => void
  className?: string
  audioLevels?: number[]
}

export function VoiceInputButton({
  isRecording,
  isProcessing = false,
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
        className={`group flex p-2 items-center justify-center rounded-full cursor-pointer transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
          isRecording
            ? 'bg-[var(--accent)]/15 border border-[var(--accent)]/40'
            : 'hover:bg-[var(--accent)]/10 border border-transparent hover:border-[var(--accent)]/30'
        }`}
        layout
        transition={{
          layout: {
            duration: 0.4,
          },
        }}
        title={isSupported ? (isProcessing ? 'Transkribiere...' : isRecording ? 'Aufnahme stoppen' : 'Spracheingabe starten') : 'Nicht unterstützt'}
      >
        <div className="h-5 w-5 items-center justify-center flex">
          {isProcessing ? (
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
              className="w-3 h-3 bg-[var(--accent)] rounded-sm"
              animate={{
                scale: [1, 0.85, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Number.POSITIVE_INFINITY,
                ease: 'easeInOut',
              }}
            />
          ) : (
            <Mic className="w-4 h-4 text-[var(--accent)]/60 group-hover:text-[var(--accent)] transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-0.5" />
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
              {/* Frequency Animation - Real Audio Bars (GPU-accelerated via scaleY) */}
              <div className="flex gap-0.5 items-end justify-center h-4">
                {Array.from({ length: 12 }).map((_, i) => {
                  const level = audioLevels[i] ?? 0
                  const scale = 0.15 + level * 0.85 // 15% min, 100% max

                  return (
                    <div
                      key={i}
                      className="w-0.5 h-full bg-[var(--accent)] rounded-full origin-bottom will-change-transform"
                      style={{
                        transform: `scaleY(${scale})`,
                        transition: 'transform 0.05s linear',
                      }}
                    />
                  )
                })}
              </div>
              {/* Timer */}
              <div className="text-xs text-[var(--accent)] w-10 text-center font-mono">
                {formatTime(time)}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  )
}
