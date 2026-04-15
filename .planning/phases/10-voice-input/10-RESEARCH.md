# Phase 10: Voice Input - Research

**Recherchiert:** 2026-04-15
**Domain:** Deepgram WebSocket Streaming + Web Audio API + Next.js
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (aus CONTEXT.md)

### Locked Decisions
- **STT-Engine:** Deepgram API (Streaming WebSocket), API Key als `DEEPGRAM_API_KEY` Env-Var
- **Audio-Visualisierung:** Echte Audio-Pegel via Web Audio API AnalyserNode (kein Fake-Random)
- **Live-Transkription:** Interim Results live anzeigen, finaler Text ersetzt Interim
- **Stopp-Modus:** Manuell per Button-Klick, kein Auto-Stopp nach Stille
- **Text-Handling:** Text ins Textarea einfuegen, User editiert vor dem Senden, kein Auto-Send
- **Sprache:** Auto-Detect (Deepgram language=multi fuer Deutsch + Englisch)
- **Browser-Support:** Chrome, Safari, Firefox, Edge (Desktop) + iOS Safari, Chrome Android (Mobile)

### Claude's Discretion
- Fallback wenn Deepgram nicht erreichbar (Graceful Degradation zu Browser Speech API ODER Error + Retry)
- Exaktes UI-Aussehen des VoiceInputButton (muss Glassmorphism-Aesthetik passen)
- Animierte Bars aus molecule-ui/voice-input als Referenz

### Deferred Ideas (OUT OF SCOPE)
- Voice Commands ("Sende Nachricht", "Loesche das")
- Text-to-Speech fuer Bot-Antworten
- Sprachauswahl-Dropdown
- Aufnahme-Qualitaets-Einstellungen
</user_constraints>

---

## Summary

Die Implementation besteht aus drei klar getrennten Teilen: (1) Eine Next.js API-Route `/api/voice/token` die einen kurzlebigen Deepgram-Token (30s) generiert, (2) einem `useDeepgramVoice` React-Hook der den WebSocket-Lifecycle verwaltet, und (3) einem Web Audio API AnalyserNode der parallel zum Deepgram-Stream die echten Frequenzdaten fuer die Bar-Visualisierung liefert.

Der API-Key darf NICHT direkt im Browser-Code erscheinen. Deepgram bietet einen offiziellen Token-Endpoint (`/v1/auth/grant`) der 30-Sekunden-Tokens ausgibt — der WebSocket bleibt danach unbegrenzt offen. Das ist der empfohlene Weg fuer Browser-Apps. Eine vollstaendige WebSocket-Proxy-Architektur (Browser -> eigener Server -> Deepgram) ist moeglich aber deutlich komplexer und mit Latenz-Overhead verbunden.

Das Deepgram SDK v5 (`@deepgram/sdk@5.0.0`) ist das aktuelle Release. Fuer Browser-Live-Transkription kann man alternativ direkt native WebSocket nutzen (einfacher, weniger Bundle-Groesse). Die Entscheidung haengt von der gewuenschten Abstraktion ab.

**Primaere Empfehlung:** Nativer Browser-WebSocket + Token-basierte Auth via Next.js API-Route. Kein SDK-Overhead, volle Kontrolle, minimal.

---

## Project Constraints (aus CLAUDE.md)

- GSD-Workflow nutzen, `.planning/STATE.md` ist Source of Truth
- Kein Push ohne OK, kein Prod-Deploy ohne OK
- Changesets bei jeder nicht-trivialen Aenderung
- `pnpm test` vor groesseren Aenderungen
- Monorepo-Struktur: Aenderungen nur in `apps/tools-app/`
- Next.js 16 (nicht 15 wie in der Phase-Beschreibung erwaehnt — CLAUDE.md sagt "Next.js 16")

---

## Standard Stack

### Core

