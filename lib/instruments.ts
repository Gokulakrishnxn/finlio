import "server-only";
import { gunzipSync } from "node:zlib";
import type { Instrument } from "@/lib/types";

const NSE_LIST_URL =
  "https://assets.upstox.com/market-quote/instruments/exchange/NSE.json.gz";

type UpstoxInstrument = {
  segment: string;
  instrument_type: string;
  instrument_key: string;
  trading_symbol: string;
  name: string;
};

let cache: Promise<Instrument[]> | null = null;

// Upstox names are uppercase abbreviations ("TATA CONSULTANCY SERV LT").
export function displayName(raw: string) {
  return raw
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\b(Lt|Ltd)\.?$/, "Ltd");
}

async function loadEquities(): Promise<Instrument[]> {
  const res = await fetch(NSE_LIST_URL);
  if (!res.ok) throw new Error(`Upstox instrument list: HTTP ${res.status}`);
  const rows = JSON.parse(
    gunzipSync(Buffer.from(await res.arrayBuffer())).toString("utf8"),
  ) as UpstoxInstrument[];
  return rows
    .filter((r) => r.segment === "NSE_EQ" && r.instrument_type === "EQ")
    .map((r) => ({
      instrumentKey: r.instrument_key,
      symbol: r.trading_symbol,
      name: displayName(r.name),
    }));
}

export function getEquities() {
  // Download once per server process; retry on the next call if it failed.
  cache ??= loadEquities().catch((err) => {
    cache = null;
    throw err;
  });
  return cache;
}

export async function searchEquities(query: string, limit = 8) {
  const q = query.trim().toUpperCase();
  if (!q) return [];
  const all = await getEquities();
  const rank = (i: Instrument) => {
    const name = i.name.toUpperCase();
    if (i.symbol === q) return 0;
    if (i.symbol.startsWith(q)) return 1;
    if (name.startsWith(q)) return 2;
    if (name.includes(q)) return 3;
    return -1;
  };
  return all
    .map((i) => ({ i, r: rank(i) }))
    .filter((x) => x.r >= 0)
    .sort((a, b) => a.r - b.r || a.i.symbol.length - b.i.symbol.length)
    .slice(0, limit)
    .map((x) => x.i);
}
