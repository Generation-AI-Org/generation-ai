# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> **Note:** Versions before v4.0.0 were developed in separate repositories:
> - [generation-ai-tools-app](https://github.com/Generation-AI-Org/generation-ai-tools-app) (archived)
> - [generation-ai-website](https://github.com/Generation-AI-Org/generation-ai-website) (archived)

---

## [Unreleased]

### Changed
- Future changes will be tracked here via Changesets

---

## [4.0.0] - 2026-04-14

### Added
- **Monorepo Migration** — Combined website and tools-app into single Turborepo
- **Shared Packages**
  - `@genai/auth` — Supabase clients (browser, server, admin, helpers)
  - `@genai/types` — Shared TypeScript types for content
  - `@genai/config` — Shared Tailwind, ESLint, TSConfig
- **GLM-5.1 Integration** — Primary LLM via Z.AI Coding Plan with MiniMax fallback
- **pnpm Catalog** — Dependency version consistency across apps

### Changed
- Apps now import from `@genai/*` packages instead of local `lib/`
- Both apps share single Supabase instance

### Infrastructure
- Turborepo for build orchestration
- pnpm workspaces
- Changesets for versioning and changelog generation

---

## [3.1.0] - 2026-04-13

> Security Hardening Milestone (tools-app)

### Added
- **Phase 7: Security Fundamentals**
  - RLS Policies — Hybrid V1 public / V2 user-isolated chat sessions
  - Input Sanitization — DOMPurify wrapper for all user input
  - Rate Limiting — Upstash Redis (10 req/min per IP, 60/hour per session)
  - Env Validation — t3-env with build-time checks
- Login Page with Magic Link + optional password
- Pro/Lite assistant naming based on auth state

### Security
- Chat sessions isolated per user (RLS)
- XSS prevention via sanitized markdown rendering
- DoS protection via rate limiting

---

## [3.0.0] - 2026-04-13

> Community Agent Milestone (tools-app)

### Added
- **Phase 4: Auth Layer**
  - Supabase SSR authentication
  - Session detection and V1/V2 routing
  - AuthProvider and proxy.ts for session refresh
  - Member badge in chat UI
- **Phase 5: KB Tools**
  - `kb_search` — Search knowledge base
  - `kb_read` — Read full content item
  - `kb_list` — List items by category/type
  - `kb_explore` — Browse KB structure
- **Phase 6: Agent Integration**
  - Tool-calling agent loop with MiniMax M2.7
  - Sources displayed in chat UI
  - Grounded responses from knowledge base

### Changed
- V2 members use Sonnet model (upgraded from Haiku)
- Chat API routes V1 (public) vs V2 (member) based on auth

---

## [2.0.0] - 2026-04-12

> Grounded Agent Milestone (tools-app)

### Added
- Full-context chat with entire knowledge base
- Content sync from GitHub to Supabase
- GSD workflow integration (.planning/ artifacts)

### Changed
- Upgraded from basic Haiku chat to grounded responses

---

## [1.1.0] - 2026-04-11

> Polish Release (tools-app)

### Added
- Light/Dark mode toggle
- Mobile optimizations
- Kiwi mascot in chat
- Tool icons for visual distinction
- Chat persistence across sessions
- Comprehensive README with security docs

### Security
- X-Frame-Options header
- Permissions-Policy header

---

## [1.0.0] - 2026-04-10

> Initial Release (tools-app)

### Added
- **Library View** — Card grid with 29 AI tools
- **Chat Assistant** — Haiku-powered recommendations
- **Detail Pages** — Full tool information
- **Design System** — Generation AI color palette, typography
- **Supabase Integration** — Content storage and retrieval

---

## Website Releases

> Separate changelog for website (pre-monorepo)

### [1.0.0] - 2026-04-12 to 2026-04-13

#### Added
- Terminal splash screen with typing animation
- Interactive SignalGrid background
- Hero section with CTAs
- Sign-up flow with Supabase Auth
- Circle API integration for community membership
- Resend email service for magic links
- Features and Target Audience sections
- Impressum and Datenschutz pages
- Schema.org JSON-LD for SEO
- OG image for social sharing
- Skip-link and ARIA landmarks for accessibility

#### Performance
- Logo optimization (next/image with priority)
- SignalGrid throttled to 30fps

---

## Links

- [Monorepo](https://github.com/Generation-AI-Org/generation-ai)
- [Legacy tools-app](https://github.com/Generation-AI-Org/generation-ai-tools-app) (archived)
- [Legacy website](https://github.com/Generation-AI-Org/generation-ai-website) (archived)
