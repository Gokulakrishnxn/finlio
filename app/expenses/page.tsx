"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, LogOut, Mail, Plus, RefreshCw, ShieldCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CountUp } from "@/components/count-up";
import { ActivityRow } from "@/components/dashboard/recent-activity";
import { EntryDialog } from "@/components/entry-dialog";
import { PageHeader } from "@/components/page-header";
import { PageSkeleton } from "@/components/page-skeleton";
import { formatINR, formatTime } from "@/lib/format";
import { compactINR, monthTotals } from "@/lib/networth";
import { useStore } from "@/lib/store";
import { useMoney } from "@/lib/use-money";
import { cn } from "@/lib/utils";
import { EXPENSE_CATEGORIES } from "@/lib/types";

type Session = { configured: boolean; signedIn: boolean; email?: string };
type Filter = "all" | "expense" | "income";

const MESSAGES: Record<string, string> = {
  connected: "Connected to Google. Press Sync to read your bank alerts.",
  denied: "You didn't allow access, so Finlio can't read your bank alerts.",
  failed: "Google sign-in didn't finish. Please try again.",
  "not-configured": "Google sign-in isn't set up on this copy of Finlio yet.",
};

const BAR_COLORS = ["var(--chart-gain)", "#3784f4", "#ff9f43", "#9553f9", "#ffbe4c", "var(--chart-loss)", "#14b8a6", "#a8a29e", "var(--chart-muted)"];

