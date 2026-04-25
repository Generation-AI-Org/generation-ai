---
"@genai/circle": patch
"website": patch
---

fix(25): createMember atomic (skip_invitation + space_ids + password) + Bug #6 response-parse

Two changes in one (both verified live against Circle):

1. **Bug #6** — `createMember` was reading `member.id` from the POST response, but
   Circle wraps the new member in a `community_member` key. Result: every signup
   wrote `circle_member_id: "undefined"` (literal string) into Supabase user_metadata,
   then the post-confirm SSO mint failed because `Number("undefined") = NaN`. Fixed
   by parsing `response.community_member.id`. Regression-guard test added.

2. **Atomic create** — Circle's POST /community_members accepts three additional
   params we weren't using:
   - `skip_invitation: true` → suppresses Circle's own invitation email (we send
     ours via Resend; users were getting two emails)
   - `space_ids: [<int>]` → adds member to spaces atomically, no separate
     addMemberToSpace call needed
   - `password: <random>` → required by Circle; users never see/use it (login
     happens via Headless SSO). Generator meets Circle's policy.

Net effect:
- 1 Circle API call per signup instead of 2 (no addMemberToSpace round-trip)
- 1 confirmation email instead of 2 (only ours, not Circle's)
- Mail CTA copy: "Loslegen →" → "In die Community →" — sets correct expectation
- circle-reprovision admin route also updated to match (was using stale
  addMemberToSpace signature from before Bug #1 fix)
