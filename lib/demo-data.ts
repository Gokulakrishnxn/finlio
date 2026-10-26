"use client";

import { useSyncExternalStore } from "react";
import { compactMoney, formatMoney, todayLocal } from "@/lib/format";
import { allocation, type Activity } from "@/lib/networth";
import type { Position, Quote } from "@/lib/portfolio";
import { useStore } from "@/lib/store";
import type { Asset, Brief, BriefItem, Holding } from "@/lib/types";

// Demo mode (see lib/demo-mode.ts) fills the gaps a recording would otherwise
// show: prices for the sample stocks, a brief about them, and instant answers
// to the chat's suggested questions. Only sample holdings get demo prices; a
// person's own stocks always show real prices or none.

const noop = () => () => {};
export function useDemoMode() {
  return useSyncExternalStore(noop, () => document.documentElement.hasAttribute("data-demo"), () => false);
}

// A steady, symbol-specific number in [0, 1).
function seeded(text: string, salt = 0) {
  let h = 2166136261 ^ salt;
  for (const c of text) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return ((h >>> 0) % 10000) / 10000;
}

// A believable day: some sample stocks up, some down.
const DAY: Record<string, number> = {
  TCS: 1.42, RELIANCE: -0.84, HDFCBANK: 0.63, INFY: 2.11, ITC: -0.38,
  AAPL: 0.92, MSFT: -0.57, NVDA: 2.36, AMZN: 1.08, VOO: 0.31,
};

// Gains of 4–24% since buying, and a day's move between −1.4% and +2.2%.
export function demoQuote(h: Holding): Quote {
  const price = h.buyPrice * (1.04 + seeded(h.symbol) * 0.2);
  const day = DAY[h.symbol] ?? -1.4 + seeded(h.symbol, 7) * 3.6;
  return { price: Math.round(price * 100) / 100, prevClose: Math.round((price / (1 + day / 100)) * 100) / 100 };
}

const SECTOR: Record<string, string> = {
  TCS: "IT", INFY: "IT", HDFCBANK: "banking", RELIANCE: "energy", ITC: "consumer",
  AAPL: "tech", MSFT: "tech", NVDA: "chip", AMZN: "tech", VOO: "large-company",
};

function quoteLink(symbol: string, country: "IN" | "US") {
  return country === "IN"
    ? { title: `NSE · ${symbol}`, url: `https://www.nseindia.com/get-quotes/equity?symbol=${encodeURIComponent(symbol)}` }
    : { title: `Nasdaq · ${symbol}`, url: `https://www.nasdaq.com/market-activity/stocks/${symbol.toLowerCase()}` };
}

// A brief built from the sample stocks' own demo moves and weights.
export function demoBrief(positions: Position[], country: "IN" | "US"): Brief | undefined {
  const sample = positions.filter((p) => p.holding.sample && p.dayChangePct !== undefined);
  if (!sample.length) return undefined;
  const byMove = [...sample].sort((a, b) => Math.abs(b.dayChangePct!) - Math.abs(a.dayChangePct!));
  const total = sample.reduce((s, p) => s + (p.value ?? p.invested), 0);
  const largest = [...sample].sort((a, b) => (b.value ?? 0) - (a.value ?? 0))[0];
  const item = (p: Position, text: string): BriefItem => ({
    symbol: p.holding.symbol,
    text,
    sources: [quoteLink(p.holding.symbol, country)],
  });
  const move = (p: Position) => {
    const pct = Math.abs(p.dayChangePct!).toFixed(1);
    const sector = SECTOR[p.holding.symbol] ?? "its";
    return p.dayChangePct! >= 0
      ? `${p.holding.name} rose ${pct}% today, moving with other ${sector} stocks. Your ${p.holding.quantity} shares gained about ${compactMoney(Math.abs(p.dayChange ?? 0))}.`
      : `${p.holding.name} slipped ${pct}% today as ${sector} stocks cooled. Your ${p.holding.quantity} shares lost about ${compactMoney(Math.abs(p.dayChange ?? 0))}.`;
  };
  const changed = byMove.slice(0, 3).map((p) => item(p, move(p)));
  const next = byMove[3] ?? byMove[0];
  const share = Math.round(((largest.value ?? largest.invested) / total) * 100);
  return {
    date: todayLocal(),
    createdAt: new Date(new Date().setHours(7, 30, 0, 0)).toISOString(),
    changed,
    comingUp: [item(next, `Quarterly results season is under way. ${next.holding.name}'s next results will be the big update to watch.`)],
    attention: [item(largest, `${largest.holding.name} is ${share}% of your stocks, so a move there changes your total the most.`)],
    noNews: byMove.slice(4).map((p) => p.holding.symbol),
  };
}

// Today's brief: the real one when there is one, else the demo one in demo mode.
export function useTodaysBrief(positions: Position[], country: "IN" | "US") {
  const { brief } = useStore();
  const demo = useDemoMode();
  if (brief?.date === todayLocal()) return { brief, demo: false };
  if (demo) return { brief: demoBrief(positions, country), demo: true };
  return { brief: undefined, demo: false };
}

// ---- The chat's six suggested questions, answered from the person's own data.

export const QUESTIONS = [
  "Why did my stocks move today?",
  "Where did most of my money go this month?",
  "How much did I save this month?",
  "Explain my net worth in simple words",
  "How are my loans compared with my assets?",
  "Which of my stocks is doing best?",
] as const;

