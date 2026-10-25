import Link from "next/link";
import { compactMoney } from "@/lib/networth";

export function ThisMonthCard({
  monthLabel,
  income,
  spent,
  saved,
}: {
  monthLabel: string;
  income: number;
  spent: number;
  saved: number;
}) {
  return (
    <section className="card-surface p-6">
      <div className="flex items-center justify-between">
        <p className="eyebrow">This month</p>
        <span className="rounded-md bg-sand px-2 py-0.5 text-[11px] font-medium text-body uppercase ring-1 ring-line">
          {monthLabel}
        </span>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3">
        <Stat label="In" value={compactMoney(income)} className="text-success" />
        <Stat label="Out" value={compactMoney(spent)} className="text-loss" />
        <Stat label="Saved" value={compactMoney(saved)} className={saved >= 0 ? "text-ink" : "text-loss"} />
      </div>
      <div className="mt-4 flex justify-between border-t border-line pt-3 text-[12px]">
        <Link href="/expenses" className="text-success hover:underline">
          See expenses →
        </Link>
        <Link href="/insights" className="text-success hover:underline">
          Insights →
        </Link>
      </div>
    </section>
  );
}

function Stat({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div>
      <p className="eyebrow">{label}</p>
      <p className={`nums mt-1 text-[20px] font-semibold tracking-tight ${className ?? ""}`}>{value}</p>
    </div>
  );
}
