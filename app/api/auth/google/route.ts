import { type NextRequest } from "next/server";
import { authorizationUrl, GoogleNotConfiguredError } from "@/lib/google-session";

export async function GET(request: NextRequest) {
  try {
    return Response.redirect(await authorizationUrl(request.nextUrl.origin));
  } catch (err) {
    const reason = err instanceof GoogleNotConfiguredError ? "not-configured" : "failed";
    return Response.redirect(new URL(`/expenses?google=${reason}`, request.nextUrl.origin));
  }
}
