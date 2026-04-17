---
"@genai/tools-app": patch
---

Fix member-mode chat agent always returning "Ich konnte keine vollständige Antwort finden."

Two independent bugs that together broke the member/Pro chat experience:

1. **Tool-Highlighting never fired.** `/api/chat` hardcoded
   `recommendedSlugs: []` for member mode while the agent actually
   populated `sources: ContentSource[]`. The frontend only highlights
   tools based on `recommendedSlugs`, so the highlight UI never
   triggered even when the agent correctly identified relevant tools.
   Fix: derive `recommendedSlugs` from `sources` (`sources.map(s => s.slug)`).

2. **Agent hit max iterations before synthesizing.** Gemini 3 Flash
   kept requesting more tool calls and never emitted a terminal
   `finish_reason: stop`. After 5 iterations the agent returned a
   hard-coded fallback error text. Vercel Function Logs confirmed
   every request exhausted all 5 Gemini calls.
   Fix: when max iterations is reached, issue one final completion
   with `tools: []` (synthesis-only). This forces the model to
   answer from the context it has already gathered instead of
   asking for more searches. Standard agent recovery pattern — costs
   one extra LLM call only for queries that would otherwise fail.
