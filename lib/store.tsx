"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { SAMPLE_HOLDINGS } from "@/lib/sample";
import type { Brief, ExpenseSnapshot, Holding } from "@/lib/types";

const STORAGE_KEY = "finlio:v1";

type StoreData = { holdings: Holding[]; brief?: Brief; expenses?: ExpenseSnapshot };

export type NewHolding = Omit<Holding, "id">;

type Store = StoreData & {
  ready: boolean;
  addHolding: (holding: NewHolding) => void;
  mergeHolding: (id: string, extra: NewHolding) => void;
  updateHolding: (id: string, changes: Partial<NewHolding>) => void;
  removeHolding: (id: string) => void;
  addSample: () => void;
  removeSample: () => void;
  setBrief: (brief: Brief) => void;
  setExpenses: (expenses: ExpenseSnapshot | undefined) => void;
  clearAll: () => void;
};

const StoreContext = createContext<Store | null>(null);

function load(): StoreData {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as StoreData;
  } catch {
    // Unreadable storage behaves like a fresh start.
  }
  return { holdings: [] };
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<StoreData>({ holdings: [] });
  const [ready, setReady] = useState(false);

  // localStorage only exists in the browser, so load after mount.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setData(load());
    setReady(true);
  }, []);

  const update = useCallback((next: (prev: StoreData) => StoreData) => {
    setData((prev) => {
      const value = next(prev);
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
      } catch {
        // Storage full or blocked: keep working in memory.
      }
      return value;
    });
  }, []);

  const addHolding = useCallback(
    (holding: NewHolding) =>
      update((prev) => ({
        ...prev,
        holdings: [...prev.holdings, { ...holding, id: crypto.randomUUID() }],
      })),
    [update],
  );

  // Two buys of the same stock become one position: shares add up, the price
  // becomes the average paid, and the earlier date is kept.
  const mergeHolding = useCallback(
    (id: string, extra: NewHolding) =>
      update((prev) => ({
        ...prev,
        holdings: prev.holdings.map((h) => {
          if (h.id !== id) return h;
          const quantity = h.quantity + extra.quantity;
          const buyPrice = (h.quantity * h.buyPrice + extra.quantity * extra.buyPrice) / quantity;
          return {
            ...h,
            quantity,
            buyPrice: Math.round(buyPrice * 100) / 100,
            buyDate: h.buyDate < extra.buyDate ? h.buyDate : extra.buyDate,
            sample: h.sample && extra.sample,
          };
        }),
      })),
    [update],
  );

  const updateHolding = useCallback(
    (id: string, changes: Partial<NewHolding>) =>
      update((prev) => ({
        ...prev,
        holdings: prev.holdings.map((h) => (h.id === id ? { ...h, ...changes } : h)),
      })),
    [update],
  );

  const removeHolding = useCallback(
    (id: string) =>
      update((prev) => ({ ...prev, holdings: prev.holdings.filter((h) => h.id !== id) })),
    [update],
  );

  const addSample = useCallback(
    () =>
      update((prev) => {
        const owned = new Set(prev.holdings.map((h) => h.instrumentKey));
        const fresh = SAMPLE_HOLDINGS.filter((s) => !owned.has(s.instrumentKey)).map((s) => ({
          ...s,
          id: crypto.randomUUID(),
        }));
        return { ...prev, holdings: [...prev.holdings, ...fresh] };
      }),
    [update],
  );

  const removeSample = useCallback(
    () => update((prev) => ({ ...prev, holdings: prev.holdings.filter((h) => !h.sample) })),
    [update],
  );

  const setBrief = useCallback(
    (brief: Brief) => update((prev) => ({ ...prev, brief })),
    [update],
  );

  const setExpenses = useCallback(
    (expenses: ExpenseSnapshot | undefined) => update((prev) => ({ ...prev, expenses })),
    [update],
  );

  const clearAll = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    setData({ holdings: [] });
  }, []);

  return (
    <StoreContext.Provider
      value={{
        ...data,
        ready,
        addHolding,
        mergeHolding,
        updateHolding,
        removeHolding,
        addSample,
        removeSample,
        setBrief,
        setExpenses,
        clearAll,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const store = useContext(StoreContext);
  if (!store) throw new Error("useStore must be used inside StoreProvider");
  return store;
}
