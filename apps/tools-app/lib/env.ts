// lib/env.ts
// Type-safe environment validation using t3-env
// Source: CONTEXT.md D-17 to D-20, env.t3.gg/docs/nextjs

import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  /**
   * Server-only environment variables.
   * These are NEVER exposed to the client bundle.
   * Per D-19: SERVICE_ROLE_KEY and ANTHROPIC_API_KEY must stay server-only.
   */
  server: {
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),
    // Primary: GLM-5.1 via Z.AI Coding Plan
    ZHIPU_API_KEY: z.string().min(1, 'ZHIPU_API_KEY is required'),
    // Fallback: MiniMax M2.7
    MINIMAX_API_KEY: z.string().min(1, 'MINIMAX_API_KEY is required'),
    // Legacy (optional)
    GOOGLE_GENERATIVE_AI_API_KEY: z.string().min(1).optional(),
    ANTHROPIC_API_KEY: z.string().min(1).optional(),
    // Upstash Redis (optional — graceful degradation if missing)
    UPSTASH_REDIS_REST_URL: z.string().url().optional(),
    UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
    // Exa.ai for trusted web search (optional)
    EXA_API_KEY: z.string().min(1).optional(),
  },

  /**
   * Client-side environment variables.
   * Must be prefixed with NEXT_PUBLIC_.
   * These are safe to expose (designed for RLS).
   */
  client: {
    NEXT_PUBLIC_SUPABASE_URL: z.string().url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL'),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required'),
  },

  /**
   * Runtime environment mapping.
   * All variables must be listed here.
   */
  runtimeEnv: {
    // Server
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    ZHIPU_API_KEY: process.env.ZHIPU_API_KEY,
    MINIMAX_API_KEY: process.env.MINIMAX_API_KEY,
    GOOGLE_GENERATIVE_AI_API_KEY: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    EXA_API_KEY: process.env.EXA_API_KEY,
    // Client
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },

  /**
   * Skip validation in specific environments.
   * Set SKIP_ENV_VALIDATION=1 to bypass (e.g., for docker builds without secrets).
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,

  /**
   * Allow empty strings for optional variables.
   */
  emptyStringAsUndefined: true,
})
