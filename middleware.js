import { NextResponse } from "next/server";

const COOKIE_NAME = "qa_auth";

// Edge runtime doesn't have Node's `crypto` module, so this uses Web Crypto
// (available globally) to compute the same HMAC that pages/api/auth/login.js
// computes with Node's crypto — the two must produce identical hex output.
async function expectedToken() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    return null;
  }
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode("authenticated"));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  if (pathname === "/login" || pathname.startsWith("/api/auth") || pathname.startsWith("/_next") || pathname === "/favicon.ico") {
    return NextResponse.next();
  }

  const cookie = req.cookies.get(COOKIE_NAME)?.value;
  const expected = await expectedToken();
  const ok = expected && cookie && cookie === expected;

  if (ok) return NextResponse.next();

  if (pathname.startsWith("/api")) {
    return new NextResponse(JSON.stringify({ error: "Not authenticated" }), { status: 401, headers: { "content-type": "application/json" } });
  }

  const base = req.nextUrl.origin || req.url;
  const loginUrl = new URL("/login", base);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
