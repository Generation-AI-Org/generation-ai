---
"website": patch
---

fix(25): update join success-card copy from waitlist-V1 to real-signup confirmation (Bug #4)

The join-success-card was built for the Phase 23 waitlist flow ("Du stehst auf der
Warteliste. Wir melden uns, sobald wir live gehen."), but Phase 25 now performs a
real signup with email confirmation. Copy now matches the real flow:

- Headline: "Willkommen, {firstName}! Du bist gleich drin."
- Body: "Wir haben dir eine Bestätigungs-E-Mail geschickt. Klicke den Link darin —
  danach bist du eingeloggt und in der Community."

CTAs unchanged.
