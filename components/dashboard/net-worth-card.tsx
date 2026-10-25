"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
import { CountUp } from "@/components/count-up";
import { formatINR, formatPct, formatSignedINR } from "@/lib/format";
import { compactINR } from "@/lib/networth";
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
          Your history line starts today and grows each day you open Finlio.
        </p>
      )}

      <div className="mt-4">
        {snapshots.length > 1 ? (
          <>
            <Sparkline points={snapshots.map((s) => s.netWorth)} />
            <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
              <span>{shortDate(first.date)}</span>
              <span>{shortDate(snapshots[snapshots.length - 1].date)}</span>
            </div>
          </>
        ) : (
          <div className="h-[72px] rounded-xl bg-[repeating-linear-gradient(90deg,#f6f4ef_0,#f6f4ef_6px,transparent_6px,transparent_12px)]" />
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
