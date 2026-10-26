"use client";

import { useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  ArrowUpRight,
  CalendarClock,
  CircleAlert,
  Loader2,
  Lock,
  RefreshCw,
  Search,
  Sparkles,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { InitialBadge } from "@/components/initial-badge";
import { Button } from "@/components/ui/button";
import { useBriefWriter } from "@/components/brief/use-brief";
import { stockDomain } from "@/lib/brands";
import { formatPct, formatShortDate, formatTime, todayLocal } from "@/lib/format";
import { position } from "@/lib/portfolio";
import { usePrices } from "@/lib/prices";
import { useTodaysBrief } from "@/lib/demo-data";
import { activeLocale } from "@/lib/locale";
import { usePositions } from "@/lib/use-positions";
import { useStore } from "@/lib/store";
import type { Brief, BriefItem, Holding } from "@/lib/types";
import { cn } from "@/lib/utils";

gsap.registerPlugin(useGSAP);

type SectionKey = "attention" | "changed" | "comingUp";

// Attention comes first: it's the shortest and the most worth reading.
const SECTIONS: { key: SectionKey; title: string; short: string; hint: string; icon: LucideIcon; tint: string; dot: string }[] = [
  {
    key: "attention",
    title: "Deserves your attention",
    short: "To watch",
    hint: "At most two things worth a closer look.",
    icon: CircleAlert,
    tint: "bg-warning-soft text-warning",
    dot: "bg-warning",
  },
  {
    key: "changed",
    title: "What changed",
    short: "Changed",
    hint: "What moved your stocks, and why.",
    icon: TrendingUp,
    tint: "bg-info-soft text-info",
    dot: "bg-info",
  },
  {
    key: "comingUp",
    title: "Coming up",
    short: "Coming up",
    hint: "Results, dividends and dates ahead.",
    icon: CalendarClock,
    tint: "bg-purple-soft text-purple",
    dot: "bg-purple",
  },
];

export function NewsFeed() {
  const { holdings, brief: saved } = useStore();
  const positions = usePositions();
  // In demo mode a brief about the sample stocks fills in until a real one exists.
  const { brief: todays, demo } = useTodaysBrief(positions, activeLocale().country);
  const brief = todays ?? saved;
  const { write, loading, error } = useBriefWriter();
  const [stock, setStock] = useState<string | null>(null);
  const feed = useRef<HTMLDivElement>(null);

  const today = brief?.date === todayLocal();
  const bySymbol = useMemo(() => new Map(holdings.map((h) => [h.symbol, h])), [holdings]);

  // Stories slide in, one section after another, each time a brief arrives.
  useGSAP(
    () => {
      if (!brief) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-story]", { opacity: 0, y: 10, duration: 0.4, ease: "power2.out", stagger: 0.06 });
      });
    },
    { scope: feed, dependencies: [brief?.createdAt, stock] },
  );

  return (
    <div className="grid gap-6 *:min-w-0 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div ref={feed} className="flex flex-col gap-5">
        {loading ? (
          <Writing count={holdings.length} />
        ) : !brief ? (
          <FirstBrief holdings={holdings} onWrite={write} error={error} />
        ) : (
          <>
            {!today && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-sand px-5 py-3.5">
                <p className="text-[14px] text-body">
                  This brief is from <span className="font-medium text-ink">{formatShortDate(brief.date)}</span>.
                  Today&apos;s isn&apos;t written yet.
                </p>
                <Button size="sm" onClick={write} className="rounded-lg">
                  <Sparkles className="size-3.5" />
                  Get today&apos;s brief
                </Button>
              </div>
            )}
            {error && !demo && <ErrorNote error={error} onRetry={write} />}
            <Overview brief={brief} />
            <StockFilter brief={brief} bySymbol={bySymbol} value={stock} onChange={setStock} />
            <Stories brief={brief} stock={stock} bySymbol={bySymbol} />
            <Footnote brief={brief} />
          </>
        )}
      </div>

      <aside className="flex flex-col gap-5">
        {brief && !loading && (
          <section className="card-surface p-5">
            <p className="eyebrow">Written</p>
            <p className="mt-1.5 text-[15px] font-medium text-ink">
              {today ? "Today" : formatShortDate(brief.date)} at {formatTime(brief.createdAt)}
            </p>
            <Button variant="outline" onClick={write} data-demo-hide={demo ? "" : undefined} className="mt-4 h-9 w-full rounded-xl">
              <RefreshCw className="size-3.5" />
              {today ? "Refresh" : "Get today's brief"}
            </Button>
          </section>
        )}
        <YourStocks holdings={holdings} brief={brief} onPick={setStock} picked={stock} />
        <HowItWorks />
      </aside>
    </div>
  );
}

