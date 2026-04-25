---
"@genai/website": minor
---

phase 26 — refactor Tool-Showcase + Community-Preview to async Server Components, wire to /api/public/featured-tools (ISR 300s, AbortController-Timeout, 12-Tool-Fallback) and MDX article data (3 latest from getAllArticles). HomeClient now accepts both sections as ReactNode props from app/page.tsx; TerminalSplash, transition wrapper, main element + MotionConfig preserved 1:1.
