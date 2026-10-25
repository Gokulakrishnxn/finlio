import { extractExpenses } from "@/lib/expense-extract";
import { readAlertEmails } from "@/lib/gmail";
import {
  activeSession,
  GoogleNotConfiguredError,
  NotSignedInError,
} from "@/lib/google-session";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const country = body?.country === "US" ? "US" : "IN";
  try {
    const session = await activeSession();
    const emails = await readAlertEmails(session.accessToken);
    // Only these alerts' sender, subject and preview text go to Gemini.
    console.info(`[expenses] read ${emails.length} alert emails for ${session.email}`);
    const expenses = await extractExpenses(emails, country);
    return Response.json({
      account: session.email,
      syncedAt: new Date().toISOString(),
      scanned: emails.length,
      expenses,
    });
  } catch (err) {
    console.error("[expenses]", err);
    if (err instanceof GoogleNotConfiguredError) {
      return Response.json({ error: "Google sign-in isn't set up yet." }, { status: 503 });
    }
    if (err instanceof NotSignedInError) {
      return Response.json({ error: "Please sign in with Google again." }, { status: 401 });
    }
    return Response.json({ error: "Couldn't read your bank alerts." }, { status: 502 });
  }
}
