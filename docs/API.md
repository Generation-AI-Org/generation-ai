# API-Dokumentation — Generation AI

> Alle API-Endpoints dokumentiert fuer Claude Code.

---

## tools-app Endpoints

### POST /api/chat

Chat mit dem KI-Assistenten.

**Request:**
```json
{
  "message": "Was ist ChatGPT?",
  "history": [
    { "role": "user", "content": "Hallo" },
    { "role": "assistant", "content": "Hi! Wie kann ich helfen?" }
  ],
  "sessionId": "uuid-optional",
  "mode": "public"
}
```

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| message | string | Ja | User-Nachricht |
| history | ChatMessage[] | Nein | Bisherige Konversation (max 6 werden verwendet) |
| sessionId | string | Nein | Bestehende Session fortsetzen |
| mode | "public" \| "member" | Nein | Chat-Modus (default: "public") |

**Response (200):**
```json
{
  "sessionId": "uuid",
  "text": "ChatGPT ist ein KI-Chatbot von OpenAI...",
  "recommendedSlugs": ["chatgpt", "gpt-4"],
  "sources": [
    { "slug": "chatgpt", "title": "ChatGPT", "type": "tool" }
  ]
}
```

**Errors:**
- `400` — Nachricht fehlt
- `429` — Rate Limit erreicht (20 Requests/Minute)
- `500` — Server Error

**Rate Limiting:**
- 20 Requests pro Minute pro IP+Session
- Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

**Modi:**
- `public` — V1 Full-Context (Gemini 2.5 Flash-Lite)
- `member` — V2 Agent mit Tool-Calling (Gemini 3 Flash)

---

### GET /api/health

Health-Check fuer Monitoring.

**Response (200):**
```json
{
  "status": "ok",
  "timestamp": "2026-04-14T12:00:00.000Z"
}
```

Verwendet von: Better Stack Uptime Monitoring

---

### DELETE /api/account/delete

Loescht den eingeloggten User und alle zugehoerigen Daten.

**Auth:** Erfordert Supabase Session (Cookie)

**Response (200):**
```json
{
  "success": true
}
```

**Errors:**
- `401` — Nicht authentifiziert
- `500` — Loeschfehler

**Loeschreihenfolge:**
1. chat_messages (user_id)
2. chat_sessions (user_id)
3. auth.users (via admin.deleteUser)

---

## website Endpoints

### POST /api/auth/signup

**AKTUELL DEAKTIVIERT** — Gibt immer 503 zurueck.

```json
{
  "error": "Anmeldung ist momentan geschlossen. Wir oeffnen bald wieder!"
}
```

**Reaktivieren:**
```bash
git show HEAD~50:apps/website/app/api/auth/signup/route.ts > apps/website/app/api/auth/signup/route.ts
```

**Urspruenglicher Flow:**
1. User-Daten validieren
2. Supabase User erstellen
3. Profil anlegen
4. Circle Member erstellen
5. Magic Link via Resend senden

---

## Interne Funktionen (lib/)

### agent.ts — runAgent()

V2 Agent mit Tool-Calling.

```typescript
async function runAgent(
  message: string,
  history: ChatMessage[] = []
): Promise<AgentResult>
```

**Verfuegbare Tools:**
- `kb_explore` — KB-Struktur anzeigen
- `kb_list` — Items filtern (category, type)
- `kb_read` — Einzelnes Item lesen
- `kb_search` — Volltextsuche
- `web_search` — Externe Recherche (Exa API)

**Limits:**
- Max 5 Tool-Calls pro Request
- Max 6 History-Messages
- Max 50 Items bei kb_list
- Max 20 Items bei kb_search

---

### llm.ts — getRecommendations()

V1 Full-Context Chat.

```typescript
async function getRecommendations(
  message: string,
  history: ChatMessage[],
  items: ContentItem[],
  mode: ChatMode = 'public'
): Promise<RecommendationResponse>
```

Injiziert alle published content_items als System-Prompt.

---

### content.ts — getFullContent()

Laedt alle published content_items aus Supabase.

```typescript
async function getFullContent(): Promise<ContentItem[]>
```

---

### ratelimit.ts — checkRateLimit()

Upstash Redis Rate Limiting.

```typescript
async function checkRateLimit(
  ip: string,
  sessionId: string
): Promise<RateLimitResult>
```

Config: 20 Requests/Minute sliding window

---

### sanitize.ts — sanitizeUserInput()

XSS-Protection fuer User-Input.

```typescript
function sanitizeUserInput(input: string): string
```

Verwendet DOMPurify (server-side via jsdom).

---

## Supabase Queries

### Content Items laden

```typescript
const { data } = await supabase
  .from('content_items')
  .select('*')
  .eq('status', 'published')
```

### Chat Session anlegen

```typescript
const { data: session } = await supabase
  .from('chat_sessions')
  .insert({ user_id: userId || null })
  .select('id')
  .single()
```

### Chat Message speichern

```typescript
await supabase.from('chat_messages').insert({
  session_id: sessionId,
  role: 'user',
  content: sanitizedMessage,
  user_id: userId || null
})
```

---

## Environment Variables

Siehe [DEPLOYMENT.md](./DEPLOYMENT.md) fuer vollstaendige Liste.

**Kritisch fuer API:**
- `GOOGLE_GENERATIVE_AI_API_KEY` — Gemini API
- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` — Rate Limiting
- `SUPABASE_SERVICE_ROLE_KEY` — Admin-Operationen
- `EXA_API_KEY` — Web Search (optional)

---

*Letzte Aktualisierung: 2026-04-14*
