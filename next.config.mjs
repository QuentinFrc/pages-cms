/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow accessing the dev server through the Cloudflare tunnel
  // (`npm run tunnel`); without this, Next blocks cross-origin dev
  // requests and pages never hydrate behind the tunnel. Named tunnel
  // hostnames (TUNNEL_HOSTNAME) must be listed here too.
  allowedDevOrigins: ["*.trycloudflare.com", "cms-dev.deeev.fr"],
};

export default nextConfig;
