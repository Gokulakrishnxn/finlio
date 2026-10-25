import { BriefRequestSchema, BriefSchema } from "@/lib/brief-schema";
import { todayIn } from "@/lib/format";
import { LOCALES } from "@/lib/locale";
import { writeBrief } from "@/lib/gemini";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = BriefRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Send a list of stock names and symbols." }, { status: 400 });
  }
  // Privacy check: this is everything Finlio sends out (names and symbols only).
  console.info("[brief] outgoing stocks:", JSON.stringify(parsed.data.stocks));

  if (!process.env.GEMINI_API_KEY) {
    return Response.json({ error: "The brief isn't set up yet (no Gemini key)." }, { status: 503 });
  }

  // One retry: the model occasionally returns an unusable reply.
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const brief = BriefSchema.parse(await writeBrief(parsed.data, todayIn(LOCALES[parsed.data.country].marketTimeZone)));
      return Response.json(brief);
    } catch (err) {
      console.error(`[brief] attempt ${attempt} failed:`, err);
      // Retrying won't help when Google refuses the search for quota reasons.
      if ((err as { status?: number }).status === 429) {
        return Response.json(
          {
            error:
              "Google Search isn't available on this Gemini key yet. Turn on billing for its Google project, then try again.",
          },
          { status: 429 },
        );
      }
    }
  }
  return Response.json({ error: "Couldn't write today's brief." }, { status: 502 });
}
