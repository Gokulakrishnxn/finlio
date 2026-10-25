"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { CountUp } from "@/components/count-up";
import { formatINR, formatPct, formatSignedINR } from "@/lib/format";
import { todayIST } from "@/lib/format";
import { compactINR } from "@/lib/networth";
import { quarterBars, type QuarterBar } from "@/lib/quarters";
import { cn } from "@/lib/utils";
import type { Snapshot } from "@/lib/types";

function Sparkline({ points }: { points: number[] }) {
  const w = 320;
  const h = 72;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const xy = points.map((p, i) => [
    (i / (points.length - 1)) * w,
    h - 6 - ((p - min) / span) * (h - 12),
  ]);
  const line = xy.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const up = points[points.length - 1] >= points[0];
  const color = up ? "#34c759" : "#ef4444";
  const [lx, ly] = xy[xy.length - 1];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="h-[72px] w-full" aria-hidden>
      <defs>
        <linearGradient id="nw-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${line} L${w},${h} L0,${h} Z`} fill="url(#nw-fill)" />
      <path d={line} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
      <circle cx={lx} cy={ly} r="3.5" fill={color} />
    </svg>
  );
}

// Net worth at the end of each Indian financial-year quarter (Q1 = Apr–Jun).
function QuarterChart({ bars }: { bars: QuarterBar[] }) {
  const reduce = useReducedMotion() ?? false;
  // Scale from just below the smallest quarter so growth is visible between bars.
  const known = bars.map((b) => b.value).filter((v): v is number => v !== undefined && v > 0);
  const max = Math.max(...known, 1);
  const floor = known.length > 1 ? Math.min(...known) * 0.85 : 0;
  return (
    <div>
      <div className="flex h-[120px] items-end gap-2">
        {bars.map((b, i) => {
          const pct =
            b.value === undefined ? 0 : Math.max(6, ((Math.max(b.value, 0) - floor) / (max - floor || 1)) * 100);
          return (
            <div key={b.key} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5">
              <span
                className={cn(
                  "nums text-[10px] whitespace-nowrap",
                  b.current ? "font-semibold text-ink" : "text-muted-foreground",
                )}
              >
                {b.value === undefined ? "—" : compactINR(b.value)}
              </span>
              {b.value === undefined ? (
                <div
                  className="h-[10%] w-full max-w-[44px] rounded-md border border-dashed border-line"
                  title={`${b.label} ${b.fy}: no record`}
                />
              ) : (
                <motion.div
                  title={`${b.label} ${b.fy}: ${compactINR(b.value)}`}
                  initial={reduce ? false : { height: 0 }}
                  animate={{ height: `${pct}%` }}
                  transition={{ type: "spring", stiffness: 180, damping: 24, delay: reduce ? 0 : i * 0.06 }}
                  className={cn(
                    "w-full max-w-[44px] rounded-md",
                    b.current ? "bg-gain" : "bg-[#cfeed8]",
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-2 border-t border-line pt-2">
        {bars.map((b) => (
          <div key={b.key} className="min-w-0 flex-1 text-center leading-tight">
            <p className={cn("text-[11px] font-medium", b.current ? "text-ink" : "text-body")}>{b.label}</p>
            <p className="text-[10px] text-muted-foreground">{b.fy}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const shortDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

export function NetWorthCard({
  netWorth,
  assets,
  loans,
  stocksLive,
  snapshots,
}: {
  netWorth: number;
  assets: number;
  loans: number;
  stocksLive: boolean;
  snapshots: Snapshot[];
}) {
  const first = snapshots[0];
  const change = first ? netWorth - first.netWorth : 0;
  const pct = first?.netWorth ? (change / Math.abs(first.netWorth)) * 100 : 0;
  const [view, setView] = useState<"quarterly" | "daily">("quarterly");
  const bars = quarterBars(snapshots, todayIST(), netWorth);

  return (
    <section className="card-surface flex flex-col p-6 md:p-7">
      <div className="flex items-center justify-between gap-3">
        <p className="eyebrow">Net worth · ₹ INR</p>
        {!stocksLive && <span className="text-[11px] text-muted-foreground">Stocks at cost</span>}
      </div>
      <CountUp
        value={netWorth}
        format={formatINR}
        className="nums mt-3 block text-[34px] leading-none font-semibold tracking-tight text-ink md:text-[44px]"
      />
      {snapshots.length > 1 ? (
        <p className={`mt-3 flex items-center gap-1.5 text-[13px] ${change >= 0 ? "text-[#1f9d47]" : "text-loss"}`}>
          {change >= 0 ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
          <span className="nums">
            {formatSignedINR(change)} ({formatPct(pct)})
          </span>
          <span className="text-muted-foreground">since {shortDate(first.date)}</span>
        </p>
      ) : (
        <p className="mt-3 text-[13px] text-muted-foreground">
          Your history starts today and grows each day you open Finlio.
        </p>
      )}

      <div className="mt-5 flex items-center justify-between">
        <p className="text-[12px] text-muted-foreground">
          {view === "quarterly" ? "By quarter · financial year (Apr–Mar)" : "Day by day"}
        </p>
        <div className="flex gap-0.5 rounded-lg bg-sand p-0.5">
          {(["quarterly", "daily"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                "rounded-md px-2.5 py-1 text-[12px] text-body",
                view === v && "bg-white font-medium text-ink shadow-sm",
              )}
            >
              {v === "quarterly" ? "Quarterly" : "Daily"}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3">
        {view === "quarterly" ? (
          <QuarterChart bars={bars} />
        ) : snapshots.length > 1 ? (
          <>
            <Sparkline points={snapshots.map((s) => s.netWorth)} />
            <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
              <span>{shortDate(first.date)}</span>
              <span>{shortDate(snapshots[snapshots.length - 1].date)}</span>
            </div>
          </>
        ) : (
          <div className="flex h-[72px] items-center justify-center rounded-xl bg-sand/60 text-[12px] text-muted-foreground">
            Your daily line starts today.
          </div>
        )}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-line pt-4">
        <div>
          <p className="eyebrow">Assets</p>
          <p className="nums mt-1 text-[15px] text-ink">{compactINR(assets)}</p>
        </div>
        <div>
          <p className="eyebrow">Loans</p>
          <p className="nums mt-1 text-[15px] text-ink">{compactINR(loans)}</p>
        </div>
      </div>
    </section>
  );
}
