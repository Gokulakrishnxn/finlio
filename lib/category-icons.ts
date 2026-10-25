import {
  ArrowLeftRight,
  Banknote,
  Building2,
  Car,
  CircleDollarSign,
  Clapperboard,
  Coins,
  CreditCard,
  Gem,
  HandCoins,
  HeartPulse,
  Home,
  Landmark,
  Laptop,
  PiggyBank,
  Plane,
  Receipt,
  ShieldCheck,
  ShoppingBag,
  ShoppingBasket,
  TrendingUp,
  UtensilsCrossed,
  Wallet,
  type LucideIcon,
} from "lucide-react";

type Look = { icon: LucideIcon; tint: string };

// One calm icon and tint per spending or income category.
const CATEGORY: Record<string, Look> = {
  "Food & dining": { icon: UtensilsCrossed, tint: "bg-[#fff1e6] text-[#b4500f]" },
  Groceries: { icon: ShoppingBasket, tint: "bg-[#e8f7ec] text-[#1f7a3a]" },
  Shopping: { icon: ShoppingBag, tint: "bg-[#fdeaf3] text-[#a3245e]" },
  Travel: { icon: Plane, tint: "bg-[#e6f1ff] text-[#1d5fb8]" },
  "Bills & utilities": { icon: Receipt, tint: "bg-[#fff7e0] text-[#8a6410]" },
  Entertainment: { icon: Clapperboard, tint: "bg-[#f3ecff] text-[#6a3bc0]" },
  Health: { icon: HeartPulse, tint: "bg-[#ffecec] text-[#c43c3c]" },
  Transfers: { icon: ArrowLeftRight, tint: "bg-[#eef1f4] text-[#475569]" },
  Other: { icon: Wallet, tint: "bg-[#f1f0ec] text-[#57534e]" },
  Salary: { icon: Banknote, tint: "bg-[#e8f7ec] text-[#1f7a3a]" },
  Freelance: { icon: Laptop, tint: "bg-[#e8f7ec] text-[#1f7a3a]" },
  "Interest & dividends": { icon: TrendingUp, tint: "bg-[#e8f7ec] text-[#1f7a3a]" },
  Rent: { icon: Home, tint: "bg-[#e8f7ec] text-[#1f7a3a]" },
  "Other income": { icon: HandCoins, tint: "bg-[#e8f7ec] text-[#1f7a3a]" },
};

// One icon per asset or loan type.
const ASSET: Record<string, Look> = {
  bank: { icon: Landmark, tint: "bg-[#e6f1ff] text-[#1d5fb8]" },
  fd: { icon: PiggyBank, tint: "bg-[#e6f1ff] text-[#1d5fb8]" },
  gold: { icon: Coins, tint: "bg-[#fff7e0] text-[#8a6410]" },
  epf: { icon: ShieldCheck, tint: "bg-[#f3ecff] text-[#6a3bc0]" },
  ppf: { icon: ShieldCheck, tint: "bg-[#f3ecff] text-[#6a3bc0]" },
  property: { icon: Building2, tint: "bg-[#fff1e6] text-[#b4500f]" },
  other: { icon: Gem, tint: "bg-[#f1f0ec] text-[#57534e]" },
  "home-loan": { icon: Home, tint: "bg-[#ffecec] text-[#c43c3c]" },
  "car-loan": { icon: Car, tint: "bg-[#ffecec] text-[#c43c3c]" },
  "personal-loan": { icon: HandCoins, tint: "bg-[#ffecec] text-[#c43c3c]" },
  "credit-card": { icon: CreditCard, tint: "bg-[#ffecec] text-[#c43c3c]" },
  "other-loan": { icon: CircleDollarSign, tint: "bg-[#ffecec] text-[#c43c3c]" },
};

export const categoryLook = (category: string): Look => CATEGORY[category] ?? CATEGORY.Other;
export const assetLook = (kind: string): Look => ASSET[kind] ?? ASSET.other;