| Library | Version | Zweck | Begruendung |
|---------|---------|-------|-------------|
| `@deepgram/sdk` | 5.0.0 | Deepgram Client (optional, fuers Token-Handling) | Offiziell, aktuell [VERIFIED: npm registry] |
| Native WebSocket | Browser-API | Verbindung zu Deepgram wss:// | Kein Bundle-Overhead, full control |
| Web Audio API | Browser-API | AnalyserNode fuer Frequenz-Visualisierung | Nativ, keine Deps |
| MediaRecorder | Browser-API | Mikrofon-Audio streamen | Standard, Cross-Browser |

### Supporting

| Library | Version | Zweck | Wann nutzen |
|---------|---------|-------|------------|
| `@deepgram/sdk` | 5.0.0 | Nur fuer Token-Generierung in API-Route | Wenn man SDK-Typen nutzen will |

### Alternatives Considered

| Statt | Koennte man | Tradeoff |
|-------|-------------|----------|
| Nativer WebSocket | `@deepgram/sdk` im Browser | SDK bringt Abstraktion aber ~50KB Bundle-Overhead |
| Token-Auth | Direkt API-Key im Browser | SICHERHEITSRISIKO — nie machen |
| Token-Auth | Voller WebSocket-Proxy (eigener Server) | Mehr Kontrolle, mehr Latenz, komplexeres Infra |

### Installation

```bash
cd apps/tools-app
# Nur benoetigt wenn SDK fuer Token-Generierung in API-Route genutzt wird:
pnpm add @deepgram/sdk
# Sonst: kein neues Package noetig (nur native Browser-APIs)
```

**Version-Verifikation:** `@deepgram/sdk` 5.0.0 ist das aktuelle Release (Stand April 2026). [VERIFIED: npm registry]

---

## Architecture Patterns

### Empfohlene Dateistruktur

```
apps/tools-app/
├── app/
│   └── api/
│       └── voice/
│           └── token/
│               └── route.ts          # POST -> temporaerer Deepgram-Token (30s)
├── hooks/
│   └── useDeepgramVoice.ts          # Ersetzt useVoiceInput.ts (oder neues File)
└── components/
    └── ui/
        └── VoiceInputButton.tsx     # Erweitern: audioLevels[] als Prop
```

### Pattern 1: Token-basierte Auth (EMPFOHLEN)

**Was:** API-Route generiert kurzlebigen Deepgram-JWT, Browser nutzt diesen fuer direkten WebSocket zu Deepgram.

**Wann nutzen:** Immer — API-Key darf nie im Browser-Code landen.

**Deepgram Token Endpoint:**
```
POST https://api.deepgram.com/v1/auth/grant
Authorization: Token YOUR_DEEPGRAM_API_KEY
```
Gibt einen JWT zurueck der **30 Sekunden** gueltig ist. Der WebSocket bleibt nach dem Aufbau unbegrenzt offen.

```typescript
// Source: developers.deepgram.com/guides/fundamentals/token-based-authentication
// apps/tools-app/app/api/voice/token/route.ts
import { NextResponse } from 'next/server'

export async function POST() {
  const response = await fetch('https://api.deepgram.com/v1/auth/grant', {
    method: 'POST',
    headers: {
      Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
    },
  })

  if (!response.ok) {
    return NextResponse.json({ error: 'Failed to create token' }, { status: 500 })
  }

  const data = await response.json()
  // data.token ist der kurzlebige JWT
  return NextResponse.json({ token: data.token })
}
```

### Pattern 2: Deepgram WebSocket Verbindung (Browser)

**Deepgram WebSocket URL:**
```
wss://api.deepgram.com/v1/listen
```

**Auth via WebSocket-Protokoll-Header** (einzige Moeglichkeit im Browser):
```javascript
// Source: deepgram.com/learn/live-transcription-mic-browser [VERIFIED]
const socket = new WebSocket(
  'wss://api.deepgram.com/v1/listen?model=nova-3&language=multi&interim_results=true&punctuate=true&smart_format=true',
  ['token', temporaryToken]  // 2. Argument = Subprotokoll-Array fuer Auth
)
```

