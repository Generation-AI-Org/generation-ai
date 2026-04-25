import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    // Phase 26 Blocker-Fix: co-located __tests__/ directories wurden vorher
    // nicht erfasst (nur Top-Level __tests__/). Broader pattern discovery
    // für lib/mdx/__tests__/*, app/sitemap.test.ts, etc.
    include: [
      "**/__tests__/**/*.test.{ts,tsx}",
      "**/*.test.{ts,tsx}",
    ],
  },
})
