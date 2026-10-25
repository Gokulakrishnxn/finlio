"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HoldingsList } from "@/components/holdings-list";
import { useHoldingOverlays } from "@/components/holding-overlays";
import { PageHeader } from "@/components/page-header";
import { PortfolioSummary } from "@/components/portfolio-summary";
import { SampleBanner } from "@/components/sample-banner";
import { Welcome } from "@/components/welcome";
import { useStore } from "@/lib/store";
import { usePositions } from "@/lib/use-positions";

export default function HoldingsPage() {
  const { holdings, ready } = useStore();
  const positions = usePositions();
  const { openAdd, select, overlays } = useHoldingOverlays(positions);

  if (!ready) return null;

  return (
    <>
      <PageHeader
        title="Holdings"
        subtitle={`${holdings.length} ${holdings.length === 1 ? "stock" : "stocks"}`}
        action={
          holdings.length > 0 && (
            <Button onClick={openAdd} className="h-10 rounded-xl px-4">
              <Plus className="size-4" />
              Add stock
            </Button>
          )
        }
      />

      {holdings.length === 0 ? (
        <Welcome onAdd={openAdd} />
      ) : (
        <div className="flex flex-col gap-4">
          <SampleBanner />
          <PortfolioSummary positions={positions} />
          <section className="card-surface px-7 py-3">
            <div className="flex items-center gap-4 border-b border-line py-3 text-[12px] text-muted-foreground">
              <span className="flex-1">Stock</span>
              <span className="hidden w-28 text-right lg:block lg:w-32">Price · today</span>
              <span className="w-32 text-right lg:w-40">Value · since bought</span>
              <span className="w-4" />
            </div>
            <HoldingsList positions={positions} onSelect={select} />
          </section>
        </div>
      )}

      {overlays}
    </>
  );
}
