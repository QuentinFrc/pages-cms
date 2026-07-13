// Read values from the project's env files using the same loader and
// precedence chain as Next.js itself (@next/env, also used by
// db/envConfig.ts for drizzle-kit): .env.development.local, .env.local,
// .env.development, .env — with proper multi-line value support.
import nextEnv from "@next/env";

const { loadEnvConfig } = nextEnv;

let combinedEnv;

export function readEnvValue(name) {
  if (!combinedEnv) {
    // loadEnvConfig mutates process.env; snapshot and restore so callers
    // (e.g. with-env spawning next dev) keep a pristine parent env and
    // children still resolve env files live.
    const snapshot = { ...process.env };
    const silent = { info: () => {}, error: console.error };
    const dev = process.env.NODE_ENV !== "production";
    combinedEnv = loadEnvConfig(process.cwd(), dev, silent).combinedEnv;
    process.env = snapshot;
  }
  return combinedEnv[name] ?? "";
}
