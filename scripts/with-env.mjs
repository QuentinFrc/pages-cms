#!/usr/bin/env node
// Run a command with PORT taken from .env.local, so `dev`, `start` and the
// tunnel all share the same port. Needed because Next.js cannot read PORT
// from .env files (the HTTP server boots before env files are loaded).
// Only PORT is forwarded; everything else is loaded by Next.js itself.
import { spawn } from "node:child_process";
import { readEnvValue } from "./env.mjs";

const [cmd, ...rest] = process.argv.slice(2);

if (!cmd) {
  console.error("Usage: node scripts/with-env.mjs <command> [args...]");
  process.exit(1);
}

const env = { ...process.env };
if (!env.PORT) env.PORT = readEnvValue("PORT") || "3000";

const child = spawn(cmd, rest, {
  stdio: "inherit",
  env,
  shell: process.platform === "win32",
});

child.on("exit", (code) => process.exit(code ?? 0));
