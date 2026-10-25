"use client";

import { useMemo } from "react";
import { position } from "@/lib/portfolio";
import { usePrices } from "@/lib/prices";
import { useStore } from "@/lib/store";

export function usePositions() {
  const { holdings } = useStore();
  const { quotes } = usePrices();
  return useMemo(
    () => holdings.map((h) => position(h, quotes[h.instrumentKey])),
    [holdings, quotes],
  );
}