**Wichtige Query-Parameter:**
| Parameter | Wert | Bedeutung |
|-----------|------|-----------|
| `model` | `nova-3` | Aktuellstes Modell, deutlich besser als nova-2 [VERIFIED] |
| `language` | `multi` | Simultanes Deutsch + Englisch Code-Switching [VERIFIED: deepgram.com/docs] |
| `interim_results` | `true` | Live-Transkription waehrend Sprache |
| `punctuate` | `true` | Automatische Interpunktion |
| `smart_format` | `true` | Zahlen, Datumsformat etc. |
| `endpointing` | `false` | KEIN Auto-Stopp nach Stille (manueller Stopp-Modus) |

### Pattern 3: Audio-Format fuer MediaRecorder + Deepgram

**Beste Kompatibilitaet:** `audio/webm` (containerisiert) — Deepgram liest Header automatisch, keine `encoding`/`sample_rate` Query-Parameter noetig.

```typescript
// Source: deepgram.com/learn/live-transcription-mic-browser [VERIFIED]
const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
const mediaRecorder = new MediaRecorder(stream, {
  mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
    ? 'audio/webm;codecs=opus'
    : 'audio/webm'
})

socket.onopen = () => {
  mediaRecorder.addEventListener('dataavailable', (event) => {
    if (event.data.size > 0 && socket.readyState === WebSocket.OPEN) {
      socket.send(event.data)
    }
  })
  mediaRecorder.start(250) // 250ms-Chunks empfohlen [VERIFIED]
}
```

**Alternativ (fuer maximale Browser-Kompatibilitaet):** `encoding=linear16&sample_rate=16000` — dann ScriptProcessorNode statt MediaRecorder verwenden. Komplexer, vermeiden wenn webm reicht.

### Pattern 4: Interim Results verarbeiten

```typescript
// Source: developers.deepgram.com/docs/understand-endpointing-interim-results [VERIFIED]
// is_final: true  → Segment hat max. Genauigkeit erreicht, Speaker spricht noch
// speech_final: true → Deepgram erkennt Sprechpause (NICHT aktiviert wenn endpointing=false)

let interimTranscript = ''
let finalTranscript = ''

socket.onmessage = (message: MessageEvent) => {
  const data = JSON.parse(message.data as string)
  
  // Nur Transkriptions-Events verarbeiten (Deepgram sendet auch Metadata-Events)
  if (data.type !== 'Results') return
  
  const transcript = data.channel?.alternatives?.[0]?.transcript
  if (!transcript) return

  if (data.is_final) {
    // Finales Segment anhaengen
    finalTranscript += (finalTranscript ? ' ' : '') + transcript
    interimTranscript = ''
  } else {
    // Interim: nur anzeigen, nicht anhaengen
    interimTranscript = transcript
  }
  
  // Live-Display: finalTranscript + interimTranscript
  onTranscriptUpdate(finalTranscript + (interimTranscript ? ' ' + interimTranscript : ''))
}
```

**Wenn User auf Stop klickt:**
```typescript
// Verbindung sauber schliessen
socket.send(JSON.stringify({ type: 'CloseStream' }))
socket.close()
// finalTranscript in Textarea einfuegen
onComplete(finalTranscript)
```

### Pattern 5: Web Audio API AnalyserNode fuer Visualisierung

```typescript
// Source: MDN Web Audio API Visualizations [VERIFIED: developer.mozilla.org]
// Parallel zum Deepgram-Stream — GLEICHER getUserMedia-Stream

function setupVisualizer(stream: MediaStream) {
  const audioCtx = new AudioContext()
  const analyser = audioCtx.createAnalyser()
  analyser.fftSize = 32         // Klein = weniger Bars, schneller
  analyser.smoothingTimeConstant = 0.8  // Glaettung der Animation

  const source = audioCtx.createMediaStreamSource(stream)
  source.connect(analyser)
  // NICHT an audioCtx.destination connecten — kein Playback des Mics!

  const bufferLength = analyser.frequencyBinCount  // = fftSize / 2 = 16
  const dataArray = new Uint8Array(bufferLength)

  return { audioCtx, analyser, dataArray, bufferLength }
}

// In Animation-Loop (requestAnimationFrame):
function getBarHeights(analyser: AnalyserNode, dataArray: Uint8Array): number[] {
  analyser.getByteFrequencyData(dataArray)
  // Werte 0-255, normalisiert auf 0-1 fuer CSS height-Berechnung
  return Array.from(dataArray).map(v => v / 255)
}
```

