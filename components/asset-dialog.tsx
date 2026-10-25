"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, Select } from "@/components/form";
import { Input } from "@/components/ui/input";
import { sound } from "@/lib/sound";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { ASSET_KINDS, LOAN_KINDS, type Asset } from "@/lib/types";

// Mount with a `key` per asset so editing starts from its values.
export function AssetDialog({
  open,
  onOpenChange,
  editing,
  side: initialSide = "asset",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing?: Asset;
  side?: Asset["side"];
}) {
  const { saveAsset } = useStore();
  const [side, setSide] = useState<Asset["side"]>(editing?.side ?? initialSide);
  const kinds = side === "asset" ? ASSET_KINDS : LOAN_KINDS;
  const [kind, setKind] = useState<string>(editing?.kind ?? Object.keys(kinds)[0]);
  const [name, setName] = useState(editing?.name ?? "");
  const [amount, setAmount] = useState(editing ? String(editing.amount) : "");
  const [error, setError] = useState<string | null>(null);

  function switchSide(next: Asset["side"]) {
    setSide(next);
    setKind(Object.keys(next === "asset" ? ASSET_KINDS : LOAN_KINDS)[0]);
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (!(Number(amount) > 0)) return setError("Enter an amount above zero.");
    const label = (kinds as Record<string, string>)[kind];
    saveAsset({
      id: editing?.id,
      side,
      kind: kind as Asset["kind"],
      name: name.trim() || label,
      amount: Number(amount),
    });
    sound("success");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-5 rounded-2xl p-7 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold tracking-tight">
            {editing ? `Edit ${editing.name}` : "Add an asset or loan"}
          </DialogTitle>
          <DialogDescription>
            Anything you own or owe outside the stock market. Saved only in this browser.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={save} className="flex flex-col gap-4" noValidate>
          {!editing && (
            <div className="grid grid-cols-2 gap-1 rounded-xl bg-sand p-1">
              {(["asset", "loan"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => switchSide(s)}
                  className={cn(
                    "h-9 rounded-lg text-[14px] text-body",
                    side === s && "bg-card font-medium text-ink shadow-sm",
                  )}
                >
                  {s === "asset" ? "I own it" : "I owe it"}
                </button>
              ))}
            </div>
          )}
          <Field id="asset-kind" label="Type">
            <Select id="asset-kind" value={kind} onChange={(e) => setKind(e.target.value)}>
              {Object.entries(kinds).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
          <Field id="asset-name" label="Name (optional)">
            <Input
              id="asset-name"
              value={name}
              placeholder={side === "asset" ? "e.g. HDFC savings" : "e.g. SBI home loan"}
              onChange={(e) => setName(e.target.value)}
              className="h-11 rounded-xl"
            />
          </Field>
          <Field id="asset-amount" label={side === "asset" ? "Worth today (₹)" : "Still owed (₹)"}>
            <Input
              id="asset-amount"
              type="number"
              inputMode="decimal"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="nums h-11 rounded-xl"
            />
          </Field>
          {error && <p className="text-[13px] text-loss">{error}</p>}
          <DialogFooter>
            <Button type="submit" className="h-11 w-full rounded-xl text-[15px]">
              {editing ? "Save changes" : side === "asset" ? "Add asset" : "Add loan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
