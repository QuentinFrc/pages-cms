import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    PUBLIC_PROJET_URL: process.env.PUBLIC_PROJET_URL,
  },
};

export default withBundleAnalyzer(nextConfig);