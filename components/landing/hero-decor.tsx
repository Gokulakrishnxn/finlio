"use client";

import {
  Bell,
  Briefcase,
  ChartLine,
  Coins,
  Landmark,
  Newspaper,
  PiggyBank,
  Receipt,
  Rss,
  Sparkles,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { AppLogo } from "@/components/landing/app-logo";
import { cn } from "@/lib/utils";

// Floating bits around the hero: the apps your money and news are spread
// across today. Logos follow the "Show company logos" switch.

type Bit =
  | { kind: "logo"; file: string; label: string; icon: LucideIcon; tint: string; pos: string; delay: string }
  | { kind: "icon"; icon: LucideIcon; tint: string; pos: string; delay: string }
  | { kind: "chip"; text: string; up: boolean; pos: string; delay: string }
  | { kind: "dot"; color: string; pos: string };

const LEFT: Bit[] = [
  { kind: "logo", file: "groww", label: "Groww", icon: ChartLine, tint: "bg-info text-white", pos: "top-[16%] left-[14%] size-12", delay: "0s" },
  { kind: "icon", icon: Bell, tint: "bg-card text-warning", pos: "top-[30%] left-[2%] size-9", delay: "1.2s" },
  { kind: "chip", text: "+1.2%", up: true, pos: "top-[44%] left-[1%]", delay: "0.6s" },
  { kind: "icon", icon: Coins, tint: "bg-gold text-white", pos: "top-[46%] left-[17%] size-10", delay: "2s" },
  { kind: "logo", file: "upstox", label: "Upstox", icon: Briefcase, tint: "bg-purple text-white", pos: "top-[34%] left-[25%] size-10", delay: "0.3s" },
  { kind: "logo", file: "et", label: "The Economic Times", icon: Newspaper, tint: "bg-loss text-white", pos: "top-[56%] left-[27%] size-10", delay: "1.6s" },
  { kind: "logo", file: "angelone", label: "Angel One", icon: Receipt, tint: "bg-loss text-white", pos: "top-[70%] left-[3%] size-10", delay: "0.9s" },
  { kind: "logo", file: "kite", label: "Zerodha Kite", icon: Landmark, tint: "bg-success text-white", pos: "top-[76%] left-[20%] size-10", delay: "2.4s" },
  { kind: "chip", text: "+2.1%", up: true, pos: "top-[86%] left-[7%]", delay: "1.4s" },
  { kind: "dot", color: "bg-info", pos: "top-[20%] left-[30%]" },
  { kind: "dot", color: "bg-success", pos: "top-[40%] left-[11%]" },
];

const RIGHT: Bit[] = [
  { kind: "logo", file: "etmoney", label: "ET Money", icon: Wallet, tint: "bg-ink text-cream", pos: "top-[14%] right-[16%] size-12", delay: "0.4s" },
  { kind: "chip", text: "−0.4%", up: false, pos: "top-[30%] right-[1%]", delay: "1.4s" },
  { kind: "logo", file: "mint", label: "Mint", icon: Rss, tint: "bg-warning text-white", pos: "top-[34%] right-[22%] size-10", delay: "2.2s" },
  { kind: "logo", file: "etmarkets", label: "ET Markets", icon: Newspaper, tint: "bg-loss text-white", pos: "top-[38%] right-[7%] size-10", delay: "0.8s" },
  { kind: "chip", text: "+0.9%", up: true, pos: "top-[51%] right-[9%]", delay: "1.9s" },
  { kind: "logo", file: "coin", label: "Coin by Zerodha", icon: PiggyBank, tint: "bg-warning text-white", pos: "top-[48%] right-[27%] size-10", delay: "1s" },
  { kind: "logo", file: "paytmmoney", label: "Paytm Money", icon: Sparkles, tint: "bg-info text-white", pos: "top-[62%] right-[22%] size-10", delay: "2.8s" },
  { kind: "logo", file: "moneycontrol", label: "Moneycontrol", icon: ChartLine, tint: "bg-success text-white", pos: "top-[64%] right-[4%] size-10", delay: "0.2s" },
  { kind: "logo", file: "kuvera", label: "Kuvera", icon: Landmark, tint: "bg-purple text-white", pos: "top-[78%] right-[14%] size-10", delay: "2.6s" },
  { kind: "dot", color: "bg-purple", pos: "top-[10%] right-[26%]" },
  { kind: "dot", color: "bg-warning", pos: "top-[26%] right-[13%]" },
  { kind: "dot", color: "bg-success", pos: "top-[90%] right-[24%]" },
];

const SHADOW = "shadow-[0_8px_24px_-12px_rgba(0,0,0,0.25)]";

function Piece({ bit }: { bit: Bit }) {
  if (bit.kind === "dot") return <span className={cn("absolute size-2 rounded-full", bit.color, bit.pos)} />;
  if (bit.kind === "chip") {
    return (
      <span
        style={{ animationDelay: bit.delay }}
        className={cn(
          "land-float nums absolute rounded-full bg-card px-2 py-0.5 text-[11px] font-semibold shadow-sm ring-1 ring-line",
          bit.up ? "text-success" : "text-loss",
          bit.pos,
        )}
      >
        {bit.up ? "▲ " : "▼ "}
        {bit.text}
      </span>
    );
  }
  if (bit.kind === "logo") {
    return (
      <span style={{ animationDelay: bit.delay }} className={cn("land-float absolute", bit.pos)}>
        <AppLogo file={bit.file} label={bit.label} icon={bit.icon} tint={bit.tint} className={cn("size-full", SHADOW)} />
      </span>
    );
  }
  const Icon = bit.icon;
  return (
    <span
      style={{ animationDelay: bit.delay }}
      className={cn("land-float absolute flex items-center justify-center rounded-2xl ring-1 ring-line", SHADOW, bit.tint, bit.pos)}
    >
      <Icon className="size-[45%]" strokeWidth={1.75} />
    </span>
  );
}

function Cluster({ bits, side }: { bits: Bit[]; side: "left" | "right" }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute top-0 hidden h-full w-[min(30vw,420px)] lg:block",
        side === "left" ? "left-0" : "right-0",
      )}
    >
      <span
        className={cn(
          "absolute top-[18%] size-56 rounded-full border border-line bg-sand/40",
          side === "left" ? "left-[2%]" : "right-[2%]",
        )}
      />
      <span
        className={cn("absolute top-[56%] size-24 rounded-full bg-sand", side === "left" ? "left-[10%]" : "right-[14%]")}
      />
      {bits.map((bit, i) => (
        <Piece key={i} bit={bit} />
      ))}
    </div>
  );
}