**Fuer 12 Bars:** `fftSize = 32` gibt `frequencyBinCount = 16`. Ersten 12 Werte nutzen.
Alternativ: `fftSize = 256`, dann jeden N-ten Wert sampeln fuer 12 repraesentative Bars.

### Pattern 6: React Hook Struktur (useDeepgramVoice)

```typescript
// Grobe Struktur des neuen Hooks
interface UseDeepgramVoiceReturn {
  isRecording: boolean
  isConnecting: boolean
  isSupported: boolean
  transcript: string        // finaler Text fuer Textarea
  interimTranscript: string // Live-Preview waehrend Sprechen
  audioLevels: number[]     // 12 Werte 0-1 fuer Bars
  error: string | null
  startRecording: () => Promise<void>
  stopRecording: () => void
  clearError: () => void
}

// Refs die im Hook gebraucht werden:
// - socketRef: WebSocket | null
// - mediaRecorderRef: MediaRecorder | null
// - streamRef: MediaStream | null
// - audioCtxRef: AudioContext | null
// - analyserRef: AnalyserNode | null
// - animFrameRef: number | null  (fuer cancelAnimationFrame)
// - finalTranscriptRef: string  (nicht State — vermeidet stale closure in socket.onmessage)
```

### Anti-Patterns zu vermeiden

- **API-Key im Frontend:** Nie `NEXT_PUBLIC_DEEPGRAM_API_KEY` — immer Token-Endpoint nutzen
- **Direkt an audioCtx.destination connecten:** Mikrofon-Echo! Source nur an Analyser, nicht an Speaker
- **State statt Ref fuer WebSocket:** Jede State-Aenderung triggert Re-Render, schliessen des alten Sockets
- **Kein Cleanup im Hook:** AudioContext bleibt offen, Memory-Leak, iOS-Bugs
- **`mediaRecorder.start()` ohne timeslice:** Daten kommen erst am Ende — immer `start(250)` nutzen

---

## Don't Hand-Roll

| Problem | Nicht selbst bauen | Stattdessen | Warum |
|---------|-------------------|-------------|-------|
| Audio-Format-Detection | Eigene mimeType-Logik | `MediaRecorder.isTypeSupported()` | Browser-API, zuverlaessig |
| Token-Expiry | Countdown + auto-refresh | Token nur einmal holen, WS bleibt offen | Token muss nur fuer Verbindungsaufbau gueltig sein |
| Transcript-Puffer | Komplexes State-Management | `useRef` fuer finalTranscript | Kein stale closure in onmessage |
| WS-Reconnect | Eigene Reconnect-Logik | Nicht in dieser Phase (out of scope) | Manueller Stopp-Modus braucht kein Reconnect |

---

## Common Pitfalls

### Pitfall 1: iOS Safari AudioContext suspended

**Was schieflaeuft:** Auf iOS Safari startet AudioContext im Status "suspended". Kein Audio-Input moeglich.

**Warum:** Safari erfordert User-Gesture um AudioContext zu aktivieren — auch nach getUserMedia.

**Vermeidung:**
```typescript
// AudioContext NUR innerhalb eines User-Event-Handlers erstellen/resumeen
const audioCtx = new AudioContext()
if (audioCtx.state === 'suspended') {
  await audioCtx.resume()
}
```
**Warnsignal:** analyser.getByteFrequencyData gibt nur Nullen zurueck.