function StockBadge({ holding, symbol, className }: { holding?: Holding; symbol: string; className?: string }) {
  return (
    <BrandLogo
      domain={holding ? stockDomain(holding.symbol) : undefined}
      fallback={<InitialBadge symbol={symbol} className={className} />}
      className={className}
    />
  );
}

function FirstBrief({ holdings, onWrite, error }: { holdings: Holding[]; onWrite: () => void; error: string | null }) {
  return (
    <section className="card-surface relative overflow-hidden p-6 md:p-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(70%_100%_at_50%_0%,var(--info-soft),transparent)]"
      />
      <div className="relative">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-info-soft text-info">
          <Sparkles className="size-5" strokeWidth={1.75} />
        </span>
        <h2 className="mt-5 text-[22px] font-semibold tracking-tight text-ink md:text-[26px]">
          Your brief for today isn&apos;t written yet
        </h2>
        <p className="mt-2 max-w-lg text-[15px] leading-relaxed text-body">
          Finlio reads today&apos;s news about these {holdings.length} stocks and explains what changed, what&apos;s
          coming up, and what deserves your attention. About two minutes to read.
        </p>
        <ul className="mt-5 flex flex-wrap gap-2">
          {holdings.slice(0, 10).map((h) => (
            <li
              key={h.id}
              className="flex items-center gap-2 rounded-full bg-sand py-1 pr-3 pl-1 text-[13px] text-ink ring-1 ring-line"
            >
              <StockBadge holding={h} symbol={h.symbol} className="size-6 rounded-full text-[11px]" />
              {h.symbol}
            </li>
          ))}
          {holdings.length > 10 && (
            <li className="rounded-full px-2 py-1 text-[13px] text-muted-foreground">+{holdings.length - 10} more</li>
          )}
        </ul>
        {error && (
          <p className="mt-6 flex max-w-xl items-start gap-2 text-[14px] text-loss">
            <CircleAlert className="mt-0.5 size-4 shrink-0" />
            {error}
          </p>
        )}
        <Button onClick={onWrite} className="mt-7 h-11 rounded-xl px-5 text-[15px]">
          <Sparkles className="size-4" />
          {error ? "Try again" : "Get today's brief"}
        </Button>
      </div>
    </section>
  );
}

