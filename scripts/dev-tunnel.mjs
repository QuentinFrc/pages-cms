#!/usr/bin/env node
// Expose the local app over public HTTPS with a Cloudflare quick tunnel.
// GitHub rejects webhook URLs pointing to localhost, so the setup helper
// (and GitHub webhooks during dev) need a publicly reachable URL.
//
// The tunnel URL is written to .tunnel-url (picked up by
// setup-github-app.mjs) and to BASE_URL in .env.development.local, which
// Next.js loads over .env.local in dev and reloads without a restart.
// Both are cleaned up when the tunnel stops.
import { spawn, execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, unlinkSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { readEnvValue } from "./env.mjs";

const args = process.argv.slice(2);
const port =
  getArg("--port") || process.env.PORT || readEnvValue("PORT") || "3000";
const localUrl = getArg("--url") || `http://localhost:${port}`;
const urlFile = resolve(process.cwd(), ".tunnel-url");
const devEnvFile = resolve(process.cwd(), ".env.development.local");

try {
  execFileSync("cloudflared", ["--version"], { stdio: "ignore" });
} catch {
  console.error(
    [
      "cloudflared is not installed.",
      "",
      "Install it first:",
      "  macOS:   brew install cloudflared",
      "  Linux:   https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/",
      "  Windows: winget install Cloudflare.cloudflared",
    ].join("\n"),
  );
  process.exit(1);
}

console.log(`Starting Cloudflare quick tunnel to ${localUrl}...`);

const child = spawn(
  "cloudflared",
  ["tunnel", "--url", localUrl, "--no-autoupdate"],
  { stdio: ["ignore", "pipe", "pipe"] },
);

let tunnelUrl = "";

const scan = (chunk) => {
  const text = chunk.toString();
  if (!tunnelUrl) {
    const match = text.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
    if (match) {
      tunnelUrl = match[0];
      writeFileSync(urlFile, `${tunnelUrl}\n`, "utf8");
      upsertBaseUrl(tunnelUrl);
      console.log(
        [
          "",
          "Tunnel ready:",
          `  ${tunnelUrl}  ->  ${localUrl}`,
          "",
          `URL saved to ${urlFile} (picked up by setup:github-app).`,
          `BASE_URL updated in ${devEnvFile} (picked up live by next dev).`,
          "Keep this process running while using the app. Ctrl+C to stop.",
          "",
          "Reminder: the GitHub App's callback/webhook URLs are fixed at",
          "creation — if this is a NEW tunnel URL, update them in the app",
          "settings or re-run npm run setup:github-app.",
          "",
        ].join("\n"),
      );
    }
  }
};

child.stdout.on("data", scan);
child.stderr.on("data", scan);

const cleanup = () => {
  if (existsSync(urlFile)) {
    try {
      unlinkSync(urlFile);
    } catch {}
  }
  removeBaseUrl();
};

// Set BASE_URL in .env.development.local, replacing any previous value.
function upsertBaseUrl(url) {
  const lines = existsSync(devEnvFile)
    ? readFileSync(devEnvFile, "utf8").split(/\r?\n/).filter(Boolean)
    : [];
  const next = lines.filter((line) => !line.startsWith("BASE_URL="));
  next.push(`BASE_URL=${url}`);
  writeFileSync(devEnvFile, `${next.join("\n")}\n`, "utf8");
}

// Drop the BASE_URL we wrote (only if it still points at this tunnel);
// delete the file when it becomes empty.
function removeBaseUrl() {
  if (!tunnelUrl || !existsSync(devEnvFile)) return;
  try {
    const lines = readFileSync(devEnvFile, "utf8").split(/\r?\n/).filter(Boolean);
    const next = lines.filter((line) => line !== `BASE_URL=${tunnelUrl}`);
    if (next.length === 0) unlinkSync(devEnvFile);
    else if (next.length !== lines.length)
      writeFileSync(devEnvFile, `${next.join("\n")}\n`, "utf8");
  } catch {}
}

child.on("exit", (code) => {
  cleanup();
  if (!tunnelUrl) {
    console.error("Tunnel exited before providing a URL.");
  }
  process.exit(code ?? 0);
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    cleanup();
    child.kill(signal);
  });
}

function getArg(name) {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] || "" : "";
}
