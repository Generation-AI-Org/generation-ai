---
"@genai/circle": patch
"website": patch
---

fix(25): correct addMemberToSpace payload — Circle expects `{email, space_id:int}`, not `community_member_id` (Bug #1)

Plan-B shipped `addMemberToSpace` with `{space_id, community_member_id}` as a best-guess
payload that returned 404 in production. Live-verified against Circle MCP schema and
real API call: the endpoint resolves the member by email, not member ID, and `space_id`
must be an integer (not the string from `process.env.CIRCLE_DEFAULT_SPACE_ID`).

Signature changed from `addMemberToSpace(memberId, spaceId)` to
`addMemberToSpace(email, spaceId)`. Call site in `apps/website/app/actions/signup.ts`
now passes `email` directly. Tests updated to match new contract + new test asserts
exact wire-payload shape.
