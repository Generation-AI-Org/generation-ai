'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

export interface UseDeepgramVoiceReturn {
  isRecording: boolean
  isConnecting: boolean
  isSupported: boolean
  transcript: string
  interimTranscript: string
  audioLevels: number[]
  error: string | null
  startRecording: () => Promise<void>
  stopRecording: () => void
  clearError: () => void
  clearTranscript: () => void
}

const DEEPGRAM_URL = 'wss://api.deepgram.com/v1/listen?' + new URLSearchParams({
  model: 'nova-2',
  language: 'multi',
  interim_results: 'true',
  punctuate: 'true',
  smart_format: 'true',
  endpointing: 'false',
}).toString()

export function useDeepgramVoice(): UseDeepgramVoiceReturn {
  const [isRecording, setIsRecording] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [audioLevels, setAudioLevels] = useState<number[]>([])
  const [error, setError] = useState<string | null>(null)

  const socketRef = useRef<WebSocket | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const finalTranscriptRef = useRef('')

  // Check browser support
  const isSupported = typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof MediaRecorder !== 'undefined' &&
    typeof WebSocket !== 'undefined'

  const clearError = useCallback(() => setError(null), [])

  const clearTranscript = useCallback(() => {
    setTranscript('')
    setInterimTranscript('')
    finalTranscriptRef.current = ''
  }, [])

  // Audio level analysis
  const startAudioAnalysis = useCallback((stream: MediaStream) => {
    try {
      const audioContext = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      const analyser = audioContext.createAnalyser()
      const source = audioContext.createMediaStreamSource(stream)

      analyser.fftSize = 32
      analyser.smoothingTimeConstant = 0.5
      source.connect(analyser)
      // Don't connect to destination - we don't want to hear ourselves

      audioContextRef.current = audioContext
      analyserRef.current = analyser

      const dataArray = new Uint8Array(analyser.frequencyBinCount)

      const updateLevels = () => {
        if (!analyserRef.current) return

        analyserRef.current.getByteFrequencyData(dataArray)

        // Take first 12 bins and normalize to 0-1
        const levels = Array.from(dataArray.slice(0, 12)).map(v => v / 255)
        setAudioLevels(levels)

        animationFrameRef.current = requestAnimationFrame(updateLevels)
      }

      updateLevels()
    } catch (err) {
      console.error('[Voice] Audio analysis error:', err)
    }
  }, [])

  const stopAudioAnalysis = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
    analyserRef.current = null
    setAudioLevels([])
  }, [])

  const stopRecording = useCallback(() => {
    // Send close message to Deepgram
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      try {
        socketRef.current.send(JSON.stringify({ type: 'CloseStream' }))
        socketRef.current.close()
      } catch (e) {
        // Ignore close errors
      }
    }
    socketRef.current = null

    // Stop MediaRecorder
    if (mediaRecorderRef.current?.state !== 'inactive') {
      try {
        mediaRecorderRef.current?.stop()
      } catch (e) {
        // Ignore stop errors
      }
    }
    mediaRecorderRef.current = null

    // Stop all audio tracks
    streamRef.current?.getTracks().forEach(track => track.stop())
    streamRef.current = null

    // Stop audio analysis
    stopAudioAnalysis()

    setIsRecording(false)
    setIsConnecting(false)
    setInterimTranscript('')
  }, [stopAudioAnalysis])

  const startRecording = useCallback(async () => {
    if (!isSupported) {
      setError('Spracherkennung wird in diesem Browser nicht unterstützt.')
      return
    }

    // Clear previous state
    setError(null)
    finalTranscriptRef.current = ''
    setTranscript('')
    setInterimTranscript('')
    setIsConnecting(true)

    try {
      // 1. Get token from our API
      const tokenRes = await fetch('/api/voice/token', { method: 'POST' })
      if (!tokenRes.ok) {
        const data = await tokenRes.json()
        throw new Error(data.error || 'Token-Anfrage fehlgeschlagen')
      }
      const { token } = await tokenRes.json()

      // 2. Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      // 3. Start audio analysis for visualization
      startAudioAnalysis(stream)

      // 4. Find best supported mime type
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mp4',
      ]
      const mimeType = mimeTypes.find(type => MediaRecorder.isTypeSupported(type)) || 'audio/webm'

      // 5. Create WebSocket with token auth via subprotocol
      const socket = new WebSocket(DEEPGRAM_URL, ['token', token])
      socketRef.current = socket

      socket.onopen = () => {
        console.log('[Voice] WebSocket connected')
        setIsConnecting(false)
        setIsRecording(true)

        // Start MediaRecorder
        const mediaRecorder = new MediaRecorder(stream, { mimeType })
        mediaRecorderRef.current = mediaRecorder

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0 && socket.readyState === WebSocket.OPEN) {
            socket.send(event.data)
          }
        }

        mediaRecorder.start(250) // Send chunks every 250ms
      }

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)

          if (data.type !== 'Results') return

          const text = data.channel?.alternatives?.[0]?.transcript
          if (!text) return

          if (data.is_final) {
            finalTranscriptRef.current += (finalTranscriptRef.current ? ' ' : '') + text
            setInterimTranscript('')
            setTranscript(finalTranscriptRef.current)
          } else {
            setInterimTranscript(text)
          }
        } catch (e) {
          console.error('[Voice] Parse error:', e)
        }
      }

      socket.onerror = (event) => {
        console.error('[Voice] WebSocket error:', event)
        setError('Verbindung zur Spracherkennung fehlgeschlagen. Bitte versuche es erneut.')
        stopRecording()
      }

      socket.onclose = (event) => {
        console.log('[Voice] WebSocket closed:', event.code, event.reason)
        if (event.code !== 1000 && event.code !== 1005) {
          // Abnormal close
          setError('Verbindung unterbrochen. Bitte versuche es erneut.')
        }
        stopRecording()
      }

    } catch (err) {
      console.error('[Voice] Start error:', err)
      setIsConnecting(false)

      if (err instanceof Error) {
        if (err.name === 'NotAllowedError' || err.message.includes('Permission')) {
          setError('Mikrofon-Zugriff verweigert. Bitte erlaube das Mikrofon in den Browser-Einstellungen.')
        } else if (err.message.includes('network') || err.message.includes('Network')) {
          setError('Keine Internetverbindung. Bitte prüfe deine Verbindung.')
        } else {
          setError(err.message || 'Spracherkennung konnte nicht gestartet werden.')
        }
      } else {
        setError('Spracherkennung konnte nicht gestartet werden.')
      }

      // Clean up on error
      streamRef.current?.getTracks().forEach(track => track.stop())
      streamRef.current = null
      stopAudioAnalysis()
    }
  }, [isSupported, startAudioAnalysis, stopRecording, stopAudioAnalysis])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current?.state !== 'inactive') {
        mediaRecorderRef.current?.stop()
      }
      streamRef.current?.getTracks().forEach(track => track.stop())
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.close()
      }
      stopAudioAnalysis()
    }
  }, [stopAudioAnalysis])

  return {
    isRecording,
    isConnecting,
    isSupported,
    transcript,
    interimTranscript,
    audioLevels,
    error,
    startRecording,
    stopRecording,
    clearError,
    clearTranscript,
  }
}
