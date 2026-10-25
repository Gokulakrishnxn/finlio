"use client";

import { useState } from "react";
import { HardDrive, Send, ShieldCheck, Trash2 } from "lucide-react";
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

const POINTS = [
  {
    icon: HardDrive,
    title: "Stored only in this browser",
    body: "Your holdings and today's brief live in this browser's storage. Finlio has no account, no database and no server copy.",
  },
  {
    icon: Send,
    title: "Only stock names leave your device",
    body: "To find prices and news, Finlio sends the names and NSE symbols of your stocks. Your quantities, buy prices and portfolio value never leave this browser. Your gains are worked out here.",
  },
  {
    icon: ShieldCheck,
    title: "Who sees those names",
    body: "Upstox, for live prices. Google Gemini with Google Search, to read today's news and write your brief. Both over an encrypted connection. No ads, no tracking.",
  },
];

export default function PrivacyPage() {
  const { holdings, brief, clearAll } = useStore();
  const [confirming, setConfirming] = useState(false);
  const [cleared, setCleared] = useState(false);
  const hasData = holdings.length > 0 || Boolean(brief);

  return (
    <>
      <PageHeader title="Privacy" subtitle="Your money is your business." />

      <section className="card-surface max-w-3xl divide-y divide-line">
        {POINTS.map(({ icon: Icon, title, body }) => (
          <div key={title} className="flex gap-5 p-8">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sand text-ink">
              <Icon className="size-[18px]" strokeWidth={1.75} />
            </span>
            <div>
              <h2 className="font-medium text-ink">{title}</h2>
              <p className="mt-1.5 text-[15px] leading-relaxed text-body">{body}</p>
            </div>
          </div>
        ))}
        <div className="flex items-center justify-between gap-6 p-8">
          <div>
            <h2 className="font-medium text-ink">Clear all my data</h2>
            <p className="mt-1.5 text-[15px] text-body">
              {cleared
                ? "Done. Finlio has forgotten everything."
                : "Removes your holdings and briefs from this browser."}
            </p>
          </div>
          <Button
            variant="outline"
            disabled={!hasData}
            onClick={() => setConfirming(true)}
            className="h-10 shrink-0 rounded-xl text-loss hover:text-loss"
          >
            <Trash2 className="size-4" />
            Clear all
          </Button>
        </div>
      </section>

      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear all your data?</AlertDialogTitle>
            <AlertDialogDescription>
              Your {holdings.length} {holdings.length === 1 ? "holding" : "holdings"} and saved
              briefs will be removed from this browser. This can&apos;t be undone.
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
