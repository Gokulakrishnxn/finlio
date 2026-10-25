import type { Instrument } from "@/lib/types";

// Popular US stocks and ETFs, so search works without a Finnhub key.
// Instrument keys look like "US|AAPL".
const LIST: [string, string][] = [
  ["AAPL", "Apple Inc."],
  ["MSFT", "Microsoft Corporation"],
  ["NVDA", "NVIDIA Corporation"],
  ["AMZN", "Amazon.com, Inc."],
  ["GOOGL", "Alphabet Inc. (Class A)"],
  ["GOOG", "Alphabet Inc. (Class C)"],
  ["META", "Meta Platforms, Inc."],
  ["TSLA", "Tesla, Inc."],
  ["BRK.B", "Berkshire Hathaway Inc. (Class B)"],
  ["AVGO", "Broadcom Inc."],
  ["JPM", "JPMorgan Chase & Co."],
  ["V", "Visa Inc."],
  ["MA", "Mastercard Incorporated"],
  ["UNH", "UnitedHealth Group Incorporated"],
  ["JNJ", "Johnson & Johnson"],
  ["PG", "Procter & Gamble Company"],
  ["HD", "Home Depot, Inc."],
  ["COST", "Costco Wholesale Corporation"],
  ["WMT", "Walmart Inc."],
  ["KO", "Coca-Cola Company"],
  ["PEP", "PepsiCo, Inc."],
  ["MCD", "McDonald's Corporation"],
  ["SBUX", "Starbucks Corporation"],
  ["NKE", "NIKE, Inc."],
  ["DIS", "Walt Disney Company"],
  ["NFLX", "Netflix, Inc."],
  ["AMD", "Advanced Micro Devices, Inc."],
  ["INTC", "Intel Corporation"],
  ["ORCL", "Oracle Corporation"],
  ["CRM", "Salesforce, Inc."],
  ["ADBE", "Adobe Inc."],
  ["CSCO", "Cisco Systems, Inc."],
  ["IBM", "International Business Machines Corporation"],
  ["QCOM", "QUALCOMM Incorporated"],
  ["TXN", "Texas Instruments Incorporated"],
  ["BAC", "Bank of America Corporation"],
  ["WFC", "Wells Fargo & Company"],
  ["C", "Citigroup Inc."],
  ["GS", "Goldman Sachs Group, Inc."],
  ["AXP", "American Express Company"],
  ["PYPL", "PayPal Holdings, Inc."],
  ["UBER", "Uber Technologies, Inc."],
  ["ABNB", "Airbnb, Inc."],
  ["SHOP", "Shopify Inc."],
  ["PLTR", "Palantir Technologies Inc."],
  ["COIN", "Coinbase Global, Inc."],
  ["XOM", "Exxon Mobil Corporation"],
  ["CVX", "Chevron Corporation"],
  ["PFE", "Pfizer Inc."],
  ["MRK", "Merck & Co., Inc."],
  ["LLY", "Eli Lilly and Company"],
  ["ABBV", "AbbVie Inc."],
  ["T", "AT&T Inc."],
  ["VZ", "Verizon Communications Inc."],
  ["TMUS", "T-Mobile US, Inc."],
  ["BA", "Boeing Company"],
  ["CAT", "Caterpillar Inc."],
  ["GE", "GE Aerospace"],
  ["F", "Ford Motor Company"],
  ["GM", "General Motors Company"],
  ["VOO", "Vanguard S&P 500 ETF"],
  ["VTI", "Vanguard Total Stock Market ETF"],
  ["SPY", "SPDR S&P 500 ETF Trust"],
  ["QQQ", "Invesco QQQ Trust"],
  ["SCHD", "Schwab U.S. Dividend Equity ETF"],
];

export const US_STOCKS: Instrument[] = LIST.map(([symbol, name]) => ({
  instrumentKey: `US|${symbol}`,
  symbol,
  name,
}));

export function searchUsList(query: string, limit = 8): Instrument[] {
  const q = query.trim().toUpperCase();
  if (!q) return [];
  const rank = (i: Instrument) => {
    const name = i.name.toUpperCase();
    if (i.symbol === q) return 0;
    if (i.symbol.startsWith(q)) return 1;
    if (name.startsWith(q)) return 2;
    if (name.includes(q)) return 3;
    return -1;
  };
  return US_STOCKS.map((i) => ({ i, r: rank(i) }))
    .filter((x) => x.r >= 0)
    .sort((a, b) => a.r - b.r)
    .slice(0, limit)
    .map((x) => x.i);
}
