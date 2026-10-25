import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ChartNoAxesCombined,
  ChevronDown,
  HardDrive,
  Landmark,
  Lock,
  Mail,
  MessageCircle,
  Newspaper,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { BeforeAfter } from "@/components/landing/before-after";
import { cn } from "@/lib/utils";

const REPO = "https://github.com/Gokulakrishnxn/finlio";

const FEATURES: { icon: LucideIcon; title: string; body: string; tint: string }[] = [
  {
    icon: Newspaper,
    title: "A daily brief",
    body: "What changed for the stocks you own, in plain English, with the source for every line.",
    tint: "bg-info-soft text-info",
  },
  {
    icon: Landmark,
    title: "The whole picture",
    body: "Stocks, bank accounts, property, gold and loans add up to one net worth, by quarter.",
    tint: "bg-success-soft text-success",
  },
  {
    icon: Mail,
    title: "Spending from Gmail",
    body: "Bank and card alerts become a tidy list of where your money went. Read-only, your choice.",
    tint: "bg-warning-soft text-warning",
  },
  {
    icon: ChartNoAxesCombined,
    title: "Analytics",
    body: "Where income goes, what you own by type, and how this month compares to the last.",
    tint: "bg-purple-soft text-purple",
  },
  {
    icon: MessageCircle,
    title: "Ask Finlio",
    body: "“Why is my total down today?” Answers that know your numbers. Press ⌘L anywhere.",
    tint: "bg-pink-soft text-pink",
  },
  {
    icon: Lock,
    title: "Private by design",
    body: "No Finlio account and no Finlio database. Everything lives in your browser.",
    tint: "bg-neutral-soft text-neutral",
  },
];

const STEPS = [
  { title: "Tell Finlio what you own", body: "Add stocks by name, import a CSV, or start with sample data." },
  { title: "Read your brief", body: "Each morning, the few things that changed and why they matter to you." },
  { title: "Ask anything", body: "Follow up in Finlio chat. It explains; the decisions stay yours." },
];

const MARKETS = [
  {
    flag: "🇮🇳",
    name: "India",
    points: ["Indian stock prices in rupees", "₹ lakh and crore formats", "Financial-year quarters (Apr–Mar)", "Savings, FD, PPF and gold"],
  },
  {
    flag: "🇺🇸",
    name: "United States",
    points: ["US stock prices in dollars", "$ formats and calendar quarters", "Checking, savings and 401(k)", "Mortgages, auto and student loans"],
  },
];

const FAQ = [
  {
    q: "Is Finlio financial advice?",
    a: "No. Finlio explains what happened to what you own and why. It never tells you to buy, sell or hold, and it isn't a licensed advisor.",
  },
  {
    q: "Where is my data stored?",
    a: "In your browser, on this device. There's no Finlio account or server copy. You can download a backup at any time, and signing out erases it.",
  },
  {
    q: "What leaves my device?",
    a: "Only what's needed: stock symbols for prices and news, and your question when you ask Finlio chat. Quantities, balances and transactions are never sent for prices or news.",
  },
  {
    q: "Do I have to connect Gmail?",
    a: "No. Gmail is optional and read-only, used only to find bank and card alerts. You can add spending by hand or skip it entirely.",
  },
  {
    q: "What does it cost?",
    a: "Finlio is free and open source under the MIT licence.",
  },
];

