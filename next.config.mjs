/** @type {import('next').NextConfig} */
const nextConfig = {
  // esbuild ships with a native binary; never bundle it.
  serverExternalPackages: ["esbuild"],
};

export default nextConfig;
