# Phase 27 UI/UX Pro Max Audit

Date: 2026-04-26
Scope: `apps/website`, `apps/tools-app`, shared UI/design tokens.
Mode: Read-only audit. No product UI changes.

## Lens

Used local skill `.codex/skills/ui-ux-pro-max` with:

- Design-system query: `AI education community website tools dashboard dark mode brand`
- UX query: `layout shift form responsive focus`
- Stack query: `layout responsive form accessibility` for Next.js

Important calibration: the skill recommends generic community/dark-mode patterns, but its generated purple/green palette and Fira fonts are not authoritative for this repo. Generation AI brand docs stay source of truth: Geist Sans/Mono, dark default, neon/red accent, blue/pink header bands, Signal over Noise motif.

## Good

- Brand source of truth is explicit and unusually strong: `brand/Generation AI Design System`, `packages/config/tailwind/base.css`, app `AGENTS.md`.
- Website subpages mostly follow a consistent framework: `Header`, `Footer`, `MotionConfig nonce`, `LabeledNodes`, `SectionTransition`.
- Motion is generally reduced-motion aware via `useReducedMotion` and global `prefers-reduced-motion` guards.
- Focus-visible globals exist in both apps and use neutral high-contrast rings, matching brand docs.
- The `/join` layout-shift issue was correctly addressed by decoupling the hero text column from form height.

## Brand-Override Decisions

These are not problems even if the external skill suggests otherwise:

- Keep Geist Sans/Mono instead of generated font pairings.
- Keep neon/red/blue/pink CI palette instead of generated community purple/green.
- Keep editorial-tech dark aesthetic instead of generic SaaS or playful education styles.
- Keep `LabeledNodes`/Signal-Grid motifs; they are brand-defining, not decorative noise.

## Findings

### P1: Tools-app still has visible non-brand decoration

Evidence:
- `apps/tools-app/components/library/ContentCard.tsx` uses `✨` in quick-win cards.
- `apps/tools-app/components/chat/FloatingChat.tsx` contains `bald ✨`.
- `apps/tools-app/components/chat/FloatingChat.tsx` renders a large hand-coded Kiwi SVG with brown/green hard-coded colors.
- `apps/tools-app/components/ui/KiwiMascot.tsx` duplicates similar Kiwi color logic.

Why it matters:
Brand docs explicitly ban decorative emojis in UI and prefer functional SVG/Lucide/icon systems. The Kiwi can still be a product mascot if wanted, but right now it is visually outside the CI and could make the tools surface feel less premium than the website.

Recommended next step:
Decide whether Kiwi is strategic. If yes, codify it as an approved mascot with brand-tokenized colors. If no, replace with a CI-native Prisma/chat icon treatment.

### P1: `transition-all` is widespread

Evidence:
- `rg "transition-all" apps/website apps/tools-app` returns 75 occurrences.
- Most are hover cards/buttons; some are large containers and chat surfaces.

Why it matters:
The external skill and our own polish rules both flag this. `transition-all` can animate layout-affecting properties accidentally, makes regressions harder to reason about, and contributes to subtle jank.

Recommended next step:
Do not bulk-replace blindly. Create a focused transition pass:
- Buttons/cards: `transition-[transform,box-shadow,border-color,background-color,color]`
- Inputs: `transition-colors`
- Layout panels/chat: explicit `transition-[opacity,transform,width,height]` only where needed.

### P1: Tools-app design system drift

Evidence:
- `apps/tools-app/app/globals.css` introduces app-local tokens such as `--chat-bg`.
- Tools app uses raw Tailwind colors in important states: `bg-red-500`, `text-red-400`, `border-red-500/30`, `bg-white/10`, `bg-black/20`.
- Some auth/settings pages use smaller rounded controls (`rounded-xl`) and generic app styling rather than the website's stronger pill/card language.

Why it matters:
The tools app is becoming a second design system. Some drift is acceptable for dense tool UX, but the current mix makes login/settings/chat feel less connected to the public website.

Recommended next step:
Create a Tools App UI alignment phase:
- Map `--chat-bg` and danger states onto shared tokens.
- Standardize auth/settings buttons and inputs.
- Keep dense app-specific layout, but share interaction primitives.

### P2: Button primitive does not match brand defaults

Evidence:
- `apps/website/components/ui/button.tsx` default primitive uses `rounded-lg`, `h-8`, generic shadcn/Base UI sizing.
- Brand docs say buttons default to `rounded-full`.

Why it matters:
Many bespoke public CTAs manually follow the brand, but reusable primitives do not. Future work may accidentally regress to generic rounded-rectangle UI.

Recommended next step:
Either rebrand the primitive or document it as an internal compact-control primitive. Do not change blindly because Base UI/shadcn components may rely on compact sizing.

### P2: Focus treatment sometimes removes outlines locally

Evidence:
- Multiple inputs use `focus:outline-none` or `focus-visible:outline-none`, usually with replacement border/ring.
- `.input-clean` and `.chat-textarea` explicitly remove focus outline in tools-app globals.

Why it matters:
Global focus is good, but local overrides create a risk that keyboard affordance disappears when a wrapper style changes.

Recommended next step:
Audit only interactive controls with `outline-none`. Keep cases with clear replacement rings; fix any border-only focus states that are too subtle in light mode.

### P2: Mobile/layout QA should target Tools chat surfaces next

Evidence:
- Floating chat has many fixed offsets: `top-[77px]`, `bottom-[96px]`, `md:top-[148px]`, `md:w-[420px]`.
- It also has duplicated markup blocks for contextual vs floating modes.

Why it matters:
The skill emphasizes responsive checks at 375, 768, 1024, 1440. The chat is likely the highest-risk surface for overlap, safe-area, keyboard, and reduced-motion issues.

Recommended next step:
Run Playwright screenshot QA for tools home/detail/chat at 375px and 768px before launch, especially open chat + keyboard-like textarea growth.

### P3: Hard-coded visual colors are concentrated in special visuals

Evidence:
- `TerminalSplash`, `KiwiMascot`, `FloatingChat` hand-coded SVG, `ToolIcon`, and generated email/logo assets contain raw hex.

Why it matters:
Some raw hex is intentional for assets, but special visuals should be either tokenized or explicitly documented as approved exceptions.

Recommended next step:
Add an "approved raw-color exceptions" list to design docs. Tokenize anything outside that list.

## Birth-Year Recommendation

Collecting birth year instead of full birthday is the right data-minimization choice.

Range decision:
- `1950-2010` is inclusive but admits 15/16-year-olds in 2026.
- If Generation AI membership should be 18+, use `2008` as max birth year for now.
- If school students are intentionally allowed later, keep `2010`, but make that product/legal decision explicit.

Recommendation for current launch:
Use `1950-2008` if we want an 18+ community posture. Use `1950-2010` only if minors are intentionally in scope.

## Suggested Backlog

1. Tools App UI alignment pass: tokens, buttons, auth/settings, status colors.
2. Chat/Prisma visual decision: keep/tokenize Kiwi or replace with CI-native assistant identity.
3. Transition hygiene pass: replace broad `transition-all` in high-traffic components.
4. Focus affordance audit for all `outline-none` controls.
5. Responsive screenshot QA for tools chat at 375/768/1024/1440.
6. Decide birth-year max: `2008` for 18+ posture vs `2010` for inclusive students.

