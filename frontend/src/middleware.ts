import { NextResponse, type NextRequest } from "next/server";

const ADMIN_MATCHER = "/admin";
const AUTH_COOKIE = "admin_token";
const AUTH_HEADER = "authorization";
const BYPASS_ENV = "ADMIN_GUARD_BYPASS";

const isGuardBypassed = (): boolean => {
  return process.env[BYPASS_ENV] === "true";
};

const hasJwtToken = (request: NextRequest): boolean => {
  if (request.cookies.get(AUTH_COOKIE)?.value) {
    return true;
  }

  const authHeader = request.headers.get(AUTH_HEADER);
  if (authHeader && authHeader.startsWith("Bearer ") && authHeader.split(" ").at(1)) {
    return true;
  }

  return false;
};

export function middleware(request: NextRequest) {
  if (isGuardBypassed()) {
    return NextResponse.next();
  }

  if (!request.nextUrl.pathname.startsWith(ADMIN_MATCHER)) {
    return NextResponse.next();
  }

  if (hasJwtToken(request)) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("redirect", request.nextUrl.pathname + request.nextUrl.search);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*"],
};