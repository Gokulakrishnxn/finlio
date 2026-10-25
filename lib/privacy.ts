// What leaves the person's device, to whom and why. Shown in Settings → Privacy
// and in the Terms, so both always say the same thing.
export const SHARING: { who: string; why: string; what: string }[] = [
  { who: "Upstox (India)", why: "Live NSE prices", what: "NSE codes of your stocks" },
  { who: "Finnhub (United States)", why: "US stock search and prices", what: "Ticker symbols of your stocks, like AAPL" },
  { who: "Gemini + Google Search", why: "Today's brief (News)", what: "Names and symbols of your stocks" },
  { who: "Google sign-in", why: "Signing you in", what: "Google shares your name, email and photo with Finlio" },
  { who: "Gmail (read-only)", why: "Expenses, if you connect it", what: "Finlio reads bank, card and payment alerts only" },
  { who: "Gemini", why: "Reading those alerts", what: "Each alert's sender, subject and preview" },
  { who: "Gemini", why: "Analytics and Finlio chat", what: "Your totals and your question; no transactions or quantities" },
  {
    who: "icon.horse, Google favicons",
    why: "Company logos (can be turned off)",
    what: "Company web addresses like netflix.com, sent by Finlio's helper, not your browser",
  },
];
