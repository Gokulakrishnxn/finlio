"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { todayLocal } from "@/lib/format";
import { activeLocale, isCountry, setActiveCountry } from "@/lib/locale";
import { sampleAssets, sampleEntries, sampleHoldings, sampleSnapshots } from "@/lib/sample";
import type { Asset, Brief, Entry, ExpenseSnapshot, Holding, Profile, Snapshot } from "@/lib/types";

const STORAGE_KEY = "finlio:v1";

export type StoreData = {
  holdings: Holding[];
  brief?: Brief;
  expenses?: ExpenseSnapshot;
  assets?: Asset[];
  entries?: Entry[];
  snapshots?: Snapshot[];
  profile?: Profile;
};

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
  saveAsset: (asset: Omit<Asset, "id"> & { id?: string }) => void;
  removeAsset: (id: string) => void;
  addEntry: (entry: Omit<Entry, "id">) => void;
  removeEntry: (id: string) => void;
  recordSnapshot: (snapshot: Snapshot) => void;
  setProfile: (profile: Profile) => void;
  replaceAll: (data: StoreData) => void;
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
    const loaded = load();
    setActiveCountry(isCountry(loaded.profile?.country) ? loaded.profile.country : "IN");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setData(loaded);
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

  // The whole sample household: stocks, assets, loans, three months of income and
  // spending, and net-worth history. Added once; everything is tagged `sample`.
  const addSample = useCallback(
    () =>
      update((prev) => {
        const id = () => crypto.randomUUID();
        const today = todayLocal();
        const country = activeLocale().country;
        const owned = new Set(prev.holdings.map((h) => h.instrumentKey));
        const holdings = [
          ...prev.holdings,
          ...sampleHoldings(country).filter((s) => !owned.has(s.instrumentKey)).map((s) => ({ ...s, id: id() })),
        ];
        const hasSample = (list?: { sample?: boolean }[]) => list?.some((x) => x.sample) ?? false;
        const assets = hasSample(prev.assets)
          ? prev.assets!
          : [...(prev.assets ?? []), ...sampleAssets(country).map((a) => ({ ...a, id: id() }))];
        const entries = hasSample(prev.entries)
          ? prev.entries!
          : [...(prev.entries ?? []), ...sampleEntries(today, country).map((e) => ({ ...e, id: id() }))];
        // Scale the history to today's net worth (stocks at cost) so the chart ends where the card starts.
        const current =
          holdings.reduce((sum, h) => sum + h.quantity * h.buyPrice, 0) +
          assets.reduce((sum, a) => sum + (a.side === "asset" ? a.amount : -a.amount), 0);
        const realDays = new Set((prev.snapshots ?? []).filter((s) => !s.sample).map((s) => s.date));
        const snapshots = hasSample(prev.snapshots)
          ? prev.snapshots!
          : [...(prev.snapshots ?? []), ...sampleSnapshots(today, current).filter((s) => !realDays.has(s.date))].sort(
              (a, b) => a.date.localeCompare(b.date),
            );
        return { ...prev, holdings, assets, entries, snapshots };
      }),
    [update],
  );

  // Removes every sample item and keeps everything the person added themselves.
  const removeSample = useCallback(
    () =>
      update((prev) => ({
        ...prev,
        holdings: prev.holdings.filter((h) => !h.sample),
        assets: prev.assets?.filter((a) => !a.sample),
        entries: prev.entries?.filter((e) => !e.sample),
        snapshots: prev.snapshots?.filter((s) => !s.sample),
      })),
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

  // Adds a new asset or loan, or replaces the one with the same id.
  const saveAsset = useCallback(
    (asset: Omit<Asset, "id"> & { id?: string }) =>
      update((prev) => {
        const assets = prev.assets ?? [];
        if (asset.id && assets.some((a) => a.id === asset.id)) {
          return { ...prev, assets: assets.map((a) => (a.id === asset.id ? (asset as Asset) : a)) };
        }
        return { ...prev, assets: [...assets, { ...asset, id: crypto.randomUUID() }] };
      }),
    [update],
  );

  const removeAsset = useCallback(
    (id: string) => update((prev) => ({ ...prev, assets: (prev.assets ?? []).filter((a) => a.id !== id) })),
    [update],
  );

  const addEntry = useCallback(
    (entry: Omit<Entry, "id">) =>
      update((prev) => ({
        ...prev,
        entries: [...(prev.entries ?? []), { ...entry, id: crypto.randomUUID() }],
      })),
    [update],
  );

  const removeEntry = useCallback(
    (id: string) =>
      update((prev) => ({ ...prev, entries: (prev.entries ?? []).filter((e) => e.id !== id) })),
    [update],
  );

  // One net-worth point per day; today's is overwritten as values change. Keeps a year.
  const recordSnapshot = useCallback(
    (snapshot: Snapshot) =>
      update((prev) => {
        const rest = (prev.snapshots ?? []).filter((s) => s.date !== snapshot.date);
        const last = prev.snapshots?.find((s) => s.date === snapshot.date);
        if (last && Math.abs(last.netWorth - snapshot.netWorth) < 0.5) return prev;
        return {
          ...prev,
          snapshots: [...rest, snapshot].sort((a, b) => a.date.localeCompare(b.date)).slice(-365),
        };
      }),
    [update],
  );

  // Merges into the saved profile. Country changes take effect on the next render,
  // so formats switch everywhere at once.
  const setProfile = useCallback(
    (profile: Profile) => {
      if (isCountry(profile.country)) setActiveCountry(profile.country);
      update((prev) => ({ ...prev, profile: { ...prev.profile, ...profile } }));
    },
    [update],
  );

  // Restores a backup made with Export.
  const replaceAll = useCallback(
    (next: StoreData) => {
      setActiveCountry(isCountry(next.profile?.country) ? next.profile.country : "IN");
      update(() => ({ ...next, holdings: next.holdings ?? [] }));
    },
    [update],
  );

  const clearAll = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    setActiveCountry("IN");
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
        saveAsset,
        removeAsset,
        addEntry,
        removeEntry,
        recordSnapshot,
        setProfile,
        replaceAll,
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
