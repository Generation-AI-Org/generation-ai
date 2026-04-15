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
  const streamRef = useRef<MediaStream | null>(null)

  const clearError = useCallback(() => setError(null), [])

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    // Stop the media stream tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
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
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }

    setError(null)
    setTranscript(null)

    // IMPORTANT: First request microphone permission via getUserMedia
    // This ensures the OS-level permission dialog is triggered
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      // Permission granted, now start SpeechRecognition
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognition = new SpeechRecognitionAPI()

      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = language
      recognition.maxAlternatives = 1

      recognition.onstart = () => {
        console.log('Speech recognition started')
        setIsRecording(true)
      }

      recognition.onresult = (event) => {
        const last = event.results.length - 1
        const text = event.results[last][0].transcript
        console.log('Speech result:', text)
        setTranscript(text)
        setIsRecording(false)
        // Stop the stream after getting result
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
          streamRef.current = null
        }
      }

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setIsRecording(false)

        // Stop the stream on error
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
          streamRef.current = null
        }

        const errorMessages: Record<string, string> = {
          'not-allowed': 'Mikrofon-Zugriff wurde verweigert. Bitte erlaube den Zugriff in deinen Browser- UND System-Einstellungen (macOS: Systemeinstellungen > Datenschutz > Mikrofon > Chrome aktivieren).',
          'no-speech': 'Keine Sprache erkannt. Bitte versuche es erneut.',
          'audio-capture': 'Kein Mikrofon gefunden. Bitte schließe ein Mikrofon an.',
          'network': 'Netzwerkfehler. Bitte prüfe deine Internetverbindung.',
          'aborted': '', // Silent - user cancelled
          'service-not-allowed': 'Spracherkennung ist auf diesem Gerät nicht verfügbar.',
        }

        const message = errorMessages[event.error] || `Spracherkennungsfehler: ${event.error}`
        if (message) {
          setError(message)
        }
      }

      recognition.onend = () => {
        console.log('Speech recognition ended')
        setIsRecording(false)
        recognitionRef.current = null
      }

      recognition.onspeechend = () => {
        console.log('Speech ended, stopping recognition')
        recognition.stop()
      }

      recognitionRef.current = recognition

      try {
        recognition.start()
        console.log('Recognition.start() called successfully')
      } catch (err) {
        console.error('Failed to start recognition:', err)
        setError('Spracherkennung konnte nicht gestartet werden.')
        setIsRecording(false)
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
          streamRef.current = null
        }
      }
    } catch (err) {
      // getUserMedia failed - this is the real permission issue
      console.error('getUserMedia error:', err)

      if (err instanceof Error) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setError('Mikrofon-Zugriff wurde verweigert. Bitte erlaube den Zugriff:\n\n1. Browser: Klicke auf das Schloss-Symbol in der Adressleiste → Mikrofon → Erlauben\n\n2. macOS: Systemeinstellungen → Datenschutz & Sicherheit → Mikrofon → Chrome aktivieren')
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setError('Kein Mikrofon gefunden. Bitte schließe ein Mikrofon an.')
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          setError('Mikrofon wird von einer anderen Anwendung verwendet. Bitte schließe andere Apps die das Mikrofon nutzen.')
        } else {
          setError(`Mikrofon-Fehler: ${err.message}`)
        }
      } else {
        setError('Unbekannter Mikrofon-Fehler. Bitte prüfe deine Einstellungen.')
      }
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
