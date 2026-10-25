import { cn } from "@/lib/utils";

// Soft brand-adjacent tints; a symbol always gets the same one.
const TINTS = [
  "bg-[#e8f7ec] text-[#1f7a3a]",
  "bg-[#e6f1ff] text-[#1d5fb8]",
  "bg-[#fff1e6] text-[#b4500f]",
  "bg-[#f3ecff] text-[#6a3bc0]",
  "bg-[#fff7e0] text-[#8a6410]",
  "bg-[#ffe9e9] text-[#b42c2c]",
];

function tintFor(symbol: string) {
  let hash = 0;
  for (const c of symbol) hash = (hash * 31 + c.charCodeAt(0)) >>> 0;
  return TINTS[hash % TINTS.length];
}

export function InitialBadge({ symbol, className }: { symbol: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-xl text-[15px] font-semibold",
        tintFor(symbol),
        className,
      )}
    >
      {symbol.charAt(0)}
    </span>
  );
}