export default function Landing() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Section id="see" eyebrow="The difference" title="Less noise. More meaning.">
          <BeforeAfter />
        </Section>
        <Section id="features" eyebrow="Features" title="Everything you own, explained.">
          <ul className="grid gap-4 *:min-w-0 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, body, tint }) => (
              <li key={title} className="card-surface p-6">
                <span className={cn("mb-4 flex size-10 items-center justify-center rounded-xl", tint)}>
                  <Icon className="size-5" strokeWidth={1.75} />
                </span>
                <h3 className="text-[16px] font-semibold text-ink">{title}</h3>
                <p className="mt-1.5 text-[14px] leading-relaxed text-body">{body}</p>
              </li>
            ))}
          </ul>
        </Section>
        <Section id="how" eyebrow="How it works" title="Three steps. Two minutes a day.">
          <ol className="grid gap-4 *:min-w-0 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title} className="rounded-2xl border border-line p-6">
                <span className="nums text-[13px] text-muted-foreground">0{i + 1}</span>
                <h3 className="mt-3 text-[18px] font-semibold tracking-tight text-ink">{s.title}</h3>
                <p className="mt-1.5 text-[14px] leading-relaxed text-body">{s.body}</p>
              </li>
            ))}
          </ol>
        </Section>
        <Section id="markets" eyebrow="Built for two markets" title="Made for India and the United States.">
          <div className="grid gap-4 *:min-w-0 md:grid-cols-2">
            {MARKETS.map((m) => (
              <div key={m.name} className="card-surface p-6 sm:p-8">
                <p className="text-[32px] leading-none">{m.flag}</p>
                <h3 className="mt-4 text-[20px] font-semibold tracking-tight text-ink">{m.name}</h3>
                <ul className="mt-4 grid gap-2">
                  {m.points.map((p) => (
                    <li key={p} className="flex items-center gap-2.5 text-[14px] text-body">
                      <span className="size-1.5 rounded-full bg-success" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>
        <Privacy />
        <Section id="faq" eyebrow="Questions" title="Good questions.">
          <div className="mx-auto max-w-2xl divide-y divide-line border-y border-line">
            {FAQ.map((f) => (
              <details key={f.q} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[16px] font-medium text-ink [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-2 pr-8 text-[15px] leading-relaxed text-body">{f.a}</p>
              </details>
            ))}
          </div>
        </Section>
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}

function Mark({ className }: { className?: string }) {
  return (
    <Image
      src="/finlio-mark.png"
      alt=""
      width={1024}
      height={1024}
      className={cn("mix-blend-multiply dark:mix-blend-screen dark:invert", className)}
      priority
    />
  );
}

function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/60 bg-cream/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-1.5">
          <Mark className="size-8" />
          <span className="text-xl font-semibold tracking-tight text-ink">Finlio</span>
        </Link>
        <nav className="hidden items-center gap-7 text-[14px] text-body md:flex">
          <a href="#features" className="hover:text-ink">Features</a>
          <a href="#how" className="hover:text-ink">How it works</a>
          <a href="#privacy" className="hover:text-ink">Privacy</a>
          <a href="#faq" className="hover:text-ink">FAQ</a>
        </nav>
        <PrimaryLink href="/dashboard" small>
          Open Finlio
        </PrimaryLink>
      </div>
    </header>
  );
}

function PrimaryLink({ href, children, small }: { href: string; children: React.ReactNode; small?: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex shrink-0 items-center gap-1.5 rounded-full bg-ink font-medium text-cream transition-opacity hover:opacity-90",
        small ? "h-9 px-4 text-[14px]" : "h-12 px-6 text-[15px]",
      )}
    >
      {children}
      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(60%_60%_at_50%_0%,var(--info-soft),transparent)]"
      />
      <div className="relative mx-auto max-w-6xl px-4 pt-16 pb-12 text-center sm:px-6 sm:pt-24">
        <p className="mx-auto mb-6 w-fit rounded-full border border-line bg-card px-3 py-1 text-[13px] text-body">
          For India 🇮🇳 and the United States 🇺🇸
        </p>
        <h1 className="mx-auto max-w-3xl text-[44px] leading-[1.05] font-semibold tracking-tight text-balance text-ink sm:text-[64px] lg:text-[76px]">
          Your money, explained.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-[17px] leading-relaxed text-pretty text-body sm:text-[19px]">
          Finlio reads the news about what you own and tells you, in plain English, what changed and why it
          matters to you. Every morning. In two minutes.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <PrimaryLink href="/dashboard">Get started free</PrimaryLink>
          <a
            href="#see"
            className="inline-flex h-12 items-center rounded-full border border-line bg-card px-6 text-[15px] font-medium text-ink hover:bg-sand"
          >
            See the difference
          </a>
        </div>
        <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px] text-muted-foreground">
          <li className="flex items-center gap-1.5">
            <HardDrive className="size-3.5" /> Stays on your device
          </li>
          <li className="flex items-center gap-1.5">
            <ShieldCheck className="size-3.5" /> Explains, never advises
          </li>
          <li className="flex items-center gap-1.5">
            <Lock className="size-3.5" /> No account needed
          </li>
        </ul>

        <ProductPreview />
      </div>
    </section>
  );
}

// A drawn preview of the dashboard, so the page needs no screenshots.
const BARS = [38, 44, 41, 52, 58, 63, 71, 78];

