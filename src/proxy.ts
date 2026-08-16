import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const REFRESH_COOKIE = "zapsters_refresh";
const AUTH_COOKIE = "zapsters_auth";
const SESSION_COOKIE = "zapsters_session";
const LOGIN_PATH = "/auth/login";

export function proxy(request: NextRequest) {
  const isAuth =
    request.cookies.has(REFRESH_COOKIE) ||
    request.cookies.has(AUTH_COOKIE) ||
    request.cookies.has(SESSION_COOKIE);

  if (isAuth) {
    return NextResponse.next();
  }

  const { pathname, search } = request.nextUrl;

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = LOGIN_PATH;
  loginUrl.search = "";
  loginUrl.searchParams.set("next", `${pathname}${search}`);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/my-teams/:path*",
    "/my-hackathons/:path*",
    "/organizer/:path*",
    "/judge/:path*",
    "/profile/:path*",
  ],
};