### Pitfall 2: WebSocket auth via Header nicht moeglich im Browser

**Was schieflaeuft:** `Authorization: Bearer TOKEN` Header kann Browser-WebSocket nicht setzen.

**Warum:** Browser-WebSocket API erlaubt keine Custom-Headers.

**Vermeidung:** Auth via Subprotokoll-Array — das ist der offizielle Deepgram-Weg:
```typescript
new WebSocket(url, ['token', temporaryToken])
```

### Pitfall 3: MediaRecorder Mime-Type Browser-Unterschiede

**Was schieflaeuft:** `audio/webm` nicht auf iOS Safari verfuegbar. Safari benutzt `audio/mp4`.

**Vermeidung:**
```typescript
const mimeType = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/ogg;codecs=opus',
  'audio/mp4',
].find(type => MediaRecorder.isTypeSupported(type)) ?? ''

// Bei audio/mp4 (iOS): encoding/sample_rate Query-Params an Deepgram senden
// Bei audio/webm: keine Params noetig (containerisiert)
```

### Pitfall 4: Stale Closures in socket.onmessage

**Was schieflaeuft:** `finalTranscript` State-Variable in `onmessage` Callback ist veraltet.

**Warum:** React State in Event-Handlers ist gecaptured zum Zeitpunkt der Registrierung.

**Vermeidung:** `useRef` fuer den sich akkumulierenden Transcript:
```typescript
const finalTranscriptRef = useRef('')

socket.onmessage = (message) => {
  if (data.is_final) {
    finalTranscriptRef.current += ' ' + transcript  // Immer aktuell
  }
}
```

### Pitfall 5: Kein Cleanup bei Component Unmount

**Was schieflaeuft:** WebSocket bleibt offen, MediaRecorder laeuft, AudioContext lebt, requestAnimationFrame laeuft endlos.

**Vermeidung:**
```typescript
useEffect(() => {
  return () => {
    // Cleanup in dieser Reihenfolge:
    animFrameRef.current && cancelAnimationFrame(animFrameRef.current)
    analyserRef.current?.disconnect()
    audioCtxRef.current?.close()
    mediaRecorderRef.current?.stop()
    streamRef.current?.getTracks().forEach(t => t.stop())
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: 'CloseStream' }))
      socketRef.current.close()
    }
  }
}, [])
```

### Pitfall 6: Frequenz-Bars zeigen nur Nullen

**Ursachen und Checks:**
1. AudioContext suspended (iOS Safari) → `audioCtx.resume()` aufrufen
2. Source nicht verbunden → `source.connect(analyser)` vergessen
3. Stream schon gestoppt → erst Stream holen, dann Analyser aufbauen
4. fftSize zu gross → kleineren Wert versuchen (32 oder 64)

### Pitfall 7: Deepgram Token Permissions

**Was schieflaeuft:** POST an `/v1/auth/grant` gibt `FORBIDDEN` zurueck.

**Warum:** API-Key hat nicht "Member"-Level-Permissions.

**Fix:** Deepgram Console → API Keys → Advanced Options → Permission Level auf "Member" setzen.

---

## Code Examples

### Vollstaendiger Token Endpoint

```typescript
// Source: developers.deepgram.com/guides/fundamentals/token-based-authentication [VERIFIED]
// apps/tools-app/app/api/voice/token/route.ts
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  if (!process.env.DEEPGRAM_API_KEY) {
    return NextResponse.json({ error: 'Deepgram not configured' }, { status: 503 })
  }

  try {
    const res = await fetch('https://api.deepgram.com/v1/auth/grant', {
      method: 'POST',
      headers: {
        Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
        'Content-Type': 'application/json',
      },
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('[Deepgram token]', res.status, err)
      return NextResponse.json({ error: 'Token creation failed' }, { status: 502 })
    }

    const { token } = await res.json()
    return NextResponse.json({ token })
  } catch (err) {
    console.error('[Deepgram token] Network error:', err)
    return NextResponse.json({ error: 'Network error' }, { status: 502 })
  }
}
```

