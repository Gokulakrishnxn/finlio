"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InitialBadge } from "@/components/initial-badge";
import { useStore, type NewHolding } from "@/lib/store";
import { todayIST } from "@/lib/format";
import type { Holding, Instrument } from "@/lib/types";

type Errors = Partial<Record<"buyDate" | "buyPrice" | "quantity", string>>;

function validate(buyDate: string, buyPrice: string, quantity: string): Errors {
  const errors: Errors = {};
  if (!buyDate) errors.buyDate = "Add the date you bought it.";
  else if (buyDate > todayIST()) errors.buyDate = "The buy date can't be in the future.";
  if (!(Number(buyPrice) > 0)) errors.buyPrice = "Enter the price you paid per share.";
  if (!(Number(quantity) > 0)) errors.quantity = "Enter how many shares you own.";
  return errors;
}

// Mount with a `key` per holding so editing starts from that holding's values.
export function HoldingDialog({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing?: Holding;
}) {
  const { holdings, addHolding, mergeHolding, updateHolding } = useStore();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Instrument[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [picked, setPicked] = useState<Instrument | null>(
    editing ? { instrumentKey: editing.instrumentKey, symbol: editing.symbol, name: editing.name } : null,
  );
  const [buyDate, setBuyDate] = useState(editing?.buyDate ?? "");
  const [buyPrice, setBuyPrice] = useState(editing ? String(editing.buyPrice) : "");
  const [quantity, setQuantity] = useState(editing ? String(editing.quantity) : "");
  const [errors, setErrors] = useState<Errors>({});
  const [duplicate, setDuplicate] = useState<{ existing: Holding; extra: NewHolding } | null>(null);

  // Debounced search against the NSE list.
  useEffect(() => {
    const q = query.trim();
    if (!q) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setSearching(true);
      setSearchError(null);
      try {
        const res = await fetch(`/api/instruments?q=${encodeURIComponent(q)}`, {
          signal: controller.signal,
        });
        const body = await res.json();
        if (!res.ok) throw new Error(body.error);
        setResults(body.results);
      } catch (err) {
        if (!controller.signal.aborted) {
          setSearchError(err instanceof Error ? err.message : "Search failed.");
        }
      } finally {
        if (!controller.signal.aborted) setSearching(false);
      }
    }, 200);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  function reset() {
    setQuery("");
    setResults([]);
    setPicked(null);
    setBuyDate("");
    setBuyPrice("");
    setQuantity("");
    setErrors({});
    setSearchError(null);
    setDuplicate(null);
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset();
    onOpenChange(next);
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (!picked) return;
    const found = validate(buyDate, buyPrice, quantity);
    setErrors(found);
    if (Object.keys(found).length) return;
    const values: NewHolding = {
      instrumentKey: picked.instrumentKey,
      symbol: picked.symbol,
      name: picked.name,
      buyDate,
      buyPrice: Number(buyPrice),
      quantity: Number(quantity),
    };
    if (editing) {
      updateHolding(editing.id, { buyDate, buyPrice: values.buyPrice, quantity: values.quantity });
    } else {
      const existing = holdings.find((h) => h.instrumentKey === values.instrumentKey);
      if (existing) {
        setDuplicate({ existing, extra: values });
        return;
      }
      addHolding(values);
    }
    handleOpenChange(false);
  }

  if (duplicate) {
    const { existing, extra } = duplicate;
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="gap-5 rounded-3xl p-7 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold tracking-tight">
              You already own {existing.symbol}
            </DialogTitle>
            <DialogDescription>
              Add these {extra.quantity} shares to your {existing.quantity}? Finlio will keep one
              holding with the average price you paid.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-1 gap-2">
            <Button variant="outline" className="h-11 flex-1 rounded-xl" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button
              className="h-11 flex-1 rounded-xl"
              onClick={() => {
                mergeHolding(existing.id, extra);
                handleOpenChange(false);
              }}
            >
              Add to {existing.symbol}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="gap-5 rounded-3xl p-7 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold tracking-tight">
            {editing ? `Edit ${editing.symbol}` : picked ? "Your position" : "Add a stock you own"}
          </DialogTitle>
          <DialogDescription>
            {picked
              ? "Finlio uses this to work out your gain or loss. It stays in this browser."
              : "Search NSE by company name or symbol."}
          </DialogDescription>
        </DialogHeader>

        {!picked ? (
          <div className="flex flex-col gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. TCS or Infosys"
                className="h-11 rounded-xl pl-9 text-[15px]"
                aria-label="Search NSE stocks"
              />
              {searching && (
                <Loader2 className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
              )}
            </div>
            {searchError && <p className="text-sm text-loss">{searchError}</p>}
            <ul className="flex max-h-72 flex-col overflow-y-auto">
              {(query.trim() ? results : []).map((r) => (
                <li key={r.instrumentKey}>
                  <button
                    type="button"
                    onClick={() => setPicked(r)}
                    className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-sand"
                  >
                    <InitialBadge symbol={r.symbol} className="size-9 text-sm" />
                    <span className="min-w-0">
                      <span className="block text-[15px] font-medium text-ink">{r.symbol}</span>
                      <span className="block truncate text-[13px] text-muted-foreground">
                        {r.name}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
              {query.trim() && !searching && !searchError && results.length === 0 && (
                <li className="px-2 py-3 text-sm text-muted-foreground">
                  No NSE stock matches “{query.trim()}”.
                </li>
              )}
            </ul>
          </div>
        ) : (
          <form onSubmit={save} className="flex flex-col gap-4" noValidate>
            <button
              type="button"
              onClick={() => setPicked(null)}
              disabled={Boolean(editing)}
              className="flex items-center gap-3 rounded-2xl bg-sand p-3 text-left"
            >
              <InitialBadge symbol={picked.symbol} />
              <span className="min-w-0 flex-1">
                <span className="block font-medium text-ink">{picked.symbol}</span>
                <span className="block truncate text-[13px] text-muted-foreground">
                  {picked.name}
                </span>
              </span>
              {!editing && (
                <ArrowLeft className="size-4 text-muted-foreground" aria-label="Change stock" />
              )}
            </button>

            <Field id="buyDate" label="Buy date" error={errors.buyDate}>
              <Input
                id="buyDate"
                type="date"
                max={todayIST()}
                value={buyDate}
                onChange={(e) => setBuyDate(e.target.value)}
                className="h-11 rounded-xl"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field id="buyPrice" label="Buy price per share (₹)" error={errors.buyPrice}>
                <Input
                  id="buyPrice"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.05"
                  value={buyPrice}
                  onChange={(e) => setBuyPrice(e.target.value)}
                  className="nums h-11 rounded-xl"
                />
              </Field>
              <Field id="quantity" label="Quantity" error={errors.quantity}>
                <Input
                  id="quantity"
                  type="number"
                  inputMode="numeric"
                  min="0"
                  step="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="nums h-11 rounded-xl"
                />
              </Field>
            </div>

            <DialogFooter className="mt-1">
              <Button type="submit" className="h-11 w-full rounded-xl text-[15px]">
                {editing ? "Save changes" : `Save ${picked.symbol}`}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="text-[13px] font-medium text-body">
        {label}
      </Label>
      {children}
      {error && <p className="text-[13px] text-loss">{error}</p>}
    </div>
  );
}
