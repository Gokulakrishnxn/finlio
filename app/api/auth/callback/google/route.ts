import { type NextRequest } from "next/server";
import { completeSignIn } from "@/lib/google-session";

export async function GET(request: NextRequest) {
  const { origin, searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const back = (status: string) => Response.redirect(new URL(`/expenses?google=${status}`, origin));

  // The person pressed Cancel on Google's consent screen.
  if (searchParams.get("error") || !code || !state) return back("denied");
  try {
    await completeSignIn(origin, code, state);
    return back("connected");
  } catch (err) {
    console.error("[google] sign-in failed:", err);
    return back("failed");
  }
}
