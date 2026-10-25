"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, FileUp, Lock, Newspaper, PieChart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTour } from "@/components/tour/tour";
import { COUNTRIES, guessCountry, LOCALES, setActiveCountry, type Country } from "@/lib/locale";
import { sound } from "@/lib/sound";
import { useStore, type StoreData } from "@/lib/store";
import { TERMS_VERSION } from "@/lib/terms";
import { cn } from "@/lib/utils";

const FEATURES = [
  { icon: Newspaper, title: "A daily brief", body: "Why the stocks you own moved, in plain words, with sources." },
  { icon: PieChart, title: "Your whole picture", body: "Stocks, savings, loans, income and spending in one place." },
  { icon: Lock, title: "Private by design", body: "You sign in with Google. Your money data stays in this browser, with no Finlio database." },
];

// First visit: welcome, name, country, then terms and how to start.
// Shown over the app until finished; the Terms page stays readable.
export function Onboarding() {
  const { ready, profile } = useStore();
  const pathname = usePathname();
  const router = useRouter();
  const done = ready && Boolean(profile?.onboardedAt);

  // On /setup, a finished set-up continues to the dashboard.
  useEffect(() => {
    if (done && pathname === "/setup") router.replace("/dashboard");
  }, [done, pathname, router]);

  if (!ready || profile?.onboardedAt || pathname.startsWith("/terms")) {
    return null;
  }
  return <Flow />;
}

