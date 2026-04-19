import "dotenv/config"
import * as dotenv from "dotenv"
import { defineConfig, devices } from "@playwright/test"

dotenv.config({ path: ".env.test.local" })

// D-08: Default gegen Prod. Override via E2E_BASE_URL (oder legacy BASE_URL).
// Lokale Dev gegen Dev-Server: E2E_BASE_URL=http://localhost:3001 pnpm exec playwright test
const BASE_URL =
  process.env.E2E_BASE_URL ||
  process.env.BASE_URL ||
  "https://tools.generation-ai.org"

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
})
