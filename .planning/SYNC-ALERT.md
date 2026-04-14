# SYNC ALERT — VOR JEDEM PUSH LESEN

**Stand:** 2026-04-14 02:55
**Von:** Parallel Session (Fixes + UI)

---

## KRITISCH: Vor jedem Push

```bash
git pull origin main --rebase
```

Sonst überschreibst du meine Fixes oder bekommst Konflikte.

---

## Was ich geändert habe (seit deinem letzten Pull)

### 1. tools-app Fixes (500er behoben)
- `proxy.ts` — CSP Header disabled (Edge Runtime Problem)
- `lib/env.ts` — LLM Keys optional gemacht, ZHIPU_API_KEY hinzugefügt
- `app/layout.tsx` — SpeedInsights disabled
- `lib/agent.ts` — Lazy-init für LLM Clients, Logging

### 2. Website Logo
- `components/layout/header.tsx` — Theme-aware Logo
- `components/layout/footer.tsx` — Theme-aware Logo, gleiche Größe wie Header

### 3. tools-app Chat UX
- `components/chat/ChatInput.tsx` — Textarea bleibt aktiv während Loading
- `components/chat/ChatPanel.tsx` — AbortController, Stop-Button

---

## Betroffene Dateien (Konflikt-Risiko)

```
apps/tools-app/
├── app/layout.tsx          ← SpeedInsights disabled
├── proxy.ts                ← CSP disabled  
├── lib/env.ts              ← Keys optional
├── lib/agent.ts            ← Lazy-init + Logging
└── components/chat/*       ← UX improvements

apps/website/
└── components/layout/*     ← Logo changes
```

---

## Für dich

Phase 7 Testing sollte keine Konflikte haben — andere Dateien.

Aber **immer vor Push pullen**, sonst Chaos.

---

**Diese Datei nach dem Pull löschen oder ignorieren.**
