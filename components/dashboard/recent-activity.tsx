import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { formatDate } from "@/lib/format";
import { compactINR, type Activity } from "@/lib/networth";

export function RecentActivity({ items, limit = 5 }: { items: Activity[]; limit?: number }) {
  return (
    <section className="card-surface p-6">
      <div className="flex items-center justify-between">
        <p className="eyebrow">Recent activity</p>
        <Link href="/expenses" className="text-[12px] text-[#1f7a3a] hover:underline">
          All →
        </Link>
      </div>
      {items.length ? (
        <ul className="mt-2 flex flex-col">
          {items.slice(0, limit).map((a) => (
            <ActivityRow key={a.id} item={a} />
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-[14px] leading-relaxed text-body">
          Nothing yet. Add an expense or income, or connect Gmail on{" "}
          <Link href="/expenses" className="text-ink underline">
            Expenses
          </Link>
          .
        </p>
      )}
    </section>
  );
}

export function ActivityRow({ item, action }: { item: Activity; action?: React.ReactNode }) {
  const income = item.type === "income";
  return (
    <li className="flex items-center gap-3 border-b border-line py-3 last:border-b-0">
      <span
        className={`flex size-8 shrink-0 items-center justify-center rounded-full ${income ? "bg-[#e8f7ec] text-[#1f7a3a]" : "bg-[#ffecec] text-[#c43c3c]"}`}
      >
        {income ? <ArrowDownLeft className="size-4" /> : <ArrowUpRight className="size-4" />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-medium text-ink">{item.title}</p>
        <p className="text-[12px] text-muted-foreground">
          {item.category} · {formatDate(item.date)}
          {item.source === "gmail" && " · Gmail"}
        </p>
      </div>
      <p className={`nums text-[14px] ${income ? "text-[#1f9d47]" : "text-ink"}`}>
        {income ? "+" : "−"}
        {compactINR(item.amount)}
      </p>
      {action}
    </li>
  );
}
