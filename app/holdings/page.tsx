"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HoldingDialog } from "@/components/holding-dialog";
import { HoldingsList } from "@/components/holdings-list";
import { PageHeader } from "@/components/page-header";
import { Welcome } from "@/components/welcome";
import { useStore } from "@/lib/store";

export default function HoldingsPage() {
  const { holdings, ready } = useStore();
  const [adding, setAdding] = useState(false);

  if (!ready) return null;

  return (
    <>
      <PageHeader
        title="Holdings"
        subtitle={`${holdings.length} ${holdings.length === 1 ? "stock" : "stocks"}`}
        action={
          holdings.length > 0 && (
            <Button onClick={() => setAdding(true)} className="h-10 rounded-xl px-4">
              <Plus className="size-4" />
              Add stock
            </Button>
          )
        }
      />

      {holdings.length === 0 ? (
        <Welcome onAdd={() => setAdding(true)} />
      ) : (
        <section className="card-surface px-7 py-3">
          <HoldingsList holdings={holdings} />
        </section>
      )}

      <HoldingDialog open={adding} onOpenChange={setAdding} />
    </>
  );
}
