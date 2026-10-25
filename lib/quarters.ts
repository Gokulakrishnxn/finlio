import type { Snapshot } from "@/lib/types";

// Indian financial year quarters: Q1 Apr–Jun, Q2 Jul–Sep, Q3 Oct–Dec, Q4 Jan–Mar.
// "FY27" is the year April 2026 – March 2027.
export function fiscalQuarter(iso: string) {
  const [y, m] = iso.split("-").map(Number);
  const fyEnd = m >= 4 ? y + 1 : y;
  const q = m >= 4 ? Math.floor((m - 4) / 3) + 1 : 4;
  return { key: `${fyEnd}-Q${q}`, label: `Q${q}`, fy: `FY${String(fyEnd).slice(-2)}`, fyEnd, q };
}

function previousQuarter(fyEnd: number, q: number) {
  return q === 1 ? { fyEnd: fyEnd - 1, q: 4 } : { fyEnd, q: q - 1 };
}

export type QuarterBar = {
  key: string;
  label: string; // "Q3"
  fy: string; // "FY27"
  value?: number; // net worth at the quarter's last recorded day; undefined if no record
  current: boolean;
};

// The last `count` quarters ending with today's, each holding the latest net worth
// recorded in that quarter (today's live value for the current one).
export function quarterBars(snapshots: Snapshot[], today: string, current: number, count = 6): QuarterBar[] {
  const latest = new Map<string, number>();
  for (const s of [...snapshots].sort((a, b) => a.date.localeCompare(b.date))) {
    latest.set(fiscalQuarter(s.date).key, s.netWorth);
  }
  const now = fiscalQuarter(today);
  const bars: QuarterBar[] = [];
  let cursor = { fyEnd: now.fyEnd, q: now.q };
  for (let i = 0; i < count; i++) {
    const key = `${cursor.fyEnd}-Q${cursor.q}`;
    const isCurrent = i === 0;
    bars.unshift({
      key,
      label: `Q${cursor.q}`,
      fy: `FY${String(cursor.fyEnd).slice(-2)}`,
      value: isCurrent ? current : latest.get(key),
      current: isCurrent,
    });
    cursor = previousQuarter(cursor.fyEnd, cursor.q);
  }
  return bars;
}
