"use client";

import { useMemo, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DonutChart,
  DonutChartCenter,
  DonutChartLegend,
  DonutChartPlot,
} from "@/components/charts/donut-chart";
import { SankeyChart, SankeyChartPlot, SankeyChartTooltip } from "@/components/charts/sankey-chart";
import { PageHeader } from "@/components/page-header";
import { PageSkeleton } from "@/components/page-skeleton";
import { formatMoney } from "@/lib/format";
import { allocation, compactMoney, monthTotals } from "@/lib/networth";
import { sound } from "@/lib/sound";
import { activeLocale } from "@/lib/locale";
import { useStore } from "@/lib/store";
import { useMoney } from "@/lib/use-money";

const CATEGORY_COLORS = ["var(--chart-loss)", "#ff9f43", "#ffbe4c", "#9553f9", "#3784f4", "#14b8a6", "#a8a29e", "#c084fc", "#94a3b8"];

function previousMonth(key: string) {
  const [y, m] = key.split("-").map(Number);
  return m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, "0")}`;
}

export default function AnalyticsPage() {
  const { ready, assets } = useStore();
  const { worth, items, thisMonth, month } = useMoney();
  const [points, setPoints] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const alloc = useMemo(() => allocation(worth.stocks, assets), [worth.stocks, assets]);
  const allocTotal = alloc.reduce((s, a) => s + a.amount, 0);

  const spending = useMemo(() => {
    const totals = new Map<string, number>();
    for (const i of items) {
      if (i.type === "expense" && i.date.startsWith(month)) totals.set(i.category, (totals.get(i.category) ?? 0) + i.amount);
    }
    return [...totals.entries()].map(([category, amount]) => ({ category, amount })).sort((a, b) => b.amount - a.amount);
  }, [items, month]);

  const income = useMemo(() => {
    const totals = new Map<string, number>();
    for (const i of items) {
      if (i.type === "income" && i.date.startsWith(month)) totals.set(i.category, (totals.get(i.category) ?? 0) + i.amount);
    }
    return [...totals.entries()].map(([category, amount]) => ({ category, amount }));
  }, [items, month]);

  // Income sources → this month's money → spending categories and savings.
  const flow = useMemo(() => {
    if (!income.length || !spending.length) return null;
    const nodes = [
      ...income.map((i) => ({ id: `in:${i.category}`, label: i.category, color: "var(--chart-gain)" })),
      { id: "month", label: "This month", color: "var(--chart-ink)" },
      ...spending.map((s, n) => ({ id: `out:${s.category}`, label: s.category, color: CATEGORY_COLORS[n % CATEGORY_COLORS.length] })),
    ];
    const links = [
      ...income.map((i) => ({ source: `in:${i.category}`, target: "month", value: i.amount })),
      ...spending.map((s) => ({ source: "month", target: `out:${s.category}`, value: s.amount })),
    ];
    if (thisMonth.saved > 0) {
      nodes.push({ id: "saved", label: "Saved", color: "var(--success)" });
      links.push({ source: "month", target: "saved", value: thisMonth.saved });
    }
    return { nodes, links };
  }, [income, spending, thisMonth.saved]);

  async function explain() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          country: activeLocale().country,
          netWorth: Math.round(worth.netWorth),
          assets: Math.round(worth.assets),
          loans: Math.round(worth.loans),
          month: thisMonth,
          lastMonthSpent: monthTotals(items, previousMonth(month)).spent,
          spendingByCategory: spending,
          allocation: alloc.map((a) => ({
            label: a.label,
            percent: allocTotal ? Math.round((a.amount / allocTotal) * 100) : 0,
          })),
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error);
      setPoints(body.points);
      sound("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't explain your money right now.");
    } finally {
      setLoading(false);
    }
  }

  if (!ready) return <PageSkeleton />;

  return (
    <>
      <PageHeader title="Analytics" subtitle="Your money, explained in plain words." />

      <section className="card-surface overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-4 p-6">
          <div className="max-w-xl">
            <p className="eyebrow">Explain my money</p>
            <p className="mt-2 text-[15px] leading-relaxed text-body">
              Finlio looks at your totals (net worth, this month, spending by category and how your money is
              spread) and tells you what stands out. Only totals are sent; never transactions or names.
            </p>
          </div>
          <Button onClick={explain} disabled={loading} className="h-10 rounded-xl px-4">
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            {loading ? "Reading your numbers…" : points ? "Explain again" : "Explain my money"}
          </Button>
        </div>
        {error && <p className="border-t border-line px-6 py-4 text-[14px] text-loss">{error}</p>}
        {points && (
          <ul className="flex flex-col gap-3 border-t border-line bg-success-soft px-6 py-5">
            {points.map((p, i) => (
              <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-ink">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-gain" />
                {p}
              </li>
            ))}
            <li className="text-[12px] text-muted-foreground">Finlio explains. It doesn&apos;t advise.</li>
          </ul>
        )}
      </section>

      <div className="mt-4 grid gap-4 *:min-w-0 lg:grid-cols-2">
        <section className="card-surface p-6">
          <p className="eyebrow mb-5">Where your money sits</p>
          {alloc.length ? (
            <DonutChart
              segments={alloc.map((a) => ({ id: a.label, name: a.label, color: a.color, value: a.amount }))}
              formatValue={compactMoney}
              label="Allocation"
            >
              <div className="grid items-center gap-6 sm:grid-cols-[minmax(0,13rem)_1fr]">
                <DonutChartPlot>
                  <DonutChartCenter totalLabel="Total assets" />
                </DonutChartPlot>
                <DonutChartLegend />
              </div>
            </DonutChart>
          ) : (
            <p className="text-[14px] text-body">Add stocks or assets to see how your money is spread.</p>
          )}
        </section>

        <section className="card-surface p-6">
          <p className="eyebrow mb-5">Spending this month</p>
          {spending.length ? (
            <DonutChart
              segments={spending.map((s, n) => ({
                id: s.category,
                name: s.category,
                color: CATEGORY_COLORS[n % CATEGORY_COLORS.length],
                value: s.amount,
              }))}
              formatValue={compactMoney}
              label="Spending by category"
            >
              <div className="grid items-center gap-6 sm:grid-cols-[minmax(0,13rem)_1fr]">
                <DonutChartPlot>
                  <DonutChartCenter totalLabel="Spent" />
                </DonutChartPlot>
                <DonutChartLegend />
              </div>
            </DonutChart>
          ) : (
            <p className="text-[14px] text-body">No spends recorded this month yet.</p>
          )}
        </section>
      </div>

      <section className="card-surface mt-4 p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="eyebrow">Money flow · this month</p>
          <p className="text-[13px] text-muted-foreground">
            In <span className="nums text-ink">{formatMoney(thisMonth.income)}</span> · Out{" "}
            <span className="nums text-ink">{formatMoney(thisMonth.spent)}</span>
          </p>
        </div>
        {flow ? (
          <SankeyChart nodes={flow.nodes} links={flow.links} formatValue={compactMoney} label="Money flow" className="mt-4">
            <SankeyChartPlot />
            <SankeyChartTooltip />
          </SankeyChart>
        ) : (
          <p className="mt-4 text-[14px] text-body">
            Add this month&apos;s income and a few expenses to see where your money flows.
          </p>
        )}
      </section>
    </>
  );
}
