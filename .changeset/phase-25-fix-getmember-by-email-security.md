---
"@genai/circle": patch
"website": patch
---

fix(25): SECURITY — getMemberByEmail now uses /community_members/search (Bug #5, DSGVO-critical)

`getMemberByEmail` was hitting `GET /community_members?email=X&community_id=Y` as a
Plan-B "best guess" path. Live-verified 2026-04-25: Circle's Admin v2 silently ignores
the `email` query parameter on the plain `/community_members` collection endpoint and
returns the unfiltered list. The function then took `.records[0]` — i.e. **every new
signup was assigned the first member of the community as their `circle_member_id`**.

In practice this meant Phase-25 test signups were all writing the wrong person's
`community_member_id` into Supabase user_metadata, and the seamless-SSO redirect
post-confirm logged the new user into someone else's Circle account. DSGVO-critical
session confusion across users.

Fix: switch to `/community_members/search?email=` (the real email-resolved endpoint —
returns 200 + single object on match, 404 on no-match). Tests updated to assert the
exact path and to guard against a regression back to the unfiltered endpoint.
