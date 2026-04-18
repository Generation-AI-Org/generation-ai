---
phase: 15-chat-ueberall-global-context-aware
verified: 2026-04-18T00:00:00Z
status: passed
score: 8/8 must-haves verified
overrides_applied: 0
---

# Phase 15: Chat überall — global + Context-aware — Verification Report

**Phase Goal:** FloatingChat aus AppShell-Lock lösen — Chat ist auf allen authed Routen (Home, Detail, Settings) verfügbar; `/login` ausgenommen. Desktop-Detail-Seiten: Chat wird 400px Sidebar, Agent bekommt Tool-Kontext, Session überlebt Navigation, Analytics-Event feuert, Auto-Resize hält.
**Verified:** 2026-04-18
**Status:** passed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths (ROADMAP Success Criteria + CONTEXT D-01..D-07)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Chat auf Home, Detail, Settings sichtbar; `/login` ausgenommen | ✓ VERIFIED | `ConditionalGlobalLayout.tsx:14` `BARE_ROUTES = ['/login']`; `app/layout.tsx:115` wrappt Root mit `ConditionalGlobalLayout`; `GlobalLayout.tsx:249` rendert `<FloatingChat>` global |
| 2 | Desktop `/[slug]` Sidebar-Mode 400px rechts bei expand; Main shrinks via `lg:mr-[400px]`; Collapse → 100% | ✓ VERIFIED | `FloatingChat.tsx:116` `isSidebarMode = !!context && isExpanded && isOpen && isDesktop`; `FloatingChat.tsx:449` `lg:w-[400px]`; `GlobalLayout.tsx:237-243` main `lg:mr-[400px]` wenn `chatContext && isChatExpanded`, sonst `''` (= 100%) |
| 3 | Agent-System-Prefix mit Tool-Context in `/api/chat` wenn `context` im Request | ✓ VERIFIED | `api/chat/route.ts:24-35` context validation; `route.ts:86-90` `contextPrefix = "Der User liest gerade: {title} ({type})\nKurzbeschreibung: {summary}\nSlug: {slug}\n\n"` + `messageForLLM = contextPrefix + sanitizedMessage` → fließt in `runAgent()` / `getRecommendations()` |
| 4 | Empty-State Title "Fragen zu {ToolName}?" + 3 Chips (exakte CONTEXT.md-Strings) | ✓ VERIFIED | `FloatingChat.tsx:493,873` `Fragen zu ${context.title}?`; `QuickActions.tsx:34` "Wie unterscheidet sich das von ähnlichen Tools?"; `:39` `Für welche Use-Cases passt ${context.title}?`; `:44` "Wie fange ich an?" — alle wortgleich zu CONTEXT D-04 |
| 5 | SessionStorage Key für Chat-Session survives Navigation | ✓ VERIFIED | `FloatingChat.tsx:15` `STORAGE_KEY = 'genai-chat-session'` (global, nicht per-route); load `:121` + save `:141`. Gleicher FloatingChat-Mount bleibt über alle non-bare Routen erhalten (GlobalLayout ist Root-Wrapper) → Component-State persistiert Client-Navigation |
| 6 | Analytics-Event `chat_opened_from_route` wird gefired | ✓ VERIFIED | `lib/analytics.ts:6-11` typed payload schema; `:13` `trackEvent` export; `FloatingChat.tsx:13` import; `:420-428` `handleKiwiClick` fires `trackEvent('chat_opened_from_route', { route, context_slug, mode })` on open (`!isOpen` guard, no double-count); `:753` onClick wired |
| 7 | Mobile bleibt immer Floating (isDesktop + `lg:` Gate) | ✓ VERIFIED | `FloatingChat.tsx:34` `isDesktop` state; `:106-112` matchMedia `(min-width: 1024px)`; `:116` isSidebarMode gated auf isDesktop; `GlobalLayout.tsx:240` Shrink-Klasse ist `lg:mr-[400px]` → greift unter 1024px sowieso nicht. Doppelte Absicherung wie in 15-02-SUMMARY beschrieben |
| 8 | Auto-Resize Fix für Desktop-Chat-Input hält | ✓ VERIFIED | `FloatingChat.tsx:51-57` `resizeTextarea` callback als single source of truth; `:248-249` `useEffect([message, isExpanded, resizeTextarea])` triggert resize bei Typing + Voice-Transcript. Kein separater Render-Branch in Sidebar-Mode (nur conditional classes) → textarea-DOM stabil, kein Remount, Phase-14 Fix (commit `d22b452`) bleibt intakt |

