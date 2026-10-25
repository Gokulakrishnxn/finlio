import { compactMoney } from "@/lib/networth";

// Assets versus loans as one split bar.
export function WealthBar({ assets, loans }: { assets: number; loans: number }) {
  const total = assets + loans;
  const assetPct = total ? Math.round((assets / total) * 100) : 100;

  return (
    <div>
      <div className="flex h-2 overflow-hidden rounded-full bg-sand">
        <span className="h-full bg-gain" style={{ width: `${assetPct}%` }} />
        <span className="h-full bg-loss" style={{ width: `${100 - assetPct}%` }} />
      </div>
      <div className="mt-2 flex justify-between text-[11px] font-semibold tracking-[0.06em] uppercase">
        <span className="text-success">
          {assetPct}% assets · <span className="nums">{compactMoney(assets)}</span>
        </span>
        <span className="text-loss">
          {100 - assetPct}% loans · <span className="nums">{compactMoney(loans)}</span>
        </span>
      </div>
    </div>
  );
}
