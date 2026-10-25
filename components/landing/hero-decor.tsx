import {
  Bell,
  Briefcase,
  ChartLine,
  Coins,
  Landmark,
  Newspaper,
  PiggyBank,
  Receipt,
  Sparkles,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Floating bits around the hero: the kinds of things Finlio reads and adds up.
// Generic icons only, no other companies' logos.

type Bit =
  | { kind: "icon"; icon: LucideIcon; tint: string; pos: string; delay: string }
  | { kind: "chip"; text: string; up: boolean; pos: string; delay: string }
  | { kind: "dot"; color: string; pos: string };

const LEFT: Bit[] = [
  { kind: "icon", icon: ChartLine, tint: "bg-info text-white", pos: "top-[16%] left-[14%] size-12", delay: "0s" },
  { kind: "icon", icon: Bell, tint: "bg-card text-warning", pos: "top-[30%] left-[2%] size-9", delay: "1.2s" },
  { kind: "chip", text: "+1.2%", up: true, pos: "top-[44%] left-[1%]", delay: "0.6s" },
  { kind: "icon", icon: Coins, tint: "bg-gold text-white", pos: "top-[46%] left-[17%] size-10", delay: "2s" },
  { kind: "icon", icon: Briefcase, tint: "bg-purple text-white", pos: "top-[34%] left-[25%] size-10", delay: "0.3s" },
  { kind: "icon", icon: Landmark, tint: "bg-success text-white", pos: "top-[66%] left-[22%] size-10", delay: "1.6s" },
  { kind: "icon", icon: Receipt, tint: "bg-loss text-white", pos: "top-[70%] left-[3%] size-10", delay: "0.9s" },
  { kind: "chip", text: "+2.1%", up: true, pos: "top-[80%] left-[9%]", delay: "2.4s" },
  { kind: "dot", color: "bg-info", pos: "top-[20%] left-[30%]" },
  { kind: "dot", color: "bg-success", pos: "top-[40%] left-[11%]" },
];

const RIGHT: Bit[] = [
  { kind: "icon", icon: Newspaper, tint: "bg-ink text-cream", pos: "top-[16%] right-[16%] size-12", delay: "0.4s" },
  { kind: "chip", text: "−0.4%", up: false, pos: "top-[32%] right-[1%]", delay: "1.4s" },
  { kind: "icon", icon: PiggyBank, tint: "bg-warning text-white", pos: "top-[36%] right-[22%] size-10", delay: "2.2s" },
  { kind: "icon", icon: Wallet, tint: "bg-loss text-white", pos: "top-[38%] right-[7%] size-10", delay: "0.8s" },
  { kind: "chip", text: "+0.9%", up: true, pos: "top-[50%] right-[9%]", delay: "1.9s" },
  { kind: "icon", icon: Sparkles, tint: "bg-info text-white", pos: "top-[60%] right-[24%] size-10", delay: "1s" },
  { kind: "icon", icon: Landmark, tint: "bg-purple text-white", pos: "top-[72%] right-[12%] size-10", delay: "2.6s" },
  { kind: "dot", color: "bg-purple", pos: "top-[12%] right-[26%]" },
  { kind: "dot", color: "bg-warning", pos: "top-[28%] right-[13%]" },
  { kind: "dot", color: "bg-success", pos: "top-[86%] right-[20%]" },
];

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
  const Icon = bit.icon;
  return (
    <span
      style={{ animationDelay: bit.delay }}
      className={cn(
        "land-float absolute flex items-center justify-center rounded-2xl shadow-[0_8px_24px_-12px_rgba(0,0,0,0.25)] ring-1 ring-line",
        bit.tint,
        bit.pos,
      )}
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
        className={cn(
          "absolute top-[56%] size-24 rounded-full bg-sand",
          side === "left" ? "left-[10%]" : "right-[14%]",
        )}
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
export function HeroDecorMobile() {
  const row: { icon: LucideIcon; tint: string }[] = [
    { icon: ChartLine, tint: "bg-info text-white" },
    { icon: Newspaper, tint: "bg-ink text-cream" },
    { icon: Landmark, tint: "bg-success text-white" },
    { icon: PiggyBank, tint: "bg-warning text-white" },
    { icon: Coins, tint: "bg-gold text-white" },
  ];
  return (
    <div aria-hidden className="mt-10 flex items-center justify-center gap-3 lg:hidden">
      {row.map(({ icon: Icon, tint }, i) => (
        <span
          key={i}
          style={{ animationDelay: `${i * 0.5}s` }}
          className={cn("land-float flex size-11 items-center justify-center rounded-2xl ring-1 ring-line", tint)}
        >
          <Icon className="size-5" strokeWidth={1.75} />
        </span>
      ))}
    </div>
  );
}
