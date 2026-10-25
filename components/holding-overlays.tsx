"use client";

import { useState } from "react";
import { HoldingDialog } from "@/components/holding-dialog";
import { HoldingDetail } from "@/components/holding-detail";
import type { Position } from "@/lib/portfolio";

// The add/edit dialog and the detail card, shared by Today and Holdings.
export function useHoldingOverlays(positions: Position[]) {
  const [adding, setAdding] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const selected = positions.find((p) => p.holding.id === selectedId);
  const editing = positions.find((p) => p.holding.id === editingId)?.holding;

  const overlays = (
    <>
      <HoldingDialog open={adding} onOpenChange={setAdding} />
      <HoldingDialog
        key={editing?.id ?? "none"}
        open={Boolean(editing)}
        editing={editing}
        onOpenChange={(open) => !open && setEditingId(null)}
      />
      <HoldingDetail
        position={selected}
        onClose={() => setSelectedId(null)}
        onEdit={(id) => {
          setSelectedId(null);
          setEditingId(id);
        }}
      />
    </>
  );

  return { openAdd: () => setAdding(true), select: setSelectedId, overlays };
}