function Flow() {
  const { setProfile, addSample, replaceAll, holdings } = useStore();
  const { startTour } = useTour();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [country, setCountry] = useState<Country>(() => guessCountry());
  const [start, setStart] = useState<"sample" | "fresh">(holdings.length ? "fresh" : "sample");
  const [tour, setTour] = useState(true);
  const [agreed, setAgreed] = useState(false);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Start with the first name from the Google account, if there is one.
  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((s: { name?: string }) => {
        const first = s.name?.trim().split(/\s+/)[0];
        if (first) setName((current) => current || first);
      })
      .catch(() => undefined);
  }, []);

  const next = () => {
    sound("tap");
    setStep((s) => s + 1);
  };

  function finish() {
    if (!agreed) return;
    setActiveCountry(country);
    setProfile({
      name: name.trim() || undefined,
      country,
      onboardedAt: new Date().toISOString(),
      termsVersion: TERMS_VERSION,
      tourDone: !tour,
    });
    if (start === "sample") addSample();
    sound("success");
    if (tour) startTour();
  }

  async function restore(file: File) {
    try {
      const parsed = JSON.parse(await file.text());
      if (parsed?.app !== "finlio" || !Array.isArray(parsed?.data?.holdings)) throw new Error("not a backup");
      const data = parsed.data as StoreData;
      replaceAll({
        ...data,
        profile: { ...data.profile, onboardedAt: data.profile?.onboardedAt ?? new Date().toISOString() },
      });
      sound("success");
    } catch {
      setRestoreError("That file isn't a Finlio backup.");
      sound("error");
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-sand" role="dialog" aria-modal="true" aria-label="Welcome to Finlio">
      <div className="mx-auto flex min-h-full w-full max-w-5xl flex-col px-4 py-6 sm:px-6 sm:py-10">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Image src="/finlio-mark.png" alt="" width={1024} height={1024} className="size-8 mix-blend-multiply dark:invert dark:mix-blend-screen" priority />
            <span className="text-xl font-semibold tracking-tight text-ink">Finlio</span>
          </div>
          {step > 0 && (
            <div className="flex items-center gap-1.5" aria-label={`Step ${step} of 3`}>
              {[1, 2, 3].map((i) => (
                <span key={i} className={cn("h-1.5 rounded-full transition-all", i <= step ? "w-6 bg-gain" : "w-1.5 bg-line")} />
              ))}
            </div>
          )}
        </header>

        <main className="flex flex-1 items-center py-8">
          {step === 0 && (
            <div className="grid w-full items-center gap-10 *:min-w-0 lg:grid-cols-[1.1fr_1fr]">
              <div>
                <p className="eyebrow">Welcome to Finlio</p>
                <h1 className="mt-3 text-[38px] leading-[1.05] font-semibold tracking-tight text-ink sm:text-[52px]">
                  Your money,
                  <br />
                  explained.
                </h1>
                <p className="mt-4 max-w-md text-[16px] leading-relaxed text-body sm:text-[17px]">
                  Finlio reads the news about what you own, keeps track of where your money goes, and tells you
                  what changed, in plain words. For India and the United States.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Button onClick={next} className="h-12 rounded-xl px-6 text-[15px]">
                    Get started
                    <ArrowRight className="size-4" />
                  </Button>
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="inline-flex h-12 items-center gap-2 rounded-xl px-3 text-[14px] text-body hover:text-ink"
                  >
                    <FileUp className="size-4" />
                    Restore a backup
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="application/json,.json"
                    className="sr-only"
                    onChange={(e) => e.target.files?.[0] && restore(e.target.files[0])}
                  />
                </div>
                {restoreError && <p className="mt-3 text-[13px] text-loss">{restoreError}</p>}
              </div>
              <ul className="grid gap-3">
                {FEATURES.map(({ icon: Icon, title, body }) => (
                  <li key={title} className="card-surface flex gap-4 p-5">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-success-soft text-success">
                      <Icon className="size-[18px]" strokeWidth={1.75} />
                    </span>
                    <div>
                      <p className="font-medium text-ink">{title}</p>
                      <p className="mt-0.5 text-[14px] leading-relaxed text-body">{body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {step === 1 && (
            <Panel title="What should we call you?" subtitle="Finlio greets you by name. It stays in this browser.">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  next();
                }}
              >
                <Input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your first name"
                  aria-label="Your name"
                  autoComplete="given-name"
                  maxLength={40}
                  className="h-14 rounded-2xl px-5 text-[18px]"
                />
                <Nav onBack={() => setStep(0)} nextLabel={name.trim() ? "Continue" : "Skip"} />
              </form>
            </Panel>
          )}

          {step === 2 && (
            <Panel
              title={name.trim() ? `Nice to meet you, ${name.trim().split(" ")[0]}. Where do you live?` : "Where do you live?"}
              subtitle="Finlio uses your country's currency, stock market and account types. You can change it later."
            >
              <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Country">
                {COUNTRIES.map((c) => {
                  const l = LOCALES[c];
                  const selected = country === c;
                  return (
                    <button
                      key={c}
                      role="radio"
                      aria-checked={selected}
                      onClick={() => {
                        setCountry(c);
                        sound("select");
                      }}
                      className={cn(
                        "relative flex flex-col items-start gap-3 rounded-2xl border bg-card p-5 text-left transition-all hover:border-gain/60",
                        selected ? "border-gain ring-2 ring-gain/30" : "border-line",
                      )}
                    >
                      {selected && (
                        <span className="absolute top-4 right-4 flex size-6 items-center justify-center rounded-full bg-gain text-white">
                          <Check className="size-3.5" strokeWidth={3} />
                        </span>
                      )}
                      <span className="text-[34px] leading-none" aria-hidden>
                        {l.flag}
                      </span>
                      <span>
                        <span className="block text-[17px] font-semibold text-ink">{l.name}</span>
                        <span className="mt-1 block text-[13px] text-muted-foreground">
                          {l.symbol} {l.currency} · {l.market}
                        </span>
                        <span className="mt-1 block text-[12px] text-muted-foreground">
                          {c === "IN" ? "EPF, PPF, FDs · Apr–Mar financial year" : "401(k), IRA, HSA · calendar quarters"}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
              <Nav onBack={() => setStep(1)} onNext={next} nextLabel="Continue" />
            </Panel>
          )}

          {step === 3 && (
            <Panel title="How would you like to start?" subtitle="You can add your own stocks, accounts and spending any time.">
              <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="How to start">
                <Choice
                  selected={start === "sample"}
                  onSelect={() => setStart("sample")}
                  title="Explore with sample data"
                  body={`A sample ${LOCALES[country].name === "India" ? "Indian" : "American"} household, clearly labelled. Remove it in one tap.`}
                  icon={<Sparkles className="size-[18px]" />}
                />
                <Choice
                  selected={start === "fresh"}
                  onSelect={() => setStart("fresh")}
                  title="Start fresh"
                  body="An empty Finlio, ready for your own money."
                  icon={<ArrowRight className="size-[18px]" />}
                />
              </div>

              <label className="mt-6 flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-line bg-card p-4">
                <span>
                  <span className="block text-[14px] font-medium text-ink">Show me around</span>
                  <span className="block text-[13px] text-muted-foreground">A quick six-step tour of the dashboard.</span>
                </span>
                <input type="checkbox" checked={tour} onChange={(e) => setTour(e.target.checked)} className="size-5 accent-[var(--color-gain)]" />
              </label>

              <label className="mt-3 flex cursor-pointer items-start gap-3 rounded-2xl p-1 text-[14px] leading-relaxed text-body">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 size-5 shrink-0 accent-[var(--color-gain)]"
                />
                <span>
                  I agree to the{" "}
                  <Link href="/terms" target="_blank" className="font-medium text-ink underline">
                    Terms &amp; Conditions
                  </Link>{" "}
                  and understand that Finlio explains my money but doesn&apos;t give financial advice. My data
                  stays in this browser.
                </span>
              </label>

              <div className="mt-8 flex items-center justify-between gap-3">
                <Button variant="ghost" onClick={() => setStep(2)} className="h-12 rounded-xl px-4">
                  <ArrowLeft className="size-4" />
                  Back
                </Button>
                <Button onClick={finish} disabled={!agreed} className="h-12 rounded-xl px-6 text-[15px]">
                  Enter Finlio
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </Panel>
          )}
        </main>
      </div>
    </div>
  );
}

function Panel({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-xl animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
      <h1 className="text-[28px] leading-tight font-semibold tracking-tight text-ink sm:text-[34px]">{title}</h1>
      <p className="mt-2 mb-6 text-[15px] leading-relaxed text-body">{subtitle}</p>
      {children}
    </div>
  );
}

function Nav({ onBack, onNext, nextLabel }: { onBack: () => void; onNext?: () => void; nextLabel: string }) {
  return (
    <div className="mt-8 flex items-center justify-between gap-3">
      <Button type="button" variant="ghost" onClick={onBack} className="h-12 rounded-xl px-4">
        <ArrowLeft className="size-4" />
        Back
      </Button>
      <Button type={onNext ? "button" : "submit"} onClick={onNext} className="h-12 rounded-xl px-6 text-[15px]">
        {nextLabel}
        <ArrowRight className="size-4" />
      </Button>
    </div>
  );
}

function Choice({
  selected,
  onSelect,
  title,
  body,
  icon,
}: {
  selected: boolean;
  onSelect: () => void;
  title: string;
  body: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      role="radio"
      aria-checked={selected}
      onClick={() => {
        onSelect();
        sound("select");
      }}
      className={cn(
        "flex gap-3 rounded-2xl border bg-card p-4 text-left transition-all hover:border-gain/60",
        selected ? "border-gain ring-2 ring-gain/30" : "border-line",
      )}
    >
      <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-xl", selected ? "bg-gain text-white" : "bg-sand text-ink")}>
        {icon}
      </span>
      <span>
        <span className="block text-[15px] font-medium text-ink">{title}</span>
        <span className="mt-0.5 block text-[13px] leading-relaxed text-muted-foreground">{body}</span>
      </span>
    </button>
  );
}
