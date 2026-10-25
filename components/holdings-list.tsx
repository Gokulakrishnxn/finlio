"use client";

import { ChevronRight } from "lucide-react";
import { Change } from "@/components/change";
import { InitialBadge } from "@/components/initial-badge";
import { formatINR } from "@/lib/format";
import type { Position } from "@/lib/portfolio";

export function HoldingsList({
  positions,
  onSelect,
}: {
  positions: Position[];
  onSelect: (id: string) => void;
}) {
  return (
    <ul className="flex flex-col">
      {positions.map((p) => (
        <li key={p.holding.id} className="border-b border-line last:border-b-0">
          <button
            onClick={() => onSelect(p.holding.id)}
            className="group -mx-3 flex w-[calc(100%+1.5rem)] items-center gap-4 rounded-2xl px-3 py-4 text-left transition-colors hover:bg-sand/70"
          >
            <InitialBadge symbol={p.holding.symbol} />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 font-medium text-ink">
                {p.holding.symbol}
                {p.holding.sample && (
                  <span className="rounded-full bg-sand px-2 py-0.5 text-[11px] font-medium text-muted-foreground ring-1 ring-line">
                    Sample
                  </span>
                )}
              </p>
              <p className="truncate text-[13px] text-muted-foreground">
                {p.holding.quantity} {p.holding.quantity === 1 ? "share" : "shares"} ·{" "}
                {p.holding.name}
              </p>
            </div>
            <div className="hidden w-28 text-right lg:block lg:w-32">
              <p className="nums text-[15px] text-ink">
                {p.quote ? formatINR(p.quote.price) : "—"}
              </p>
              <Change amount={p.dayChange} pct={p.dayChangePct} className="text-[12px]" />
            </div>
            <div className="w-32 text-right lg:w-40">
              <p className="nums text-[15px] font-medium text-ink">
                {p.value !== undefined ? formatINR(p.value) : formatINR(p.invested)}
              </p>
              {p.value !== undefined ? (
                <Change amount={p.gain} pct={p.gainPct} className="text-[12px]" />
              ) : (
                <p className="text-[12px] text-muted-foreground">invested</p>
              )}
            </div>
            <ChevronRight className="size-4 text-[#c9c8c4] transition-colors group-hover:text-ink" />
          </button>
        </li>
      ))}
    </ul>
  );
}
