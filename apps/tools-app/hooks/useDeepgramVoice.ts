'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

interface UseDeepgramVoiceReturn {
  isRecording: boolean
  isProcessing: boolean
  isSupported: boolean
  transcript: string
  audioLevels: number[]
  error: string | null
  startRecording: () => Promise<void>
  stopRecording: () => void
  clearError: () => void
  clearTranscript: () => void
}

export function useDeepgramVoice(): UseDeepgramVoiceReturn {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [audioLevels, setAudioLevels] = useState<number[]>([])
  const [error, setError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  // Check browser support
  const isSupported = typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof MediaRecorder !== 'undefined'

  const clearError = useCallback(() => setError(null), [])
  const clearTranscript = useCallback(() => setTranscript(''), [])

  // Audio level analysis for visualization
  const startAudioAnalysis = useCallback((stream: MediaStream) => {
    try {
      const audioContext = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      const analyser = audioContext.createAnalyser()
      const source = audioContext.createMediaStreamSource(stream)

      analyser.fftSize = 32
      analyser.smoothingTimeConstant = 0.5
      source.connect(analyser)

      audioContextRef.current = audioContext
      analyserRef.current = analyser

      const dataArray = new Uint8Array(analyser.frequencyBinCount)

      const updateLevels = () => {
        if (!analyserRef.current) return

        analyserRef.current.getByteFrequencyData(dataArray)
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

  const stopRecording = useCallback(async () => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
      return
    }

    // Stop recording - this triggers ondataavailable with final chunk
    mediaRecorderRef.current.stop()
  }, [])

  const startRecording = useCallback(async () => {
    if (!isSupported) {
      setError('Spracherkennung wird in diesem Browser nicht unterstützt.')
      return
    }

    setError(null)
    setTranscript('')
    chunksRef.current = []

    try {
      console.log('[Voice] Requesting microphone...')
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      console.log('[Voice] Microphone granted')

      // Start audio visualization
      startAudioAnalysis(stream)

      // Find best mime type
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mp4',
      ]
      const mimeType = mimeTypes.find(type => MediaRecorder.isTypeSupported(type)) || 'audio/webm'
      console.log('[Voice] Using mime type:', mimeType)

      const mediaRecorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        console.log('[Voice] Recording stopped, processing...')
        setIsRecording(false)
        setIsProcessing(true)
        stopAudioAnalysis()

        // Stop all tracks
        streamRef.current?.getTracks().forEach(track => track.stop())
        streamRef.current = null

        // Create blob from chunks
        const audioBlob = new Blob(chunksRef.current, { type: mimeType })
        console.log('[Voice] Audio blob size:', audioBlob.size)

        if (audioBlob.size === 0) {
          setError('Keine Audio-Daten aufgenommen.')
          setIsProcessing(false)
          return
        }

        // Send to transcription API
        try {
          const formData = new FormData()
          formData.append('audio', audioBlob, 'recording.webm')

          const response = await fetch('/api/voice/transcribe', {
            method: 'POST',
            body: formData,
          })

          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.error || 'Transkription fehlgeschlagen')
          }

          if (data.transcript) {
            console.log('[Voice] Transcript:', data.transcript)
            setTranscript(data.transcript)
          } else {
            setError('Keine Sprache erkannt. Bitte versuche es erneut.')
          }
        } catch (err) {
          console.error('[Voice] Transcription error:', err)
          setError('Transkription fehlgeschlagen. Bitte versuche es erneut.')
        } finally {
          setIsProcessing(false)
        }
      }

      mediaRecorder.onerror = (event) => {
        console.error('[Voice] MediaRecorder error:', event)
        setError('Aufnahme fehlgeschlagen.')
        setIsRecording(false)
        stopAudioAnalysis()
      }

      // Start recording
      mediaRecorder.start()
      setIsRecording(true)
      console.log('[Voice] Recording started')

    } catch (err) {
      console.error('[Voice] Start error:', err)

      if (err instanceof Error) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setError('Mikrofon-Zugriff verweigert. Bitte erlaube das Mikrofon in den Browser-Einstellungen.')
        } else {
          setError(err.message || 'Aufnahme konnte nicht gestartet werden.')
        }
      } else {
        setError('Aufnahme konnte nicht gestartet werden.')
      }

      streamRef.current?.getTracks().forEach(track => track.stop())
      streamRef.current = null
      stopAudioAnalysis()
    }
  }, [isSupported, startAudioAnalysis, stopAudioAnalysis])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current?.state !== 'inactive') {
        mediaRecorderRef.current?.stop()
      }
      streamRef.current?.getTracks().forEach(track => track.stop())
      stopAudioAnalysis()
    }
  }, [stopAudioAnalysis])

  return {
    isRecording,
    isProcessing,
    isSupported,
    transcript,
    audioLevels,
    error,
    startRecording,
    stopRecording,
    clearError,
    clearTranscript,
  }
}
