import { NextResponse } from "next/server";

const COOKIE_NAME = "qa_auth";
const ROLES = ["admin", "auditor"];

// Only these need to be reachable without a session: the login page itself,
// and the two auth endpoints that establish/clear one. Everything else
// under /api/auth (change-password, me) goes through the normal checks
// below like any other route — change-password in particular needs the
// admin-only gate, which a blanket "/api/auth" bypass would skip entirely.
const PUBLIC_PATHS = ["/login", "/api/auth/login", "/api/auth/logout"];

// Projects, Domains & Templates, and item/checklist management are
// Admin-only — Auditors can read this data (via /api/data) to fill out
// audits, but can't create/edit/delete it. All of these routes are
// mutation-only (POST/PUT/DELETE, no GET), so gating the whole prefix
// never blocks Auditors from the reads they need.
const ADMIN_ONLY_PREFIXES = ["/api/projects", "/api/domains", "/api/items", "/api/auth/change-password"];

export function middleware(req) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PATHS.includes(pathname) || pathname.startsWith("/_next") || pathname === "/favicon.ico") {
    return NextResponse.next();
  }

  const role = req.cookies.get(COOKIE_NAME)?.value;
  const authed = ROLES.includes(role);

  if (!authed) {
    if (pathname.startsWith("/api")) {
      return new NextResponse(JSON.stringify({ error: "Not authenticated" }), { status: 401, headers: { "content-type": "application/json" } });
    }
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  const adminOnly = ADMIN_ONLY_PREFIXES.some((p) => pathname.startsWith(p));
  if (adminOnly && role !== "admin") {
    return new NextResponse(JSON.stringify({ error: "Admin access required." }), { status: 403, headers: { "content-type": "application/json" } });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
