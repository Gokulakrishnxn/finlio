"use client";

import { useState } from "react";
import { FileUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { todayIST, formatINR } from "@/lib/format";
import { sound } from "@/lib/sound";
import { useStore } from "@/lib/store";
import type { Instrument } from "@/lib/types";
import { parseZerodhaCsv } from "@/lib/zerodha-csv";

type Result = { added: string[]; merged: string[]; unmatched: string[] };

async function findExact(symbol: string): Promise<Instrument | undefined> {
  const res = await fetch(`/api/instruments?q=${encodeURIComponent(symbol)}`);
  if (!res.ok) return undefined;
  const { results } = (await res.json()) as { results: Instrument[] };
  return results.find((r) => r.symbol === symbol);
}

export function ImportDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { holdings, addHolding, mergeHolding } = useStore();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  async function importFile(file: File) {
    setBusy(true);
    setError(null);
    setResult(null);
    const { rows, error } = parseZerodhaCsv(await file.text());
    if (error) {
      setError(error);
      setBusy(false);
      return;
    }
    const done: Result = { added: [], merged: [], unmatched: [] };
    for (const row of rows) {
      const match = await findExact(row.symbol);
      if (!match) {
        done.unmatched.push(row.symbol);
        continue;
      }
      const values = {
        instrumentKey: match.instrumentKey,
        symbol: match.symbol,
        name: match.name,
        buyDate: todayIST(),
        buyPrice: row.avgCost,
        quantity: row.quantity,
        imported: true,
      };
      const existing = holdings.find((h) => h.instrumentKey === match.instrumentKey);
      if (existing) {
        mergeHolding(existing.id, values);
        done.merged.push(match.symbol);
      } else {
        addHolding(values);
        done.added.push(`${match.symbol} · ${row.quantity} @ ${formatINR(row.avgCost)}`);
      }
    }
    setResult(done);
    sound(done.added.length + done.merged.length ? "success" : "warning");
    setBusy(false);
  }

  function close(next: boolean) {
    if (!next) {
      setResult(null);
      setError(null);
    }
    onOpenChange(next);
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="gap-5 rounded-2xl p-7 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold tracking-tight">Import from Zerodha</DialogTitle>
          <DialogDescription>
            In Kite, open Holdings and choose Download (CSV). The file is read here in your browser;
            only the stock symbols are looked up.
          </DialogDescription>
        </DialogHeader>

        {!result && (
          <label className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border border-dashed border-line bg-sand/60 px-6 py-10 text-center transition-colors hover:bg-sand">
            {busy ? (
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            ) : (
              <FileUp className="size-5 text-muted-foreground" />
            )}
            <span className="text-[14px] font-medium text-ink">
              {busy ? "Matching your stocks…" : "Choose holdings CSV"}
            </span>
            <span className="text-[12px] text-muted-foreground">Quantity and average cost are imported</span>
            <input
              type="file"
              accept=".csv,text/csv"
              className="sr-only"
              disabled={busy}
              onChange={(e) => e.target.files?.[0] && importFile(e.target.files[0])}
            />
          </label>
        )}

        {error && <p className="text-[13px] text-loss">{error}</p>}

        {result && (
          <div className="flex flex-col gap-3 text-[14px] text-body">
            <p className="font-medium text-ink">
              Imported {result.added.length + result.merged.length} of{" "}
              {result.added.length + result.merged.length + result.unmatched.length} holdings.
            </p>
            {result.added.length > 0 && <List title="Added" items={result.added} />}
            {result.merged.length > 0 && <List title="Added to existing" items={result.merged} />}
            {result.unmatched.length > 0 && (
              <List title="Not found on NSE (skipped)" items={result.unmatched} />
            )}
            <Button onClick={() => close(false)} className="mt-2 h-11 rounded-xl">
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="eyebrow">{title}</p>
      <p className="mt-1 text-[13px] leading-relaxed">{items.join(", ")}</p>
    </div>
  );
}
