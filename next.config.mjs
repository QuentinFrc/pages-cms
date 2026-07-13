// Extra origins allowed to reach the dev server (e.g. an HTTPS tunnel);
// without this, Next.js blocks cross-origin dev requests and pages never
// hydrate when accessed through one. TUNNEL_HOSTNAME is included
// automatically; wildcard patterns can be added via ALLOWED_DEV_ORIGINS
// (comma-separated). Env files are loaded before this config is evaluated.
const allowedDevOrigins = [
  process.env.TUNNEL_HOSTNAME,
  ...(process.env.ALLOWED_DEV_ORIGINS?.split(",").map((s) => s.trim()) ?? []),
].filter(Boolean);

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(allowedDevOrigins.length > 0 ? { allowedDevOrigins } : {}),
};

export default nextConfig;
