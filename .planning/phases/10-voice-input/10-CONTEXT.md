# Phase 10: Voice Input - Context

**Gathered:** 2026-04-15
**Status:** Ready for planning

<domain>
## Phase Boundary

**In Scope:**
- Spracheingabe für den Chat mit professioneller Audio-Visualisierung
- Deepgram API Integration für hochqualitative Transkription
- Live-Transkription während dem Sprechen (Interim Results)
- Manueller Stopp durch User
- Cross-Browser Support (Desktop, Mobile, Tablet)
- Echte Audio-Pegel-Visualisierung via Web Audio API

**Out of Scope:**
- Text-to-Speech (Antworten vorlesen)
- Voice Commands (Navigation per Sprache)
- Offline-Modus
- Eigenes STT-Modell hosten

</domain>

<decisions>
## Implementation Decisions

### STT-Engine
- **LOCKED:** Deepgram API für Speech-to-Text
- User hat $200 Guthaben
- Streaming via WebSocket für Echtzeit-Transkription
- API Key wird als DEEPGRAM_API_KEY Env-Var gespeichert

### Audio-Visualisierung
- **LOCKED:** Echte Audio-Pegel via Web Audio API AnalyserNode
- Keine fake Random-Animation
- Bars zeigen tatsächliche Frequenzen/Amplitude

### Live-Transkription
- **LOCKED:** Interim Results anzeigen während User spricht
- Text erscheint live im Textarea oder separatem Preview
- Finales Ergebnis ersetzt Interim-Text

### Stopp-Modus
- **LOCKED:** Manueller Stopp durch Button-Klick
- Kein Auto-Stopp nach Stille

### Text-Handling
- **LOCKED:** Transkribierter Text wird ins Textarea eingefügt
- User kann editieren vor dem Senden
- Kein Auto-Send

### Sprache
- **LOCKED:** Auto-Detect (Deepgram erkennt Sprache automatisch)
- Primär Deutsch, aber auch Englisch möglich

### Browser-Support
- **LOCKED:** Alle modernen Browser
- Desktop: Chrome, Safari, Firefox, Edge
- Mobile: iOS Safari, Chrome Android
- Tablet: iPad Safari, Chrome

### Fallback
- **CLAUDE'S DISCRETION:** Was passiert wenn Deepgram nicht erreichbar?
- Option: Graceful degradation zu Browser Speech API
- Option: Error Message + Retry

### UI-Integration
- **CLAUDE'S DISCRETION:** Genau wie der VoiceInputButton aussieht
- Muss zur Glassmorphism-Ästhetik passen
- Soll die animierten Bars aus molecule-ui/voice-input verwenden

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing Voice Code
- `apps/tools-app/hooks/useVoiceInput.ts` — Aktueller Hook (Web Speech API, wird ersetzt)
- `apps/tools-app/components/ui/VoiceInputButton.tsx` — UI-Komponente mit Animation
- `apps/tools-app/components/chat/FloatingChat.tsx` — Integration in Chat

### Design System
- Phase 9 etablierte Glassmorphism + Glow-Effekte
- CI-Farben: --accent (Kiwi-Grün), --accent-glow

### Deepgram Docs
- https://developers.deepgram.com/docs/streaming
- https://developers.deepgram.com/docs/getting-started-with-live-streaming-audio

</canonical_refs>

<specifics>
## Specific Ideas

### VoiceInputButton Animation
User hat diese Komponente von 21st.dev referenziert:
- https://21st.dev/community/components/molecule-ui/voice-input/default
- Animierte Bars die expandieren
- Timer zeigt Aufnahmedauer
- Smooth Transition beim Start/Stop

### Audio-Visualisierung
- 12 Bars wie in der Referenz
- Aber mit echten Audio-Pegeln statt Random
- Rot während Aufnahme

### Flow
1. User klickt Mic-Button
2. Mikrofon-Permission wird angefragt (falls noch nicht erteilt)
3. WebSocket zu Deepgram öffnet sich
4. Audio wird gestreamt, Bars zeigen Pegel
5. Interim-Transkription erscheint live
6. User klickt Stop
7. Finaler Text landet im Textarea

</specifics>

<deferred>
## Deferred Ideas

- Voice Commands ("Sende Nachricht", "Lösche das")
- Text-to-Speech für Bot-Antworten
- Sprachauswahl-Dropdown
- Aufnahme-Qualitäts-Einstellungen

</deferred>

---

*Phase: 10-voice-input*
*Context gathered: 2026-04-15 via discuss-phase*
