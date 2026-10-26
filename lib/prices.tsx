"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { demoQuote, useDemoMode } from "@/lib/demo-data";
import { useStore } from "@/lib/store";
import type { Quote } from "@/lib/portfolio";

const REFRESH_MS = 60_000;

type Prices = {
  quotes: Record<string, Quote>;
  updatedAt?: string;
  loading: boolean;
  error: string | null;
  refresh: () => void;
};

const PricesContext = createContext<Prices | null>(null);

export function PricesProvider({ children }: { children: React.ReactNode }) {
  const { holdings, ready } = useStore();
  const [quotes, setQuotes] = useState<Record<string, Quote>>({});
  const [updatedAt, setUpdatedAt] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Polling stops when the server has no Upstox token; Retry tries again.
  const [unconfigured, setUnconfigured] = useState(false);

  const keys = useMemo(
    () => [...new Set(holdings.map((h) => h.instrumentKey))].sort().join(","),
    [holdings],
  );

  const refresh = useCallback(async () => {
    if (!keys) return;
    setLoading(true);
    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keys: keys.split(",") }),
      });
      const body = await res.json();
      setUnconfigured(res.status === 503);
      if (!res.ok) throw new Error(body.error);
      // Keep last known prices for anything missing from this response.
      setQuotes((prev) => ({ ...prev, ...body.quotes }));
      setUpdatedAt(body.fetchedAt);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't update prices.");
    } finally {
      setLoading(false);
    }
  }, [keys]);

  useEffect(() => {
    if (!ready || !keys) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [ready, keys, refresh]);

  useEffect(() => {
    if (!ready || !keys || unconfigured) return;
    const timer = setInterval(refresh, REFRESH_MS);
    return () => clearInterval(timer);
  }, [ready, keys, refresh, unconfigured]);

  // Demo mode: sample stocks without a live price get a steady demo one.
  const demo = useDemoMode();
  const value = useMemo(() => {
    if (!demo) return { quotes, updatedAt, loading, error, refresh };
    const filled = { ...quotes };
    for (const h of holdings) if (h.sample && !filled[h.instrumentKey]) filled[h.instrumentKey] = demoQuote(h);
    const covered = holdings.every((h) => filled[h.instrumentKey]);
    return { quotes: filled, updatedAt: updatedAt ?? (covered ? new Date().toISOString() : undefined), loading, error: covered ? null : error, refresh };
  }, [demo, quotes, holdings, updatedAt, loading, error, refresh]);

  return (
    <PricesContext.Provider value={value}>
      {children}
    </PricesContext.Provider>
  );
}

export function usePrices() {
  const prices = useContext(PricesContext);
  if (!prices) throw new Error("usePrices must be used inside PricesProvider");
  return prices;
}
