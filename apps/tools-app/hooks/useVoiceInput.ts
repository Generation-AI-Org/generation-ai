'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

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
  const [isSupported, setIsSupported] = useState(false)
  const [transcript, setTranscript] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  // Check support on mount (client-side only)
  useEffect(() => {
    const supported = typeof window !== 'undefined' &&
      !!(window.SpeechRecognition || window.webkitSpeechRecognition)
    setIsSupported(supported)
  }, [])

  const clearError = useCallback(() => setError(null), [])

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (e) {
        // Ignore errors when stopping
      }
      recognitionRef.current = null
    }
    setIsRecording(false)
  }, [])

  const startRecording = useCallback(async () => {
    if (!isSupported) {
      setError('Spracherkennung wird in diesem Browser nicht unterstützt.')
      return
    }

    // Clean up any existing recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort()
      } catch (e) {
        // Ignore
      }
      recognitionRef.current = null
    }

    setError(null)
    setTranscript(null)

    // Check if we're on Chrome - it needs explicit microphone permission first
    const isChrome = navigator.userAgent.includes('Chrome') && !navigator.userAgent.includes('Edg')

    if (isChrome && navigator.mediaDevices?.getUserMedia) {
      try {
        // Request microphone permission explicitly on Chrome
        console.log('[Voice] Chrome detected - requesting mic permission first...')
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        // Stop immediately, we just needed the permission
        stream.getTracks().forEach(track => track.stop())
        console.log('[Voice] Microphone permission granted')
      } catch (micErr) {
        console.error('[Voice] Microphone permission denied:', micErr)
        setError('Mikrofon-Zugriff verweigert. Bitte erlaube das Mikrofon in den Browser-Einstellungen.')
        return
      }
    }

    try {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognition = new SpeechRecognitionAPI()

      // Configuration
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = language
      recognition.maxAlternatives = 1

      // Event handlers
      recognition.onstart = () => {
        console.log('[Voice] Recognition started')
        setIsRecording(true)
      }

      recognition.onaudiostart = () => {
        console.log('[Voice] Audio capture started')
      }

      recognition.onspeechstart = () => {
        console.log('[Voice] Speech detected')
      }

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        console.log('[Voice] Result received:', event.results)
        if (event.results.length > 0) {
          const result = event.results[event.results.length - 1]
          if (result.length > 0) {
            const text = result[0].transcript
            console.log('[Voice] Transcript:', text, '- will update state')
            setTranscript(text)
          }
        }
        setIsRecording(false)
      }

      recognition.onspeechend = () => {
        console.log('[Voice] Speech ended')
      }

      recognition.onend = () => {
        console.log('[Voice] Recognition ended')
        setIsRecording(false)
        recognitionRef.current = null
      }

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('[Voice] Error:', event.error, event.message)
        setIsRecording(false)
        recognitionRef.current = null

        // Map error codes to user-friendly messages
        switch (event.error) {
          case 'not-allowed':
          case 'service-not-allowed':
            setError('Mikrofon-Zugriff verweigert. Bitte klicke auf das Schloss-Symbol in der Adressleiste und erlaube das Mikrofon für diese Seite.')
            break
          case 'no-speech':
            setError('Keine Sprache erkannt. Bitte sprich deutlich und versuche es erneut.')
            break
          case 'audio-capture':
            setError('Kein Mikrofon gefunden. Bitte schließe ein Mikrofon an.')
            break
          case 'network':
            setError('Netzwerkfehler bei der Spracherkennung. Bitte prüfe deine Internetverbindung.')
            break
          case 'aborted':
            // User cancelled - no error message needed
            break
          default:
            setError(`Spracherkennungsfehler: ${event.error}`)
        }
      }

      recognition.onnomatch = () => {
        console.log('[Voice] No match found')
        setError('Sprache nicht erkannt. Bitte versuche es erneut.')
      }

      recognitionRef.current = recognition

      // Start recognition - this triggers the browser permission prompt if needed
      console.log('[Voice] Starting recognition...')
      recognition.start()
      console.log('[Voice] recognition.start() called')

    } catch (err) {
      console.error('[Voice] Failed to create/start recognition:', err)
      setError('Spracherkennung konnte nicht gestartet werden. Bitte lade die Seite neu.')
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
