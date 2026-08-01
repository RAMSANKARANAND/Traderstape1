import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const MAINTENANCE_MODE = process.env.MAINTENANCE_MODE === "true";

const EXEMPT_PATHS = [
  "/coming-soon",
  "/api/",
  "/_next/",
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
];

function isExempt(pathname: string): boolean {
  if (pathname === "/coming-soon") return true;
  if (pathname.startsWith("/admin/")) return true;
  if (pathname.startsWith("/api/")) return true;
  if (pathname.startsWith("/_next/")) return true;
  if (pathname === "/favicon.ico") return true;
  if (pathname === "/robots.txt") return true;
  if (pathname === "/sitemap.xml") return true;
  return false;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (MAINTENANCE_MODE && !isExempt(pathname)) {
    const url = new URL("/coming-soon", request.url);
    return NextResponse.redirect(url);
  }

  // Admin auth protection
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") {
      return NextResponse.next();
    }

    const token = request.cookies.get("authjs.session-token")?.value ||
                  request.cookies.get("__Secure-authjs.session-token")?.value;

    if (!token) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return Response.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  runtime: "experimental-edge",
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};