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
  "Food & dining": { icon: UtensilsCrossed, tint: "bg-warning-soft text-warning" },
  Groceries: { icon: ShoppingBasket, tint: "bg-success-soft text-success" },
  Shopping: { icon: ShoppingBag, tint: "bg-pink-soft text-pink" },
  Travel: { icon: Plane, tint: "bg-info-soft text-info" },
  "Bills & utilities": { icon: Receipt, tint: "bg-gold-soft text-gold" },
  Entertainment: { icon: Clapperboard, tint: "bg-purple-soft text-purple" },
  Health: { icon: HeartPulse, tint: "bg-danger-soft text-loss" },
  Transfers: { icon: ArrowLeftRight, tint: "bg-neutral-soft text-neutral" },
  Other: { icon: Wallet, tint: "bg-neutral-soft text-neutral" },
  Salary: { icon: Banknote, tint: "bg-success-soft text-success" },
  Freelance: { icon: Laptop, tint: "bg-success-soft text-success" },
  "Interest & dividends": { icon: TrendingUp, tint: "bg-success-soft text-success" },
  Rent: { icon: Home, tint: "bg-success-soft text-success" },
  "Other income": { icon: HandCoins, tint: "bg-success-soft text-success" },
};

// One icon per asset or loan type.
const ASSET: Record<string, Look> = {
  bank: { icon: Landmark, tint: "bg-info-soft text-info" },
  fd: { icon: PiggyBank, tint: "bg-info-soft text-info" },
  gold: { icon: Coins, tint: "bg-gold-soft text-gold" },
  epf: { icon: ShieldCheck, tint: "bg-purple-soft text-purple" },
  ppf: { icon: ShieldCheck, tint: "bg-purple-soft text-purple" },
  property: { icon: Building2, tint: "bg-warning-soft text-warning" },
  other: { icon: Gem, tint: "bg-neutral-soft text-neutral" },
  "home-loan": { icon: Home, tint: "bg-danger-soft text-loss" },
  "car-loan": { icon: Car, tint: "bg-danger-soft text-loss" },
  "personal-loan": { icon: HandCoins, tint: "bg-danger-soft text-loss" },
  "credit-card": { icon: CreditCard, tint: "bg-danger-soft text-loss" },
  "other-loan": { icon: CircleDollarSign, tint: "bg-danger-soft text-loss" },
};

export const categoryLook = (category: string): Look => CATEGORY[category] ?? CATEGORY.Other;
export const assetLook = (kind: string): Look => ASSET[kind] ?? ASSET.other;
