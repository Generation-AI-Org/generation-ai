# Auth Test Plan

Systematische Checkliste fuer alle Auth-Flows.

## Pre-Test Setup

- [ ] Alle Cookies loeschen (DevTools → Application → Cookies → Clear)
- [ ] Hard Refresh (`Cmd+Shift+R`)
- [ ] Console offen haben fuer Fehler

---

## 1. Unauthenticated User Flows

### 1.1 Homepage (tools.generation-ai.org)
- [ ] Seite laedt ohne Fehler
- [ ] "Anmelden" Button sichtbar im Header
- [ ] Tool-Karten sind sichtbar
- [ ] Chat-Button unten rechts sichtbar

### 1.2 Tool-Detailseite (/chatgpt, /claude, etc.)
- [ ] Seite laedt ohne Fehler
- [ ] Content wird angezeigt
- [ ] Keine Auth-Fehler in Console

### 1.3 Login-Seite (/login)
- [ ] Seite laedt ohne Fehler
- [ ] Email-Feld sichtbar
- [ ] "Magic Link senden" Button (disabled ohne Email)
- [ ] "Mit Passwort anmelden" Toggle funktioniert
- [ ] Passwort-Feld erscheint nach Toggle

---

## 2. Login Flows

### 2.1 Magic Link Login
- [ ] Email eingeben
- [ ] "Magic Link senden" klicken
- [ ] Erfolgs-Meldung erscheint
- [ ] Email kommt an (Spam pruefen!)
- [ ] Link in Email klicken
- [ ] Redirect zu /auth/callback
- [ ] Redirect zu / (Homepage)
- [ ] User ist eingeloggt (kein "Anmelden" mehr, stattdessen Zahnrad)
- [ ] Cookies gesetzt (sb-* in DevTools)

### 2.2 Passwort Login
- [ ] "Mit Passwort anmelden" klicken
- [ ] Email + Passwort eingeben
- [ ] "Anmelden" klicken
- [ ] Redirect zu / (Homepage)
- [ ] User ist eingeloggt
- [ ] Cookies gesetzt

### 2.3 Login Persistence
- [ ] Eingeloggt → Tab schliessen → Tab neu oeffnen
- [ ] User ist noch eingeloggt
- [ ] Eingeloggt → Hard Refresh
- [ ] User ist noch eingeloggt

---

## 3. Authenticated User Flows

### 3.1 Settings (/settings)
- [ ] Zahnrad-Icon klicken
- [ ] Settings-Seite laedt (NICHT Login-Redirect!)
- [ ] Email wird angezeigt
- [ ] "Account loeschen" Button sichtbar

### 3.2 Chat (Member Mode)
- [ ] Chat oeffnen
- [ ] Nachricht senden
- [ ] Antwort kommt
- [ ] Chat-History wird gespeichert

### 3.3 Protected API Routes
- [ ] `/api/chat` funktioniert mit Session
- [ ] `/api/account/delete` erfordert Auth

---

## 4. Password Reset Flow

### 4.1 Trigger Reset (Supabase Dashboard)
- [ ] Authentication → Users → User waehlen
- [ ] "Send password recovery" klicken
- [ ] Email kommt an

### 4.2 Reset Link
- [ ] Link in Email klicken
- [ ] Redirect zu /auth/callback
- [ ] Redirect zu /auth/set-password
- [ ] Passwort-Formular sichtbar

### 4.3 Set New Password
- [ ] Neues Passwort eingeben (min. 8 Zeichen)
- [ ] Passwort bestaetigen
- [ ] "Passwort speichern" klicken
- [ ] Erfolgs-Meldung
- [ ] Redirect zu /
- [ ] User ist eingeloggt

---

## 5. Logout Flow

### 5.1 Logout
- [ ] Eingeloggt sein
- [ ] Logout (wo ist der Button? TODO: pruefen)
- [ ] Redirect zu /
- [ ] "Anmelden" Button wieder sichtbar
- [ ] Cookies geloescht

---

## 6. Account Delete Flow

### 6.1 Delete Account
- [ ] Settings oeffnen (/settings)
- [ ] "Account loeschen" klicken
- [ ] Bestaetigung erscheint
- [ ] "Endgueltig loeschen" klicken
- [ ] Redirect zu /
- [ ] User ist ausgeloggt
- [ ] Login mit alten Credentials schlaegt fehl

### 6.2 Data Cleanup
- [ ] Chat-Sessions geloescht (Supabase Table Editor pruefen)
- [ ] Chat-Messages geloescht
- [ ] Auth User geloescht

---

## 7. Edge Cases

### 7.1 Expired Tokens
- [ ] Magic Link nach 1h → "Link expired" Fehler
- [ ] Session nach langer Inaktivitaet → automatisch refreshed

### 7.2 Invalid Credentials
- [ ] Falsches Passwort → Fehlermeldung
- [ ] Nicht existierende Email → Fehlermeldung

### 7.3 Network Errors
- [ ] Offline → sinnvolle Fehlermeldung
- [ ] Supabase down → sinnvolle Fehlermeldung

---

## Bekannte Issues

| Issue | Status | Notes |
|-------|--------|-------|
| Kein "Passwort vergessen" im UI | TODO | User muss Admin fragen |
| Kein "Passwort aendern" in Settings | TODO | Nur via Reset moeglich |
| Kein Logout-Button | TODO | Wo ist er? Pruefen! |

---

## Test-Accounts

| Email | Passwort | Zweck |
|-------|----------|-------|
| test@generation-ai.org | TestPassword123! | E2E Tests |

---

## Letzte Durchfuehrung

- Datum: ___________
- Von: ___________
- Ergebnis: ___________
