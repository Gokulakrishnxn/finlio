"use client";

import Link from "next/link";
import { BriefCard } from "@/components/brief/brief-card";
import { HoldingsList } from "@/components/holdings-list";
import { useHoldingOverlays } from "@/components/holding-overlays";
import { PageHeader } from "@/components/page-header";
import { PageSkeleton } from "@/components/page-skeleton";
import { PortfolioSummary } from "@/components/portfolio-summary";
import { SampleBanner } from "@/components/sample-banner";
import { Welcome } from "@/components/welcome";
import { useStore } from "@/lib/store";
import { usePositions } from "@/lib/use-positions";

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

export default function TodayPage() {
  const { holdings, ready } = useStore();
  const positions = usePositions();
  const { openAdd, select, overlays } = useHoldingOverlays(positions);

  if (!ready) return <PageSkeleton />;

  return (
    <>
      <PageHeader title={greeting()} subtitle={todayLabel()} />

      {holdings.length === 0 ? (
        <Welcome onAdd={openAdd} />
      ) : (
        <div className="flex flex-col gap-4">
          <SampleBanner />
          <BriefCard />
          <PortfolioSummary positions={positions} />
          <section className="card-surface px-7 pt-6 pb-3">
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-medium text-ink">Your holdings</h2>
              <Link href="/holdings" className="text-[13px] text-muted-foreground hover:text-ink">
                Manage
              </Link>
            </div>
            <HoldingsList positions={positions} onSelect={select} />
          </section>
        </div>
      )}

      {overlays}
    </>
  );
}
