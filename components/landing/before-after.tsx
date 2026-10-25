"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { sound } from "@/lib/sound";

// The same morning, twice: the raw feed everyone gets, and the Finlio brief.
const BEFORE = [
  "Your largest stock −2.4% · pre-market",
  "Quarterly results filed · 84 pages",
  "Central bank keeps rates unchanged",
  "Sector index −1.1% · 2 analysts revise",
  "Dividend record date announced",
  "12 more headlines…",
];

const AFTER = [
  {
    tone: "loss",
    title: "Your largest stock fell 2.4%",
    body: "Results showed slower growth than last year. It's 31% of your stocks, so it moved your total by about −0.7%.",
  },
  {
    tone: "info",
    title: "Rates didn't change",
    body: "Nothing changes for your loan's interest today. The next decision is in six weeks.",
  },
  {
    tone: "success",
    title: "A dividend is coming",
    body: "You'll be paid if you still own the shares on the record date, next Friday.",
  },
] as const;

const TONE = {
  loss: "bg-loss",
  info: "bg-info",
  success: "bg-success",
};

export function BeforeAfter() {
  const [after, setAfter] = useState(true);

  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="mx-auto mb-5 flex w-fit rounded-full border border-line bg-sand p-1 text-[14px]">
        {[
          { on: false, label: "Without Finlio" },
          { on: true, label: "With Finlio" },
        ].map(({ on, label }) => (
          <button
            key={label}
            onClick={() => {
              setAfter(on);
              sound("tap");
            }}
            aria-pressed={after === on}
            className={cn(
              "rounded-full px-4 py-1.5 font-medium text-muted-foreground transition-colors",
              after === on && "bg-card text-ink shadow-sm",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="card-surface min-h-[340px] p-5 sm:p-6">
        {after ? (
          <div key="after" className="animate-in fade-in slide-in-from-bottom-1 duration-300">
            <p className="eyebrow mb-1">Today&apos;s brief · 7:30 am</p>
            <p className="mb-5 text-[15px] text-body">Three things changed for what you own. Two minutes to read.</p>
            <ul className="grid gap-4">
              {AFTER.map((item) => (
                <li key={item.title} className="flex gap-3">
                  <span className={cn("mt-2 size-2 shrink-0 rounded-full", TONE[item.tone])} />
                  <div className="min-w-0">
                    <p className="text-[15px] font-medium text-ink">{item.title}</p>
                    <p className="text-[14px] leading-relaxed text-body">{item.body}</p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-[12px] text-muted-foreground">Finlio explains what happened. It never says buy or sell.</p>
          </div>
        ) : (
          <div key="before" className="animate-in fade-in slide-in-from-bottom-1 duration-300">
            <p className="eyebrow mb-1">Notifications · 47 unread</p>
            <p className="mb-5 text-[15px] text-body">Every app, every alert, none of it about you.</p>
            <ul className="grid gap-2">
              {BEFORE.map((line) => (
                <li
                  key={line}
                  className="nums truncate rounded-lg bg-sand px-3 py-2 text-[13px] text-muted-foreground"
                >
                  {line}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
