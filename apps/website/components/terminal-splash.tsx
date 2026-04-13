'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'

interface TerminalSplashProps {
  onComplete: () => void
  skipIfSeen?: boolean
  enableSound?: boolean
}

const TYPING_SPEED = 45 // Faster typing
const OUTPUT_DELAY = 250
const COMMAND_DELAY = 500

// ASCII Art Logo - styled like the brand (stacked GENER/ATION/AI)
const ASCII_LOGO = `
 ██████╗ ███████╗███╗   ██╗███████╗██████╗
██╔════╝ ██╔════╝████╗  ██║██╔════╝██╔══██╗
██║  ███╗█████╗  ██╔██╗ ██║█████╗  ██████╔╝
██║   ██║██╔══╝  ██║╚██╗██║██╔══╝  ██╔══██╗
╚██████╔╝███████╗██║ ╚████║███████╗██║  ██║
 ╚═════╝ ╚══════╝╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝
 █████╗ ████████╗██╗ ██████╗ ███╗   ██╗
██╔══██╗╚══██╔══╝██║██╔═══██╗████╗  ██║
███████║   ██║   ██║██║   ██║██╔██╗ ██║
██╔══██║   ██║   ██║██║   ██║██║╚██╗██║
██║  ██║   ██║   ██║╚██████╔╝██║ ╚████║
╚═╝  ╚═╝   ╚═╝   ╚═╝ ╚═════╝ ╚═╝  ╚═══╝
       █████╗ ██╗
      ██╔══██╗██║
      ███████║██║
      ██╔══██║██║
      ██║  ██║██║
      ╚═╝  ╚═╝╚═╝
`

// Progress bar component for launch animation
const LaunchProgressBar = ({ progress }: { progress: number }) => {
  const filled = Math.floor(progress / 5) // 20 blocks total
  const empty = 20 - filled
  return (
    <div className="font-mono">
      <span className="text-[#6c6c6c]">[</span>
      <span className="text-[#96d461]">{'█'.repeat(filled)}</span>
      <span className="text-[#3a3a3c]">{'░'.repeat(empty)}</span>
      <span className="text-[#6c6c6c]">]</span>
      <span className="text-[#78dce8] ml-2">{progress}%</span>
      <span className="text-[#a0a0a0] ml-2">Launching...</span>
    </div>
  )
}

// Commands with their outputs
const COMMANDS = [
  {
    text: 'init community --dach',
    outputs: [
      '✓ Loading community modules',
      '✓ Community initialized',
    ],
  },
  {
    text: 'connect --students',
    outputs: [
      '✓ Found 100+ students in DACH',
      '✓ Connection ready',
    ],
    delayBeforeTyping: 1500, // Pause after prompt appears, before typing starts
  },
]

// Audio sprite offsets [offset_ms, duration_ms] - from Aceternity
const KEY_SOUNDS: Record<string, [number, number]> = {
  A: [31542, 85], B: [40621, 107], C: [39632, 95], D: [32492, 85],
  E: [23317, 83], F: [32973, 87], G: [33453, 94], H: [33986, 93],
  I: [25795, 91], J: [34425, 88], K: [34932, 90], L: [35410, 95],
  M: [41610, 93], N: [41103, 90], O: [26309, 84], P: [26804, 83],
  Q: [22245, 95], R: [23817, 92], S: [32031, 88], T: [24297, 92],
  U: [25313, 95], V: [40136, 94], W: [22790, 89], X: [39148, 76],
  Y: [24811, 93], Z: [38694, 80], ' ': [51541, 144], '-': [42594, 90],
}

const SOUND_FILE = '/sounds/sound.ogg'
const USERNAME = 'student'

