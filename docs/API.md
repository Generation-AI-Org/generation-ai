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

### POST /api/auth/signup (Phase 25, feature-flagged)

Unified signup endpoint. Feature-flagged via `SIGNUP_ENABLED` env var (default `false` → 503).

**Auth:** None (public, rate-limited 5/15min per IP).

**Content-Type:** `multipart/form-data` oder `application/x-www-form-urlencoded`

**Fields:**

```
email=user@example.com            (required)
name=Jane Doe                     (required)
university=TU Berlin              (required)
study_program=Informatik          (optional)
marketing_opt_in=on               (optional)
consent=on                        (required)
redirect_after=/join/welcome      (optional, same-origin absolute path)
status=student                    (optional: student | pre-studium | early-career)
motivation=Karriere                (optional)
level=3                            (optional: 1-5)
website=                           (honeypot — must be empty)
```

**Response:**

- `200 { ok: true }` — success (user created, mail sent)
- `400 { ok: false, error, fieldErrors? }` — validation failed
- `429 { ok: false, error }` — rate limit reached
- `503 { error }` — `SIGNUP_ENABLED=false` (default, until Phase 27)

**Idempotency:** Duplicate email returns `{ ok: true }` silently (no-leak, no re-send).

**Flow (when SIGNUP_ENABLED=true):**

1. Honeypot + rate-limit + Zod validate
2. `admin.createUser({ email_confirm:false, user_metadata:{...} })`
3. Circle `createMember` + `addMemberToSpace` (non-blocking, D-03)
4. Upsert `user_circle_links` + stamp `circle_member_id` in user_metadata
5. `admin.generateLink({ type:'magiclink' })` triggert Confirm-Mail

**Rate Limit:** 5 Requests / 15 min pro IP (Upstash).

---

### POST /api/admin/circle-reprovision (Phase 25)

Admin-only: Retry Circle provisioning für einen User, dessen Signup-Circle-Call fehlgeschlagen ist.

**Auth:**
- Session required (`Cookie: sb-...`)
- UND (`user_metadata.role === 'admin'` ODER `user.email` in `ADMIN_EMAIL_ALLOWLIST`)

**Content-Type:** `application/json`

**Rate Limit:** 20 Requests / 15 min pro Admin-User-ID.

**Request:**

```json
{ "email": "user@example.com" }
```

**Response:**

- `200 { ok: true, circleMemberId, alreadyExists }` — success
- `400 { error }` — invalid body / content-type
- `401 { error: "Not authenticated" }` — no session
- `403 { error: "Not authorized (admin only)" }` — session aber kein admin
- `404 { error: "User not found" }` — target email existiert nicht in Supabase
- `429 { error: "Rate limit exceeded" }` — zu viele Reprovisions
- `502 { error: "Circle API failed", code, correlationId }` — Circle-API-Fehler
- `500 { error: "Internal error" }` — unbekannter Fehler

Alle Errors werden in Sentry mit Tag `circle-api:true` + `op:adminReprovision.*` geloggt inkl. `target_user_id` + `admin_user_id` (UUIDs, kein PII).

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
