"use client";

import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sound } from "@/lib/sound";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

// A short guided tour of the dashboard. Each step points at an element marked
// with data-tour="…"; steps whose element isn't on screen are skipped.
type Step = { target: string; title: string; body: string };

const STEPS: Step[] = [
  {
    target: "networth",
    title: "Your net worth, at a glance",
    body: "Stocks, savings and everything you own, minus what you owe. The bars show how it has grown each quarter.",
  },
  {
    target: "news",
    title: "News: today's brief",
    body: "Finlio reads today's news about the stocks you own and explains, in plain words, what moved and why. Every line links to its source.",
  },
  {
    target: "quickadd",
    title: "Add anything in a tap",
    body: "Log an expense or income, add a stock, or add an account or loan. It all stays in this browser.",
  },
  {
    target: "nav",
    title: "Everything has a home",
    body: "News, Holdings, Expenses, Assets & loans and Analytics. Connect Gmail on Expenses to read bank alerts automatically.",
  },
  {
    target: "chat",
    title: "Ask Finlio",
    body: "Ask anything about your money, like “Where did most of it go this month?” Press ⌘L (Ctrl L) from anywhere.",
  },
  {
    target: "profile",
    title: "Your profile and settings",
    body: "Change your name or country, switch light or dark mode, see what stays private, export a backup, or sign out.",
  },
];

type TourUI = { startTour: () => void };
const TourContext = createContext<TourUI | null>(null);

export function useTour() {
  const ui = useContext(TourContext);
  if (!ui) throw new Error("useTour must be used inside TourProvider");
  return ui;
}

// The first visible element for a step (desktop and mobile layouts both mark targets).
function findTarget(name: string) {
  return [...document.querySelectorAll<HTMLElement>(`[data-tour="${name}"]`)].find((el) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  });
}

export function TourProvider({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState(false);
  const [steps, setSteps] = useState<Step[]>([]);
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { profile, setProfile } = useStore();

  const startTour = useCallback(() => {
    if (pathname !== "/dashboard") router.push("/dashboard");
    // Wait a beat for the dashboard to render, then keep only steps that exist.
    setTimeout(() => {
      const available = STEPS.filter((s) => findTarget(s.target));
      if (!available.length) return;
      setSteps(available);
      setIndex(0);
      setActive(true);
      sound("open");
    }, 450);
  }, [pathname, router]);

  const finish = useCallback(() => {
    setActive(false);
    setRect(null);
    if (!profile?.tourDone) setProfile({ tourDone: true });
  }, [profile?.tourDone, setProfile]);

  const step = steps[index];

  // Keep the spotlight on the current element through scrolling and resizing.
  useLayoutEffect(() => {
    if (!active || !step) return;
    const el = findTarget(step.target);
    if (!el) return;
    el.scrollIntoView({ block: "center", behavior: "smooth" });
    const update = () => setRect(el.getBoundingClientRect());
    update();
    const timer = setInterval(update, 120); // follows smooth scrolling and layout shifts
    window.addEventListener("resize", update);
    return () => {
      clearInterval(timer);
      window.removeEventListener("resize", update);
    };
  }, [active, step]);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish();
      if (e.key === "ArrowRight") setIndex((i) => Math.min(i + 1, steps.length - 1));
      if (e.key === "ArrowLeft") setIndex((i) => Math.max(i - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, finish, steps.length]);

  return (
    <TourContext.Provider value={{ startTour }}>
      {children}
      {active && step && rect && (
        <TourOverlay
          step={step}
          index={index}
          total={steps.length}
          rect={rect}
          onBack={() => setIndex((i) => Math.max(i - 1, 0))}
          onNext={() => {
            sound("tap");
            if (index === steps.length - 1) {
              sound("success");
              finish();
            } else setIndex(index + 1);
          }}
          onSkip={finish}
        />
      )}
    </TourContext.Provider>
  );
}

function TourOverlay({
  step,
  index,
  total,
  rect,
  onBack,
  onNext,
  onSkip,
}: {
  step: Step;
  index: number;
  total: number;
  rect: DOMRect;
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
}) {
  const pad = 8;
  const vw = typeof window === "undefined" ? 1024 : window.innerWidth;
  const vh = typeof window === "undefined" ? 768 : window.innerHeight;
  const mobile = vw < 640;
  const cardWidth = Math.min(340, vw - 32);
  // Below the element if there's room, otherwise above; on phones, docked to the bottom.
  const below = rect.bottom + 16 + 190 < vh;
  const left = Math.min(Math.max(16, rect.left + rect.width / 2 - cardWidth / 2), vw - cardWidth - 16);
  const top = below ? rect.bottom + 14 : Math.max(16, rect.top - 14 - 190);

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label={`Tour: ${step.title}`}>
      {/* The dimmed page with a clear window around the highlighted element. */}
      <div
        className="pointer-events-none absolute rounded-2xl ring-2 ring-gain transition-all duration-300 ease-out"
        style={{
          left: rect.left - pad,
          top: rect.top - pad,
          width: rect.width + pad * 2,
          height: rect.height + pad * 2,
          boxShadow: "0 0 0 9999px rgba(10, 10, 10, 0.55)",
        }}
      />
      <div className="absolute inset-0" onClick={onSkip} aria-hidden />
      <div
        className={cn(
          "absolute rounded-2xl border border-line bg-card p-5 text-ink shadow-[0_20px_60px_-15px_rgba(0,0,0,0.45)] transition-all duration-300 ease-out",
          mobile && "right-4 bottom-4 left-4",
        )}
        style={mobile ? undefined : { left, top, width: cardWidth }}
      >
        <div className="flex items-start justify-between gap-3">
          <p className="eyebrow">
            Step {index + 1} of {total}
          </p>
          <button
            onClick={onSkip}
            aria-label="Close tour"
            className="-mt-1 -mr-1 rounded-lg p-1 text-muted-foreground hover:bg-sand hover:text-ink"
          >
            <X className="size-4" />
          </button>
        </div>
        <h2 className="mt-1.5 text-[17px] font-semibold tracking-tight">{step.title}</h2>
        <p className="mt-1.5 text-[14px] leading-relaxed text-body">{step.body}</p>
        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex gap-1.5" aria-hidden>
            {Array.from({ length: total }, (_, i) => (
              <span
                key={i}
                className={cn("h-1.5 rounded-full transition-all", i === index ? "w-5 bg-gain" : "w-1.5 bg-line")}
              />
            ))}
          </div>
          <div className="flex gap-2">
            {index > 0 && (
              <Button variant="ghost" onClick={onBack} className="h-9 rounded-xl px-3">
                Back
              </Button>
            )}
            <Button onClick={onNext} className="h-9 rounded-xl px-4" autoFocus>
              {index === total - 1 ? "Done" : "Next"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
