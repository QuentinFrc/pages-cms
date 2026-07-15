const DEV_BASE_URL = "http://localhost:3000";
const DEV_HOST = "localhost:3000";

export const getBaseUrl = () => {
  const baseUrl = process.env.BASE_URL?.trim();

  if (baseUrl) {
    return baseUrl;
  }

  if (process.env.NODE_ENV !== "production") {
    return DEV_BASE_URL;
  }

  throw new Error("Missing BASE_URL. Set BASE_URL in production.");
};

// Dynamic base URL config for Better Auth: the auth base URL is resolved from
// each request's host instead of the build-time BASE_URL, so Vercel preview
// deployments work under any of their aliases (deployment URL, branch URL).
// Requests from hosts outside the allowlist fall back to BASE_URL.
export const getAuthBaseUrlConfig = () => {
  const fallback = getBaseUrl();
  const allowedHosts = new Set([new URL(fallback).host]);

  // Extra hosts allowed to serve auth (comma-separated, wildcards allowed),
  // e.g. custom domains beyond BASE_URL: AUTH_ALLOWED_HOSTS=cms-preview.deeev.fr
  for (const host of process.env.AUTH_ALLOWED_HOSTS?.split(",") ?? []) {
    if (host.trim()) {
      allowedHosts.add(host.trim());
    }
  }

  if (process.env.VERCEL) {
    allowedHosts.add("*.vercel.app");
  }
  if (process.env.NODE_ENV !== "production") {
    allowedHosts.add(DEV_HOST);
  }

  return {
    allowedHosts: [...allowedHosts],
    // Derive http/https from the request (x-forwarded-proto), so the tunnel
    // and Vercel get https while plain localhost keeps http.
    protocol: "auto" as const,
    fallback,
  };
};
