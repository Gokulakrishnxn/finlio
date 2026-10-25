import { NextResponse, type NextRequest } from "next/server";

// Routing only: the app's pages need a sign-in cookie, and signed-in people skip
// the sign-in screens. The API routes check the cookie properly themselves.
const APP = ["/dashboard", "/holdings", "/expenses", "/assets", "/analytics", "/news", "/setup"];
const AUTH = ["/sign-in", "/sign-up"];

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const signedIn = request.cookies.has("finlio_google") || request.cookies.has("finlio_local");
  const inApp = APP.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (inApp && !signedIn) {
    const url = new URL("/sign-in", request.url);
    url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }
  if (AUTH.includes(pathname) && signedIn) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/holdings/:path*", "/expenses/:path*", "/assets/:path*", "/analytics/:path*", "/news/:path*", "/setup", "/sign-in", "/sign-up"],
};
