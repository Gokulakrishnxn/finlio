import { z } from "zod";
import { getUsQuotes, MissingFinnhubKeyError } from "@/lib/finnhub";
import type { Quote } from "@/lib/portfolio";
import { getQuotes, MissingTokenError } from "@/lib/upstox";

// Indian stocks ("NSE_EQ|ISIN") come from Upstox; US stocks ("US|AAPL") from Finnhub.
const QuotesRequestSchema = z.object({
  keys: z
    .array(z.string().regex(/^(NSE_EQ\|[A-Z0-9]+|US\|[A-Z][A-Z0-9.-]{0,9})$/))
    .min(1)
    .max(50),
});

export async function POST(request: Request) {
  const parsed = QuotesRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Send a list of stock keys." }, { status: 400 });
  }
  const nse = parsed.data.keys.filter((k) => k.startsWith("NSE_EQ|"));
  const us = parsed.data.keys.filter((k) => k.startsWith("US|")).map((k) => k.slice(3));

  const results = await Promise.allSettled([
    nse.length ? getQuotes(nse) : Promise.resolve({}),
    us.length ? getUsQuotes(us) : Promise.resolve({}),
  ]);
  const quotes: Record<string, Quote> = {};
  const failures = results.flatMap((r) => (r.status === "rejected" ? [r.reason as unknown] : []));
  for (const r of results) if (r.status === "fulfilled") Object.assign(quotes, r.value);
  failures.forEach((err) => console.error("[quotes]", err));

  if (failures.length && !Object.keys(quotes).length) {
    const missing = failures.every((e) => e instanceof MissingTokenError || e instanceof MissingFinnhubKeyError);
    return Response.json(
      { error: missing ? "Prices aren't set up yet." : "Couldn't update prices." },
      { status: missing ? 503 : 502 },
    );
  }
  return Response.json({ quotes, fetchedAt: new Date().toISOString() });
}
