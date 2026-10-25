"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Brief, Holding } from "@/lib/types";

const STORAGE_KEY = "finlio:v1";

type StoreData = { holdings: Holding[]; brief?: Brief };

type Store = StoreData & {
  ready: boolean;
  addHolding: (holding: Omit<Holding, "id">) => void;
  setBrief: (brief: Brief) => void;
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
    (holding: Omit<Holding, "id">) =>
      update((prev) => ({
        ...prev,
        holdings: [...prev.holdings, { ...holding, id: crypto.randomUUID() }],
      })),
    [update],
  );

  const setBrief = useCallback(
    (brief: Brief) => update((prev) => ({ ...prev, brief })),
    [update],
  );

  const clearAll = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    setData({ holdings: [] });
  }, []);

  return (
    <StoreContext.Provider value={{ ...data, ready, addHolding, setBrief, clearAll }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const store = useContext(StoreContext);
  if (!store) throw new Error("useStore must be used inside StoreProvider");
  return store;
}
