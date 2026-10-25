import { formatPct, formatSignedMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

// A signed ₹ amount with its percentage, green for gains and red for losses.
export function Change({
  amount,
  pct,
  className,
}: {
  amount?: number;
  pct?: number;
  className?: string;
}) {
  if (amount === undefined || pct === undefined) {
    return <span className={cn("nums text-muted-foreground", className)}>—</span>;
  }
  return (
    <span className={cn("nums", amount >= 0 ? "text-success" : "text-loss", className)}>
      {formatSignedMoney(amount)} ({formatPct(pct)})
    </span>
  );
}