**Score:** 8/8 truths verified

---

### Required Artifacts (Level 1-3)

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `apps/tools-app/components/layout/GlobalLayout.tsx` | Header + FloatingChat + Main-Shrink | ✓ VERIFIED | 259 LOC, exportiert default; FloatingChat auf :249; Main-Shrink `lg:mr-[400px]`/`md:mr-[35%]` konditional; HighlightContext + SearchContext providers |
| `apps/tools-app/components/layout/ConditionalGlobalLayout.tsx` | Route-Gate Wrapper | ✓ VERIFIED | 33 LOC; `usePathname` + BARE_ROUTES-Check; wraps in ChatContextProvider + GlobalLayout für non-bare |
| `apps/tools-app/components/layout/ChatContextProvider.tsx` | Client-Context für Detail-Route Context-Payload | ✓ VERIFIED | 33 LOC; `useState<ChatContext \| null>(null)`; safe fallback für out-of-tree consumers |
| `apps/tools-app/components/detail/DetailPageShell.tsx` | Detail-Wrapper, setzt ChatContext on mount / clear on unmount | ✓ VERIFIED | 36 LOC; useEffect mit setChatContext({slug,title,type,summary}) + cleanup zu null |
| `apps/tools-app/components/chat/FloatingChat.tsx` | context-Prop + Sidebar-Mode + Analytics + Auto-Resize | ✓ VERIFIED | isDesktop + isSidebarMode (:116); lg:w-[400px] branch (:449); handleKiwiClick analytics (:420); resizeTextarea SSOT (:51) |
| `apps/tools-app/app/api/chat/route.ts` | Context-Validation + System-Prefix | ✓ VERIFIED | validContext-Gate (:24-35); contextPrefix (:86-88); messageForLLM = contextPrefix + sanitizedMessage (:90); prefix NICHT in DB (:93-97) |
| `apps/tools-app/lib/analytics.ts` | trackEvent helper + chat_opened_from_route payload type | ✓ VERIFIED | 42 LOC; typed EventPayloads; window.va + Sentry sinks; try/catch never-throw |
| `apps/tools-app/app/[slug]/page.tsx` | Wrapped in DetailPageShell, eigener Header entfernt | ✓ VERIFIED | Import + wrap mit `<DetailPageShell item={item}>`; article content mit `max-w-2xl`; kein eigener Top-Header (nur Back-Link + Hero) |
| `apps/tools-app/app/layout.tsx` | Root wrapped in ConditionalGlobalLayout | ✓ VERIFIED | :115 `<ConditionalGlobalLayout mode={mode}>{children}</ConditionalGlobalLayout>` |
| `apps/tools-app/app/login/page.tsx` | Bare — kein GlobalLayout/Chat | ✓ VERIFIED | Standalone `min-h-screen` Container, kein GlobalLayout/FloatingChat import; wird durch BARE_ROUTES-Gate gefiltert |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|----|--------|---------|
| Detail page (`/[slug]`) | ChatContextProvider | DetailPageShell.useEffect setChatContext | ✓ WIRED | page.tsx wraps in `<DetailPageShell>`; DetailPageShell setzt context im Mount-Effect |
| ChatContextProvider | GlobalLayout | useChatContext hook | ✓ WIRED | GlobalLayout.tsx:60 `const { chatContext } = useChatContext()` |
| GlobalLayout | FloatingChat | `context={chatContext ?? undefined}` prop | ✓ WIRED | GlobalLayout.tsx:253 |
| FloatingChat | /api/chat | fetch body includes `context` | ✓ WIRED | FloatingChat.tsx:302 `context, // undefined on Home/Settings, set on /[slug]` |
| /api/chat | Agent/Recommendations | `messageForLLM = contextPrefix + sanitizedMessage` | ✓ WIRED | route.ts:90 + :101 `runAgent(messageForLLM, history)`, :120 `getRecommendations(messageForLLM, ...)` |
| FloatingChat | Analytics | trackEvent('chat_opened_from_route', ...) | ✓ WIRED | handleKiwiClick (:420) wired zu Kiwi-Button onClick (:753) |
| FloatingChat (isExpanded) | GlobalLayout main shrink | onExpandChange callback | ✓ WIRED | GlobalLayout.tsx:251 `onExpandChange={setIsChatExpanded}` → :237 main class toggle |

