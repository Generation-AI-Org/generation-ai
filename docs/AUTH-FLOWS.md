# Auth Flows — Generation AI

> Vollstaendige Dokumentation aller Authentifizierungs-Flows

Stand: 2026-04-16

---

## Uebersicht

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              SUPABASE AUTH                                  │
│                      wbohulnuwqrhystaamjc.supabase.co                       │
│                                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │ auth.users  │  │  profiles   │  │chat_sessions│  │   chat_messages     │ │
│  │             │←─│  CASCADE    │  │  user_id    │  │      user_id        │ │
│  │  id, email  │  │  id = user  │  │  (no cascade)│  │    (no cascade)    │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
         ┌─────────────────────┐         ┌─────────────────────┐
         │      WEBSITE        │         │     TOOLS-APP       │
         │  generation-ai.org  │         │ tools.generation-ai │
         │                     │         │                     │
         │  Sign-up: DISABLED  │         │  Login: ✓           │
         │  Login: ✗           │         │  Logout: ✓          │
         │                     │         │  Settings: ✓        │
         │                     │         │  Delete Account: ✓  │
         └─────────────────────┘         └─────────────────────┘
```

---

## Entry Points

| Was | Wo | Status |
|-----|-----|--------|
| **Sign-up** | Website `/api/auth/signup` | DEAKTIVIERT (503) |
| **Login** | tools-app `/login` | Aktiv |
| **Logout** | tools-app `/auth/signout` | Aktiv |
| **Password Reset** | Supabase Dashboard | Aktiv (manuell) |
| **Password Set** | tools-app `/auth/set-password` | Aktiv |
| **Account Delete** | tools-app `/settings` | Aktiv |

---

## Detaillierte Flows

### 1. Sign-up (DEAKTIVIERT)

```
Status: 503 — "Anmeldung ist momentan geschlossen"

Datei: apps/website/app/api/auth/signup/route.ts

Um zu reaktivieren: Git-History fuer alte Implementierung
```

**Frueher (wenn aktiv):**
```
User auf Website → Sign-up Formular → POST /api/auth/signup
→ Supabase signUp() → Magic Link Email → Callback → Eingeloggt
→ Profil in `profiles` Tabelle erstellt
```

---

### 2. Login

**Datei:** `apps/tools-app/app/login/page.tsx`

**URL:** `https://tools.generation-ai.org/login`

```
┌────────────────────────────────────────────────────────────┐
│                      /login                                │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Email: [________________________]                   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Passwort: [________________________] (optional)     │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
│            [ Magic Link senden ]                           │
│                    oder                                    │
│            [ Mit Passwort anmelden ]                       │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

**Flow A: Magic Link (Default)**
```
1. User gibt Email ein
2. Klickt "Magic Link senden"
3. supabase.auth.signInWithOtp({ email })
4. Email mit Link kommt an
5. Link: tools.generation-ai.org/auth/callback#access_token=...&type=magiclink
6. Callback setzt Session
7. Redirect zu /
```

**Flow B: Passwort**
```
1. User klickt "Mit Passwort anmelden"
2. Gibt Email + Passwort ein
3. supabase.auth.signInWithPassword({ email, password })
4. Bei Erfolg: Redirect zu /
5. Bei Fehler: Fehlermeldung

Voraussetzung: User hat Passwort gesetzt (via Reset-Flow oder Supabase Dashboard)
```

---

### 3. Auth Callback

**Datei:** `apps/tools-app/app/auth/callback/page.tsx`

**URL:** `https://tools.generation-ai.org/auth/callback`

```
Eingehende URL-Parameter (Hash):
- access_token
- refresh_token
- type (magiclink | recovery | signup)
- error (optional)

Logik:
1. Parse Hash-Parameter
2. Bei error → Redirect zu /login?error=...
3. Bei Tokens:
   a. setSession({ access_token, refresh_token })
   b. Wenn type=recovery → Redirect zu /auth/set-password
   c. Sonst → Redirect zu /
4. Ohne Tokens → Check ob bereits Session existiert
```

---

### 4. Password Reset / Set

**Trigger:** Supabase Dashboard → Authentication → Users → "Send password recovery"

**Flow:**
```
1. Admin triggert Reset im Dashboard
2. User bekommt Email mit Link
3. Link: tools.generation-ai.org/auth/callback#access_token=...&type=recovery
4. Callback erkennt type=recovery
5. Redirect zu /auth/set-password
6. User gibt neues Passwort ein (min. 8 Zeichen, Bestaetigung)
7. supabase.auth.updateUser({ password })
8. Redirect zu /
```

**Datei:** `apps/tools-app/app/auth/set-password/page.tsx`

**LUECKE:** Es gibt keinen "Passwort vergessen" Link im Login-UI.
User kann Reset nur ueber Admin bekommen.

---

### 5. Logout

**Datei:** `apps/tools-app/app/auth/signout/route.ts`

**URL:** `https://tools.generation-ai.org/auth/signout`

**Methoden:** GET oder POST

```
1. Request zu /auth/signout
2. supabase.auth.signOut()
3. Redirect zu /
```

**Aufruf im UI:** Vermutlich ueber Navigation/Header-Komponente

---

### 6. Account Delete

**UI:** `apps/tools-app/app/settings/page.tsx`
**API:** `apps/tools-app/app/api/account/delete/route.ts`
**Button:** `apps/tools-app/app/settings/DeleteAccountButton.tsx`

**URL:** `https://tools.generation-ai.org/settings`

