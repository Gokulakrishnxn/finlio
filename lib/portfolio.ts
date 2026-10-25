import type { Holding } from "@/lib/types";

export type Quote = { price: number; prevClose: number; timestamp?: string };

export type Position = {
  holding: Holding;
  quote?: Quote;
  invested: number;
  value?: number;
  gain?: number;
  gainPct?: number;
  dayChange?: number;
  dayChangePct?: number;
};

export function position(holding: Holding, quote?: Quote): Position {
  const invested = holding.quantity * holding.buyPrice;
  if (!quote) return { holding, invested };
  const value = holding.quantity * quote.price;
  const dayChange = holding.quantity * (quote.price - quote.prevClose);
  return {
    holding,
    quote,
    invested,
    value,
    gain: value - invested,
    gainPct: invested ? ((value - invested) / invested) * 100 : 0,
    dayChange,
    dayChangePct: quote.prevClose ? ((quote.price - quote.prevClose) / quote.prevClose) * 100 : 0,
  };
}

export function totals(positions: Position[]) {
  const priced = positions.filter((p) => p.value !== undefined);
  const invested = positions.reduce((s, p) => s + p.invested, 0);
  if (priced.length !== positions.length || positions.length === 0) {
    return { invested, complete: false as const };
  }
  const value = priced.reduce((s, p) => s + p.value!, 0);
  const dayChange = priced.reduce((s, p) => s + p.dayChange!, 0);
  const prevValue = value - dayChange;
  return {
    invested,
    complete: true as const,
    value,
    gain: value - invested,
    gainPct: invested ? ((value - invested) / invested) * 100 : 0,
    dayChange,
    dayChangePct: prevValue ? (dayChange / prevValue) * 100 : 0,
  };
}
