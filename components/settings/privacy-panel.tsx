"use client";

import Link from "next/link";
import { HardDrive, Lock, LogOut, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SHARING } from "@/lib/privacy";
import { useStore } from "@/lib/store";

const POINTS = [
  {
    icon: HardDrive,
    title: "Stored in this browser",
    body: "You sign in with Google, but there's no Finlio database or server copy. Your money data stays on this device.",
  },
  {
    icon: Lock,
    title: "Amounts stay with you",
    body: "Quantities, buy prices, balances and transactions are never sent for prices or news. Gains and net worth are worked out here.",
  },
  {
    icon: ShieldCheck,
    title: "Explains, never advises",
    body: "Finlio tells you what happened and why. It never says buy, sell or hold, and has no ads or tracking.",
  },
];

// Settings → Privacy: what Finlio keeps, what it sends, and how to leave.
export function PrivacyPanel({ onSignOut }: { onSignOut: () => void }) {
  const { holdings, expenses, assets = [], entries = [], snapshots = [] } = useStore();
  const counts = [
    { label: "Stocks", value: holdings.length },
    { label: "Assets & loans", value: assets.length },
    { label: "Income & spends", value: entries.length + (expenses?.expenses.length ?? 0) },
    { label: "Days of history", value: snapshots.length },
  ];

  return (
    <section>
      <h3 className="mb-4 border-b border-line pb-3 text-[15px] font-semibold text-ink">Privacy</h3>

      <ul className="grid gap-3">
        {POINTS.map(({ icon: Icon, title, body }) => (
          <li key={title} className="flex gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-success-soft text-success">
              <Icon className="size-4" strokeWidth={1.75} />
            </span>
            <div>
              <p className="text-[14px] font-medium text-ink">{title}</p>
              <p className="text-[13px] leading-relaxed text-muted-foreground">{body}</p>
            </div>
          </li>
        ))}
      </ul>

      <p className="eyebrow mt-6 mb-2">What leaves your device, and why</p>
      <ul className="divide-y divide-line rounded-xl border border-line">
        {SHARING.map((s) => (
          <li key={`${s.who}-${s.why}`} className="px-4 py-3">
            <p className="text-[13px] font-medium text-ink">
              {s.who} <span className="font-normal text-muted-foreground">· {s.why}</span>
            </p>
            <p className="mt-0.5 text-[13px] text-body">{s.what}</p>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[12px] text-muted-foreground">
        All over encrypted connections. See the{" "}
        <Link href="/terms" target="_blank" className="underline">
          Terms &amp; Conditions
        </Link>
        .
      </p>

      <p className="eyebrow mt-6 mb-2">In this browser now</p>
      <div className="flex flex-wrap gap-6">
        {counts.map((c) => (
          <div key={c.label}>
            <p className="nums text-[20px] font-semibold text-ink">{c.value}</p>
            <p className="text-[12px] text-muted-foreground">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line p-4">
        <div>
          <p className="text-[14px] font-medium text-ink">Sign out of Finlio</p>
          <p className="text-[13px] text-muted-foreground">Disconnects Google and erases Finlio from this browser.</p>
        </div>
        <Button variant="outline" onClick={onSignOut} className="h-9 rounded-xl text-loss hover:text-loss">
          <LogOut className="size-4" />
          Sign out
        </Button>
      </div>
    </section>
  );
}
