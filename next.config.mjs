// Extra origins allowed to reach the dev server (e.g. an HTTPS tunnel);
// without this, Next.js blocks cross-origin dev requests and pages never
// hydrate when accessed through one. TUNNEL_HOSTNAME is included
// automatically; wildcard patterns can be added via ALLOWED_DEV_ORIGINS
// (comma-separated). Env files are loaded before this config is evaluated.
const allowedDevOrigins = [
  process.env.TUNNEL_HOSTNAME,
  ...(process.env.ALLOWED_DEV_ORIGINS?.split(",").map((s) => s.trim()) ?? []),
].filter(Boolean);

// Platform glue: populate BASE_URL from Vercel's system env vars at build
// time so app code only ever reads BASE_URL. An explicit BASE_URL wins.
const vercelUrl =
  process.env.VERCEL_ENV === "production"
    ? process.env.VERCEL_PROJECT_PRODUCTION_URL
    : process.env.VERCEL_URL;
const baseUrl =
  process.env.BASE_URL?.trim() || (vercelUrl ? `https://${vercelUrl}` : undefined);

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(allowedDevOrigins.length > 0 ? { allowedDevOrigins } : {}),
  ...(baseUrl ? { env: { BASE_URL: baseUrl } } : {}),
};

export default nextConfig;
