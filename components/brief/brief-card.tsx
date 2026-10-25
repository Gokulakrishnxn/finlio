"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { todayIST } from "@/lib/format";
import type { Brief, BriefItem } from "@/lib/types";

gsap.registerPlugin(useGSAP);

const SECTIONS = [
  { key: "changed", title: "What changed" },
  { key: "comingUp", title: "Coming up" },
  { key: "attention", title: "Deserves your attention" },
] as const;

export function BriefCard() {
  const { holdings, brief, setBrief } = useStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const container = useRef<HTMLElement>(null);

  const current = brief?.date === todayIST() ? brief : undefined;

  // The brief writes itself in, one section after another.
  useGSAP(
    () => {
      if (!current) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-brief-section]", {
          opacity: 0,
          y: 12,
          duration: 0.45,
          ease: "power2.out",
          stagger: 0.35,
        });
      });
    },
    { scope: container, dependencies: [current?.createdAt] },
  );

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      // Only names and symbols leave the browser. Quantities and prices stay here.
      const stocks = holdings.map(({ name, symbol }) => ({ name, symbol }));
      const res = await fetch("/api/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stocks }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error);
      setBrief(body as Brief);
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : "Couldn't write today's brief.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section ref={container} className="card-surface p-6 md:p-8">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h2 className="text-[15px] font-medium text-ink">Today&apos;s brief</h2>
          <p className="mt-1 text-[13px] text-muted-foreground">
            {current
              ? `Written at ${new Date(current.createdAt).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" })} from today's news.`
              : "Finlio reads today's news about your stocks and explains it in plain words."}
          </p>
        </div>
        {current && !loading && (
          <Button variant="ghost" size="sm" onClick={generate} className="text-muted-foreground">
            <RefreshCw className="size-3.5" />
            Refresh
          </Button>
        )}
      </div>

      {loading && (
        <div className="mt-8 flex items-center gap-3 text-[15px] text-body">
          <Loader2 className="size-4 animate-spin text-gain" />
          Reading today&apos;s news…
        </div>
      )}

      {!loading && error && (
        <div className="mt-8 flex items-center gap-4">
          <p className="max-w-xl text-[15px] text-body">{error}</p>
          <Button variant="outline" size="sm" onClick={generate}>
            Try again
          </Button>
        </div>
      )}

      {!loading && !current && !error && (
        <Button onClick={generate} className="mt-8 h-11 rounded-xl px-5 text-[15px]">
          <Sparkles className="size-4" />
          Get today&apos;s brief
        </Button>
      )}

      {!loading && current && <BriefBody brief={current} />}
    </section>
  );
}

function BriefBody({ brief }: { brief: Brief }) {
  const empty = SECTIONS.every(({ key }) => brief[key].length === 0);

  return (
    <div className="mt-8 flex flex-col gap-8">
      {empty && (
        <p data-brief-section className="text-[15px] text-body">
          Nothing notable was reported about your stocks today.
        </p>
      )}

      {SECTIONS.map(({ key, title }) =>
        brief[key].length ? (
          <div key={key} data-brief-section>
            <h3 className="text-[12px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
              {title}
            </h3>
            <ul className="mt-3 flex flex-col gap-4">
              {brief[key].map((item, i) => (
                <BriefLine key={i} item={item} />
              ))}
            </ul>
          </div>
        ) : null,
      )}

      {brief.noNews.length > 0 && (
        <p data-brief-section className="text-[13px] text-muted-foreground">
          No news today about {brief.noNews.join(", ")}.
        </p>
      )}

      <div data-brief-section className="flex flex-col gap-3 border-t border-line pt-5">
        <p className="text-[13px] text-muted-foreground">Finlio explains. It doesn&apos;t advise.</p>
        {brief.searchSuggestionsHtml && (
          <iframe
            title="Google Search suggestions"
            srcDoc={brief.searchSuggestionsHtml}
            sandbox="allow-popups allow-popups-to-escape-sandbox"
            className="h-[64px] w-full"
          />
        )}
      </div>
    </div>
  );
}

function BriefLine({ item }: { item: BriefItem }) {
  return (
    <li className="flex flex-col gap-2">
      <p className="text-[16px] leading-relaxed text-ink [text-wrap:pretty]">
        {item.symbol && <span className="mr-2 font-semibold">{item.symbol}</span>}
        {item.text}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {item.sources.slice(0, 3).map((s) => (
          <a
            key={s.url}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-full bg-sand px-2.5 py-1 text-[12px] text-body ring-1 ring-line transition-colors hover:text-ink"
          >
            {s.title}
            <ArrowUpRight className="size-3" />
          </a>
        ))}
      </div>
    </li>
  );
}
