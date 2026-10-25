"use client";

import Link from "next/link";
import { Newspaper } from "lucide-react";
import { BriefCard } from "@/components/brief/brief-card";
import { PageHeader } from "@/components/page-header";
import { PageSkeleton } from "@/components/page-skeleton";
import { activeLocale } from "@/lib/locale";
import { useStore } from "@/lib/store";

// Today's brief: the news about the stocks you own, explained in plain words.
export default function NewsPage() {
  const { ready, holdings } = useStore();
  if (!ready) return <PageSkeleton />;

  return (
    <>
      <PageHeader
        title="News"
        subtitle={`Today's brief: what moved your ${activeLocale().market} stocks, and why.`}
      />
      {holdings.length ? (
        <BriefCard />
      ) : (
        <section className="card-surface flex flex-col items-start gap-4 p-8">
          <span className="flex size-10 items-center justify-center rounded-xl bg-success-soft text-success">
            <Newspaper className="size-[18px]" strokeWidth={1.75} />
          </span>
          <div>
            <h2 className="text-[17px] font-semibold text-ink">Add a stock to get your brief</h2>
            <p className="mt-1 max-w-md text-[14px] leading-relaxed text-body">
              Finlio reads today&apos;s news only about the stocks you own, so it needs at least one.
            </p>
          </div>
          <Link
            href="/holdings"
            className="inline-flex h-10 items-center rounded-xl bg-primary px-4 text-[14px] font-medium text-primary-foreground"
          >
            Go to Holdings
          </Link>
        </section>
      )}
    </>
  );
}
