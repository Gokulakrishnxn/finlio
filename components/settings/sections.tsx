"use client";

// The sections of the Settings window (opened from the profile menu).
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Download, ImageIcon, LogOut, Mail, Monitor, Moon, PanelLeftClose, Sun, Upload, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, Select } from "@/components/form";
import { useSettings } from "@/components/settings/settings-dialog";
import { useTour } from "@/components/tour/tour";
import { useTheme } from "@/components/theme-root";
import { todayLocal } from "@/lib/format";
import { setSoundOn, sound, soundOn } from "@/lib/sound";
import type { StoreData } from "@/lib/store";
import { COLLAPSE_KEY, logosOn, setLogosOn, SIDEBAR_EVENT } from "@/lib/ui-prefs";
import { cn } from "@/lib/utils";
import { activeLocale, COUNTRIES, isCountry, LOCALES, type Country } from "@/lib/locale";

type Session = { configured: boolean; signedIn: boolean; email?: string; name?: string; picture?: string };

function Card({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={className}>
      <h3 className="mb-4 border-b border-line pb-3 text-[15px] font-semibold text-ink">{title}</h3>
      {children}
    </section>
  );
}

export function ProfileCard({
  initial,
  onSave,
}: {
  initial?: StoreData["profile"];
  onSave: (p: NonNullable<StoreData["profile"]>) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [city, setCity] = useState(initial?.city ?? "");
  const [goal, setGoal] = useState(initial?.goal ?? "");
  const [country, setCountry] = useState<Country>(isCountry(initial?.country) ? initial.country : "IN");
  const [saved, setSaved] = useState(false);
  const initialLetter = (name.trim()[0] ?? "F").toUpperCase();

  function save(e: React.FormEvent) {
    e.preventDefault();
    onSave({
      name: name.trim() || undefined,
      city: city.trim() || undefined,
      goal: goal.trim() || undefined,
      country,
    });
    setSaved(true);
    sound("success");
  }

  return (
    <Card title="Profile">
      <div className="mb-5 flex items-center gap-4">
        <span className="flex size-14 items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_30%,#7ee29a,#34c759_55%,#1f7a3a)] text-[22px] font-semibold text-[#102b18]">
          {initialLetter}
        </span>
        <div>
          <p className="text-[17px] font-semibold text-ink">{name.trim() || "Your name"}</p>
          <p className="text-[13px] text-muted-foreground">{city.trim() || "Where you live"}</p>
        </div>
      </div>
      <form onSubmit={save} className="flex flex-col gap-4" noValidate>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field id="profile-name" label="Name">
            <Input
              id="profile-name"
              value={name}
              placeholder="e.g. Gokulakrishnan"
              onChange={(e) => {
                setName(e.target.value);
                setSaved(false);
              }}
              className="h-11 rounded-xl"
            />
          </Field>
          <Field id="profile-city" label="City (optional)">
            <Input
              id="profile-city"
              value={city}
              placeholder="e.g. Chennai"
              onChange={(e) => {
                setCity(e.target.value);
                setSaved(false);
              }}
              className="h-11 rounded-xl"
            />
          </Field>
        </div>
        <Field id="profile-country" label="Country">
          <Select
            id="profile-country"
            value={country}
            onChange={(e) => {
              setCountry(e.target.value as Country);
              setSaved(false);
            }}
          >
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {LOCALES[c].flag} {LOCALES[c].name} ({LOCALES[c].symbol} {LOCALES[c].currency})
              </option>
            ))}
          </Select>
        </Field>
        {country !== (initial?.country ?? "IN") && (
          <p className="-mt-2 text-[12px] text-muted-foreground">
            Amounts will show in {LOCALES[country].currency}. Finlio doesn&apos;t convert what you&apos;ve already
            entered, so update amounts that were in the other currency.
          </p>
        )}
        <Field id="profile-goal" label="A money goal (optional)">
          <Input
            id="profile-goal"
            value={goal}
            placeholder="e.g. Save for a home by 2030"
            onChange={(e) => {
              setGoal(e.target.value);
              setSaved(false);
            }}
            className="h-11 rounded-xl"
          />
        </Field>
        <p className="text-[12px] text-muted-foreground">
          Your name personalises the greeting. Your goal helps Finlio chat explain your numbers in context; it
          never turns into advice.
        </p>
        <div className="flex items-center gap-3">
          <Button type="submit" className="h-10 rounded-xl px-5">
            Save profile
          </Button>
          {saved && <span className="text-[13px] text-success">Saved</span>}
        </div>
      </form>
    </Card>
  );
}

