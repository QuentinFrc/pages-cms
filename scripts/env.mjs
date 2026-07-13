// Minimal line-based reader for .env files. Only reliable for single-line
// values (PORT, BASE_URL...) — multi-line values like the GitHub App private
// key are left to Next.js's own env loading.
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

export function readEnvValue(
  name,
  files = [".env.development.local", ".env.local", ".env"],
) {
  for (const file of files) {
    const path = resolve(process.cwd(), file);
    if (!existsSync(path)) continue;
    for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
      if (!match || match[1] !== name) continue;
      let value = match[2];
      if (
        (value.startsWith('"') && value.endsWith('"') && value.length > 1) ||
        (value.startsWith("'") && value.endsWith("'") && value.length > 1)
      ) {
        value = value.slice(1, -1);
      }
      return value;
    }
  }
  return "";
}
