"use client";

import { useState } from "react";
import { ArrowUpRight, Pencil, Trash2 } from "lucide-react";
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
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Change } from "@/components/change";
import { BrandLogo } from "@/components/brand-logo";
import { InitialBadge } from "@/components/initial-badge";
import { stockDomain } from "@/lib/brands";
import { formatDate, formatMoney, todayLocal } from "@/lib/format";
import { useStore } from "@/lib/store";
import { activeLocale } from "@/lib/locale";
import type { Position } from "@/lib/portfolio";
import type { BriefItem } from "@/lib/types";

export function HoldingSheet({
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
        ...(todays?.changed ?? []).map((item) => ({ label: "What changed", item })),
        ...(todays?.comingUp ?? []).map((item) => ({ label: "Coming up", item })),
        ...(todays?.attention ?? []).map((item) => ({ label: "Deserves your attention", item })),
      ].filter((l) => l.item.symbol === h.symbol)
    : [];
  const headlines = [
    ...new Map(lines.flatMap((l) => l.item.sources).map((s) => [s.url, s])).values(),
  ];

  return (
    <>
      <Sheet open={Boolean(h)} onOpenChange={(open) => !open && onClose()}>
        <SheetContent className="w-full gap-0 overflow-y-auto bg-cream p-0 sm:max-w-[460px]">
          {h && position && (
            <>
              <SheetHeader className="gap-4 border-b border-line p-7">
                <div className="flex items-center gap-3">
                  <BrandLogo
                    domain={stockDomain(h.symbol)}
                    className="size-12"
                    fallback={<InitialBadge symbol={h.symbol} className="size-12 text-lg" />}
                  />
                  <div className="min-w-0">
                    <SheetTitle className="text-xl font-semibold tracking-tight text-ink">
                      {h.symbol}
                    </SheetTitle>
                    <SheetDescription className="truncate">{h.name}</SheetDescription>
                  </div>
                </div>
                <div>
                  <p className="nums text-[32px] leading-none font-semibold tracking-tight text-ink">
                    {position.quote ? formatMoney(position.quote.price) : `${activeLocale().symbol}—`}
                  </p>
                  <Change
                    amount={position.quote ? position.quote.price - position.quote.prevClose : undefined}
                    pct={position.dayChangePct}
                    className="mt-1.5 block text-[14px]"
                  />
                </div>
              </SheetHeader>

              <div className="grid grid-cols-2 gap-px border-b border-line bg-line">
                <Cell label="Your shares" value={String(h.quantity)} />
                <Cell label="Average buy price" value={formatMoney(h.buyPrice)} />
                <Cell label="You put in" value={formatMoney(position.invested)} />
                <Cell
                  label="Worth now"
                  value={position.value !== undefined ? formatMoney(position.value) : "—"}
                />
                <div className="col-span-2 bg-cream px-7 py-4">
                  <p className="text-[12px] text-muted-foreground">Since you bought on {formatDate(h.buyDate)}</p>
                  <Change amount={position.gain} pct={position.gainPct} className="mt-1 block text-[16px]" />
                </div>
              </div>

              <div className="p-7">
                <h3 className="text-[12px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
                  Why it moved
                </h3>
                {lines.length ? (
                  <ul className="mt-3 flex flex-col gap-4">
                    {lines.map((l, i) => (
                      <li key={i}>
                        <p className="text-[12px] text-muted-foreground">{l.label}</p>
                        <p className="mt-1 text-[15px] leading-relaxed text-ink">{l.item.text}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-[14px] leading-relaxed text-body">
                    {todays
                      ? `Today's brief has no news about ${h.symbol}.`
                      : "Get today's brief to see why it moved."}
                  </p>
                )}

                {headlines.length > 0 && (
                  <>
                    <h3 className="mt-8 text-[12px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
                      Headlines
                    </h3>
                    <ul className="mt-3 flex flex-col gap-2">
                      {headlines.map((s) => (
                        <li key={s.url}>
                          <a
                            href={s.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between gap-3 rounded-xl bg-card px-4 py-3 text-[14px] text-ink ring-1 ring-line transition-colors hover:bg-sand"
                          >
                            <span className="truncate">{s.title}</span>
                            <ArrowUpRight className="size-4 shrink-0 text-muted-foreground" />
                          </a>
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                <div className="mt-10 flex gap-2">
                  <Button variant="outline" className="h-10 flex-1 rounded-xl" onClick={() => onEdit(h.id)}>
                    <Pencil className="size-4" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    className="h-10 flex-1 rounded-xl text-loss hover:text-loss"
                    onClick={() => setConfirming(true)}
                  >
                    <Trash2 className="size-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {h?.symbol}?</AlertDialogTitle>
            <AlertDialogDescription>
              Finlio will forget this holding. You can add it again any time.
            </AlertDialogDescription>
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

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-cream px-7 py-4">
      <p className="text-[12px] text-muted-foreground">{label}</p>
      <p className="nums mt-1 text-[16px] text-ink">{value}</p>
    </div>
  );
}
