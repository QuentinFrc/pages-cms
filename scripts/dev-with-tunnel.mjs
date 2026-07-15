#!/usr/bin/env node
// Run `next dev` and the Cloudflare tunnel together: npm run dev:tunnel
// Output is prefixed per process; stopping one (or Ctrl+C) stops both,
// with SIGINT so dev-tunnel's cleanup (.tunnel-url, BASE_URL) runs.
import { spawn } from "node:child_process";
import { readEnvValue } from "./env.mjs";

const env = { ...process.env, DEV_REDIRECT_TO_BASE_URL: true };
if (!env.PORT) env.PORT = readEnvValue("PORT") || "3000";

const procs = [];
let shuttingDown = false;
let exitCode = 0;

function run(name, cmd, cmdArgs) {
  const child = spawn(cmd, cmdArgs, {
    env,
    stdio: ["ignore", "pipe", "pipe"],
    shell: process.platform === "win32",
  });

  const forward = (data, stream) => {
    for (const line of data.toString().split(/\r?\n/)) {
      if (line) stream.write(`[${name}] ${line}\n`);
    }
  };
  child.stdout.on("data", (d) => forward(d, process.stdout));
  child.stderr.on("data", (d) => forward(d, process.stderr));

  child.on("exit", (code) => {
    if (!shuttingDown) {
      console.log(`[${name}] exited (${code ?? 0}) — stopping the rest.`);
      shutdown(code ?? 0);
    }
  });

  procs.push(child);
}

function shutdown(code) {
  if (shuttingDown) return;
  shuttingDown = true;
  exitCode = code;
  for (const p of procs) {
    if (p.exitCode === null) p.kill("SIGINT");
  }
  // Hard exit if a child ignores SIGINT.
  setTimeout(() => process.exit(exitCode), 3000).unref();
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

let remaining = 2;
const onChildGone = () => {
  remaining -= 1;
  if (remaining === 0) process.exit(exitCode);
};

run("tunnel", process.execPath, ["scripts/dev-tunnel.mjs"]);
run("next", "npx", ["next", "dev"]);

for (const p of procs) p.on("close", onChildGone);
