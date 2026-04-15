'use client'

import { useState, useCallback, useRef } from 'react'

interface UseVoiceInputReturn {
  isRecording: boolean
  isSupported: boolean
  startRecording: () => void
  stopRecording: () => void
  toggleRecording: () => void
  transcript: string | null
  error: string | null
  clearError: () => void
}

export function useVoiceInput(language = 'de-DE'): UseVoiceInputReturn {
  const [isRecording, setIsRecording] = useState(false)
  const [isSupported] = useState(() => {
    if (typeof window === 'undefined') return false
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  })
  const [transcript, setTranscript] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  const clearError = useCallback(() => setError(null), [])

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    setIsRecording(false)
  }, [])

  const startRecording = useCallback(() => {
    if (!isSupported) {
      setError('Spracherkennung wird in diesem Browser nicht unterstützt.')
      return
    }

    // Clean up any existing recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }

    setError(null)
    setTranscript(null)

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = language

    recognition.onstart = () => {
      setIsRecording(true)
    }

    recognition.onresult = (event) => {
      const last = event.results.length - 1
      const text = event.results[last][0].transcript
      setTranscript(text)
      setIsRecording(false)
    }

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      setIsRecording(false)

      const errorMessages: Record<string, string> = {
        'not-allowed': 'Mikrofon-Zugriff wurde verweigert. Bitte erlaube den Zugriff in deinen Browser-Einstellungen.',
        'no-speech': 'Keine Sprache erkannt. Bitte versuche es erneut.',
        'audio-capture': 'Kein Mikrofon gefunden. Bitte schließe ein Mikrofon an.',
        'network': 'Netzwerkfehler. Bitte prüfe deine Internetverbindung.',
        'aborted': '', // Silent
        'service-not-allowed': 'Spracherkennung ist auf diesem Gerät nicht verfügbar.',
      }

      const message = errorMessages[event.error] || `Spracherkennungsfehler: ${event.error}`
      if (message) {
        setError(message)
      }
    }

    recognition.onend = () => {
      setIsRecording(false)
      recognitionRef.current = null
    }

    recognitionRef.current = recognition

    try {
      recognition.start()
    } catch (err) {
      console.error('Failed to start recognition:', err)
      setError('Spracherkennung konnte nicht gestartet werden.')
      setIsRecording(false)
    }
  }, [isSupported, language])

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }, [isRecording, startRecording, stopRecording])

  return {
    isRecording,
    isSupported,
    startRecording,
    stopRecording,
    toggleRecording,
    transcript,
    error,
    clearError,
  }
}

// TypeScript declarations for Web Speech API
interface SpeechRecognitionErrorEvent extends Event {
  error: string
  message?: string
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean
  readonly length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
}

interface SpeechRecognitionAlternative {
  readonly transcript: string
  readonly confidence: number
}

interface SpeechRecognitionResultList {
  readonly length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionEventMap {
  'audioend': Event
  'audiostart': Event
  'end': Event
  'error': SpeechRecognitionErrorEvent
  'nomatch': Event
  'result': SpeechRecognitionEvent
  'soundend': Event
  'soundstart': Event
  'speechend': Event
  'speechstart': Event
  'start': Event
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  grammars: unknown
  interimResults: boolean
  lang: string
  maxAlternatives: number
  onaudioend: ((this: SpeechRecognition, ev: Event) => void) | null
  onaudiostart: ((this: SpeechRecognition, ev: Event) => void) | null
  onend: ((this: SpeechRecognition, ev: Event) => void) | null
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null
  onnomatch: ((this: SpeechRecognition, ev: Event) => void) | null
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null
  onsoundend: ((this: SpeechRecognition, ev: Event) => void) | null
  onsoundstart: ((this: SpeechRecognition, ev: Event) => void) | null
  onspeechend: ((this: SpeechRecognition, ev: Event) => void) | null
  onspeechstart: ((this: SpeechRecognition, ev: Event) => void) | null
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null
  abort(): void
  start(): void
  stop(): void
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number
  readonly results: SpeechRecognitionResultList
}

declare var SpeechRecognition: {
  prototype: SpeechRecognition
  new(): SpeechRecognition
}

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition
    webkitSpeechRecognition: typeof SpeechRecognition
  }
}
