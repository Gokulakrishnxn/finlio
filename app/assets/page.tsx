"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AssetDialog } from "@/components/asset-dialog";
import { CountUp } from "@/components/count-up";
import { WealthBar } from "@/components/dashboard/wealth-bar";
import { BrandLogo, IconBadge } from "@/components/brand-logo";
import { PageHeader } from "@/components/page-header";
import { PageSkeleton } from "@/components/page-skeleton";
import { formatMoney } from "@/lib/format";
import { merchantDomain } from "@/lib/brands";
import { assetLook } from "@/lib/category-icons";
import { compactMoney } from "@/lib/networth";
import { useStore } from "@/lib/store";
import { useMoney } from "@/lib/use-money";
import { ASSET_KINDS, LOAN_KINDS, type Asset } from "@/lib/types";

const KIND_LABEL: Record<string, string> = { ...ASSET_KINDS, ...LOAN_KINDS };

export default function AssetsPage() {
  const { ready, assets = [], removeAsset } = useStore();
  const { worth } = useMoney();
  const [adding, setAdding] = useState<Asset["side"] | null>(null);
  const [editing, setEditing] = useState<Asset | null>(null);

  if (!ready) return <PageSkeleton />;

  const owned = assets.filter((a) => a.side === "asset");
  const owed = assets.filter((a) => a.side === "loan");

  return (
    <>
      <PageHeader
        title="Assets & loans"
        subtitle="Everything you own and owe outside the stock market."
        action={
          <>
            <Button variant="outline" onClick={() => setAdding("loan")} className="h-10 rounded-xl px-4">
              <Plus className="size-4" />
              Add loan
            </Button>
            <Button onClick={() => setAdding("asset")} className="h-10 rounded-xl px-4">
              <Plus className="size-4" />
              Add asset
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Summary label="Net worth" value={worth.netWorth} strong />
        <Summary label="You own" value={worth.assets} note={`incl. ${compactMoney(worth.stocks)} in stocks`} />
        <Summary label="You owe" value={worth.loans} />
      </div>

      <section className="card-surface mt-4 p-6">
        <p className="eyebrow mb-4">Split</p>
        <WealthBar assets={worth.assets} loans={worth.loans} />
      </section>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Group
          title="Assets"
          tone="asset"
          items={owned}
          total={owned.reduce((s, a) => s + a.amount, 0)}
          empty="Add your bank balance, fixed deposits, gold, EPF, PPF or property."
          onAdd={() => setAdding("asset")}
          onEdit={setEditing}
          onRemove={removeAsset}
        />
        <Group
          title="Loans"
          tone="loan"
          items={owed}
          total={owed.reduce((s, a) => s + a.amount, 0)}
          empty="Add a home, car or personal loan, or a credit-card balance."
          onAdd={() => setAdding("loan")}
          onEdit={setEditing}
          onRemove={removeAsset}
        />
      </div>

      <AssetDialog
        key={`add-${adding}`}
        open={adding !== null}
        side={adding ?? "asset"}
        onOpenChange={(open) => !open && setAdding(null)}
      />
      <AssetDialog
        key={`edit-${editing?.id}`}
        open={editing !== null}
        editing={editing ?? undefined}
        onOpenChange={(open) => !open && setEditing(null)}
      />
    </>
  );
}

function Summary({ label, value, note, strong }: { label: string; value: number; note?: string; strong?: boolean }) {
  return (
    <section className="card-surface p-6">
      <p className="eyebrow">{label}</p>
      <CountUp
        value={value}
        format={formatMoney}
        className={`nums mt-2 block leading-none font-semibold tracking-tight text-ink ${strong ? "text-[30px]" : "text-[24px]"}`}
      />
      {note && <p className="mt-2 text-[12px] text-muted-foreground">{note}</p>}
    </section>
  );
}

function Group({
  title,
  tone,
  items,
  total,
  empty,
  onAdd,
  onEdit,
  onRemove,
}: {
  title: string;
  tone: "asset" | "loan";
  items: Asset[];
  total: number;
  empty: string;
  onAdd: () => void;
  onEdit: (a: Asset) => void;
  onRemove: (id: string) => void;
}) {
  const accent = tone === "asset" ? "border-l-gain" : "border-l-loss";
  return (
    <section className={`card-surface border-l-4 ${accent} px-6 pt-5 pb-3`}>
      <div className="flex items-center justify-between">
        <p className="eyebrow">{title}</p>
        <p className={`nums text-[18px] font-semibold ${tone === "asset" ? "text-success" : "text-loss"}`}>
          {compactMoney(total)}
        </p>
      </div>
      {items.length ? (
        <ul className="mt-2">
          {items.map((a) => (
            <li key={a.id} className="group flex items-center gap-3 border-b border-line py-3 last:border-b-0">
              <BrandLogo
                domain={merchantDomain(a.name)}
                fallback={<IconBadge icon={assetLook(a.kind).icon} tint={assetLook(a.kind).tint} />}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-medium text-ink">{a.name}</p>
                <p className="text-[12px] text-muted-foreground">{KIND_LABEL[a.kind]}</p>
              </div>
              <p className="nums text-[14px] text-ink">{formatMoney(a.amount)}</p>
              <button
                onClick={() => onEdit(a)}
                aria-label={`Edit ${a.name}`}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-sand hover:text-ink"
              >
                <Pencil className="size-3.5" />
              </button>
              <button
                onClick={() => onRemove(a.id)}
                aria-label={`Delete ${a.name}`}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-sand hover:text-loss"
              >
                <Trash2 className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="py-5">
          <p className="text-[14px] text-body">{empty}</p>
          <button onClick={onAdd} className="mt-2 text-[13px] font-medium text-ink underline underline-offset-2">
            Add {tone === "asset" ? "an asset" : "a loan"}
          </button>
        </div>
      )}
    </section>
  );
}
