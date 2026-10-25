"use client";

import { useEffect, useMemo } from "react";
import { todayLocal } from "@/lib/format";
import { activity, monthTotals, netWorth } from "@/lib/networth";
import { useStore } from "@/lib/store";
import { usePositions } from "@/lib/use-positions";

// Everything the dashboard and analytics show, derived from this browser's data.
export function useMoney({ record = false }: { record?: boolean } = {}) {
  const { ready, assets, entries, expenses, snapshots, recordSnapshot } = useStore();
  const positions = usePositions();
  const worth = useMemo(() => netWorth(positions, assets), [positions, assets]);
  const items = useMemo(() => activity(expenses, entries), [expenses, entries]);
  // Dates are read only in the browser; Next.js prerenders pages without them.
  const month = ready ? todayLocal().slice(0, 7) : "";
  const thisMonth = useMemo(() => monthTotals(items, month), [items, month]);

  // Today's point on the net-worth line, once there is something to measure.
  const hasData = positions.length > 0 || (assets?.length ?? 0) > 0;
  useEffect(() => {
    if (!record || !ready || !hasData) return;
    recordSnapshot({ date: todayLocal(), netWorth: Math.round(worth.netWorth) });
  }, [record, ready, hasData, worth.netWorth, recordSnapshot]);

  return { positions, worth, items, thisMonth, month, snapshots: snapshots ?? [], hasData };
}
