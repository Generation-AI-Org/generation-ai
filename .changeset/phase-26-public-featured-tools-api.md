---
"@genai/tools-app": minor
"@genai/website": patch
---

phase 26 — add `GET /api/public/featured-tools` (no-auth, edge-cached `s-maxage=300, swr=1800`) on tools-app for the website's Tool-Showcase. Broaden vitest include-pattern in tools-app to discover co-located `__tests__/` directories. Extract `BeispielBadge` from `tool-showcase-section.tsx` to `components/ui/beispiel-badge.tsx` on the website (D-15 prep).