type Data = {
  positions: Position[];
  assets: Asset[];
  items: Activity[];
  month: string;
  thisMonth: { income: number; spent: number; saved: number };
  worth: { netWorth: number; assets: number; loans: number; stocks: number };
  brief?: Brief;
};

const pct = (part: number, whole: number) => (whole ? Math.round((part / whole) * 100) : 0);
const money = (n: number) => formatMoney(Math.round(n)).replace(/\.00$/, "");

export function answer(question: string, d: Data): string | undefined {
  switch (question) {
    case QUESTIONS[0]: {
      const moved = d.positions.filter((p) => p.dayChangePct !== undefined);
      if (!moved.length) return "I don't have today's prices for your stocks yet, so I can't say how they moved.";
      const day = moved.reduce((s, p) => s + (p.dayChange ?? 0), 0);
      const sorted = [...moved].sort((a, b) => Math.abs(b.dayChangePct!) - Math.abs(a.dayChangePct!)).slice(0, 3);
      const lines = sorted.map((p) => `- **${p.holding.symbol}** ${p.dayChangePct! >= 0 ? "+" : "−"}${Math.abs(p.dayChangePct!).toFixed(1)}%`);
      const why = d.brief?.changed[0]?.text;
      return [
        `Your stocks are **${day >= 0 ? "up" : "down"} ${money(Math.abs(day))}** today. The biggest moves:`,
        "",
        ...lines,
        ...(why ? ["", `The main reason: ${why}`] : []),
        "",
        "These are one day's moves. Finlio explains them; it doesn't suggest buying or selling.",
      ].join("\n");
    }
    case QUESTIONS[1]: {
      const by = new Map<string, number>();
      for (const i of d.items) if (i.type === "expense" && i.date.startsWith(d.month)) by.set(i.category, (by.get(i.category) ?? 0) + i.amount);
      const rows = [...by.entries()].sort((a, b) => b[1] - a[1]);
      if (!rows.length) return "There's no spending recorded this month yet.";
      const total = rows.reduce((s, r) => s + r[1], 0);
      return [
        `You've spent **${money(total)}** this month. Most of it went to **${rows[0][0]}**, ${pct(rows[0][1], total)}% of the total.`,
        "",
        ...rows.slice(0, 3).map(([c, a]) => `- **${c}**: ${money(a)} (${pct(a, total)}%)`),
        "",
        "The full breakdown is on the Expenses and Analytics pages.",
      ].join("\n");
    }
    case QUESTIONS[2]: {
      const { income, spent, saved } = d.thisMonth;
      if (!income) return `You've spent ${money(spent)} this month, but no income is recorded yet, so I can't work out savings.`;
      return [
        `This month you earned **${money(income)}** and spent **${money(spent)}**.`,
        `That leaves **${money(saved)}** saved, ${pct(saved, income)}% of your income.`,
        "",
        pct(saved, income) >= 20
          ? "That's above the 20% many people aim for."
          : "Many people aim to save about 20% of what they earn.",
      ].join("\n");
    }
    case QUESTIONS[3]: {
      const alloc = allocation(d.worth.stocks, d.assets);
      const total = alloc.reduce((s, a) => s + a.amount, 0);
      return [
        `Your net worth is **${money(d.worth.netWorth)}**. That's everything you own, ${money(d.worth.assets)}, minus everything you owe, ${money(d.worth.loans)}.`,
        "",
        "What you own is spread like this:",
        "",
        ...alloc.slice(0, 4).map((a) => `- **${a.label}**: ${money(a.amount)} (${pct(a.amount, total)}%)`),
      ].join("\n");
    }
    case QUESTIONS[4]: {
      const loans = d.assets.filter((a) => a.side === "loan");
      if (!loans.length) return `You have no loans recorded. Everything you own, ${money(d.worth.assets)}, is yours outright.`;
      const ratio = pct(d.worth.loans, d.worth.assets);
      return [
        `You owe **${money(d.worth.loans)}** against **${money(d.worth.assets)}** you own, so loans are **${ratio}%** of your assets.`,
        "",
        ...loans.map((l) => `- **${l.name}**: ${money(l.amount)}`),
        "",
        ratio <= 30 ? "For every 100 you own, you owe less than 30, which is a comfortable cushion." : "For every 100 you own, you owe more than 30, so loans take up a large share.",
      ].join("\n");
    }
    case QUESTIONS[5]: {
      const priced = d.positions.filter((p) => p.gainPct !== undefined).sort((a, b) => b.gainPct! - a.gainPct!);
      if (!priced.length) return "I need today's prices to compare your stocks.";
      const best = priced[0];
      const worst = priced[priced.length - 1];
      return [
        `**${best.holding.name}** is your best performer: up **${best.gainPct!.toFixed(1)}%** since you bought it, a gain of ${money(best.gain ?? 0)}.`,
        priced.length > 1 ? `\n**${worst.holding.name}** has done the least, at ${worst.gainPct! >= 0 ? "+" : "−"}${Math.abs(worst.gainPct!).toFixed(1)}%.` : "",
        "\nPast performance doesn't tell you what happens next.",
      ].filter(Boolean).join("\n");
    }
  }
  return undefined;
}
