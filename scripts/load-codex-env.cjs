#!/usr/bin/env node

const { spawnSync } = require("node:child_process");
const { existsSync, readFileSync } = require("node:fs");
const { join } = require("node:path");
const { homedir } = require("node:os");

const envFile = join(homedir(), ".config", "generation-ai", "codex.env");

function parseEnv(contents) {
  const env = {};

  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) continue;

    const normalized = line.startsWith("export ") ? line.slice(7).trim() : line;
    const eq = normalized.indexOf("=");

    if (eq === -1) continue;

    const key = normalized.slice(0, eq).trim();
    let value = normalized.slice(eq + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (key) env[key] = value;
  }

  return env;
}

const [, , ...command] = process.argv;

if (command.length === 0) {
  console.error("Usage: node scripts/load-codex-env.cjs <command> [args...]");
  console.error(`Loads local secrets from ${envFile}`);
  process.exit(1);
}

const loadedEnv = existsSync(envFile) ? parseEnv(readFileSync(envFile, "utf8")) : {};
const result = spawnSync(command[0], command.slice(1), {
  stdio: "inherit",
  cwd: process.cwd(),
  env: { ...process.env, ...loadedEnv },
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 0);
