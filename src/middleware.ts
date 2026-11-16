import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secretKey = process.env.SESSION_SECRET || "fallback-secret-key-change-in-production";
const encodedKey = new TextEncoder().encode(secretKey);

// Public pages accessible without logging in
const PUBLIC_PAGE_PATHS = ["/", "/register"];

// Public API routes accessible without session (empty for now, extensible if public webhooks or login endpoints are added)
const PUBLIC_API_PREFIXES: string[] = [];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get("session")?.value;

  let hasValidSession = false;
  if (sessionCookie) {
    try {
      await jwtVerify(sessionCookie, encodedKey, {
        algorithms: ["HS256"],
      });
      hasValidSession = true;
    } catch {
      hasValidSession = false;
    }
  }

  const isApiRoute = pathname.startsWith("/api");
  const isPublicPage = PUBLIC_PAGE_PATHS.includes(pathname);
  const isPublicApi = PUBLIC_API_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  // 1. API Route Protection: Return 401 JSON for unauthenticated API requests
  if (isApiRoute) {
    if (!hasValidSession && !isPublicApi) {
      return NextResponse.json(
        { message: "Unauthorized. Authentication required." },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  // 2. Redirect authenticated users away from public auth pages (login / register) to dashboard
  if (isPublicPage && hasValidSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 3. Page Route Protection: Redirect unauthenticated users to login for all non-public pages
  if (!isPublicPage && !hasValidSession) {
    const loginUrl = new URL("/", request.url);
    const redirectResponse = NextResponse.redirect(loginUrl);
    redirectResponse.headers.set("Cache-Control", "no-store, max-age=0, must-revalidate");
    return redirectResponse;
  }

  const response = NextResponse.next();
  // Prevent browser from caching authenticated agent views in history/bfcache
  if (!isPublicPage) {
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
  }
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
