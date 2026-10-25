import { activeLocale } from "@/lib/locale";

// Money and dates in the person's country style (₹1,24,000 in India, $124,000 in the US).

const moneyFormats = new Map<string, Intl.NumberFormat>();

function moneyFormat() {
  const { language, currency } = activeLocale();
  const key = `${language}-${currency}`;
  let f = moneyFormats.get(key);
  if (!f) {
    f = new Intl.NumberFormat(language, { style: "currency", currency, maximumFractionDigits: 2 });
    moneyFormats.set(key, f);
  }
  return f;
}

export const formatMoney = (value: number) => moneyFormat().format(value);

export const formatSignedMoney = (value: number) =>
  `${value >= 0 ? "+" : "−"}${moneyFormat().format(Math.abs(value))}`;

// Short amounts: ₹3.46L / ₹1.2Cr in India, $34.6K / $1.2M in the US.
export function compactMoney(value: number) {
  const { symbol, compactUnits } = activeLocale();
  const abs = Math.abs(value);
  const sign = value < 0 ? "−" : "";
  for (const [size, unit] of compactUnits) {
    if (abs >= size) return `${sign}${symbol}${(abs / size).toFixed(size >= 1e5 ? 2 : 1)}${unit}`;
  }
  return `${sign}${symbol}${abs.toFixed(0)}`;
}

export const formatPct = (value: number) =>
  `${value >= 0 ? "+" : "−"}${Math.abs(value).toFixed(2)}%`;

// Times and dates use the person's own device time zone and country style.
export const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString(activeLocale().language, { hour: "numeric", minute: "2-digit" });

export const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString(activeLocale().language, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export const formatShortDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString(activeLocale().language, { day: "numeric", month: "short" });

export const formatMonth = (yearMonth: string, style: "long" | "short-year" = "long") =>
  new Date(`${yearMonth}-01T00:00:00`).toLocaleDateString(
    activeLocale().language,
    style === "long" ? { month: "long" } : { month: "short", year: "numeric" },
  );

// Today's date on this device, as "YYYY-MM-DD".
export const todayLocal = () => new Intl.DateTimeFormat("en-CA").format(new Date());

// Today in a given time zone (server routes use the market's zone).
export const todayIn = (timeZone: string) =>
  new Intl.DateTimeFormat("en-CA", { timeZone }).format(new Date());
