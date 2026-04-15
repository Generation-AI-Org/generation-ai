# Phase 11: Performance Polish

> Micro-Optimierungen für smoother UI, schnellere Renders, bessere UX

## Goal

UI-Performance verbessern ohne Funktionalität zu ändern. Fokus auf:
- Weniger Re-Renders
- GPU-beschleunigte Animationen
- Kleinere Bundle-Auswirkungen
- Cleaner Production Code

## Tasks

### T1: Console.logs entfernen [CRITICAL] ✓
**Datei:** `FloatingChat.tsx`
- [x] Zeile 68-70: Console.logs entfernt

### T2: MarkdownContent memoizen [CRITICAL] ✓
**Datei:** `MessageList.tsx`
- [x] `MarkdownContent` mit `React.memo()` gewrapped
- [x] Components mit `useMemo()` stabilisiert
- [x] Type-Import von react-markdown für korrekte Typisierung

### T3: Audio-Bars CSS-optimieren [HIGH] ✓
**Datei:** `VoiceInputButton.tsx`
- [x] 12x motion.div → Native div mit CSS transform
- [x] `transform: scaleY()` statt `height` (GPU-beschleunigt)
- [x] `will-change: transform` hinzugefügt

### T4: ContentCard memoizen [MEDIUM] ✓
**Datei:** `ContentCard.tsx`
- [x] `React.memo()` implementiert

### T5: Inline Styles → Tailwind [MEDIUM] ✓
**Datei:** `FloatingChat.tsx`, `globals.css`
- [x] Neue Utility-Klassen: `animate-dropdown`, `animate-slide-in`, `animate-pop-in`, `animate-fade-in`
- [x] `dropdown-glow` Klasse für konsistenten Shadow
- [x] Alle inline animation styles durch Klassen ersetzt

### T6: GPU-Hints für Animationen [LOW] ✓
**Datei:** `globals.css`
- [x] `will-change: transform, opacity` zu allen Animation-Klassen hinzugefügt

### T7: Lucide Icons konsistent nutzen [LOW] — SKIPPED
**Reason:** Inline SVGs sind für spezifische Animationen (split path für Pfeil/Tür) nötig. Kein Gewinn durch Wechsel.

### T8: FloatingChat lazy loading [MEDIUM] ✓
**Datei:** `AppShell.tsx`
- [x] `dynamic()` import mit `ssr: false`
- [x] Chat wird erst geladen wenn nötig → kleineres Initial Bundle

### T9: Above-the-fold Image Priority [LOW] ✓
**Dateien:** `ToolLogo.tsx`, `ContentCard.tsx`, `CardGrid.tsx`
- [x] `priority` prop durch Komponenten-Kette
- [x] Erste 6 Cards bekommen `priority={true}`
- [x] Preloads LCP-relevante Bilder

## Nicht in Scope

- useReducer Refactoring (zu viel Risiko für Breaking Changes)
- Framer Motion komplett entfernen (Voice-Button braucht layout Animation)

## Verification

Nach jeder Änderung:
1. `pnpm dev` - App startet ohne Errors
2. Browser öffnen - Alle Features funktionieren
3. Animations smooth

## Rollback

Bei Problemen: Git revert einzelner Commits möglich (atomic commits)
