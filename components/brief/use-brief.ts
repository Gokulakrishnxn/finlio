"use client";

import { useState } from "react";
import { activeLocale } from "@/lib/locale";
import { sound } from "@/lib/sound";
import { useStore } from "@/lib/store";
import type { Brief } from "@/lib/types";

// Asks the server for today's brief. Only names and symbols leave the browser;
// quantities and prices stay here.
export function useBriefWriter() {
  const { holdings, setBrief } = useStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function write() {
    setLoading(true);
    setError(null);
    try {
      const stocks = holdings.map(({ name, symbol }) => ({ name, symbol }));
      const res = await fetch("/api/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stocks, country: activeLocale().country }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error);
      setBrief(body as Brief);
      sound("success");
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : "Couldn't write today's brief.");
      sound("error");
    } finally {
      setLoading(false);
    }
  }

  return { write, loading, error };
}
