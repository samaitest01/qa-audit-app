import { NextResponse } from "next/server";

const COOKIE_NAME = "qa_auth";
const AUTH_TOKEN = "authenticated";

export function middleware(req) {
  const { pathname } = req.nextUrl;

  if (pathname === "/login" || pathname.startsWith("/api/auth") || pathname.startsWith("/_next") || pathname === "/favicon.ico") {
    return NextResponse.next();
  }

  const cookie = req.cookies.get(COOKIE_NAME)?.value;
  const ok = cookie === AUTH_TOKEN;

  if (ok) return NextResponse.next();

  if (pathname.startsWith("/api")) {
    return new NextResponse(JSON.stringify({ error: "Not authenticated" }), { status: 401, headers: { "content-type": "application/json" } });
  }
  const loginUrl = new URL("/login", req.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
