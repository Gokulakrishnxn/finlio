"use client";

import { Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";

export function Welcome({ onAdd }: { onAdd: () => void }) {
  const { addSample } = useStore();

  return (
    <section className="card-surface overflow-hidden">
      <div className="flex flex-col items-start gap-6 p-10">
        <div className="max-w-lg">
          <h2 className="text-2xl font-semibold tracking-tight text-ink">
            Know why your money moved.
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-body">
            Add the stocks you own. Every day, Finlio reads the news about them and tells you, in
            plain words, what changed and why. No account. Your portfolio stays in this browser.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={onAdd} className="h-11 rounded-xl px-5 text-[15px]">
            <Plus className="size-4" />
            Add your first stock
          </Button>
          <Button variant="outline" onClick={addSample} className="h-11 rounded-xl px-5 text-[15px]">
            <Sparkles className="size-4" />
            Try a sample portfolio
          </Button>
        </div>
      </div>

      {/* The idea in one picture: jargon in, plain words out. Illustrative example. */}
      <div className="grid gap-px border-t border-line bg-line sm:grid-cols-2">
        <div className="bg-sand/60 p-7">
          <p className="text-[11px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
            What you read elsewhere
          </p>
          <p className="mt-2 text-[14px] leading-relaxed text-body">
            “Q2 net profit up 8.3% YoY, beats street estimates on robust BFSI demand.”
          </p>
        </div>
        <div className="bg-[#f1faf3] p-7">
          <p className="text-[11px] font-semibold tracking-[0.06em] text-[#1f7a3a] uppercase">
            What Finlio tells you
          </p>
          <p className="mt-2 text-[15px] leading-relaxed font-medium text-ink">
            The company earned more than expected, mostly from banks spending on IT. That&apos;s
            why your shares went up.
          </p>
        </div>
      </div>
    </section>
  );
}