function Toggle({ on, onChange, label }: { on: boolean; onChange: (on: boolean) => void; label: string }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full transition-colors",
        on ? "bg-gain" : "bg-line",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0 size-5 rounded-full bg-white shadow transition-transform",
          on ? "translate-x-[22px]" : "translate-x-0.5",
        )}
      />
    </button>
  );
}

export function Preferences() {
  const { startTour } = useTour();
  const { closeSettings } = useSettings();
  const { theme, setTheme } = useTheme();
  const [sounds, setSounds] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [logos, setLogos] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSounds(soundOn());
    setLogos(logosOn());
    try {
      setCollapsed(window.localStorage.getItem(COLLAPSE_KEY) === "1");
    } catch {
      // Storage blocked: show defaults.
    }
  }, []);

  return (
    <Card title="Preferences">
      <fieldset>
        <legend className="text-[14px] font-medium text-ink">Appearance</legend>
        <p className="mt-1 text-[13px] text-muted-foreground">Choose a theme, or match your device.</p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {([
            { value: "light", label: "Light", icon: Sun },
            { value: "dark", label: "Dark", icon: Moon },
            { value: "system", label: "System", icon: Monitor },
          ] as const).map(({ value, label, icon: Icon }) => (
            <label
              key={value}
              className="relative flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-input bg-card px-2 py-3 text-[13px] font-medium text-body transition-colors hover:bg-muted has-checked:border-success has-checked:bg-success-soft has-checked:text-success has-focus-visible:outline-2 has-focus-visible:outline-offset-3 has-focus-visible:outline-ring"
            >
              <input
                type="radio"
                name="appearance"
                value={value}
                checked={theme === value}
                onChange={() => setTheme(value)}
                className="sr-only"
              />
              <Icon className="size-[18px]" strokeWidth={1.75} aria-hidden />
              {label}
            </label>
          ))}
        </div>
      </fieldset>
      <ul className="mt-5 divide-y divide-line border-t border-line pt-5">
        <Row
          icon={<Volume2 className="size-4" />}
          title="Interface sounds"
          body="Soft sounds when you save, navigate or get a brief."
          control={
            <Toggle
              label="Interface sounds"
              on={sounds}
              onChange={(on) => {
                setSoundOn(on);
                setSounds(on);
                if (on) sound("toggle");
              }}
            />
          }
        />
        <Row
          icon={<ImageIcon className="size-4" />}
          title="Show company logos"
          body="Logos for your stocks, banks and merchants. Turn off before recording a public demo: logos are other companies' trademarks."
          control={
            <Toggle
              label="Show company logos"
              on={logos}
              onChange={(on) => {
                setLogosOn(on);
                setLogos(on);
              }}
            />
          }
        />
        <Row
          icon={<PanelLeftClose className="size-4" />}
          title="Compact sidebar"
          body="Show only icons in the sidebar. You can also use the button next to the logo."
          control={
            <Toggle
              label="Compact sidebar"
              on={collapsed}
              onChange={(on) => {
                try {
                  window.localStorage.setItem(COLLAPSE_KEY, on ? "1" : "0");
                } catch {
                  // Storage blocked: the sidebar keeps its current state.
                }
                window.dispatchEvent(new Event(SIDEBAR_EVENT));
                setCollapsed(on);
              }}
            />
          }
        />
        <Row
          title="Country, currency and market"
          body={`${activeLocale().flag} ${activeLocale().name}: ${activeLocale().currency} and ${activeLocale().market} stocks. Change your country in Profile.`}
          control={
            <span className="rounded-md bg-sand px-2 py-1 text-[12px] whitespace-nowrap text-body ring-1 ring-line">
              {activeLocale().symbol} {activeLocale().currency}
            </span>
          }
        />
        <Row
          title="Keyboard"
          body="Open or close Finlio chat from anywhere."
          control={<kbd className="rounded-md bg-sand px-2 py-1 text-[12px] text-body ring-1 ring-line">⌘ L</kbd>}
        />
        <Row
          title="Tour"
          body="A quick six-step walk through the dashboard."
          control={
            <Button
              variant="outline"
              onClick={() => {
                closeSettings();
                startTour();
              }}
              className="h-8 rounded-lg px-3 text-[13px]"
            >
              Replay tour
            </Button>
          }
        />
        <Row
          title="Terms & Conditions"
          body="Finlio explains your money; it doesn't give financial advice."
          control={
            <Link href="/terms" target="_blank" className="text-[13px] font-medium whitespace-nowrap text-ink underline">
              Read terms
            </Link>
          }
        />
      </ul>
    </Card>
  );
}

