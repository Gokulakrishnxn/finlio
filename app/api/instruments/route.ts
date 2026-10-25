import { type NextRequest } from "next/server";
import { hasFinnhubKey, searchUs } from "@/lib/finnhub";
import { searchEquities } from "@/lib/instruments";
import { searchUsList } from "@/lib/us-stocks";

// Stock search for the person's market: ?q=...&market=IN (NSE, default) or market=US.
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? "";
  const market = request.nextUrl.searchParams.get("market") === "US" ? "US" : "IN";
  try {
    if (market === "US") {
      // Live search with a Finnhub key; otherwise the built-in list of popular US stocks.
      const results = hasFinnhubKey() ? await searchUs(q).catch(() => searchUsList(q)) : searchUsList(q);
      return Response.json({ results });
    }
    return Response.json({ results: await searchEquities(q) });
  } catch (err) {
    console.error(err);
    return Response.json(
      { error: market === "US" ? "Couldn't search US stocks. Try again." : "Couldn't load the NSE stock list. Try again." },
      { status: 502 },
    );
  }
}