function previousMonth(key: string) {
  const [y, m] = key.split("-").map(Number);
  return m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, "0")}`;
}

const monthName = (key: string) =>
  new Date(`${key}-01T00:00:00`).toLocaleDateString("en-IN", { month: "long" });

export default function ExpensesPage() {
  const { ready, expenses, setExpenses, removeEntry } = useStore();
  const { items, thisMonth, month } = useMoney();
  const [session, setSession] = useState<Session | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState<"income" | "expense" | null>(null);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    // Result of the Google redirect, e.g. /expenses?google=connected
    const status = new URLSearchParams(window.location.search).get("google");
    if (status) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNotice(MESSAGES[status] ?? null);
      window.history.replaceState(null, "", "/expenses");
    }
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then(setSession)
      .catch(() => setSession({ configured: false, signedIn: false }));
  }, []);

  const lastMonth = previousMonth(month);
  const before = useMemo(() => monthTotals(items, lastMonth), [items, lastMonth]);
  const byCategory = useMemo(() => {
    const totals = new Map<string, number>();
    for (const i of items) {
      if (i.type === "expense" && i.date.startsWith(month)) {
        totals.set(i.category, (totals.get(i.category) ?? 0) + i.amount);
      }
    }
    return [...totals.entries()].map(([category, amount]) => ({ category, amount })).sort((a, b) => b.amount - a.amount);
  }, [items, month]);
  const shown = items.filter((i) => filter === "all" || i.type === filter);

  async function sync() {
    setSyncing(true);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch("/api/expenses/sync", { method: "POST" });
      const body = await res.json();
      if (res.status === 401) setSession((s) => (s ? { ...s, signedIn: false } : s));
      if (!res.ok) throw new Error(body.error);
      setExpenses({ account: body.account, syncedAt: body.syncedAt, expenses: body.expenses });
      if (!body.expenses.length) setNotice(`Read ${body.scanned} alert emails but found no spends.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't read your bank alerts.");
    } finally {
      setSyncing(false);
    }
  }

  async function disconnect() {
    await fetch("/api/auth/signout", { method: "POST" });
    setSession((s) => (s ? { ...s, signedIn: false, email: undefined } : s));
    setExpenses(undefined);
  }

  if (!ready || !session) return <PageSkeleton />;
  const max = byCategory[0]?.amount ?? 1;

  return (
    <>
      <PageHeader
        title="Expenses"
        subtitle="Where your money came from and where it went."
        action={
          <>
            <Button variant="outline" onClick={() => setAdding("income")} className="h-10 rounded-xl px-4">
              <Plus className="size-4" />
              Income
            </Button>
            <Button onClick={() => setAdding("expense")} className="h-10 rounded-xl px-4">
              <Plus className="size-4" />
              Expense
            </Button>
          </>
        }
      />

      {notice && (
        <p className="mb-4 rounded-2xl bg-card px-5 py-3 text-[14px] text-body ring-1 ring-line">{notice}</p>
      )}

      <div className="grid gap-4 lg:grid-cols-12">
        <section className="card-surface p-6 lg:col-span-5">
          <p className="eyebrow">Spent in {monthName(month)}</p>
          <CountUp
            value={thisMonth.spent}
            format={formatINR}
            className="nums mt-2 block text-[34px] leading-none font-semibold tracking-tight text-ink"
          />
          <p className="mt-3 text-[13px] text-body">
            {monthName(lastMonth)}: <span className="nums text-ink">{formatINR(before.spent)}</span>
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3 border-t border-line pt-4">
            <div>
              <p className="eyebrow">In</p>
              <p className="nums mt-1 text-[16px] font-semibold text-success">{compactINR(thisMonth.income)}</p>
            </div>
            <div>
              <p className="eyebrow">Saved</p>
              <p className={cn("nums mt-1 text-[16px] font-semibold", thisMonth.saved >= 0 ? "text-ink" : "text-loss")}>
                {compactINR(thisMonth.saved)}
              </p>
            </div>
          </div>
        </section>

        <section className="card-surface p-6 lg:col-span-7">
          <p className="eyebrow">By category · {monthName(month)}</p>
          {byCategory.length ? (
            <ul className="mt-4 flex flex-col gap-3">
              {byCategory.map(({ category, amount }) => (
                <li key={category} className="grid grid-cols-[120px_1fr_auto] items-center gap-3 text-[13px]">
                  <span className="truncate text-body">{category}</span>
                  <span className="h-2 overflow-hidden rounded-full bg-sand">
                    <span
                      className="block h-full rounded-full"
                      style={{
                        width: `${Math.max(4, (amount / max) * 100)}%`,
                        background:
                          BAR_COLORS[EXPENSE_CATEGORIES.indexOf(category as (typeof EXPENSE_CATEGORIES)[number])] ??
                          "var(--chart-muted)",
                      }}
                    />
                  </span>
                  <span className="nums text-ink">{formatINR(amount)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-[14px] text-body">No spends yet this month.</p>
          )}
        </section>
      </div>

      <div className="mt-4">
        {session.signedIn ? (
          <section className="card-surface flex flex-wrap items-center justify-between gap-4 px-6 py-4">
            <div className="flex items-center gap-3 text-[14px] text-body">
              <span className="flex size-8 items-center justify-center rounded-full bg-sand">
                <Mail className="size-4 text-ink" />
              </span>
              <span>
                Gmail · <span className="font-medium text-ink">{session.email}</span>
                {expenses?.syncedAt && (
                  <span className="text-muted-foreground"> · Synced {formatTime(expenses.syncedAt)}</span>
                )}
              </span>
            </div>
            <div className="flex gap-2">
              <Button onClick={sync} disabled={syncing} className="h-9 rounded-xl px-4">
                {syncing ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
                {syncing ? "Reading your alerts…" : expenses ? "Sync again" : "Sync bank alerts"}
              </Button>
              <Button variant="ghost" onClick={disconnect} className="h-9 rounded-xl text-muted-foreground">
                <LogOut className="size-4" />
                Disconnect
              </Button>
            </div>
          </section>
        ) : (
          <ConnectCard configured={session.configured} />
        )}
        {error && <p className="mt-3 rounded-2xl bg-card px-5 py-3 text-[14px] text-loss ring-1 ring-line">{error}</p>}
      </div>

      <section className="card-surface mt-4 px-6 pt-5 pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="eyebrow">Transactions</p>
          <div className="flex gap-1 rounded-xl bg-sand p-1">
            {(["all", "expense", "income"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "rounded-lg px-3 py-1 text-[13px] text-body",
                  filter === f && "bg-card font-medium text-ink shadow-sm",
                )}
              >
                {f === "all" ? "All" : f === "expense" ? "Spends" : "Income"}
              </button>
            ))}
          </div>
        </div>
        {shown.length ? (
          <ul className="mt-2">
            {shown.slice(0, 60).map((item) => (
              <ActivityRow
                key={item.id}
                item={item}
                action={
                  item.source === "manual" ? (
                    <button
                      onClick={() => removeEntry(item.id)}
                      aria-label={`Delete ${item.title}`}
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-sand hover:text-loss"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  ) : (
                    <span className="w-[26px]" />
                  )
                }
              />
            ))}
          </ul>
        ) : (
          <p className="py-6 text-[14px] text-body">
            Nothing here yet. Add an expense or income{session.signedIn ? ", or sync your bank alerts" : ""}.
          </p>
        )}
      </section>

      <EntryDialog
        key={adding ?? "none"}
        type={adding ?? "expense"}
        open={adding !== null}
        onOpenChange={(open) => !open && setAdding(null)}
      />
    </>
  );
}

function ConnectCard({ configured }: { configured: boolean }) {
  return (
    <section className="card-surface overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-5 p-6">
        <div className="max-w-xl">
          <p className="text-[16px] font-semibold tracking-tight text-ink">Let Finlio read your bank alerts</p>
          <p className="mt-1 text-[14px] leading-relaxed text-body">
            Your bank already emails you every time you spend. Connect Gmail and Finlio turns those
            alerts into your spending, sorted by category. No typing.
          </p>
        </div>
        <div className="flex flex-col items-start gap-1">
          <a
            href="/api/auth/google"
            aria-disabled={!configured}
            className="inline-flex h-11 items-center gap-3 rounded-xl bg-card px-5 text-[15px] font-medium text-ink ring-1 ring-line transition-colors hover:bg-sand aria-disabled:pointer-events-none aria-disabled:opacity-50"
          >
            <GoogleG />
            Continue with Google
          </a>
          {!configured && <span className="text-[12px] text-muted-foreground">Not set up on this copy yet</span>}
        </div>
      </div>
      <div className="flex gap-3 border-t border-line bg-sand/60 px-6 py-4 text-[12px] leading-relaxed text-body">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" />
        <p>
          Read-only. Finlio looks only at bank and UPI alerts, never sends email, and keeps results in this
          browser. Only those alerts&apos; subject and preview go to Gemini to read the amount. In Google&apos;s
          test mode, only invited accounts can connect.
        </p>
      </div>
    </section>
  );
}

// Google's "G" mark, as Google's sign-in branding guidelines ask for.
function GoogleG() {
  return (
    <svg viewBox="0 0 48 48" className="size-[18px]" aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

