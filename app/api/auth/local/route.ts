import { startLocalSession } from "@/lib/google-session";

// Opens the app without Google, allowed only when this copy has no Google keys.
export async function POST() {
  const ok = await startLocalSession();
  return Response.json({ ok }, { status: ok ? 200 : 403 });
}
