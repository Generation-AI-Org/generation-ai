#!/usr/bin/env node

const { spawnSync } = require("node:child_process");
const { existsSync } = require("node:fs");
const { join } = require("node:path");
const { homedir } = require("node:os");

const cli = join(homedir(), ".claude", "get-shit-done", "bin", "gsd-tools.cjs");

if (!existsSync(cli)) {
  console.error(`GSD CLI not found at ${cli}`);
  console.error("Install or sync ~/.claude/get-shit-done before using pnpm gsd.");
  process.exit(1);
}

const args = process.argv.slice(2);

const result = spawnSync(process.execPath, [cli, ...args], {
  stdio: "inherit",
  cwd: process.cwd(),
  env: process.env,
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 0);
