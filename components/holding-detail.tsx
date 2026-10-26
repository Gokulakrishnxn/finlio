"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Newspaper, Pencil, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Change } from "@/components/change";
import { BrandLogo } from "@/components/brand-logo";
import { InitialBadge } from "@/components/initial-badge";
import { stockDomain } from "@/lib/brands";
import { formatDate, formatMoney, todayLocal } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { Position } from "@/lib/portfolio";
import type { BriefItem } from "@/lib/types";
import { cn } from "@/lib/utils";

// One holding in a centred card: today's price, what you own, and why it moved.
export function HoldingDetail({
  position,
  onClose,
  onEdit,
}: {
  position?: Position;
  onClose: () => void;
  onEdit: (id: string) => void;
}) {
  const { brief, removeHolding } = useStore();
  const [confirming, setConfirming] = useState(false);
  const h = position?.holding;

  const todays = brief?.date === todayLocal() ? brief : undefined;
  const lines: { label: string; item: BriefItem }[] = h
    ? [
        ...(todays?.attention ?? []).map((item) => ({ label: "Deserves your attention", item })),
        ...(todays?.changed ?? []).map((item) => ({ label: "What changed", item })),
        ...(todays?.comingUp ?? []).map((item) => ({ label: "Coming up", item })),
      ].filter((l) => l.item.symbol === h.symbol)
    : [];
  const headlines = [...new Map(lines.flatMap((l) => l.item.sources).map((s) => [s.url, s])).values()];

  return (
    <>
      <Dialog open={Boolean(h)} onOpenChange={(open) => !open && onClose()}>
        <DialogContent
          showCloseButton={false}
          className="flex max-h-[calc(100vh-2rem)] flex-col gap-0 overflow-hidden rounded-2xl bg-card p-0 sm:max-w-[480px]"
        >
          {h && position && (
            <>
              <header className="flex items-center gap-3 px-6 pt-6 pb-5">
                <BrandLogo
                  domain={stockDomain(h.symbol)}
                  className="size-12"
                  fallback={<InitialBadge symbol={h.symbol} className="size-12 text-lg" />}
                />
                <div className="min-w-0 flex-1">
                  <DialogTitle className="text-[19px] font-semibold tracking-tight text-ink">{h.symbol}</DialogTitle>
                  <DialogDescription className="truncate text-[13px]">{h.name}</DialogDescription>
                </div>
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="self-start rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-sand hover:text-ink"
                >
                  <X className="size-4" />
                </button>
              </header>

              <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">
                <div data-demo-hide={position.quote ? undefined : ""} className="rounded-xl bg-sand p-4">
                  <p className="eyebrow">Price today</p>
                  {position.quote ? (
                    <div className="mt-1.5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <p className="nums text-[28px] leading-none font-semibold tracking-tight text-ink">
                        {formatMoney(position.quote.price)}
                      </p>
                      <Change
                        amount={position.quote.price - position.quote.prevClose}
                        pct={position.dayChangePct}
                        className="text-[14px]"
                      />
                    </div>
                  ) : (
                    <p className="mt-1.5 text-[14px] text-body">Live price isn&apos;t available right now.</p>
                  )}
                </div>

                <dl className="mt-3 grid grid-cols-2 gap-3">
                  <Stat label="Your shares" value={String(h.quantity)} />
                  <Stat label="Average buy price" value={formatMoney(h.buyPrice)} />
                  <Stat label="You put in" value={formatMoney(position.invested)} />
                  <Stat label="Worth now" value={position.value !== undefined ? formatMoney(position.value) : "—"} />
                  <div className="col-span-2 flex items-center justify-between gap-3 rounded-xl border border-line px-4 py-3">
                    <dt className="text-[13px] text-muted-foreground">Since {formatDate(h.buyDate)}</dt>
                    <dd>
                      <Change amount={position.gain} pct={position.gainPct} className="text-[14px]" />
                    </dd>
                  </div>
                </dl>

                <section className="mt-6">
                  <h3 className="eyebrow">Why it moved</h3>
                  {lines.length ? (
                    <ul className="mt-3 flex flex-col gap-3">
                      {lines.map((l, i) => (
                        <li key={i} className="rounded-xl border border-line p-4">
                          <p className="text-[12px] text-muted-foreground">{l.label}</p>
                          <p className="mt-1 text-[15px] leading-relaxed text-ink">{l.item.text}</p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="mt-3 flex items-center justify-between gap-4 rounded-xl border border-dashed border-line p-4">
                      <p className="text-[14px] leading-relaxed text-body">
                        {todays ? `Today's brief has no news about ${h.symbol}.` : "Get today's brief to see why it moved."}
                      </p>
                      {!todays && (
                        <Link
                          href="/news"
                          onClick={onClose}
                          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-sand px-3 text-[13px] font-medium text-ink ring-1 ring-line hover:bg-muted"
                        >
                          <Newspaper className="size-3.5" />
                          Open News
                        </Link>
                      )}
                    </div>
                  )}

                  {headlines.length > 0 && (
                    <ul className="mt-3 flex flex-col gap-2">
                      {headlines.map((s) => (
                        <li key={s.url}>
                          <a
                            href={s.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between gap-3 rounded-xl bg-sand px-4 py-2.5 text-[13px] text-ink transition-colors hover:bg-muted"
                          >
                            <span className="truncate">{s.title}</span>
                            <ArrowUpRight className="size-3.5 shrink-0 text-muted-foreground" />
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              </div>

              <footer className="flex gap-2 border-t border-line bg-sand/50 px-6 py-4">
                <Button variant="outline" className="h-10 flex-1 rounded-xl bg-card" onClick={() => onEdit(h.id)}>
                  <Pencil className="size-4" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  className="h-10 flex-1 rounded-xl bg-card text-loss hover:text-loss"
                  onClick={() => setConfirming(true)}
                >
                  <Trash2 className="size-4" />
                  Delete
                </Button>
              </footer>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {h?.symbol}?</AlertDialogTitle>
            <AlertDialogDescription>Finlio will forget this holding. You can add it again any time.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (h) removeHolding(h.id);
                setConfirming(false);
                onClose();
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function Stat({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={cn("rounded-xl border border-line px-4 py-3", className)}>
      <dt className="text-[12px] text-muted-foreground">{label}</dt>
      <dd className="nums mt-1 text-[16px] text-ink">{value}</dd>
    </div>
  );
}
