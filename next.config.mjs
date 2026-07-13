/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow accessing the dev server through the Cloudflare tunnel
  // (`npm run tunnel`); without this, Next.js blocks cross-origin dev
  // requests and pages never hydrate behind the tunnel. Named tunnel
  // hostnames come from TUNNEL_HOSTNAME (env files are loaded before
  // this config is evaluated).
  allowedDevOrigins: [
    "*.trycloudflare.com",
    ...(process.env.TUNNEL_HOSTNAME ? [process.env.TUNNEL_HOSTNAME] : []),
  ],
};

export default nextConfig;
