/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow accessing the dev server through the Cloudflare tunnel
  // (`npm run tunnel`); without this, Next.js blocks cross-origin dev
  // requests and pages never hydrate behind the tunnel. With a stable
  // named tunnel (TUNNEL_HOSTNAME, loaded before this config is
  // evaluated) the allowlist narrows to that hostname; quick tunnels get
  // a random *.trycloudflare.com hostname that cannot be known ahead of
  // time, hence the wildcard.
  allowedDevOrigins: process.env.TUNNEL_HOSTNAME
    ? [process.env.TUNNEL_HOSTNAME]
    : ["*.trycloudflare.com"],
};

export default nextConfig;
