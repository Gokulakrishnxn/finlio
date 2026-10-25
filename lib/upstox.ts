import "server-only";
import type { Quote } from "@/lib/portfolio";

type UpstoxQuote = {
  last_price: number;
  net_change?: number;
  ohlc?: { close?: number };
  instrument_token: string;
  timestamp?: string;
};

export class MissingTokenError extends Error {}

// Full market quote for up to ~50 NSE instruments in one request.
export async function getQuotes(keys: string[]): Promise<Record<string, Quote>> {
  const token = process.env.UPSTOX_ANALYTICS_TOKEN;
  if (!token) throw new MissingTokenError("UPSTOX_ANALYTICS_TOKEN is not set");

  const url = new URL("https://api.upstox.com/v2/market-quote/quotes");
  url.searchParams.set("instrument_key", keys.join(","));
  const res = await fetch(url, {
    headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Upstox quotes: HTTP ${res.status} ${await res.text()}`);

  const body = (await res.json()) as { data?: Record<string, UpstoxQuote> };
  const quotes: Record<string, Quote> = {};
  // Response keys look like "NSE_EQ:TCS"; instrument_token carries our key.
  for (const q of Object.values(body.data ?? {})) {
    const prevClose =
      q.net_change !== undefined ? q.last_price - q.net_change : (q.ohlc?.close ?? q.last_price);
    quotes[q.instrument_token] = { price: q.last_price, prevClose, timestamp: q.timestamp };
  }
  return quotes;
}