// Custom hook for Web Audio API sound
function useKeyboardSound(enabled: boolean) {
  const ctxRef = useRef<AudioContext | null>(null)
  const bufferRef = useRef<AudioBuffer | null>(null)
  const readyRef = useRef(false)

  useEffect(() => {
    if (!enabled) return

    const init = async () => {
      try {
        ctxRef.current = new AudioContext()
        const res = await fetch(SOUND_FILE)
        if (!res.ok) return
        bufferRef.current = await ctxRef.current.decodeAudioData(await res.arrayBuffer())
        readyRef.current = true
      } catch {
        // Silently fail if audio can't be loaded
      }
    }
    init()

    return () => {
      ctxRef.current?.close()
    }
  }, [enabled])

  const playKey = useCallback((key: string) => {
    if (!readyRef.current || !ctxRef.current || !bufferRef.current) return

    // Resume context if suspended (browser autoplay policy)
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume()
    }

    const sound = KEY_SOUNDS[key.toUpperCase()] || KEY_SOUNDS[key] || KEY_SOUNDS['A']
    if (!sound) return

    try {
      const src = ctxRef.current.createBufferSource()
      src.buffer = bufferRef.current

      // Add gain node for volume control
      const gain = ctxRef.current.createGain()
      gain.gain.value = 0.8
      src.connect(gain)
      gain.connect(ctxRef.current.destination)

      // Play from offset for duration (convert ms to seconds)
      src.start(0, sound[0] / 1000, sound[1] / 1000)
    } catch {
      // Ignore playback errors
    }
  }, [])

  return { playKey, isReady: () => readyRef.current }
}

