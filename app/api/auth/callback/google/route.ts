import { type NextRequest } from "next/server";
import { completeSignIn, pendingSignIn } from "@/lib/google-session";

export async function GET(request: NextRequest) {
  const { origin, searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const pending = await pendingSignIn();
  // Failures go back to where the person started: Expenses for Gmail, else sign-in.
  const fail = (status: string) =>
    Response.redirect(new URL(pending?.gmail ? `/expenses?google=${status}` : `/sign-in?error=${status}`, origin));

  // The person pressed Cancel on Google's consent screen.
  if (searchParams.get("error") || !code || !state) return fail("denied");
  try {
    const { next } = await completeSignIn(origin, code, state);
    return Response.redirect(new URL(next, origin));
  } catch (err) {
    console.error("[google] sign-in failed:", err);
    return fail("failed");
  }
}
