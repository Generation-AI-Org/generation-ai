#!/usr/bin/env node

const { spawnSync } = require("node:child_process");

const tokenResult = spawnSync("gh", ["auth", "token"], {
  encoding: "utf8",
  stdio: ["ignore", "pipe", "pipe"],
});

if (tokenResult.status !== 0) {
  process.stderr.write(tokenResult.stderr || "Failed to get GitHub token from gh.\n");
  process.exit(tokenResult.status ?? 1);
}

const token = tokenResult.stdout.trim();

if (!token) {
  process.stderr.write("gh auth token returned an empty token. Run `gh auth login` first.\n");
  process.exit(1);
}

const env = {
  ...process.env,
  GITHUB_PERSONAL_ACCESS_TOKEN: token,
  GITHUB_TOOLSETS:
    process.env.GITHUB_TOOLSETS || "context,repos,issues,pull_requests,actions",
};

const result = spawnSync("github-mcp-server", ["stdio"], {
  stdio: "inherit",
  env,
});

if (result.error) {
  process.stderr.write(`${result.error.message}\n`);
  process.exit(1);
}

process.exit(result.status ?? 0);
