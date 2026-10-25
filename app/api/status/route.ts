import { connection } from "next/server";
import { isGoogleConfigured } from "@/lib/google-session";

// Which outside services this copy of Finlio has keys for. Booleans only, never the keys.
export async function GET() {
  await connection();
  return Response.json({
    gemini: Boolean(process.env.GEMINI_API_KEY),
    upstox: Boolean(process.env.UPSTOX_ANALYTICS_TOKEN),
    google: isGoogleConfigured(),
  });
}
