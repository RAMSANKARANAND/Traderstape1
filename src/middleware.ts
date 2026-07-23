import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /admin routes
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // Allow access to login page without auth
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  // Check for session token
  const token = request.cookies.get("authjs.session-token")?.value ||
                request.cookies.get("__Secure-authjs.session-token")?.value;

  if (!token) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return Response.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  runtime: "experimental-edge",
  matcher: ["/admin/:path*"],
};