export function HeroDecor() {
  return (
    <>
      <Cluster bits={LEFT} side="left" />
      <Cluster bits={RIGHT} side="right" />
    </>
  );
}

// Phones get one tidy row under the buttons instead of the side clusters.
const MOBILE = [LEFT[0], LEFT[4], RIGHT[0], RIGHT[3], RIGHT[7]].filter(
  (b): b is Extract<Bit, { kind: "logo" }> => b.kind === "logo",
);

export function HeroDecorMobile() {
  return (
    <div aria-hidden className="mt-10 flex items-center justify-center gap-3 lg:hidden">
      {MOBILE.map((b, i) => (
        <span key={b.file} style={{ animationDelay: `${i * 0.5}s` }} className="land-float size-11">
          <AppLogo file={b.file} label={b.label} icon={b.icon} tint={b.tint} className="size-full" />
        </span>
      ))}
    </div>
  );
}

// The app rows in the story: where stocks, funds and news live today.
const ROWS = {
  stocks: [
    { file: "groww", label: "Groww", icon: ChartLine, tint: "bg-info text-white" },
    { file: "kite", label: "Zerodha Kite", icon: Briefcase, tint: "bg-purple text-white" },
    { file: "upstox", label: "Upstox", icon: ChartLine, tint: "bg-purple text-white" },
    { file: "angelone", label: "Angel One", icon: Briefcase, tint: "bg-info text-white" },
  ],
  funds: [
    { file: "etmoney", label: "ET Money", icon: Landmark, tint: "bg-success text-white" },
    { file: "coin", label: "Coin by Zerodha", icon: PiggyBank, tint: "bg-warning text-white" },
    { file: "paytmmoney", label: "Paytm Money", icon: Wallet, tint: "bg-info text-white" },
    { file: "kuvera", label: "Kuvera", icon: Coins, tint: "bg-gold text-white" },
  ],
  news: [
    { file: "moneycontrol", label: "Moneycontrol", icon: Newspaper, tint: "bg-ink text-cream" },
    { file: "etmarkets", label: "ET Markets", icon: Rss, tint: "bg-loss text-white" },
    { file: "mint", label: "Mint", icon: Newspaper, tint: "bg-warning text-white" },
    { file: "et", label: "The Economic Times", icon: Rss, tint: "bg-loss text-white" },
  ],
};

export function AppRow({ row }: { row: keyof typeof ROWS }) {
  return (
    <span className="ml-1.5 inline-flex translate-y-[-3px] flex-wrap gap-1 align-middle sm:ml-2.5 sm:gap-1.5">
      {ROWS[row].map((a) => (
        <AppLogo key={a.file} {...a} className="land-word size-6 sm:size-8" />
      ))}
    </span>
  );
}
