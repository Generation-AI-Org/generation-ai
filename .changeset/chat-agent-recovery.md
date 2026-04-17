---
"@genai/tools-app": patch
---

Fix member-mode chat agent always returning "Ich konnte keine vollständige Antwort finden."

Three related fixes that together restore the member/Pro chat:

1. **Root cause: Gemini 3 thinking over-planned.** Gemini 3 Flash has
   non-disableable reasoning. Without a `reasoning_effort` hint the
   default effort makes the model keep planning more tool calls
   instead of synthesizing an answer, so `finish_reason: stop` never
   fires. Fix: send `reasoning_effort: 'low'` and switch to
   `max_completion_tokens: 8000` (OpenAI-compat param that includes
   reasoning tokens for thinking models). Also log `reasoning_tokens`
   from `completion_tokens_details` to verify the budget is healthy.

2. **Safety net for remaining loops.** Even with low reasoning, a
   pathological prompt could still exhaust iterations. When max
   iterations is reached, issue one final completion with no tools
   to force synthesis from the context already gathered. Costs one
   extra API call only for queries that would otherwise fail.

3. **Tool-Highlighting never fired.** `/api/chat` hardcoded
   `recommendedSlugs: []` for member mode while the agent populated
   `sources: ContentSource[]`. The frontend only highlights tools
   based on `recommendedSlugs`. Fix: derive
   `recommendedSlugs` from `sources.map(s => s.slug)`.