### Deepgram WebSocket mit Auth und Optionen

```typescript
// Source: deepgram.com/learn/live-transcription-mic-browser [VERIFIED]
const DEEPGRAM_URL =
  'wss://api.deepgram.com/v1/listen?' +
  new URLSearchParams({
    model: 'nova-3',
    language: 'multi',        // Deutsch + Englisch gleichzeitig
    interim_results: 'true',
    punctuate: 'true',
    smart_format: 'true',
    endpointing: 'false',     // Kein Auto-Stopp
  }).toString()

const socket = new WebSocket(DEEPGRAM_URL, ['token', temporaryToken])
```

### Visualisierung in requestAnimationFrame Loop

```typescript
// Source: MDN Web Audio API [VERIFIED: developer.mozilla.org]
function startVisualizationLoop(
  analyser: AnalyserNode,
  dataArray: Uint8Array,
  onLevels: (levels: number[]) => void,
  frameRef: React.MutableRefObject<number | null>
) {
  const NUM_BARS = 12
  
  const loop = () => {
    analyser.getByteFrequencyData(dataArray)  // Fuellt dataArray in-place
    
    // Ersten NUM_BARS Frequenz-Bins nehmen und auf 0-1 normalisieren
    const levels = Array.from({ length: NUM_BARS }, (_, i) => {
      return (dataArray[i] ?? 0) / 255
    })
    
    onLevels(levels)
    frameRef.current = requestAnimationFrame(loop)
  }

  frameRef.current = requestAnimationFrame(loop)
}
```

### Fallback-Entscheidungslogik

```typescript
// [ASSUMED] Empfehlung: Error + Retry (kein silent Fallback zur Web Speech API)
// Begruendung: User hat Deepgram explizit gewaehlt, silent Fallback waere verwirrend

async function startRecording() {
  try {
    const tokenRes = await fetch('/api/voice/token', { method: 'POST' })
    if (!tokenRes.ok) {
      setError('Verbindung zu Spracherkennung fehlgeschlagen. Bitte versuche es erneut.')
      return
    }
    const { token } = await tokenRes.json()
    // ... WebSocket aufbauen
  } catch {
    setError('Keine Internetverbindung. Bitte pruefen und erneut versuchen.')
  }
}
```

---

## State of the Art

| Alter Ansatz | Aktueller Ansatz | Seit | Bedeutung |
|-------------|------------------|------|-----------|
| Web Speech API | Deepgram WebSocket | — | Besere Qualitaet, kein Chrome-only, Interim Results |
| Deepgram nova-2 | Deepgram nova-3 | 2024 | ~54% bessere WER, native Deutsch-Unterstuetzung [VERIFIED] |
| SDK im Browser | Token + nativer WS | 2023+ | Kein API-Key-Leak, weniger Bundle |
| Random-Animation | Web Audio API AnalyserNode | — | Echte Pegel statt Fake |

**Veraltet/deprecated:**
- `ScriptProcessorNode`: Veraltet, durch `AudioWorklet` ersetzt — fuer diese Phase nicht noetig (MediaRecorder reicht)
- Deepgram nova-1: Nicht mehr empfohlen

---

## Assumptions Log

| # | Claim | Bereich | Risiko wenn falsch |
|---|-------|---------|---------------------|
| A1 | Empfehlung: Error+Retry statt silent Fallback zur Web Speech API | Fallback-Strategie | User sieht keine Fehlermeldung wenn Deepgram down — aber Claude's Discretion |
| A2 | `fftSize=32` gibt genug Frequenz-Aufloesing fuer 12 visuelle Bars | Visualisierung | Bars koennen eng zusammenliegen; evtl. `fftSize=256` mit Sampling besser |
| A3 | `language=multi` deckt Deutsch+Englisch gleichzeitig ab | Spracherkennung | Falls nova-3 multi fuer DE schlechter als `language=de` — beides testen |
| A4 | `audio/webm` funktioniert auf iOS Safari via audio/mp4 Fallback | Browser-Compat | iOS Safari WebSocket + audio/mp4 + Deepgram evtl. weitere Konfiguration noetig |

