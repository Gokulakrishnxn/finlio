"use client";

import { useState } from "react";
import { ArrowDownLeft, ArrowUpRight, FileUp, Landmark, LineChart, type LucideIcon } from "lucide-react";
import { AssetDialog } from "@/components/asset-dialog";
import { EntryDialog } from "@/components/entry-dialog";
import { HoldingDialog } from "@/components/holding-dialog";
import { activeLocale } from "@/lib/locale";
import { ImportDialog } from "@/components/import-dialog";

export type QuickAddKind = "expense" | "income" | "asset" | "stock" | "import";

const TILES: { kind: QuickAddKind; label: string; icon: LucideIcon; tint: string }[] = [
  { kind: "expense", label: "Expense", icon: ArrowUpRight, tint: "bg-danger-soft text-loss" },
  { kind: "income", label: "Income", icon: ArrowDownLeft, tint: "bg-success-soft text-success" },
  { kind: "stock", label: "Stock", icon: LineChart, tint: "bg-info-soft text-info" },
  { kind: "asset", label: "Asset / loan", icon: Landmark, tint: "bg-warning-soft text-warning" },
  { kind: "import", label: "Import CSV", icon: FileUp, tint: "bg-purple-soft text-purple" },
];

// Every "add" dialog in one place, so any screen can open them.
export function useQuickAdd() {
  const [open, setOpen] = useState<QuickAddKind | null>(null);
  const close = (next: boolean) => !next && setOpen(null);

  const dialogs = (
    <>
      <EntryDialog key={`e-${open}`} type="expense" open={open === "expense"} onOpenChange={close} />
      <EntryDialog key={`i-${open}`} type="income" open={open === "income"} onOpenChange={close} />
      <AssetDialog key={`a-${open}`} open={open === "asset"} onOpenChange={close} />
      <HoldingDialog open={open === "stock"} onOpenChange={close} />
      <ImportDialog open={open === "import"} onOpenChange={close} />
    </>
  );

  return { openAdd: setOpen, dialogs };
}

export function QuickAddTiles({ onAdd }: { onAdd: (kind: QuickAddKind) => void }) {
  // Zerodha CSV import is for Indian portfolios only.
  const tiles = TILES.filter((t) => t.kind !== "import" || activeLocale().country === "IN");
  return (
    <section>
      <p className="eyebrow mb-3">Quick add</p>
      <div className={`grid grid-cols-3 gap-2 ${tiles.length === 5 ? "sm:grid-cols-5" : "sm:grid-cols-4"}`}>
        {tiles.map(({ kind, label, icon: Icon, tint }) => (
          <button
            key={kind}
            onClick={() => onAdd(kind)}
            data-cuelume-tap
            className="card-surface flex flex-col items-center gap-2 px-2 py-4 transition-colors hover:bg-sand/60"
          >
            <span className={`flex size-9 items-center justify-center rounded-full ${tint}`}>
              <Icon className="size-4" />
            </span>
            <span className="text-[13px] font-medium text-ink">{label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
