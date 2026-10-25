"use client";

import { useState } from "react";
import Link from "next/link";
import { HoldingDialog } from "@/components/holding-dialog";
import { HoldingsList } from "@/components/holdings-list";
import { PageHeader } from "@/components/page-header";
import { Welcome } from "@/components/welcome";
import { useStore } from "@/lib/store";

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
  const [adding, setAdding] = useState(false);

  if (!ready) return null;

  return (
    <>
      <PageHeader title={greeting()} subtitle={todayLabel()} />

      {holdings.length === 0 ? (
        <Welcome onAdd={() => setAdding(true)} />
      ) : (
        <section className="card-surface p-7">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-[15px] font-medium text-ink">Your holdings</h2>
            <Link href="/holdings" className="text-[13px] text-muted-foreground hover:text-ink">
              Manage
            </Link>
          </div>
          <HoldingsList holdings={holdings} />
        </section>
      )}

      <HoldingDialog open={adding} onOpenChange={setAdding} />
    </>
  );
}
