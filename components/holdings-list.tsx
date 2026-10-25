import { InitialBadge } from "@/components/initial-badge";
import { formatDate, formatINR } from "@/lib/format";
import type { Holding } from "@/lib/types";

export function HoldingsList({ holdings }: { holdings: Holding[] }) {
  return (
    <ul className="flex flex-col">
      {holdings.map((h) => (
        <li
          key={h.id}
          className="flex items-center gap-4 border-b border-line py-4 last:border-b-0"
        >
          <InitialBadge symbol={h.symbol} />
          <div className="min-w-0 flex-1">
            <p className="font-medium text-ink">{h.symbol}</p>
            <p className="truncate text-[13px] text-muted-foreground">{h.name}</p>
          </div>
          <div className="text-right">
            <p className="nums text-[15px] text-ink">
              {h.quantity} × {formatINR(h.buyPrice)}
            </p>
            <p className="text-[13px] text-muted-foreground">Bought {formatDate(h.buyDate)}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
