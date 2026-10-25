export type Holding = {
  id: string;
  instrumentKey: string; // e.g. "NSE_EQ|INE467B01029"
  symbol: string; // "TCS"
  name: string; // "Tata Consultancy Serv Ltd"
  buyDate: string; // "2025-03-14"
  buyPrice: number; // ₹ per share
  quantity: number;
  sample?: boolean;
  imported?: boolean; // added from a broker CSV; buy date is the import date
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

// Account kinds for both countries; each country shows its own list (see KINDS_BY_COUNTRY).
export const ASSET_KINDS = {
  bank: "Bank balance",
  checking: "Checking account",
  savings: "Savings account",
  fd: "Fixed deposit",
  cd: "Certificate of deposit",
  gold: "Gold",
  epf: "EPF",
  ppf: "PPF",
  nps: "NPS",
  "401k": "401(k)",
  ira: "IRA",
  hsa: "HSA",
  brokerage: "Brokerage cash",
  crypto: "Crypto",
  property: "Property",
  other: "Other asset",
} as const;

export const LOAN_KINDS = {
  "home-loan": "Home loan",
  mortgage: "Mortgage",
  "car-loan": "Car loan",
  "auto-loan": "Auto loan",
  "education-loan": "Education loan",
  "student-loan": "Student loan",
  "personal-loan": "Personal loan",
  "credit-card": "Credit card",
  "other-loan": "Other loan",
} as const;

export type AssetKind = keyof typeof ASSET_KINDS;
export type LoanKind = keyof typeof LOAN_KINDS;

export const KINDS_BY_COUNTRY: Record<"IN" | "US", { asset: AssetKind[]; loan: LoanKind[] }> = {
  IN: {
    asset: ["bank", "fd", "gold", "epf", "ppf", "nps", "property", "crypto", "other"],
    loan: ["home-loan", "car-loan", "education-loan", "personal-loan", "credit-card", "other-loan"],
  },
  US: {
    asset: ["checking", "savings", "cd", "401k", "ira", "hsa", "brokerage", "property", "crypto", "gold", "other"],
    loan: ["mortgage", "auto-loan", "student-loan", "personal-loan", "credit-card", "other-loan"],
  },
};

// Something owned or owed outside the stock market, entered by hand.
export type Asset = {
  id: string;
  side: "asset" | "loan";
  kind: AssetKind | LoanKind;
  name: string;
  amount: number; // ₹ today
  sample?: boolean;
};

export const INCOME_CATEGORIES = ["Salary", "Freelance", "Interest & dividends", "Rent", "Other income"] as const;

// Income or an expense the user typed in (Gmail spends live in ExpenseSnapshot).
export type Entry = {
  id: string;
  type: "income" | "expense";
  date: string;
  amount: number;
  category: string;
  note?: string;
  sample?: boolean;
};

export type Snapshot = { date: string; netWorth: number; sample?: boolean };

// Kept in this browser only; used to personalise greetings and the chat.
export type Profile = {
  name?: string;
  city?: string;
  goal?: string; // e.g. "Buy a home by 2030"
  country?: "IN" | "US";
  onboardedAt?: string; // set when the welcome setup is finished
  termsVersion?: string; // the Terms version the person accepted
  tourDone?: boolean;
};

export type Instrument = {
  instrumentKey: string;
  symbol: string;
  name: string;
};