---

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|--------------|--------|---------------------|--------|
| FloatingChat | `context` prop | GlobalLayout → useChatContext → ChatContextProvider state set by DetailPageShell useEffect with real `ContentItem` (fetched via `getItemBySlug` in server component) | Yes (live DB item) | ✓ FLOWING |
| /api/chat | `context` body field | fetch payload in FloatingChat line 302 includes `context` from prop | Yes | ✓ FLOWING |
| /api/chat | `messageForLLM` | contextPrefix + sanitizedMessage, fed to runAgent/getRecommendations | Yes (LLM receives prefix) | ✓ FLOWING |
| Analytics | `chat_opened_from_route` payload | `{ route: window.location.pathname, context_slug: context?.slug, mode }` — real runtime values | Yes | ✓ FLOWING |

---

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Build passes | `pnpm --filter tools-app build` (per 15-0*-SUMMARY) | 46 static pages generated, 3 Task-Runs grün | ✓ PASS (from summaries) |
| Typecheck | `pnpm tsc --noEmit` (per summaries) | Keine Fehler | ✓ PASS (from summaries) |
| Git commits exist | git log | `863d6f4`, `cbdde98`, `d45c843`, `e825f63`, `6a361e9`, `969fa14`, `c1770d5`, `7739de9` — alle 8 Commits da | ✓ PASS |
| Chip strings exact | grep CONTEXT D-04 wording | Alle 3 strings wortgleich in QuickActions.tsx | ✓ PASS |

---

### Anti-Patterns Found

None. Scanned:
- No `TODO`/`FIXME`/`PLACEHOLDER` in phase-modified files
- No `return null` / empty handlers in Chat / Layout code paths
- No hardcoded empty arrays/objects in render paths
- Context-Provider exposes safe fallback (no silent error swallow, intentional no-op for out-of-tree)
- Analytics helper's try/catch is documented, never-throw by design (not silent-swallow anti-pattern)

---

### Human Verification Required

None. All automated checks passed; Luca hat in SUMMARYs visuelle Smoke-Tests als optional markiert (keine Blocker, kein Gap). Falls gewünscht: Manueller Smoke-Test `/[slug]` Sidebar-Expand auf Desktop + Mobile-Floating-Invariant bleibt offen (nicht blocking).

---

### Gaps Summary

Keine Gaps. Alle 5 ROADMAP Success Criteria + alle 7 CONTEXT.md LOCKED-Decisions (D-02, D-03, D-04 + Discretion D-01, D-05, D-06, D-07) sind im Code umgesetzt, verdrahtet und semantisch konsistent mit den Locked-Strings. Die 8 SUMMARY-Must-Haves aus den 3 Waves entsprechen 1:1 den verifizierten Truths.

**Bonus-Erkenntnisse:**
- `ChatContextProvider` liefert safe Fallback — auch außerhalb des Providers (z.B. `/login`) crashen Consumer nicht.
- `contextPrefix` wird bewusst NICHT in `chat_messages` persistiert (DB-Bloat + PII-Surface) — dokumentiert in Summary-Decisions, korrekt umgesetzt in `route.ts:93-97`.
- `max-w-prose`-Toggle wurde bewusst nicht gebaut (Artikel bleibt `max-w-2xl`, Shrink kommt aus Main-Area `lg:mr-[400px]`) — dokumentierter Trade-off im 15-03-SUMMARY.

---

_Verified: 2026-04-18_
_Verifier: Claude (gsd-verifier, Opus 4.7)_
