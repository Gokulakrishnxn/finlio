"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { Database, Link2, Settings2, UserRound, X, type LucideIcon } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Accounts, DataCard, Preferences, ProfileCard } from "@/components/settings/sections";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export type SettingsTab = "general" | "profile" | "accounts" | "data";

const TABS: { id: SettingsTab; label: string; icon: LucideIcon }[] = [
  { id: "general", label: "General", icon: Settings2 },
  { id: "profile", label: "Profile", icon: UserRound },
  { id: "accounts", label: "Connected apps", icon: Link2 },
  { id: "data", label: "Data controls", icon: Database },
];

type SettingsUI = { openSettings: (tab?: SettingsTab) => void; closeSettings: () => void };

const SettingsContext = createContext<SettingsUI | null>(null);

export function useSettings() {
  const ui = useContext(SettingsContext);
  if (!ui) throw new Error("useSettings must be used inside SettingsProvider");
  return ui;
}

// Settings live in one pop-up window, opened from the profile menu (like ChatGPT).
export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<SettingsTab>("general");
  const openSettings = useCallback((next: SettingsTab = "general") => {
    setTab(next);
    setOpen(true);
  }, []);

  return (
    <SettingsContext.Provider value={{ openSettings, closeSettings: () => setOpen(false) }}>
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={false}
          className="flex h-[min(620px,calc(100vh-2rem))] w-full max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-[760px] sm:flex-row"
        >
          <nav className="flex shrink-0 gap-1 overflow-x-auto border-b border-line bg-sand/60 p-3 sm:w-[210px] sm:flex-col sm:border-r sm:border-b-0">
            <div className="mb-2 hidden items-center justify-between px-2 pt-1 sm:flex">
              <DialogTitle className="text-[15px] font-semibold text-ink">Settings</DialogTitle>
            </div>
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={cn(
                  "flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[14px] text-body transition-colors hover:bg-card/70",
                  tab === id && "bg-card font-medium text-ink shadow-sm",
                )}
              >
                <Icon className="size-4" strokeWidth={1.75} />
                {label}
              </button>
            ))}
          </nav>
          <div className="relative min-h-0 flex-1 overflow-y-auto p-6">
            <DialogDescription className="sr-only">Finlio settings, saved only in this browser.</DialogDescription>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close settings"
              className="absolute top-4 right-4 rounded-lg p-1.5 text-muted-foreground hover:bg-sand hover:text-ink"
            >
              <X className="size-4" />
            </button>
            {open && <TabBody tab={tab} />}
          </div>
        </DialogContent>
      </Dialog>
    </SettingsContext.Provider>
  );
}

function TabBody({ tab }: { tab: SettingsTab }) {
  const store = useStore();
  if (tab === "general") return <Preferences />;
  if (tab === "profile")
    return <ProfileCard key={store.profile?.name ?? "new"} initial={store.profile} onSave={store.setProfile} />;
  if (tab === "accounts") return <Accounts />;
  return (
    <DataCard
      data={{
        holdings: store.holdings,
        brief: store.brief,
        expenses: store.expenses,
        assets: store.assets,
        entries: store.entries,
        snapshots: store.snapshots,
        profile: store.profile,
      }}
      onRestore={store.replaceAll}
    />
  );
}