```
1. User geht zu /settings
2. Scrollt zu "Gefahrenzone"
3. Klickt "Account loeschen"
4. Bestaetigung erscheint
5. Klickt "Endgueltig loeschen"
6. DELETE /api/account/delete
7. Server:
   a. Get current user
   b. DELETE FROM chat_messages WHERE user_id = X
   c. DELETE FROM chat_sessions WHERE user_id = X
   d. supabase.auth.admin.deleteUser(id)
   e. (profiles loescht sich via CASCADE automatisch)
8. Redirect zu /
```

---

## Datenbank-Schema

### auth.users (Supabase-managed)

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| id | uuid | Primary Key |
| email | text | User-Email |
| encrypted_password | text | Passwort-Hash (optional) |
| ... | ... | Weitere Supabase-Felder |

### profiles

```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  university TEXT,
  study_field TEXT,
  ki_level INTEGER CHECK (ki_level >= 1 AND ki_level <= 5),
  interests TEXT[],
  questionnaire_answers JSONB,
  circle_member_id INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

**CASCADE:** Ja — wird automatisch geloescht wenn auth.users geloescht wird.

### chat_sessions

```sql
CREATE TABLE chat_sessions (
  id uuid PRIMARY KEY,
  created_at timestamptz,
  updated_at timestamptz,
  metadata jsonb,
  user_id uuid REFERENCES auth.users(id) -- KEIN CASCADE!
);
```

**CASCADE:** Nein — muss manuell geloescht werden.

### chat_messages

```sql
CREATE TABLE chat_messages (
  id uuid PRIMARY KEY,
  session_id uuid REFERENCES chat_sessions(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id), -- KEIN CASCADE!
  role text,
  content text,
  recommended_slugs text[],
  created_at timestamptz
);
```

**CASCADE:** Nein fuer user_id, Ja fuer session_id.

---

## Session-Management

### Browser Client

**Datei:** `apps/tools-app/lib/supabase/browser.ts`

Erstellt Supabase-Client fuer Client-Komponenten.
Session wird in Cookies gespeichert.

### Server Client

**Datei:** `apps/tools-app/lib/supabase/server.ts`

Erstellt Supabase-Client fuer Server-Komponenten/API-Routes.
Liest Session aus Cookies.

### AuthProvider

**Datei:** `apps/tools-app/components/AuthProvider.tsx`

```tsx
const { user, isLoading } = useAuth()
```

- Reagiert auf `onAuthStateChange`
- Synchronisiert mit SSR `initialUser`

---

## Bekannte Luecken

### 1. Kein Self-Service Sign-up
- Sign-up ist deaktiviert
- Neue User muessen manuell angelegt werden

### 2. Kein "Passwort vergessen" im UI
- User kann nur ueber Admin Reset bekommen
- **Fix:** Link in `/login` hinzufuegen der `supabase.auth.resetPasswordForEmail()` triggert

### 3. Kein "Passwort aendern" fuer eingeloggte User
- User kann nur ueber Reset-Flow Passwort aendern
- **Fix:** In `/settings` Option hinzufuegen

### 4. Kein CASCADE auf chat-Tabellen
- Bei manuellem User-Delete im Dashboard bleiben chat_sessions/messages als Orphans
- Account-Delete API macht es richtig (loescht manuell)
- **Fix:** CASCADE zu Foreign Keys hinzufuegen (SQL im vorherigen Chat)

### 5. profiles-Tabelle wird bei Account-Delete nicht explizit geloescht
- Funktioniert trotzdem durch CASCADE
- Aber: Code in delete/route.ts erwaaehnt es nicht

---

## Umgebungsvariablen

| Variable | Wo | Zweck |
|----------|-----|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Beide Apps | Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Beide Apps | Public Anon Key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Admin-Operationen |

---

## Admin-Operationen (Supabase Dashboard)

| Aktion | Wo | Effekt |
|--------|-----|--------|
| User anlegen | Auth → Users → Add User | Neuer auth.users Eintrag |
| Passwort setzen | Auth → Users → User → Update | Setzt encrypted_password |
| Password Reset senden | Auth → Users → "Send recovery" | Email mit Reset-Link |
| User loeschen | Auth → Users → Delete | Loescht auth.users + profiles (CASCADE) |
| User-Daten sehen | Table Editor → profiles | Profil-Daten |
| Chat-History sehen | Table Editor → chat_sessions/messages | Alle Chats |

---

## Empfohlene Verbesserungen

### Prioritaet 1: "Passwort vergessen" Link
```tsx
// In /login hinzufuegen:
<button onClick={() => supabase.auth.resetPasswordForEmail(email)}>
  Passwort vergessen?
</button>
```

### Prioritaet 2: CASCADE auf chat-Tabellen
```sql
ALTER TABLE chat_sessions 
  DROP CONSTRAINT IF EXISTS chat_sessions_user_id_fkey,
  ADD CONSTRAINT chat_sessions_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE chat_messages 
  DROP CONSTRAINT IF EXISTS chat_messages_user_id_fkey,
  ADD CONSTRAINT chat_messages_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
```

### Prioritaet 3: "Passwort aendern" in Settings
- Neuer Abschnitt in `/settings`
- Altes Passwort + neues Passwort Formular
- `supabase.auth.updateUser({ password })`

### Prioritaet 4: Sign-up reaktivieren
- Route aus Git-History wiederherstellen
- Oder komplett neu bauen mit Questionnaire
