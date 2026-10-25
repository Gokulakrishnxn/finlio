import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Welcome({ onAdd }: { onAdd: () => void }) {
  return (
    <section className="card-surface flex flex-col items-start gap-6 p-10">
      <div className="max-w-md">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">
          Know why your money moved.
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-body">
          Add the stocks you own. Every day, Finlio reads the news about them and tells you, in
          plain words, what changed and why. No account. Your portfolio stays in this browser.
        </p>
      </div>
      <Button onClick={onAdd} className="h-11 rounded-xl px-5 text-[15px]">
        <Plus className="size-4" />
        Add your first stock
      </Button>
    </section>
  );
}