function Row({
  icon,
  title,
  body,
  control,
}: {
  icon?: React.ReactNode;
  title: string;
  body: string;
  control: React.ReactNode;
}) {
  return (
    <li className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0">
      {icon && (
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sand text-ink">{icon}</span>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-medium text-ink">{title}</p>
        <p className="text-[13px] text-muted-foreground">{body}</p>
      </div>
      {control}
    </li>
  );
}

export function Accounts() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then(setSession)
      .catch(() => setSession({ configured: false, signedIn: false }));
  }, []);

  async function disconnect() {
    await fetch("/api/auth/signout", { method: "POST" });
    setSession((s) => (s ? { ...s, signedIn: false, email: undefined } : s));
    sound("close");
  }

  return (
    <Card title="Connected accounts">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-sand">
          <Mail className="size-4 text-ink" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-medium text-ink">Google (Gmail, read-only)</p>
          <p className="truncate text-[13px] text-muted-foreground">
            {!session
              ? "Checking…"
              : session.signedIn
                ? session.email
                : session.configured
                  ? "Not connected"
                  : "Not set up on this copy"}
          </p>
        </div>
        {session?.signedIn ? (
          <Button variant="outline" onClick={disconnect} className="h-9 rounded-xl">
            <LogOut className="size-4" />
            Disconnect
          </Button>
        ) : (
          session?.configured && (
            <a
              href="/api/auth/google"
              className="inline-flex h-9 items-center rounded-xl px-3 text-[14px] font-medium text-ink ring-1 ring-line hover:bg-sand"
            >
              Connect
            </a>
          )
        )}
      </div>
      <p className="mt-4 text-[12px] leading-relaxed text-muted-foreground">
        Used only to read bank and UPI alerts for{" "}
        <Link href="/expenses" className="text-ink underline">
          Expenses
        </Link>
        . Disconnecting revokes Finlio&apos;s access in your Google account.
      </p>
    </Card>
  );
}

export function DataCard({ data, onRestore }: { data: StoreData; onRestore: (data: StoreData) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);

  function exportData() {
    const blob = new Blob([JSON.stringify({ app: "finlio", version: 1, data }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `finlio-backup-${todayLocal()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage("Backup downloaded.");
    sound("success");
  }

  async function restore(file: File) {
    try {
      const parsed = JSON.parse(await file.text());
      if (parsed?.app !== "finlio" || !Array.isArray(parsed?.data?.holdings)) {
        throw new Error("not a Finlio backup");
      }
      onRestore(parsed.data as StoreData);
      setMessage("Backup restored.");
      sound("success");
    } catch {
      setMessage("That file isn't a Finlio backup.");
      sound("error");
    }
  }

  return (
    <Card title="Your data">
      <p className="text-[14px] leading-relaxed text-body">
        Everything lives in this browser. Download a backup to move Finlio to another browser or keep a copy.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="outline" onClick={exportData} className="h-10 rounded-xl">
          <Download className="size-4" />
          Export backup
        </Button>
        <Button variant="outline" onClick={() => fileRef.current?.click()} className="h-10 rounded-xl">
          <Upload className="size-4" />
          Restore backup
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="sr-only"
          onChange={(e) => e.target.files?.[0] && restore(e.target.files[0])}
        />
      </div>
      {message && <p className="mt-3 text-[13px] text-body">{message}</p>}
      <p className="mt-4 border-t border-line pt-4 text-[13px] text-muted-foreground">
        To erase everything, use{" "}
        <Link href="/privacy" className="text-ink underline">
          Clear all my data
        </Link>{" "}
        on Privacy. Restoring replaces what&apos;s here now.
      </p>
    </Card>
  );
}
