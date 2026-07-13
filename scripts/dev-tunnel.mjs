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
import { createSign } from "node:crypto";
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
      updateAppWebhook(tunnelUrl);
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
          "Reminder: if this is a NEW tunnel URL, sign-in from the tunnel",
          "origin needs the new callback URL added by hand in the GitHub",
          "App settings (callbacks cannot be updated via API). Sign-in from",
          `http://localhost:${port} keeps working if it is registered.`,
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

// Point the GitHub App's webhook at the new tunnel URL. Unlike callback
// URLs, the webhook config IS updatable via API (PATCH /app/hook/config,
// authenticated as the app). Best effort: skipped silently when no app
// credentials are configured yet.
async function updateAppWebhook(url) {
  const appId = readEnvValue("GITHUB_APP_ID");
  let pem = readEnvValue("GITHUB_APP_PRIVATE_KEY");
  if (!appId || !pem) return;
  pem = pem.replace(/\\n/g, "\n");

  const b64 = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
  const now = Math.floor(Date.now() / 1000);
  const unsigned = `${b64({ alg: "RS256", typ: "JWT" })}.${b64({
    iat: now - 60,
    exp: now + 300,
    iss: appId,
  })}`;

  try {
    const signer = createSign("RSA-SHA256");
    signer.update(unsigned);
    const jwt = `${unsigned}.${signer.sign(pem, "base64url")}`;

    const response = await fetch("https://api.github.com/app/hook/config", {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${jwt}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify({ url: `${url}/api/webhook/github` }),
    });

    if (response.ok) {
      console.log(`GitHub App webhook updated: ${url}/api/webhook/github`);
    } else {
      console.warn(
        `Could not update the GitHub App webhook (HTTP ${response.status}) — update it manually in the app settings.`,
      );
    }
  } catch (error) {
    console.warn(
      `Could not update the GitHub App webhook (${error?.message}) — update it manually in the app settings.`,
    );
  }
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
