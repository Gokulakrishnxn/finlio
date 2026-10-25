import { BriefRequestSchema, BriefSchema } from "@/lib/brief-schema";
import { todayIST } from "@/lib/format";
import { writeBrief } from "@/lib/gemini";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = BriefRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Send a list of stock names and symbols." }, { status: 400 });
  }
  // Privacy check: this is everything Finlio sends out (names and symbols only).
  console.info("[brief] outgoing stocks:", JSON.stringify(parsed.data.stocks));

  // One retry: the model occasionally returns an unusable reply.
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const brief = BriefSchema.parse(await writeBrief(parsed.data, todayIST()));
      return Response.json(brief);
    } catch (err) {
      console.error(`[brief] attempt ${attempt} failed:`, err);
    }
  }
  return Response.json({ error: "Couldn't write today's brief." }, { status: 502 });
}
