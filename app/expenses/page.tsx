"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, LogOut, Mail, RefreshCw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CountUp } from "@/components/count-up";
import { InitialBadge } from "@/components/initial-badge";
import { PageHeader } from "@/components/page-header";
import { formatDate, formatINR, formatTime, todayIST } from "@/lib/format";
import { useStore } from "@/lib/store";
import { EXPENSE_CATEGORIES, type Expense, type ExpenseSnapshot } from "@/lib/types";

type Session = { configured: boolean; signedIn: boolean; email?: string; name?: string };

const MESSAGES: Record<string, string> = {
  connected: "Connected to Google. Press Sync to read your bank alerts.",
  denied: "You didn't allow access, so Finlio can't read your bank alerts.",
  failed: "Google sign-in didn't finish. Please try again.",
  "not-configured": "Google sign-in isn't set up on this copy of Finlio yet.",
};

const BAR_COLORS = ["#34c759", "#3784f4", "#ff9f43", "#9553f9", "#ffbe4c", "#ef4444", "#14b8a6", "#a8a29e", "#c9c8c4"];

const monthKey = (iso: string) => iso.slice(0, 7);

function previousMonth(key: string) {
  const [y, m] = key.split("-").map(Number);
  return m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, "0")}`;
}

function monthName(key: string) {
  return new Date(`${key}-01T00:00:00`).toLocaleDateString("en-IN", { month: "long" });
}

export default function ExpensesPage() {
  const { ready, expenses, setExpenses } = useStore();
  const [session, setSession] = useState<Session | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  if (!ready || !session) return null;

  return (
    <>
      <PageHeader title="Expenses" subtitle="Where your money went." />

      {notice && (
        <p className="mb-4 rounded-2xl bg-white px-5 py-3 text-[14px] text-body ring-1 ring-line">{notice}</p>
      )}

      {!session.signedIn ? (
        <ConnectCard configured={session.configured} />
      ) : (
        <div className="flex flex-col gap-4">
          <section className="card-surface flex flex-wrap items-center justify-between gap-4 px-7 py-5">
            <div className="flex items-center gap-3 text-[14px] text-body">
              <Mail className="size-4 text-muted-foreground" />
              <span>
                Reading bank alerts from <span className="font-medium text-ink">{session.email}</span>
                {expenses?.syncedAt && ` · Synced ${formatTime(expenses.syncedAt)}`}
              </span>
            </div>
            <div className="flex gap-2">
              <Button onClick={sync} disabled={syncing} className="h-9 rounded-xl px-4">
                {syncing ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
                {syncing ? "Reading your alerts…" : expenses ? "Sync again" : "Sync"}
              </Button>
              <Button variant="ghost" onClick={disconnect} className="h-9 rounded-xl text-muted-foreground">
                <LogOut className="size-4" />
                Disconnect
              </Button>
            </div>
          </section>

          {error && (
            <p className="rounded-2xl bg-white px-5 py-3 text-[14px] text-loss ring-1 ring-line">{error}</p>
          )}

          {expenses && expenses.expenses.length > 0 && <Dashboard snapshot={expenses} />}

          {!expenses && !syncing && (
            <section className="card-surface p-10 text-[15px] text-body">
              Press <span className="font-medium text-ink">Sync</span> and Finlio will read your bank and
              UPI alerts from the last 60 days.
            </section>
          )}
        </div>
      )}
    </>
  );
}

function ConnectCard({ configured }: { configured: boolean }) {
  return (
    <section className="card-surface max-w-3xl overflow-hidden">
      <div className="p-10">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">See where your money went.</h2>
        <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-body">
          Your bank already emails you every time you spend. Finlio reads those alerts and turns
          them into one clear picture: how much you spent, on what, and where.
        </p>
        <a
          href="/api/auth/google"
          aria-disabled={!configured}
          className="mt-7 inline-flex h-11 items-center gap-3 rounded-xl bg-white px-5 text-[15px] font-medium text-ink ring-1 ring-line transition-colors hover:bg-sand aria-disabled:pointer-events-none aria-disabled:opacity-50"
        >
          <GoogleG />
          Continue with Google
        </a>
        {!configured && (
          <p className="mt-3 text-[13px] text-muted-foreground">
            Google sign-in isn&apos;t set up on this copy of Finlio yet.
          </p>
        )}
      </div>
      <div className="flex gap-4 border-t border-line bg-sand/60 px-10 py-6 text-[13px] leading-relaxed text-body">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[#1f7a3a]" />
        <p>
          Read-only. Finlio looks only at bank and UPI alerts, never sends email, and keeps the
          results in this browser. Only those alerts&apos; subject and preview go to Gemini to read
          the amount. While Finlio is in Google&apos;s test mode, only invited accounts can connect.
          Disconnect any time.
        </p>
      </div>
    </section>
  );
}

function Dashboard({ snapshot }: { snapshot: ExpenseSnapshot }) {
  const thisMonth = monthKey(todayIST());
  const lastMonth = previousMonth(thisMonth);

  const { current, previous, byCategory } = useMemo(() => {
    const inMonth = (key: string) => snapshot.expenses.filter((e) => monthKey(e.date) === key);
    const current = inMonth(thisMonth);
    const totals = new Map<string, number>();
    for (const e of current) totals.set(e.category, (totals.get(e.category) ?? 0) + e.amount);
    const byCategory = [...totals.entries()]
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
    return { current, previous: inMonth(lastMonth), byCategory };
  }, [snapshot, thisMonth, lastMonth]);

  const spent = current.reduce((s, e) => s + e.amount, 0);
  const spentBefore = previous.reduce((s, e) => s + e.amount, 0);
  const max = byCategory[0]?.amount ?? 1;

  return (
    <>
      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <section className="card-surface p-8">
          <p className="text-[13px] text-muted-foreground">Spent in {monthName(thisMonth)}</p>
          <CountUp
            value={spent}
            format={formatINR}
            className="nums mt-1 block text-[36px] leading-none font-semibold tracking-tight text-ink"
          />
          <p className="mt-3 text-[14px] text-body">
            {spentBefore > 0 ? (
              <>
                {monthName(lastMonth)}: <span className="nums text-ink">{formatINR(spentBefore)}</span>
              </>
            ) : (
              `${current.length} ${current.length === 1 ? "spend" : "spends"} so far`
            )}
          </p>
        </section>

        <section className="card-surface p-8">
          <h2 className="text-[15px] font-medium text-ink">By category</h2>
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
                        background: BAR_COLORS[EXPENSE_CATEGORIES.indexOf(category as (typeof EXPENSE_CATEGORIES)[number])],
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

      <section className="card-surface px-7 pt-6 pb-3">
        <h2 className="text-[15px] font-medium text-ink">Recent spends</h2>
        <ul className="mt-2 flex flex-col">
          {snapshot.expenses.slice(0, 25).map((e) => (
            <ExpenseRow key={e.id} expense={e} />
          ))}
        </ul>
      </section>
    </>
  );
}

function ExpenseRow({ expense }: { expense: Expense }) {
  return (
    <li className="flex items-center gap-4 border-b border-line py-4 last:border-b-0">
      <InitialBadge symbol={expense.merchant.toUpperCase()} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-ink">{expense.merchant}</p>
        <p className="text-[13px] text-muted-foreground">
          {expense.category} · {formatDate(expense.date)}
        </p>
      </div>
      <p className="nums text-[15px] text-ink">−{formatINR(expense.amount)}</p>
    </li>
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
