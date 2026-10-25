"use client";

import { useStore } from "@/lib/store";

export function SampleBanner() {
  const { holdings, removeSample } = useStore();
  if (!holdings.some((h) => h.sample)) return null;

  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-card px-5 py-3 text-[13px] text-body ring-1 ring-line">
      <span>
        You&apos;re looking at sample data. Stock prices and news are real; the buy details, assets,
        loans, income and spending are examples.
      </span>
      <button onClick={removeSample} className="shrink-0 font-medium text-ink hover:underline">
        Remove sample
      </button>
    </div>
  );
}
