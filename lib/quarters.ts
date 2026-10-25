import { activeLocale } from "@/lib/locale";
import type { Snapshot } from "@/lib/types";

// Quarters follow the person's country:
// India: financial year April–March (Q1 Apr–Jun … Q4 Jan–Mar), labelled "FY27" for Apr 2026–Mar 2027.
// US: calendar quarters (Q1 Jan–Mar … Q4 Oct–Dec), labelled "2026".
export function fiscalQuarter(iso: string, startMonth = activeLocale().fyStartMonth) {
  const [y, m] = iso.split("-").map(Number);
  const offset = (m - startMonth + 12) % 12; // months since the year began
  const q = Math.floor(offset / 3) + 1;
  // The year is named after the calendar year it ends in.
  const fyEnd = startMonth === 1 ? y : m >= startMonth ? y + 1 : y;
  return { key: `${fyEnd}-Q${q}`, label: `Q${q}`, fy: activeLocale().fyLabel(fyEnd), fyEnd, q };
}

function previousQuarter(fyEnd: number, q: number) {
  return q === 1 ? { fyEnd: fyEnd - 1, q: 4 } : { fyEnd, q: q - 1 };
}

export type QuarterBar = {
  key: string;
  label: string; // "Q3"
  fy: string; // "FY27" or "2026"
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
    bars.unshift({
      key,
      label: `Q${cursor.q}`,
      fy: activeLocale().fyLabel(cursor.fyEnd),
      value: i === 0 ? current : latest.get(key),
      current: i === 0,
    });
    cursor = previousQuarter(cursor.fyEnd, cursor.q);
  }
  return bars;
}
