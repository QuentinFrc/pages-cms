/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow accessing the dev server through a Cloudflare quick tunnel
  // (`npm run tunnel`); without this, Next blocks cross-origin dev
  // requests and pages never hydrate behind the tunnel.
  allowedDevOrigins: ["*.trycloudflare.com"],
};

export default nextConfig;