---

## Open Questions

1. **audio/mp4 auf iOS Safari**
   - Was wir wissen: iOS Safari unterstuetzt kein webm, nutzt audio/mp4
   - Unklar: Ob Deepgram audio/mp4-Container korrekt parst ohne explizite encoding-Params
   - Empfehlung: In Wave 0 explizit auf echtem iOS testen; Fallback: `encoding=linear16` + ScriptProcessorNode

2. **nova-3 language=multi vs language=de Qualitaet**
   - Was wir wissen: nova-3 multi unterstuetzt Deutsch, community-Feedback gemischt
   - Unklar: Ob `language=de` (monolingual) besser als `language=multi` fuer rein-deutschen Input
   - Empfehlung: Mit `language=multi` starten (LOCKED: Auto-Detect), ggf. spaeter vergleichen

3. **Deepgram API-Key Permissions Level**
   - Was wir wissen: `/v1/auth/grant` braucht "Member"-Level-Key
   - Unklar: Hat der vorhandene API-Key des Users das richtige Level?
   - Empfehlung: Als Wave-0-Check: Token-Endpoint testen bevor Implementation startet

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| `@deepgram/sdk` | API-Route Token-Generierung | zu installieren | 5.0.0 | Native fetch reicht auch (kein SDK noetig) |
| `DEEPGRAM_API_KEY` | Token-Endpoint | unbekannt | — | Phase blockiert ohne gueltige Key |
| MediaRecorder API | Audio-Streaming | ja (alle Targets) | Browser-nativ | — |
| Web Audio API | Visualisierung | ja (alle Targets, mit iOS-Workaround) | Browser-nativ | Fake-Animation (deoptimiert) |
| WebSocket API | Deepgram-Verbindung | ja | Browser-nativ | — |
| Next.js API Routes | Token-Endpoint | ja | 16.2.3 | — |

**Fehlende Dependencies ohne Fallback:**
- `DEEPGRAM_API_KEY` Env-Var in `.env.local` und Vercel-Projekt-Settings — muss vor Start gesetzt werden

**Fehlende Dependencies mit Fallback:**
- `@deepgram/sdk` — kann durch native `fetch` in der API-Route ersetzt werden (kein SDK-Call, nur HTTP POST)

---

## Validation Architecture

> `workflow.nyquist_validation` nicht explizit auf false gesetzt — Section included.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.x |
| Config file | `vitest.config.ts` (vorhanden gemaess package.json) |
| Quick run | `pnpm test` |
| Full suite | `pnpm test:run` |

### Phase Requirements -> Test Map

| Req ID | Verhalten | Test-Typ | Command | File vorhanden? |
|--------|-----------|----------|---------|----------------|
| VOICE-01 | Token-Endpoint gibt gueltige JWT-Struktur | unit | `pnpm test -- token.test` | Nein — Wave 0 |
| VOICE-02 | WebSocket verbindet sich zu Deepgram | integration/manual | manuell | — |
| VOICE-03 | Interim + Final Transcript korrekt akkumuliert | unit | `pnpm test -- transcript.test` | Nein — Wave 0 |
| VOICE-04 | Cleanup bei Unmount schliesst alle Ressourcen | unit (mock) | `pnpm test -- useDeepgramVoice.test` | Nein — Wave 0 |
| VOICE-05 | Visualisierung zeigt echte Pegel (nicht Nullen) | manuell | manuell | — |
| VOICE-06 | iOS Safari AudioContext resume funktioniert | manuell (Geraet) | manuell | — |

### Wave 0 Gaps

