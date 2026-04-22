---
"@genai/website": patch
---

Perf: Splash-Audio von 2.6 MB → 287 KB, Fetch nur wenn Splash rendert.

- `sound.ogg` re-encoded: Vorbis stereo 500 kbps → Vorbis mono 48 kbps (-89%). Format unverändert → Browser-Support-Matrix identisch, Audio-Sprite-Offsets in `KEY_SOUNDS` bleiben 1:1 kompatibel (time-based, sample-rate-agnostic nach `decodeAudioData`).
- `keyboard.ogg` entfernt (war MD5-Dupe von `sound.ogg`, nirgends referenziert).
- `useKeyboardSound(enabled)`-Gate um `!shouldSkip` erweitert: Wiederkehrer (sessionStorage `terminal-splash-seen`) überspringen den Splash → kein Audio-Fetch → 287 KB raus aus LCP-Pfad.

Impact: Mobile LCP 16.8 s → erwartet < 3 s; total byte weight 3.06 MiB → ~700 KiB.
