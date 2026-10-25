// Finlio serves India and the United States. The person's country decides the
// currency, number style, stock market, financial-year quarters and the kinds of
// accounts they hold. Pure data and helpers; safe on server and client.

export type Country = "IN" | "US";

export type Locale = {
  country: Country;
  name: string; // "India"
  flag: string;
  language: string; // Intl locale for numbers and dates
  currency: "INR" | "USD";
  symbol: string; // "₹"
  market: string; // shown in the UI, e.g. "NSE"
  marketTimeZone: string;
  marketOpen: [number, number]; // [hour, minute] local to the market
  marketClose: [number, number];
  fyStartMonth: number; // 4 = April (India), 1 = January (US calendar quarters)
  fyLabel: (endYear: number) => string; // "FY27" / "2026"
  compactUnits: [number, string][]; // largest first
};

export const LOCALES: Record<Country, Locale> = {
  IN: {
    country: "IN",
    name: "India",
    flag: "🇮🇳",
    language: "en-IN",
    currency: "INR",
    symbol: "₹",
    market: "NSE",
    marketTimeZone: "Asia/Kolkata",
    marketOpen: [9, 15],
    marketClose: [15, 30],
    fyStartMonth: 4,
    fyLabel: (endYear) => `FY${String(endYear).slice(-2)}`,
    compactUnits: [
      [1e7, "Cr"],
      [1e5, "L"],
      [1e3, "K"],
    ],
  },
  US: {
    country: "US",
    name: "United States",
    flag: "🇺🇸",
    language: "en-US",
    currency: "USD",
    symbol: "$",
    market: "NYSE · Nasdaq",
    marketTimeZone: "America/New_York",
    marketOpen: [9, 30],
    marketClose: [16, 0],
    fyStartMonth: 1,
    fyLabel: (endYear) => String(endYear),
    compactUnits: [
      [1e9, "B"],
      [1e6, "M"],
      [1e3, "K"],
    ],
  },
};

export const COUNTRIES: Country[] = ["IN", "US"];

export function isCountry(value: unknown): value is Country {
  return value === "IN" || value === "US";
}

// The browser's chosen country. Set by the store when the profile loads or changes.
let active: Country = "IN";

export function setActiveCountry(country: Country) {
  active = country;
}

export function activeLocale(): Locale {
  return LOCALES[active];
}

// A sensible first guess for the setup screen, from the browser's time zone.
export function guessCountry(): Country {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return tz.startsWith("America/") || tz.startsWith("US/") || tz === "Pacific/Honolulu" ? "US" : "IN";
  } catch {
    return "IN";
  }
}
