import { totals, type Position } from "@/lib/portfolio";
import type { Asset, Entry, ExpenseSnapshot } from "@/lib/types";

export type Allocation = { label: string; amount: number; color: string }[];

// Stocks count at live value when every price is known, otherwise at the amount invested.
export function netWorth(positions: Position[], assets: Asset[] = []) {
  const t = totals(positions);
  const stocks = t.complete ? t.value : t.invested;
  const owned = assets.filter((a) => a.side === "asset").reduce((s, a) => s + a.amount, 0);
  const owed = assets.filter((a) => a.side === "loan").reduce((s, a) => s + a.amount, 0);
  return {
    stocks,
    stocksLive: t.complete,
    assets: stocks + owned,
    loans: owed,
    netWorth: stocks + owned - owed,
  };
}

const GROUPS: { label: string; kinds: string[]; color: string }[] = [
  { label: "Cash & deposits", kinds: ["bank", "fd"], color: "#3784f4" },
  { label: "Gold", kinds: ["gold"], color: "#ffbe4c" },
  { label: "Retirement", kinds: ["epf", "ppf"], color: "#9553f9" },
  { label: "Property", kinds: ["property"], color: "#ff9f43" },
  { label: "Other", kinds: ["other"], color: "#a8a29e" },
];

export function allocation(stocks: number, assets: Asset[] = []): Allocation {
  const rows = [{ label: "Stocks", amount: stocks, color: "var(--chart-gain)" }];
  for (const g of GROUPS) {
    const amount = assets
      .filter((a) => a.side === "asset" && g.kinds.includes(a.kind))
      .reduce((s, a) => s + a.amount, 0);
    rows.push({ label: g.label, amount, color: g.color });
  }
  return rows.filter((r) => r.amount > 0).sort((a, b) => b.amount - a.amount);
}

export type Activity = {
  id: string;
  type: "income" | "expense";
  date: string;
  amount: number;
  title: string;
  category: string;
  source: "gmail" | "manual";
};

// Gmail spends and hand-entered income/expenses in one list, newest first.
export function activity(gmail?: ExpenseSnapshot, entries: Entry[] = []): Activity[] {
  const fromGmail: Activity[] = (gmail?.expenses ?? []).map((e) => ({
    id: `g-${e.id}`,
    type: "expense",
    date: e.date,
    amount: e.amount,
    title: e.merchant,
    category: e.category,
    source: "gmail",
  }));
  const manual: Activity[] = entries.map((e) => ({
    id: e.id,
    type: e.type,
    date: e.date,
    amount: e.amount,
    title: e.note || e.category,
    category: e.category,
    source: "manual",
  }));
  return [...fromGmail, ...manual].sort((a, b) => b.date.localeCompare(a.date));
}

export function monthTotals(items: Activity[], month: string) {
  const inMonth = items.filter((i) => i.date.startsWith(month));
  const income = inMonth.filter((i) => i.type === "income").reduce((s, i) => s + i.amount, 0);
  const spent = inMonth.filter((i) => i.type === "expense").reduce((s, i) => s + i.amount, 0);
  return { income, spent, saved: income - spent };
}

export function compactINR(value: number) {
  const abs = Math.abs(value);
  const sign = value < 0 ? "−" : "";
  if (abs >= 1e7) return `${sign}₹${(abs / 1e7).toFixed(2)}Cr`;
  if (abs >= 1e5) return `${sign}₹${(abs / 1e5).toFixed(2)}L`;
  if (abs >= 1e3) return `${sign}₹${(abs / 1e3).toFixed(1)}K`;
  return `${sign}₹${abs.toFixed(0)}`;
}