- [ ] `apps/tools-app/app/api/voice/token/route.test.ts` — VOICE-01
- [ ] `apps/tools-app/hooks/__tests__/useDeepgramVoice.test.ts` — VOICE-03, VOICE-04
- [ ] `apps/tools-app/hooks/__tests__/transcriptAccumulation.test.ts` — VOICE-03

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | ja | Deepgram API Key nur serverseitig via env var |
| V3 Session Management | nein | — |
| V4 Access Control | ja | Token-Endpoint: Supabase-Auth pruefen (nur eingeloggte User) |
| V5 Input Validation | ja | Token-Response validieren, JSON.parse try/catch |
| V6 Cryptography | nein | Token-Generierung durch Deepgram |

### Known Threat Patterns

| Pattern | STRIDE | Standard-Mitigation |
|---------|--------|---------------------|
| API-Key Leak | Information Disclosure | Nie als `NEXT_PUBLIC_` exponieren, nur in API-Route |
| Token-Endpoint Abuse | Elevation of Privilege | Rate-Limiting (Upstash Redis vorhanden im Stack), optional: Auth-Check |
| WebSocket Hijacking | Tampering | Token ist 30s-lived, WS ueber wss:// (TLS) |
| Mikrofon-Daten-Exfiltration | Information Disclosure | Audio geht direkt zu Deepgram (kein eigener Server), Deepgram hat eigene Privacy-Policy |

**Kritisch:** Der Token-Endpoint `/api/voice/token` sollte mit Rate-Limiting geschuetzt werden. Upstash Redis ist bereits im Stack — dasselbe Pattern wie bei anderen API-Routes nutzen.

---

## Sources

### Primary (HIGH confidence)
- [Deepgram Live Transcription Mic Browser](https://deepgram.com/learn/live-transcription-mic-browser) — WebSocket URL, MediaRecorder Pattern, 250ms chunks [VERIFIED]
- [Deepgram API Key Protecting](https://deepgram.com/learn/protecting-api-key) — Security-Architektur, Token-Ansatz [VERIFIED]
- [Deepgram Token-Based Auth](https://developers.deepgram.com/guides/fundamentals/token-based-authentication) — /auth/grant Endpoint, 30s TTL, JWT-Auth [VERIFIED]
- [MDN Web Audio API Visualizations](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API) — AnalyserNode, getByteFrequencyData, fftSize [VERIFIED]
- [Deepgram Endpointing/Interim Results](https://developers.deepgram.com/docs/understand-endpointing-interim-results) — is_final vs speech_final, Akkumulations-Pattern [VERIFIED]
- [Deepgram Models & Languages](https://developers.deepgram.com/docs/models-languages-overview) — nova-3 German, language=multi [VERIFIED]
- npm registry — `@deepgram/sdk@5.0.0` [VERIFIED]

### Secondary (MEDIUM confidence)
- [Deepgram SDK GitHub](https://github.com/deepgram/deepgram-js-sdk) — v5 API Struktur, Browser-Support Statement
- [CSS Tricks rAF React](https://css-tricks.com/using-requestanimationframe-with-react-hooks/) — cancelAnimationFrame Cleanup Pattern

### Tertiary (LOW confidence)
- iOS Safari AudioContext Suspended — aus WebKit Bug Tracker und Community-Reports (kein offiz. MDN-Fix dokumentiert)
- audio/mp4 auf iOS + Deepgram Kompatibilitaet — keine direkte offizielle Quelle gefunden

---

## Metadata

**Confidence breakdown:**
- Deepgram WebSocket & Token: HIGH — offiziell verifiziert
- Web Audio API AnalyserNode: HIGH — MDN verified
- iOS-spezifische Workarounds: LOW — nur Community-Reports
- MediaRecorder mimeType cross-browser: MEDIUM — bekannte Browser-Diffs, kein Deepgram-offizielle Tabelle
- nova-3 language=multi Qualitaet fuer Deutsch: MEDIUM — community-Feedback gemischt

**Research date:** 2026-04-15
**Gueltig bis:** 2026-05-15 (Deepgram API stabil, aber nova-Modell-Updates moeglich)