function ProductPreview() {
  return (
    <div className="mx-auto mt-16 max-w-4xl rounded-[28px] border border-line bg-sand p-2 text-left shadow-[0_30px_80px_-30px_rgba(0,0,0,0.25)] sm:p-3">
      <div className="grid gap-2 *:min-w-0 sm:gap-3 md:grid-cols-[1.4fr_1fr]">
        <div className="card-surface p-5 sm:p-6">
          <p className="eyebrow">Net worth · ₹ INR</p>
          <p className="nums mt-2 text-[30px] font-semibold tracking-tight text-ink sm:text-[38px]">₹48,62,310</p>
          <p className="mt-1 text-[13px] text-success">+₹1,24,800 this quarter</p>
          <div className="mt-6 flex h-28 items-end gap-2">
            {BARS.map((h, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                <div
                  className={cn("w-full rounded-md", i === BARS.length - 1 ? "bg-ink" : "bg-line")}
                  style={{ height: `${h}%` }}
                />
              </div>
            ))}
          </div>
          <div className="nums mt-2 flex justify-between text-[11px] text-muted-foreground">
            <span>Q1 FY25</span>
            <span>Q4 FY26</span>
          </div>
        </div>
        <div className="grid gap-2 sm:gap-3">
          <div className="card-surface p-5">
            <p className="eyebrow mb-3">Today&apos;s brief</p>
            <p className="text-[14px] font-medium text-ink">Your largest stock fell 2.4%</p>
            <p className="mt-1 text-[13px] leading-relaxed text-body">
              Results showed slower growth. It moved your total by about −0.7%.
            </p>
          </div>
          <div className="card-surface p-5">
            <p className="eyebrow mb-3">Spending · this month</p>
            {[
              { label: "Food", v: 72, c: "bg-warning" },
              { label: "Bills", v: 48, c: "bg-info" },
              { label: "Travel", v: 30, c: "bg-purple" },
            ].map((r) => (
              <div key={r.label} className="mb-2 flex items-center gap-3 text-[13px] last:mb-0">
                <span className="w-12 text-body">{r.label}</span>
                <span className="h-2 flex-1 rounded-full bg-sand">
                  <span className={cn("block h-2 rounded-full", r.c)} style={{ width: `${r.v}%` }} />
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="eyebrow mb-3 text-center">{eyebrow}</p>
        <h2 className="mx-auto mb-12 max-w-2xl text-center text-[32px] leading-tight font-semibold tracking-tight text-balance text-ink sm:text-[44px]">
          {title}
        </h2>
        {children}
      </div>
    </section>
  );
}

function Privacy() {
  const points = [
    { title: "No account", body: "Nothing to sign up for. Open it and start." },
    { title: "No database", body: "Finlio has no server copy of your money. Your browser is the only place it lives." },
    { title: "No selling", body: "No ads, no tracking, no data sold. Ever." },
  ];
  return (
    <section id="privacy" className="scroll-mt-20 px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-6xl rounded-[32px] bg-ink px-6 py-14 text-cream sm:px-12 dark:border dark:border-line dark:bg-card dark:text-ink sm:py-20">
        <ShieldCheck className="mb-6 size-10" strokeWidth={1.5} />
        <h2 className="max-w-2xl text-[32px] leading-tight font-semibold tracking-tight text-balance sm:text-[44px]">
          Your money is your business. Not ours.
        </h2>
        <p className="mt-4 max-w-xl text-[16px] leading-relaxed opacity-70">
          Quantities, balances and transactions never leave your device for prices or news. Your gains and net
          worth are worked out right here.
        </p>
        <ul className="mt-10 grid gap-6 *:min-w-0 sm:grid-cols-3">
          {points.map((p) => (
            <li key={p.title} className="border-t border-cream/20 pt-5 dark:border-line">
              <p className="text-[16px] font-semibold">{p.title}</p>
              <p className="mt-1.5 text-[14px] leading-relaxed opacity-70">{p.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="px-4 py-20 text-center sm:px-6 sm:py-28">
      <Mark className="mx-auto mb-6 size-14" />
      <h2 className="mx-auto max-w-2xl text-[36px] leading-tight font-semibold tracking-tight text-balance text-ink sm:text-[52px]">
        Understand your money in two minutes a day.
      </h2>
      <div className="mt-9 flex justify-center">
        <PrimaryLink href="/dashboard">Get started free</PrimaryLink>
      </div>
      <p className="mt-4 text-[13px] text-muted-foreground">Try it with sample data. No sign-up.</p>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-[13px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>Finlio explains; it never advises. Not a licensed financial advisor.</p>
        <nav className="flex gap-5">
          <Link href="/terms" className="hover:text-ink">Terms</Link>
          <a href={REPO} target="_blank" rel="noreferrer" className="hover:text-ink">GitHub</a>
          <a href="https://learn-ai-basics.devpost.com" target="_blank" rel="noreferrer" className="hover:text-ink">
            Devpost
          </a>
        </nav>
      </div>
    </footer>
  );
}
