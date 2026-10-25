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

export const EXPENSE_CATEGORIES = [
  "Food & dining",
  "Groceries",
  "Shopping",
  "Travel",
  "Bills & utilities",
  "Entertainment",
  "Health",
  "Transfers",
  "Other",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export type Expense = {
  id: string; // Gmail message id
  date: string; // "2026-10-21"
  amount: number; // ₹
  merchant: string;
  category: ExpenseCategory;
};

export type ExpenseSnapshot = { account: string; syncedAt: string; expenses: Expense[] };

export type Instrument = {
  instrumentKey: string;
  symbol: string;
  name: string;
};
