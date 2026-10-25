"use client";

import { useState } from "react";
import { HardDrive, Lock, ShieldCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PageHeader } from "@/components/page-header";
import { useStore } from "@/lib/store";

const SHARING = [
  { who: "Upstox", why: "Live NSE prices", what: "NSE codes of your stocks" },
  { who: "Gemini + Google Search", why: "Today's brief", what: "Names and symbols of your stocks" },
  { who: "Gmail (read-only)", why: "Expenses, if you connect it", what: "Finlio reads bank and UPI alerts only" },
  { who: "Gemini", why: "Reading those alerts", what: "Each alert's sender, subject and preview" },
  { who: "Gemini", why: "Insights and Finlio chat", what: "Your totals and your question; no transactions or quantities" },
];

export default function PrivacyPage() {
  const { holdings, brief, expenses, assets = [], entries = [], snapshots = [], clearAll } = useStore();
  const [confirming, setConfirming] = useState(false);
  const [cleared, setCleared] = useState(false);
  const counts = [
    { label: "Stocks", value: holdings.length },
    { label: "Assets & loans", value: assets.length },
    { label: "Income & expenses", value: entries.length + (expenses?.expenses.length ?? 0) },
    { label: "Days of history", value: snapshots.length },
  ];
  const hasData = counts.some((c) => c.value > 0) || Boolean(brief);

  return (
    <>
      <PageHeader title="Privacy" subtitle="Your money is your business. Here is exactly what Finlio does with it." />

      <div className="grid gap-4 lg:grid-cols-3">
        <Point
          icon={HardDrive}
          title="Stored in this browser"
          body="No Finlio account, no Finlio database, no server copy. Close the tab and your data stays here, on your device."
        />
        <Point
          icon={Lock}
          title="Amounts stay with you"
          body="Your quantities, buy prices, balances and transactions are never sent for prices or news. Gains and net worth are worked out here."
        />
        <Point
          icon={ShieldCheck}
          title="Explains, never advises"
          body="Finlio tells you what happened and why. It never says buy, sell or hold, and has no ads or tracking."
        />
      </div>

      <section className="card-surface mt-4 overflow-hidden">
        <p className="eyebrow px-6 pt-5">What leaves your device, and why</p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-[14px]">
            <thead>
              <tr className="border-y border-line bg-sand/60 text-[12px] text-muted-foreground">
                <th className="px-6 py-2.5 font-medium">Sent to</th>
                <th className="px-6 py-2.5 font-medium">For</th>
                <th className="px-6 py-2.5 font-medium">What exactly</th>
              </tr>
            </thead>
            <tbody>
              {SHARING.map((s) => (
                <tr key={`${s.who}-${s.why}`} className="border-b border-line last:border-b-0">
                  <td className="px-6 py-3 font-medium text-ink">{s.who}</td>
                  <td className="px-6 py-3 text-body">{s.why}</td>
                  <td className="px-6 py-3 text-body">{s.what}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="border-t border-line px-6 py-3 text-[12px] text-muted-foreground">
          All over encrypted connections. Connecting Gmail is optional; Disconnect on Expenses revokes access.
        </p>
      </section>

      <section className="card-surface mt-4 p-6">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="eyebrow">In this browser now</p>
            <div className="mt-3 flex flex-wrap gap-6">
              {counts.map((c) => (
                <div key={c.label}>
                  <p className="nums text-[22px] font-semibold text-ink">{c.value}</p>
                  <p className="text-[12px] text-muted-foreground">{c.label}</p>
                </div>
              ))}
            </div>
            {cleared && <p className="mt-3 text-[14px] text-body">Done. Finlio has forgotten everything.</p>}
          </div>
          <Button
            variant="outline"
            disabled={!hasData}
            onClick={() => setConfirming(true)}
            className="h-10 rounded-xl text-loss hover:text-loss"
          >
            <Trash2 className="size-4" />
            Clear all my data
          </Button>
        </div>
      </section>

      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear all your data?</AlertDialogTitle>
            <AlertDialogDescription>
              Your stocks, assets, loans, income, expenses, briefs and net-worth history will be removed from
              this browser. This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep my data</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                clearAll();
                setConfirming(false);
                setCleared(true);
              }}
            >
              Clear all
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function Point({ icon: Icon, title, body }: { icon: typeof Lock; title: string; body: string }) {
  return (
    <section className="card-surface p-6">
      <span className="flex size-9 items-center justify-center rounded-xl bg-[#eef8f1] text-[#1f7a3a]">
        <Icon className="size-[18px]" strokeWidth={1.75} />
      </span>
      <h2 className="mt-4 font-medium text-ink">{title}</h2>
      <p className="mt-1.5 text-[14px] leading-relaxed text-body">{body}</p>
    </section>
  );
}
