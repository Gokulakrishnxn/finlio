export type Holding = {
  id: string;
  instrumentKey: string; // e.g. "NSE_EQ|INE467B01029"
  symbol: string; // "TCS"
  name: string; // "Tata Consultancy Serv Ltd"
  buyDate: string; // "2025-03-14"
  buyPrice: number; // ₹ per share
  quantity: number;
  sample?: boolean;
};

export type Source = { title: string; url: string };

export type BriefItem = { symbol?: string; text: string; sources: Source[] };

export type Brief = {
  date: string; // IST date, "2026-10-25"
  createdAt: string;
  changed: BriefItem[];
  comingUp: BriefItem[];
  attention: BriefItem[];
  noNews: string[]; // symbols
  searchSuggestionsHtml?: string;
};

export type Instrument = {
  instrumentKey: string;
  symbol: string;
  name: string;
};
