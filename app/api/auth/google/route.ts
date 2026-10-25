import { type NextRequest } from "next/server";
import { authorizationUrl, GoogleNotConfiguredError, safeNext } from "@/lib/google-session";

// /api/auth/google signs in; /api/auth/google?gmail=1 also asks for read-only Gmail.
export async function GET(request: NextRequest) {
  const { origin, searchParams } = request.nextUrl;
  const gmail = searchParams.get("gmail") === "1";
  const next = safeNext(searchParams.get("next"), gmail ? "/expenses?google=connected" : "/dashboard");
  try {
    return Response.redirect(await authorizationUrl(origin, { gmail, next }));
  } catch (err) {
    const reason = err instanceof GoogleNotConfiguredError ? "not-configured" : "failed";
    const back = gmail ? `/expenses?google=${reason}` : `/sign-in?error=${reason}`;
    return Response.redirect(new URL(back, origin));
  }
}
