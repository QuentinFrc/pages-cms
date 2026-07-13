#!/usr/bin/env node
// Expose the local app over public HTTPS with a Cloudflare quick tunnel.
// GitHub rejects webhook URLs pointing to localhost, so the setup helper
// (and GitHub webhooks during dev) need a publicly reachable URL.
//
// The tunnel URL is written to .tunnel-url so setup-github-app.mjs picks
// it up automatically. Keep this running while you use the app locally.
import { spawn, execFileSync } from "node:child_process";
import { writeFileSync, unlinkSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { readEnvValue } from "./env.mjs";

const args = process.argv.slice(2);
const port =
  getArg("--port") || process.env.PORT || readEnvValue("PORT") || "3000";
const localUrl = getArg("--url") || `http://localhost:${port}`;
const urlFile = resolve(process.cwd(), ".tunnel-url");

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
      console.log(
        [
          "",
          "Tunnel ready:",
          `  ${tunnelUrl}  ->  ${localUrl}`,
          "",
          `URL saved to ${urlFile} (picked up by setup:github-app).`,
          "Keep this process running while using the app. Ctrl+C to stop.",
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
};

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
