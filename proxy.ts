import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function isAllowedOrigin(originHeader: string, hostHeader: string): boolean {
	try {
		const originUrl = new URL(originHeader);
		return originUrl.host.toLowerCase() === hostHeader.toLowerCase();
	} catch {
		return false;
	}
}

// With DEV_REDIRECT_TO_BASE_URL=true, requests hitting localhost are
// redirected to BASE_URL (kept in sync with the tunnel URL by
// scripts/dev-tunnel.mjs), so the app is always used from a single
// origin. Disable it when working without the tunnel.
function localhostRedirect(request: NextRequest): NextResponse | null {
	if (process.env.DEV_REDIRECT_TO_BASE_URL !== "true") return null;
	const baseUrl = process.env.BASE_URL?.trim();
	if (!baseUrl) return null;

	const host = request.headers.get("host") || "";
	if (!/^(localhost|127\.0\.0\.1)(:\d+)?$/i.test(host)) return null;

	try {
		const target = new URL(baseUrl);
		if (target.host.toLowerCase() === host.toLowerCase()) return null;
		const destination = new URL(
			`${request.nextUrl.pathname}${request.nextUrl.search}`,
			target,
		);
		return NextResponse.redirect(destination, 307);
	} catch {
		return null;
	}
}

export function proxy(request: NextRequest) {
	const redirect = localhostRedirect(request);
	if (redirect) return redirect;

	const pathname = request.nextUrl.pathname;
	const isStaticAsset =
		pathname.startsWith("/_next/") ||
		pathname === "/favicon.ico" ||
		/\.[^/]+$/.test(pathname);

	if (isStaticAsset) {
		return NextResponse.next();
	}

	if (pathname.startsWith("/api/") && pathname !== "/api/webhook/github" && request.method !== "GET") {
		const originHeader = request.headers.get("Origin");
		const hostHeader = request.headers.get("Host");
		if (!originHeader || !hostHeader || !isAllowedOrigin(originHeader, hostHeader)) {
			return new NextResponse(null, {
				status: 403
			});
		}
	}

	const requestHeaders = new Headers(request.headers);
	const returnTo = `${request.nextUrl.pathname}${request.nextUrl.search}`;
	requestHeaders.set("x-return-to", returnTo);

	return NextResponse.next({
		request: {
			headers: requestHeaders,
		},
	});
}

export const config = {
	matcher: "/:path*"
}
