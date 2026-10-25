import "server-only";
import type { Quote } from "@/lib/portfolio";
import type { Instrument } from "@/lib/types";

// US stock search and prices from Finnhub (https://finnhub.io), free plan.
// The key stays on the server: FINNHUB_API_KEY in .env.local.

const BASE = "https://finnhub.io/api/v1";

export class MissingFinnhubKeyError extends Error {}

function key() {
  const token = process.env.FINNHUB_API_KEY;
  if (!token) throw new MissingFinnhubKeyError("FINNHUB_API_KEY is not set");
  return token;
}

export const hasFinnhubKey = () => Boolean(process.env.FINNHUB_API_KEY);

async function get<T>(path: string, params: Record<string, string>): Promise<T> {
  const url = new URL(`${BASE}${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  url.searchParams.set("token", key());
  const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`Finnhub ${path}: HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

type SearchResult = { result?: { symbol: string; description: string; type: string }[] };

// Common stocks and ETFs listed in the US (no "." suffix means a US listing on Finnhub).
export async function searchUs(query: string, limit = 8): Promise<Instrument[]> {
  const body = await get<SearchResult>("/search", { q: query });
  return (body.result ?? [])
    .filter((r) => /^(Common Stock|ETP|ADR)$/.test(r.type) && !r.symbol.includes(".") && r.symbol.length <= 6)
    .slice(0, limit)
    .map((r) => ({ instrumentKey: `US|${r.symbol}`, symbol: r.symbol, name: r.description }));
}

type FinnhubQuote = { c: number; pc: number; t: number };

// Last price and previous close for up to ~30 symbols (free plan: 60 calls a minute).
export async function getUsQuotes(symbols: string[]): Promise<Record<string, Quote>> {
  const out: Record<string, Quote> = {};
  await Promise.all(
    symbols.map(async (symbol) => {
      const q = await get<FinnhubQuote>("/quote", { symbol });
      if (q.c > 0) {
        out[`US|${symbol}`] = {
          price: q.c,
          prevClose: q.pc || q.c,
          timestamp: q.t ? new Date(q.t * 1000).toISOString() : undefined,
        };
      }
    }),
  );
  return out;
}
