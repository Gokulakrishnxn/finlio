import { cn } from "@/lib/utils";

// Soft brand-adjacent tints; a symbol always gets the same one.
const TINTS = [
  "bg-success-soft text-success",
  "bg-info-soft text-info",
  "bg-warning-soft text-warning",
  "bg-purple-soft text-purple",
  "bg-gold-soft text-gold",
  "bg-danger-soft text-loss",
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
