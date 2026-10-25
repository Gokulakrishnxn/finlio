"use client";

import Link from "next/link";
import { BriefCard } from "@/components/brief/brief-card";
import { NetWorthCard } from "@/components/dashboard/net-worth-card";
import { QuickAddTiles, useQuickAdd } from "@/components/dashboard/quick-add";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { ThisMonthCard } from "@/components/dashboard/this-month-card";
import { WealthBar } from "@/components/dashboard/wealth-bar";
import { HoldingsList } from "@/components/holdings-list";
import { useHoldingOverlays } from "@/components/holding-overlays";
import { PageHeader } from "@/components/page-header";
import { PageSkeleton } from "@/components/page-skeleton";
import { PriceStatus } from "@/components/price-status";
import { SampleBanner } from "@/components/sample-banner";
import { Welcome } from "@/components/welcome";
import { useStore } from "@/lib/store";
import { useMoney } from "@/lib/use-money";

function greeting() {
  const hour = Number(
    new Intl.DateTimeFormat("en-IN", { hour: "numeric", hour12: false, timeZone: "Asia/Kolkata" })
      .format(new Date()),
  );
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function todayLabel() {
  return new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Asia/Kolkata",
  });
}

export default function DashboardPage() {
  const { ready, holdings, profile } = useStore();
  const { positions, worth, items, thisMonth, month, snapshots, hasData } = useMoney({ record: true });
  const { select, overlays } = useHoldingOverlays(positions);
  const { openAdd, dialogs } = useQuickAdd();

  if (!ready) return <PageSkeleton />;

  const empty = !hasData && items.length === 0;
  const monthLabel = new Date(`${month}-01T00:00:00`).toLocaleDateString("en-IN", {
    month: "short",
    year: "numeric",
  });

  return (
    <>
      <PageHeader
        title={profile?.name ? `${greeting()}, ${profile.name.split(" ")[0]}` : greeting()}
        subtitle={todayLabel()}
      />

      {empty ? (
        <div className="flex flex-col gap-6">
          <Welcome onAdd={() => openAdd("stock")} />
          <QuickAddTiles onAdd={openAdd} />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <SampleBanner />

          <div className="grid gap-4 lg:grid-cols-12">
            <div className="flex flex-col gap-4 lg:col-span-7">
              <NetWorthCard
                netWorth={worth.netWorth}
                assets={worth.assets}
                loans={worth.loans}
                stocksLive={worth.stocksLive}
                snapshots={snapshots}
              />
              <QuickAddTiles onAdd={openAdd} />
            </div>
            <div className="flex flex-col gap-4 lg:col-span-5">
              <ThisMonthCard monthLabel={monthLabel} {...thisMonth} />
              <RecentActivity items={items} />
            </div>
          </div>

          {holdings.length > 0 && <BriefCard />}

          <div className="grid gap-4 lg:grid-cols-12">
            <section className="card-surface px-6 pt-5 pb-2 lg:col-span-7">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="eyebrow">Your stocks</p>
                <PriceStatus />
              </div>
              {holdings.length ? (
                <HoldingsList positions={positions.slice(0, 6)} onSelect={select} />
              ) : (
                <p className="py-5 text-[14px] text-body">
                  No stocks yet.{" "}
                  <button onClick={() => openAdd("stock")} className="text-ink underline">
                    Add one
                  </button>{" "}
                  or{" "}
                  <button onClick={() => openAdd("import")} className="text-ink underline">
                    import from Zerodha
                  </button>
                  .
                </p>
              )}
              {holdings.length > 6 && (
                <Link href="/holdings" className="block py-3 text-[13px] text-[#1f7a3a] hover:underline">
                  See all {holdings.length} stocks →
                </Link>
              )}
            </section>

            <section className="card-surface p-6 lg:col-span-5">
              <div className="flex items-center justify-between">
                <p className="eyebrow">Wealth</p>
                <Link href="/assets" className="text-[12px] text-[#1f7a3a] hover:underline">
                  Assets & loans →
                </Link>
              </div>
              <div className="mt-5">
                <WealthBar assets={worth.assets} loans={worth.loans} />
              </div>
              <p className="mt-5 text-[13px] leading-relaxed text-body">
                Add your bank balance, deposits, gold, EPF and loans to see your full net worth.
              </p>
              <button
                onClick={() => openAdd("asset")}
                className="mt-3 text-[13px] font-medium text-ink underline underline-offset-2"
              >
                Add an asset or loan
              </button>
            </section>
          </div>
        </div>
      )}

      {dialogs}
      {overlays}
    </>
  );
}
