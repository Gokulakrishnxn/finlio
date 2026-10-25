"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { useRouter } from "next/navigation";
import { Database, Download, Link2, Lock, LogOut, Settings2, UserRound, X, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { PrivacyPanel } from "@/components/settings/privacy-panel";
import { Accounts, DataCard, Preferences, ProfileCard } from "@/components/settings/sections";
import { downloadBackup } from "@/lib/backup";
import { sound } from "@/lib/sound";
import { useStore, type StoreData } from "@/lib/store";
import { cn } from "@/lib/utils";

export type SettingsTab = "general" | "profile" | "accounts" | "data" | "privacy";

const TABS: { id: SettingsTab; label: string; icon: LucideIcon }[] = [
  { id: "general", label: "General", icon: Settings2 },
  { id: "profile", label: "Profile", icon: UserRound },
  { id: "accounts", label: "Connected apps", icon: Link2 },
  { id: "data", label: "Data controls", icon: Database },
  { id: "privacy", label: "Privacy", icon: Lock },
];

type SettingsUI = {
  openSettings: (tab?: SettingsTab) => void;
  closeSettings: () => void;
  signOut: () => void; // asks first, then signs out
};

const SettingsContext = createContext<SettingsUI | null>(null);

export function useSettings() {
  const ui = useContext(SettingsContext);
  if (!ui) throw new Error("useSettings must be used inside SettingsProvider");
  return ui;
}

function snapshotOf(store: ReturnType<typeof useStore>): StoreData {
  return {
    holdings: store.holdings,
    brief: store.brief,
    expenses: store.expenses,
    assets: store.assets,
    entries: store.entries,
    snapshots: store.snapshots,
    profile: store.profile,
  };
}

// Settings live in one pop-up window, opened from the profile menu (like ChatGPT).
// Sign out lives here too, so the menu and Settings share one confirmation.
export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<SettingsTab>("general");
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const store = useStore();
  const router = useRouter();

  const openSettings = useCallback((next: SettingsTab = "general") => {
    setTab(next);
    setOpen(true);
  }, []);

  // Signing out ends the Google session and erases this browser's Finlio data,
  // since the data lives only here.
  async function signOut() {
    setSigningOut(true);
    await fetch("/api/auth/signout", { method: "POST" }).catch(() => undefined);
    store.clearAll();
    setSigningOut(false);
    setConfirmSignOut(false);
    setOpen(false);
    sound("close");
    router.push("/");
  }

  return (
    <SettingsContext.Provider
      value={{ openSettings, closeSettings: () => setOpen(false), signOut: () => setConfirmSignOut(true) }}
    >
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
            <button
              onClick={() => setConfirmSignOut(true)}
              className="flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[14px] text-loss transition-colors hover:bg-card/70 sm:mt-auto"
            >
              <LogOut className="size-4" strokeWidth={1.75} />
              Sign out
            </button>
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
            {open && <TabBody tab={tab} onSignOut={() => setConfirmSignOut(true)} />}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmSignOut} onOpenChange={setConfirmSignOut}>
        <AlertDialogContent className="gap-5 rounded-2xl p-6 data-[size=default]:max-w-[calc(100%-2rem)] data-[size=default]:sm:max-w-[440px]">
          <AlertDialogHeader className="place-items-start text-left">
            <AlertDialogMedia className="size-11 rounded-full bg-danger-soft text-loss">
              <LogOut className="size-5" />
            </AlertDialogMedia>
            <AlertDialogTitle className="text-[18px] font-semibold tracking-tight">Sign out of Finlio?</AlertDialogTitle>
            <AlertDialogDescription className="text-[14px] leading-relaxed">
              Signing out ends your Google session and erases your stocks, accounts, spending and history from this
              browser, since Finlio keeps no copy anywhere else.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="flex flex-col gap-3 rounded-xl bg-sand p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-[14px] font-medium text-ink">Keep a copy first</p>
              <p className="text-[13px] text-muted-foreground">Restore it later from the welcome screen.</p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                downloadBackup(snapshotOf(store));
                sound("success");
              }}
              className="h-9 shrink-0 rounded-xl bg-card"
            >
              <Download className="size-4" />
              Download backup
            </Button>
          </div>

          <AlertDialogFooter className="-mx-6 -mb-6 rounded-b-2xl px-6 py-4">
            <AlertDialogCancel className="h-10 rounded-xl px-4">Stay signed in</AlertDialogCancel>
            <Button variant="destructive" onClick={signOut} disabled={signingOut} className="h-10 rounded-xl px-4">
              <LogOut className="size-4" />
              {signingOut ? "Signing out…" : "Sign out"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SettingsContext.Provider>
  );
}

function TabBody({ tab, onSignOut }: { tab: SettingsTab; onSignOut: () => void }) {
  const store = useStore();
  if (tab === "general") return <Preferences />;
  if (tab === "profile")
    return <ProfileCard key={store.profile?.name ?? "new"} initial={store.profile} onSave={store.setProfile} />;
  if (tab === "accounts") return <Accounts />;
  if (tab === "privacy") return <PrivacyPanel onSignOut={onSignOut} />;
  return <DataCard data={snapshotOf(store)} onRestore={store.replaceAll} />;
}
