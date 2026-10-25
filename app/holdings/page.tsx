"use client";

import { useState } from "react";
import { FileUp, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HoldingsList } from "@/components/holdings-list";
import { useHoldingOverlays } from "@/components/holding-overlays";
import { ImportDialog } from "@/components/import-dialog";
import { PageHeader } from "@/components/page-header";
import { PageSkeleton } from "@/components/page-skeleton";
import { PortfolioSummary } from "@/components/portfolio-summary";
import { SampleBanner } from "@/components/sample-banner";
import { Welcome } from "@/components/welcome";
import { useStore } from "@/lib/store";
import { activeLocale } from "@/lib/locale";
import { usePositions } from "@/lib/use-positions";

export default function HoldingsPage() {
  const { holdings, ready } = useStore();
  const positions = usePositions();
  const { openAdd, select, overlays } = useHoldingOverlays(positions);
  const [importing, setImporting] = useState(false);

  if (!ready) return <PageSkeleton />;

  return (
    <>
      <PageHeader
        title="Holdings"
        subtitle={
          holdings.length
            ? `${holdings.length} ${holdings.length === 1 ? "stock" : "stocks"} · ${activeLocale().market}`
            : "The stocks you own, live."
        }
        action={
          <>
            {activeLocale().country === "IN" && (
              <Button variant="outline" onClick={() => setImporting(true)} className="h-10 rounded-xl px-4">
                <FileUp className="size-4" />
                Import from Zerodha
              </Button>
            )}
            <Button onClick={openAdd} className="h-10 rounded-xl px-4">
              <Plus className="size-4" />
              Add stock
            </Button>
          </>
        }
      />

      {holdings.length === 0 ? (
        <Welcome onAdd={openAdd} />
      ) : (
        <div className="flex flex-col gap-4">
          <SampleBanner />
          <PortfolioSummary positions={positions} />
          <section className="card-surface px-6 py-2">
            <div className="flex items-center gap-4 border-b border-line py-3">
              <span className="eyebrow flex-1">Stock</span>
              <span className="eyebrow hidden w-28 text-right lg:block lg:w-32">Price · today</span>
              <span className="eyebrow w-32 text-right lg:w-40">Value · since bought</span>
              <span className="w-4" />
            </div>
            <HoldingsList positions={positions} onSelect={select} />
          </section>
        </div>
      )}

      <ImportDialog open={importing} onOpenChange={setImporting} />
      {overlays}
    </>
  );
}
