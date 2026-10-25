import { LOCALES, type Country } from "@/lib/locale";

// How Finlio's AI should talk about money for each country.
export function moneyStyle(country: Country) {
  return country === "US"
    ? "the United States. Use US dollars written like $12,400 or $3.2K, and US terms (401(k), IRA, paycheck)."
    : "India. Use rupee amounts written like ₹12,400 or ₹3.2 lakh, and Indian number words (lakh, crore).";
}

export function marketName(country: Country) {
  return country === "US" ? "US-listed (NYSE or Nasdaq)" : "NSE-listed, India";
}

export function countryName(country: Country) {
  return LOCALES[country].name;
}