export function TerminalSplash({
  onComplete,
  skipIfSeen = true,
  enableSound = true,
}: TerminalSplashProps) {
  // Mounted state to avoid hydration mismatch
  const [mounted, setMounted] = useState(false)
  const [shouldSkip, setShouldSkip] = useState(false)

  // State
  const [currentCommandIndex, setCurrentCommandIndex] = useState(0)
  const [typedText, setTypedText] = useState('')
  const [visibleOutputs, setVisibleOutputs] = useState<number>(0)
  const [phase, setPhase] = useState<'start' | 'typing' | 'output' | 'prompt' | 'waiting' | 'launching'>('start')
  const [isExiting, setIsExiting] = useState(false)
  const [history, setHistory] = useState<Array<{ command: string; outputs: string[] }>>([])
  const [cursorVisible, setCursorVisible] = useState(true)
  const [launchProgress, setLaunchProgress] = useState(0)

  // Audio
  const { playKey } = useKeyboardSound(enableSound && mounted)

  const currentCommand = COMMANDS[currentCommandIndex]

  // Faster cursor blink (300ms instead of default)
  useEffect(() => {
    const interval = setInterval(() => setCursorVisible(v => !v), 300)
    return () => clearInterval(interval)
  }, [])

  // Mount check
  useEffect(() => {
    setMounted(true)
    if (skipIfSeen) {
      const seen = sessionStorage.getItem('terminal-splash-seen')
      if (seen) {
        setShouldSkip(true)
        onComplete()
      }
    }
  }, [skipIfSeen, onComplete])

  // Typing animation
  useEffect(() => {
    if (!mounted || shouldSkip || phase !== 'typing' || !currentCommand) return

    if (typedText.length < currentCommand.text.length) {
      const nextChar = currentCommand.text[typedText.length]
      const timeout = setTimeout(() => {
        playKey(nextChar)
        setTypedText(currentCommand.text.slice(0, typedText.length + 1))
      }, TYPING_SPEED + Math.random() * 30) // More variance for natural feel
      return () => clearTimeout(timeout)
    } else {
      setPhase('output')
    }
  }, [mounted, shouldSkip, phase, typedText, currentCommand, playKey])

  // Output animation
  useEffect(() => {
    if (!mounted || shouldSkip || phase !== 'output' || !currentCommand) return

    if (visibleOutputs < currentCommand.outputs.length) {
      const timeout = setTimeout(() => {
        setVisibleOutputs(v => v + 1)
      }, OUTPUT_DELAY)
      return () => clearTimeout(timeout)
    } else {
      const timeout = setTimeout(() => {
        setHistory(h => [...h, { command: currentCommand.text, outputs: currentCommand.outputs }])
        if (currentCommandIndex < COMMANDS.length - 1) {
          setCurrentCommandIndex(i => i + 1)
          setTypedText('')
          setVisibleOutputs(0)
          // Check if next command has a delay before typing
          const nextCommand = COMMANDS[currentCommandIndex + 1]
          if (nextCommand?.delayBeforeTyping) {
            setPhase('prompt') // Show prompt, wait, then type
          } else {
            setPhase('typing')
          }
        } else {
          setPhase('waiting')
        }
      }, COMMAND_DELAY)
      return () => clearTimeout(timeout)
    }
  }, [mounted, shouldSkip, phase, visibleOutputs, currentCommand, currentCommandIndex])

  // Prompt delay - wait after prompt appears before typing
  useEffect(() => {
    if (!mounted || shouldSkip || phase !== 'prompt' || !currentCommand) return

    const delay = currentCommand.delayBeforeTyping ?? COMMAND_DELAY
    const timeout = setTimeout(() => {
      setPhase('typing')
    }, delay)
    return () => clearTimeout(timeout)
  }, [mounted, shouldSkip, phase, currentCommand])

  // Handle keyboard
  useEffect(() => {
    if (!mounted) return
    const handleKeyDown = (e: KeyboardEvent) => {
      // Start animation on any key
      if (phase === 'start') {
        playKey(e.key)
        setPhase('typing')
        return
      }
      // Launch on Enter
      if (e.key === 'Enter' && phase === 'waiting') {
        playKey('Enter')
        setPhase('launching')
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [mounted, phase, playKey])

  // Handle click to start
  const handleStart = useCallback(() => {
    if (phase !== 'start') return
    playKey(' ')
    setPhase('typing')
  }, [phase, playKey])

  // Handle click to launch
  const handleLaunch = useCallback(() => {
    if (phase !== 'waiting') return
    playKey('Enter')
    setPhase('launching')
  }, [phase, playKey])

  // Launch animation with progress bar
  useEffect(() => {
    if (phase !== 'launching') return

    // Animate progress from 0 to 100
    const interval = setInterval(() => {
      setLaunchProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 2 // Increment by 2 each tick
      })
    }, 40) // 40ms * 50 steps = 2 seconds total

    return () => clearInterval(interval)
  }, [phase])

  // Complete after progress reaches 100
  useEffect(() => {
    if (phase !== 'launching' || launchProgress < 100) return

    const timeout = setTimeout(() => {
      setIsExiting(true)
      if (skipIfSeen) {
        sessionStorage.setItem('terminal-splash-seen', 'true')
      }
      setTimeout(onComplete, 600)
    }, 300) // Short delay after 100%
    return () => clearTimeout(timeout)
  }, [phase, launchProgress, onComplete, skipIfSeen])

  // Don't render until mounted or if should skip
  if (!mounted || shouldSkip) {
    return null
  }

  // Syntax highlighting
  const highlightCommand = (text: string, cmd: typeof COMMANDS[0]) => {
    const firstWord = cmd.text.split(' ')[0]
    return text.split('').map((char, i) => {
      let colorClass = 'text-[#c7c7c7]'
      if (i < firstWord.length) {
        colorClass = 'text-[#96d461]' // Green for command
      } else if (char === '-') {
        colorClass = 'text-[#78dce8]' // Cyan for flags
      }
      return <span key={i} className={colorClass}>{char}</span>
    })
  }

  const Prompt = () => (
    <span className="flex-shrink-0 select-none">
      <span className="text-[#78dce8]">{USERNAME}</span>
      <span className="text-[#6c6c6c]">@</span>
      <span className="text-[#96d461]">generation-ai</span>
      <span className="text-[#6c6c6c] ml-1.5">%</span>
    </span>
  )

  const Cursor = () => (
    <span
      className={`bg-[#c7c7c7] w-[8px] h-[16px] inline-block ml-px transition-opacity duration-100 ${
        cursorVisible ? 'opacity-100' : 'opacity-0'
      }`}
    />
  )

  return (
    <div
      className={`fixed inset-0 z-[100] bg-[#1e1e1e] flex items-center justify-center transition-all duration-700 ease-out ${
        isExiting ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
      }`}
    >
      {/* Scanlines overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-[101] opacity-[0.03]"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)',
        }}
      />

      <div className="w-full max-w-2xl mx-4">
        {/* macOS Terminal Window */}
        <div className="rounded-xl overflow-hidden shadow-2xl" style={{ boxShadow: '0 25px 80px -20px rgba(0,0,0,0.6)' }}>
          {/* Title Bar - macOS Sonoma style */}
          <div className="flex items-center px-4 py-3 bg-[#3a3a3c] border-b border-[#2a2a2c]">
            {/* Traffic Lights */}
            <div className="flex gap-2">
              <button className="w-3 h-3 rounded-full bg-[#ff5f57] hover:bg-[#ff5f57]/80 transition-colors" />
              <button className="w-3 h-3 rounded-full bg-[#febc2e] hover:bg-[#febc2e]/80 transition-colors" />
              <button className="w-3 h-3 rounded-full bg-[#28c840] hover:bg-[#28c840]/80 transition-colors" />
            </div>
            {/* Title */}
            <div className="flex-1 text-center">
              <span className="text-[#e0e0e0] text-[13px] font-medium">{USERNAME} — zsh — 80×24</span>
            </div>
            <div className="w-[52px]" />
          </div>

          {/* Terminal Content - Dark */}
          <div
            className="px-4 py-4 text-[15px] leading-relaxed min-h-[360px] bg-[#1e1e1e] relative"
            style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
          >
            {/* History */}
            {history.map((item, idx) => (
              <div key={idx} className="mb-3">
                <div className="flex items-center gap-2">
                  <Prompt />
                  <span className="ml-2">{highlightCommand(item.command, COMMANDS[idx])}</span>
                </div>
                {item.outputs.map((output, oi) => (
                  <div key={oi} className="text-[#a0a0a0] mt-1">
                    {output}
                  </div>
                ))}
              </div>
            ))}

            {/* Start screen with floating Logo - Gameboy style */}
            {phase === 'start' && (
              <div
                className="flex flex-col items-center justify-center min-h-[320px] cursor-pointer select-none"
                onClick={handleStart}
              >
                {/* Floating Logo */}
                <div className="relative mb-8 animate-float">
                  <Image
                    src="/logos/generationai-blau-neon.jpg"
                    alt="Generation AI"
                    width={220}
                    height={220}
                    className="w-[180px] sm:w-[220px] rounded"
                    style={{
                      filter: 'contrast(1.2) saturate(1.1) drop-shadow(0 0 12px rgba(150, 212, 97, 0.25))',
                    }}
                    priority
                  />
                  {/* Subtle scanlines */}
                  <div
                    className="absolute inset-0 pointer-events-none opacity-10 rounded"
                    style={{
                      background: 'repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(0,0,0,0.4) 2px, rgba(0,0,0,0.4) 3px)',
                    }}
                  />
                </div>
                <div className="text-[#6c6c6c] text-center">
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <span>Press any key or click to start</span>
                  </div>
                  <div className="mt-4">
                    <Cursor />
                  </div>
                </div>
              </div>
            )}

            {/* Prompt waiting phase - cursor blinks before typing starts */}
            {phase === 'prompt' && currentCommand && (
              <div className="flex items-center gap-2">
                <Prompt />
                <span className="ml-2">
                  <Cursor />
                </span>
              </div>
            )}

            {/* Current command being typed */}
            {phase === 'typing' && currentCommand && (
              <div className="flex items-center gap-2">
                <Prompt />
                <span className="ml-2">
                  {highlightCommand(typedText, currentCommand)}
                  <Cursor />
                </span>
              </div>
            )}

            {/* Current command with outputs */}
            {phase === 'output' && currentCommand && (
              <div className="mb-3">
                <div className="flex items-center gap-2">
                  <Prompt />
                  <span className="ml-2">{highlightCommand(currentCommand.text, currentCommand)}</span>
                </div>
                {currentCommand.outputs.slice(0, visibleOutputs).map((output, i) => (
                  <div key={i} className="text-[#a0a0a0] mt-1" style={{ animation: 'fadeInUp 0.15s ease-out' }}>
                    {output}
                  </div>
                ))}
              </div>
            )}

            {/* Waiting for Enter - clickable */}
            {phase === 'waiting' && (
              <>
                <div className="flex items-center gap-2 mb-6">
                  <Prompt />
                  <span className="ml-2">
                    <Cursor />
                  </span>
                </div>
                <div
                  className="text-[#6c6c6c] flex items-center gap-2 cursor-pointer hover:text-[#a0a0a0] transition-colors"
                  onClick={handleLaunch}
                >
                  <span>Press</span>
                  <kbd className="px-2 py-0.5 bg-[#3a3a3c] rounded text-[#e0e0e0] text-xs border border-[#4a4a4c]">
                    return
                  </kbd>
                  <span>or click to join</span>
                </div>
              </>
            )}

            {/* Launching with progress bar */}
            {phase === 'launching' && (
              <div className="mt-2">
                <LaunchProgressBar progress={launchProgress} />
              </div>
            )}
          </div>
        </div>

        {/* Skip */}
        {phase !== 'launching' && (
          <div className="mt-4 text-center text-[#6c6c6c] text-sm">
            <button
              onClick={() => {
                if (skipIfSeen) sessionStorage.setItem('terminal-splash-seen', 'true')
                onComplete()
              }}
              className="hover:text-[#a0a0a0] transition-colors cursor-pointer"
            >
              Skip intro
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
