import type { Asset, Entry, Holding, Snapshot } from "@/lib/types";

// Real NSE stocks with example buy details, clearly labelled "Sample".
// Prices and news for them are live; only the buy date, price and quantity are made up.
export const SAMPLE_HOLDINGS: Omit<Holding, "id">[] = [
  {
    instrumentKey: "NSE_EQ|INE467B01029",
    symbol: "TCS",
    name: "Tata Consultancy Serv Ltd",
    buyDate: "2024-06-12",
    buyPrice: 3820,
    quantity: 8,
    sample: true,
  },
  {
    instrumentKey: "NSE_EQ|INE002A01018",
    symbol: "RELIANCE",
    name: "Reliance Industries Ltd",
    buyDate: "2024-02-05",
    buyPrice: 1420,
    quantity: 20,
    sample: true,
  },
  {
    instrumentKey: "NSE_EQ|INE040A01034",
    symbol: "HDFCBANK",
    name: "HDFC Bank Ltd",
    buyDate: "2023-11-20",
    buyPrice: 1510,
    quantity: 15,
    sample: true,
  },
  {
    instrumentKey: "NSE_EQ|INE009A01021",
    symbol: "INFY",
    name: "Infosys Limited",
    buyDate: "2025-01-08",
    buyPrice: 1890,
    quantity: 12,
    sample: true,
  },
  {
    instrumentKey: "NSE_EQ|INE154A01025",
    symbol: "ITC",
    name: "ITC Ltd",
    buyDate: "2024-09-16",
    buyPrice: 495,
    quantity: 40,
    sample: true,
  },
];

// The rest of the sample: everything a real household might track, labelled so
// "Remove sample" can take it all away again. Amounts are examples.
export const SAMPLE_ASSETS: Omit<Asset, "id">[] = [
  { side: "asset", kind: "bank", name: "HDFC savings", amount: 185000, sample: true },
  { side: "asset", kind: "fd", name: "SBI fixed deposit", amount: 300000, sample: true },
  { side: "asset", kind: "gold", name: "Gold coins", amount: 142000, sample: true },
  { side: "asset", kind: "epf", name: "EPF", amount: 420000, sample: true },
  { side: "asset", kind: "ppf", name: "PPF", amount: 160000, sample: true },
  { side: "loan", kind: "car-loan", name: "ICICI car loan", amount: 260000, sample: true },
  { side: "loan", kind: "credit-card", name: "Credit card", amount: 18400, sample: true },
];

type Recurring = { day: number; type: Entry["type"]; amount: number; category: string; note: string; every?: number };

// One month of a salaried life in India; repeated for the last three months.
const MONTH: Recurring[] = [
  { day: 1, type: "income", amount: 95000, category: "Salary", note: "Salary" },
  { day: 3, type: "expense", amount: 22000, category: "Bills & utilities", note: "Rent" },
  { day: 4, type: "expense", amount: 599, category: "Bills & utilities", note: "Airtel" },
  { day: 6, type: "expense", amount: 4800, category: "Groceries", note: "BigBasket" },
  { day: 8, type: "expense", amount: 1850, category: "Bills & utilities", note: "Electricity bill" },
  { day: 9, type: "expense", amount: 486, category: "Food & dining", note: "Swiggy" },
  { day: 12, type: "expense", amount: 1250, category: "Travel", note: "Uber" },
  { day: 14, type: "expense", amount: 2350, category: "Food & dining", note: "Zomato" },
  { day: 15, type: "income", amount: 12000, category: "Freelance", note: "Logo project", every: 2 },
  { day: 17, type: "expense", amount: 6400, category: "Shopping", note: "Myntra" },
  { day: 19, type: "expense", amount: 1499, category: "Shopping", note: "Amazon" },
  { day: 21, type: "expense", amount: 3200, category: "Groceries", note: "Zepto" },
  { day: 22, type: "expense", amount: 900, category: "Health", note: "Apollo Pharmacy" },
  { day: 24, type: "expense", amount: 649, category: "Entertainment", note: "Netflix" },
  { day: 26, type: "expense", amount: 380, category: "Travel", note: "Ola" },
  { day: 28, type: "expense", amount: 1200, category: "Entertainment", note: "BookMyShow" },
];

const iso = (y: number, m: number, d: number) =>
  `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

// Income and spends for this month (up to today) and the two before it.
export function sampleEntries(today: string): Omit<Entry, "id">[] {
  const [ty, tm] = today.split("-").map(Number);
  const out: Omit<Entry, "id">[] = [];
  for (let back = 0; back < 3; back++) {
    const m0 = tm - 1 - back;
    const y = ty + Math.floor(m0 / 12);
    const m = ((m0 % 12) + 12) % 12 + 1;
    for (const r of MONTH) {
      if (r.every && back % r.every !== 0) continue;
      const date = iso(y, m, r.day);
      if (date > today) continue;
      // Small month-to-month variation so the months don't look copied.
      const wobble = r.type === "expense" && r.amount > 1000 ? 1 + ((back * 7 + r.day) % 5 - 2) / 20 : 1;
      out.push({ type: r.type, date, amount: Math.round(r.amount * wobble), category: r.category, note: r.note, sample: true });
    }
  }
  return out;
}

// Net-worth history: the end of each of the last five quarters, then the last two weeks.
export function sampleSnapshots(today: string, current: number): Snapshot[] {
  const out: Snapshot[] = [];
  const [ty, tm] = today.split("-").map(Number);
  // Quarter ends (Indian FY): Jun 30, Sep 30, Dec 31, Mar 31.
  const ends: string[] = [];
  for (let y = ty - 2; y <= ty; y++) {
    for (const [m, d] of [[3, 31], [6, 30], [9, 30], [12, 31]] as const) {
      const date = iso(y, m, d);
      if (date < today && (y < ty || m < tm)) ends.push(date);
    }
  }
  const quarters = ends.slice(-5);
  quarters.forEach((date, i) => {
    const share = 0.7 + (i / quarters.length) * 0.25; // steady growth toward today
    out.push({ date, netWorth: Math.round(current * share), sample: true });
  });
  const dayMs = 864e5;
  const base = new Date(`${today}T00:00:00Z`).getTime();
  for (let n = 14; n >= 1; n--) {
    const date = new Date(base - n * dayMs).toISOString().slice(0, 10);
    const drift = 1 - n * 0.0025 + ((n * 37) % 7 - 3) / 600;
    out.push({ date, netWorth: Math.round(current * drift), sample: true });
  }
  return out;
}
