import type { Holding } from "@/lib/types";

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
