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
import { todayLocal } from "@/lib/format";
import { activeLocale } from "@/lib/locale";
import { sound } from "@/lib/sound";
import { useStore } from "@/lib/store";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/lib/types";

// Mount with a `key` per type so the form starts fresh.
export function EntryDialog({
  type,
  open,
  onOpenChange,
}: {
  type: "income" | "expense";
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { addEntry } = useStore();
  const categories: readonly string[] = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayLocal());
  const [category, setCategory] = useState(categories[0]);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (!(Number(amount) > 0)) return setError("Enter an amount above zero.");
    if (!date || date > todayLocal()) return setError("Pick today or an earlier date.");
    addEntry({ type, amount: Number(amount), date, category, note: note.trim() || undefined });
    sound("success");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-5 rounded-2xl p-7 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold tracking-tight">
            {type === "income" ? "Add income" : "Add an expense"}
          </DialogTitle>
          <DialogDescription>Saved only in this browser.</DialogDescription>
        </DialogHeader>
        <form onSubmit={save} className="flex flex-col gap-4" noValidate>
          <div className="grid grid-cols-2 gap-3">
            <Field id="entry-amount" label={`Amount (${activeLocale().symbol})`}>
              <Input
                id="entry-amount"
                autoFocus
                type="number"
                inputMode="decimal"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="nums h-11 rounded-xl"
              />
            </Field>
            <Field id="entry-date" label="Date">
              <Input
                id="entry-date"
                type="date"
                max={todayLocal()}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-11 rounded-xl"
              />
            </Field>
          </div>
          <Field id="entry-category" label="Category">
            <Select id="entry-category" value={category} onChange={(e) => setCategory(e.target.value)}>
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </Field>
          <Field id="entry-note" label="Note (optional)">
            <Input
              id="entry-note"
              value={note}
              placeholder={type === "income" ? "e.g. October salary" : "e.g. Dinner with friends"}
              onChange={(e) => setNote(e.target.value)}
              className="h-11 rounded-xl"
            />
          </Field>
          {error && <p className="text-[13px] text-loss">{error}</p>}
          <DialogFooter>
            <Button type="submit" className="h-11 w-full rounded-xl text-[15px]">
              Save {type}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