function Writing({ count }: { count: number }) {
  return (
    <section className="card-surface p-6 md:p-8" aria-live="polite">
      <p className="flex items-center gap-3 text-[15px] text-body">
        <Loader2 className="size-4 animate-spin text-info" />
        Reading today&apos;s news about your {count} stocks…
      </p>
      <div className="mt-8 flex flex-col gap-6">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex gap-4">
            <span className="size-10 shrink-0 animate-pulse rounded-xl bg-sand" />
            <div className="flex flex-1 flex-col gap-2 pt-1">
              <span className="h-3 w-24 animate-pulse rounded bg-sand" />
              <span className="h-3 w-full animate-pulse rounded bg-sand" />
              <span className="h-3 w-2/3 animate-pulse rounded bg-sand" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ErrorNote({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-danger-soft px-5 py-3.5">
      <p className="flex items-start gap-2 text-[14px] text-loss">
        <CircleAlert className="mt-0.5 size-4 shrink-0" />
        {error}
      </p>
      <Button variant="outline" size="sm" onClick={onRetry} className="rounded-lg bg-card">
        Try again
      </Button>
    </div>
  );
}

function Overview({ brief }: { brief: Brief }) {
  return (
    <div className="grid grid-cols-3 gap-3 *:min-w-0">
      {SECTIONS.map(({ key, short, icon: Icon, tint }) => (
        <a
          key={key}
          href={`#${key}`}
          className="card-surface flex flex-col gap-3 p-4 transition-colors hover:bg-sand/60 sm:flex-row sm:items-center"
        >
          <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-xl", tint)}>
            <Icon className="size-4" strokeWidth={1.75} />
          </span>
          <div className="min-w-0">
            <p className="nums text-[22px] leading-none font-semibold text-ink">{brief[key].length}</p>
            <p className="mt-1 truncate text-[12px] text-muted-foreground">{short}</p>
          </div>
        </a>
      ))}
    </div>
  );
}

function StockFilter({
  brief,
  bySymbol,
  value,
  onChange,
}: {
  brief: Brief;
  bySymbol: Map<string, Holding>;
  value: string | null;
  onChange: (symbol: string | null) => void;
}) {
  const symbols = [
    ...new Set(SECTIONS.flatMap(({ key }) => brief[key].map((i) => i.symbol)).filter((s): s is string => !!s)),
  ];
  if (symbols.length < 2) return null;
  const chip = "flex shrink-0 items-center gap-1.5 rounded-full py-1 text-[13px] ring-1 transition-colors";
  return (
    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
      <button
        onClick={() => onChange(null)}
        className={cn(chip, "px-3", value === null ? "bg-ink text-cream ring-ink" : "bg-card text-body ring-line")}
      >
        All stories
      </button>
      {symbols.map((s) => (
        <button
          key={s}
          onClick={() => onChange(value === s ? null : s)}
          className={cn(chip, "pr-3 pl-1", value === s ? "bg-ink text-cream ring-ink" : "bg-card text-body ring-line")}
        >
          <StockBadge holding={bySymbol.get(s)} symbol={s} className="size-5 rounded-full text-[10px]" />
          {s}
        </button>
      ))}
    </div>
  );
}

function Stories({ brief, stock, bySymbol }: { brief: Brief; stock: string | null; bySymbol: Map<string, Holding> }) {
  const sections = SECTIONS.map((s) => ({
    ...s,
    items: brief[s.key].filter((i) => !stock || i.symbol === stock),
  })).filter((s) => s.items.length);

  if (!sections.length) {
    return (
      <section className="card-surface p-8 text-center">
        <p className="text-[15px] text-body">
          {stock ? `No stories about ${stock} today.` : "Nothing notable was reported about your stocks today."}
        </p>
      </section>
    );
  }

  return sections.map(({ key, title, hint, icon: Icon, tint, dot, items }) => (
    <section key={key} id={key} className="card-surface scroll-mt-6 overflow-hidden">
      <header className="flex items-center gap-3 border-b border-line px-5 py-4 md:px-6">
        <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg", tint)}>
          <Icon className="size-4" strokeWidth={1.75} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
          <p className="text-[12px] text-muted-foreground">{hint}</p>
        </div>
        <span className="nums rounded-full bg-sand px-2 py-0.5 text-[12px] text-body">{items.length}</span>
      </header>
      <ul className="divide-y divide-line">
        {items.map((item, i) => (
          <Story key={i} item={item} holding={item.symbol ? bySymbol.get(item.symbol) : undefined} dot={dot} />
        ))}
      </ul>
    </section>
  ));
}

function Story({ item, holding, dot }: { item: BriefItem; holding?: Holding; dot: string }) {
  return (
    <li data-story className="flex gap-4 px-5 py-5 md:px-6">
      {item.symbol ? (
        <StockBadge holding={holding} symbol={item.symbol} />
      ) : (
        <span className="flex size-10 shrink-0 items-center justify-center">
          <span className={cn("size-2 rounded-full", dot)} />
        </span>
      )}
      <div className="min-w-0 flex-1">
        {item.symbol && (
          <p className="text-[13px] text-muted-foreground">
            <span className="font-semibold text-ink">{item.symbol}</span>
            {holding && holding.name !== item.symbol && <span> · {holding.name}</span>}
          </p>
        )}
        <p className="mt-0.5 text-[16px] leading-relaxed text-ink [text-wrap:pretty]">{item.text}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {item.sources.slice(0, 3).map((s) => (
            <a
              key={s.url}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex max-w-full items-center gap-1 rounded-full bg-sand px-2.5 py-1 text-[12px] text-body ring-1 ring-line transition-colors hover:text-ink"
            >
              <span className="truncate">{s.title}</span>
              <ArrowUpRight className="size-3 shrink-0" />
            </a>
          ))}
        </div>
      </div>
    </li>
  );
}

function Footnote({ brief }: { brief: Brief }) {
  return (
    <div className="flex flex-col gap-3 px-1">
      {brief.noNews.length > 0 && (
        <p className="text-[13px] text-muted-foreground">Quiet today: {brief.noNews.join(", ")}.</p>
      )}
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
  );
}

function YourStocks({
  holdings,
  brief,
  picked,
  onPick,
}: {
  holdings: Holding[];
  brief?: Brief;
  picked: string | null;
  onPick: (symbol: string | null) => void;
}) {
  const { quotes } = usePrices();
  const inNews = new Set(
    brief ? SECTIONS.flatMap(({ key }) => brief[key].map((i) => i.symbol)).filter(Boolean) : [],
  );

  return (
    <section className="card-surface p-5">
      <p className="eyebrow mb-3">Your stocks today</p>
      <ul className="flex flex-col gap-1">
        {holdings.map((h) => {
          const { dayChangePct } = position(h, quotes[h.instrumentKey]);
          const news = inNews.has(h.symbol);
          return (
            <li key={h.id}>
              <button
                disabled={!news}
                onClick={() => onPick(picked === h.symbol ? null : h.symbol)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-2 py-1.5 text-left transition-colors enabled:hover:bg-sand",
                  picked === h.symbol && "bg-sand",
                )}
              >
                <StockBadge holding={h} symbol={h.symbol} className="size-8 rounded-lg text-[13px]" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-medium text-ink">{h.symbol}</p>
                  <p className="text-[12px] text-muted-foreground">{news ? "In the news" : "Quiet"}</p>
                </div>
                <span
                  className={cn(
                    "nums text-[13px]",
                    dayChangePct === undefined
                      ? "text-muted-foreground"
                      : dayChangePct >= 0
                        ? "text-success"
                        : "text-loss",
                  )}
                >
                  {dayChangePct === undefined ? "—" : formatPct(dayChangePct)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function HowItWorks() {
  const points: { icon: LucideIcon; text: string }[] = [
    { icon: Search, text: "Gemini searches today's news for each stock you own." },
    { icon: Lock, text: "Only names and symbols are sent. Never quantities or prices." },
    { icon: ArrowUpRight, text: "Every line links to where it came from." },
  ];
  return (
    <section className="rounded-2xl border border-line p-5">
      <p className="eyebrow mb-3">How your brief is made</p>
      <ul className="flex flex-col gap-3">
        {points.map(({ icon: Icon, text }) => (
          <li key={text} className="flex gap-2.5 text-[13px] leading-relaxed text-body">
            <Icon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
            {text}
          </li>
        ))}
      </ul>
    </section>
  );
}
