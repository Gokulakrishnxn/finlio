"use client";

import { Change } from "@/components/change";
import { CountUp } from "@/components/count-up";
import { PriceStatus } from "@/components/price-status";
import { formatMoney } from "@/lib/format";
import { activeLocale } from "@/lib/locale";
import { totals, type Position } from "@/lib/portfolio";

export function PortfolioSummary({ positions }: { positions: Position[] }) {
  const t = totals(positions);

  return (
    <section className="card-surface p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <h2 className="text-[15px] font-medium text-ink">Your portfolio</h2>
        <PriceStatus />
      </div>

      <div className="mt-5 flex flex-wrap items-end gap-x-12 gap-y-5">
        <div>
          <p className="text-[13px] text-muted-foreground">Worth now</p>
          {t.complete ? (
            <CountUp
              value={t.value}
              format={formatMoney}
              className="nums mt-1 block text-[36px] leading-none font-semibold tracking-tight text-ink"
            />
          ) : (
            <p className="nums mt-1 text-[36px] leading-none font-semibold tracking-tight text-muted-foreground">
              {activeLocale().symbol}—
            </p>
          )}
        </div>
        <Stat label="Today" amount={t.complete ? t.dayChange : undefined} pct={t.complete ? t.dayChangePct : undefined} />
        <Stat label="Since you bought" amount={t.complete ? t.gain : undefined} pct={t.complete ? t.gainPct : undefined} />
        <div>
          <p className="text-[13px] text-muted-foreground">You put in</p>
          <p className="nums mt-1 text-[17px] text-ink">{formatMoney(t.invested)}</p>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, amount, pct }: { label: string; amount?: number; pct?: number }) {
  return (
    <div>
      <p className="text-[13px] text-muted-foreground">{label}</p>
      <Change amount={amount} pct={pct} className="mt-1 block text-[17px]" />
    </div>
  );
}
