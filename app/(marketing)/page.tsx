import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  Briefcase,
  ChartLine,
  ChevronRight,
  Landmark,
  Newspaper,
  PiggyBank,
  Plus,
  Rss,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { HeroDecor, HeroDecorMobile } from "@/components/landing/hero-decor";
import { RotatingWord } from "@/components/landing/rotating-word";
import { cn } from "@/lib/utils";

const REPO = "https://github.com/Gokulakrishnxn/finlio";

const FAQ = [
  {
    q: "What is Finlio?",
    a: "A free web app that explains your money in plain English. Tell it what you own, and each day it reads the news about those stocks and tells you what changed and why. It also adds up your bank accounts, property, gold and loans into one net worth, and shows where your spending goes.",
  },
  {
    q: "How is this different from a news app?",
    a: "A news app shows everyone the same headlines. Finlio reads only the news about what you own, and says what it means for you, in short, simple sentences with a link to every source.",
  },
  {
    q: "Will Finlio tell me what to buy or sell?",
    a: "No. Finlio explains what happened and why. It never says buy, sell or hold, and it isn't a licensed financial advisor. The decisions stay yours.",
  },
  {
    q: "Does it work outside India?",
    a: "Yes. Finlio works for India and the United States: rupees or dollars, Indian or US stocks, financial-year or calendar quarters, and the account types each country uses.",
  },
  {
    q: "Where is my data kept?",
    a: "In your browser, on your device. There's no Finlio account and no Finlio database. Only stock names and symbols are sent to fetch prices and news, never your quantities or balances.",
  },
  {
    q: "Do I have to link my bank or broker?",
    a: "No. Add stocks by name or import a CSV, and add accounts by hand. Connecting Gmail to read bank and card alerts is optional and read-only.",
  },
  {
    q: "Is Finlio free?",
    a: "Yes. Finlio is free and open source under the MIT licence.",
  },
];

export default function Landing() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Story />
        <Faq />
        <Closing />
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

function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 bg-card/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-1.5">
          <Mark className="size-7" />
          <span className="text-[17px] font-semibold tracking-tight text-ink">Finlio</span>
        </Link>
        <nav className="hidden items-center gap-8 text-[14px] text-body sm:flex">
          <a href="#how" className="transition-colors hover:text-ink">
            How it works
          </a>
          <a href="#faqs" className="transition-colors hover:text-ink">
            FAQs
          </a>
        </nav>
        <Link
          href="/dashboard"
          className="inline-flex h-9 items-center rounded-full bg-ink px-4 text-[14px] font-medium text-cream transition-opacity hover:opacity-90"
        >
          Open Finlio
        </Link>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <HeroDecor />
      <div className="relative z-10 mx-auto max-w-3xl px-4 pt-32 pb-20 text-center sm:px-6 sm:pt-40 sm:pb-28 lg:pb-32">
        <Link
          href="/dashboard"
          className="group land-rise mb-7 inline-flex items-center gap-2 rounded-full bg-card py-1.5 pr-3 pl-2.5 text-[13px] font-medium text-body ring-1 ring-line transition-colors hover:text-ink"
        >
          <span className="relative flex size-2">
            <span className="absolute inset-0 animate-ping rounded-full bg-success opacity-60" />
            <span className="relative size-2 rounded-full bg-success" />
          </span>
          Free for India 🇮🇳 and the United States 🇺🇸
          <ChevronRight className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        </Link>
        <h1
          className="land-rise text-[clamp(2.75rem,9vw,4.5rem)] leading-[1.08] font-medium tracking-[-0.04em] text-balance text-ink"
          style={{ animationDelay: "100ms" }}
        >
          Know why your money <RotatingWord />.
        </h1>
        <p
          className="land-rise mx-auto mt-6 max-w-lg text-[16px] leading-[1.55] font-medium tracking-[-0.01em] text-pretty text-body sm:text-[17px]"
          style={{ animationDelay: "200ms" }}
        >
          Every morning, Finlio tells you in simple words why the stocks you own went up or down, and adds up
          everything else you own into one honest number.
        </p>
        <div
          className="land-rise mt-9 flex flex-wrap items-center justify-center gap-3"
          style={{ animationDelay: "300ms" }}
        >
          <Link
            href="/dashboard"
            className="group inline-flex h-12 items-center gap-2 rounded-full bg-ink px-6 text-[15px] font-medium text-cream transition-opacity hover:opacity-90"
          >
            Open Finlio
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <a
            href="#how"
            className="inline-flex h-12 items-center rounded-full bg-sand px-6 text-[15px] font-medium text-ink ring-1 ring-line transition-colors hover:bg-muted"
          >
            How it works
          </a>
        </div>
        <p className="land-rise mt-4 text-[13px] text-muted-foreground" style={{ animationDelay: "400ms" }}>
          No sign-up. Try it with sample data.
        </p>
        <HeroDecorMobile />
      </div>
    </section>
  );
}

// Splits a sentence into words that sharpen one by one as you scroll.
function Words({ children }: { children: string }) {
  return children
    .trim()
    .split(/\s+/)
    .map((word, i) => (
      <span key={i} className="land-word">
        {word}{" "}
      </span>
    ));
}

function Icons({ items }: { items: { icon: LucideIcon; tint: string }[] }) {
  return (
    <span aria-hidden className="ml-1.5 inline-flex translate-y-[-3px] gap-1 align-middle sm:ml-2.5 sm:gap-1.5">
      {items.map(({ icon: Icon, tint }, i) => (
        <span
          key={i}
          className={cn("land-word inline-flex size-7 items-center justify-center rounded-lg sm:size-8", tint)}
        >
          <Icon className="size-4" strokeWidth={1.75} />
        </span>
      ))}
    </span>
  );
}

function Story() {
  return (
    <section id="how" className="scroll-mt-16 bg-cream">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)] lg:gap-16 lg:py-32">
        <div>
          <div className="lg:sticky lg:top-28">
            <p className="text-[12px] font-semibold tracking-[0.16em] text-info uppercase">How it works</p>
            <h2 className="mt-2 text-[28px] leading-[1.1] font-medium tracking-[-0.03em] text-ink">
              Why Finlio exists
            </h2>
            <p className="mt-3 hidden max-w-[16rem] text-[14px] leading-normal text-body/70 sm:block">
              For everyone who has ever opened their portfolio and wondered why.
            </p>
          </div>
        </div>

        <div className="space-y-6 text-[22px] leading-[1.35] font-medium tracking-[-0.02em] text-ink sm:space-y-8 sm:text-2xl lg:text-3xl lg:leading-[1.3]">
          <p>
            <Words>It starts with one simple problem.</Words>
          </p>
          <div className="space-y-3">
            <p>
              <Words>Your stocks sit in one app.</Words>
              <Icons
                items={[
                  { icon: ChartLine, tint: "bg-info text-white" },
                  { icon: Briefcase, tint: "bg-purple text-white" },
                ]}
              />
            </p>
            <p>
              <Words>Your savings sit in another.</Words>
              <Icons
                items={[
                  { icon: Landmark, tint: "bg-success text-white" },
                  { icon: PiggyBank, tint: "bg-warning text-white" },
                ]}
              />
            </p>
            <p>
              <Words>And the news is somewhere else.</Words>
              <Icons
                items={[
                  { icon: Newspaper, tint: "bg-ink text-cream" },
                  { icon: Rss, tint: "bg-loss text-white" },
                ]}
              />
            </p>
          </div>
          <p>
            <Words>
              One morning your money goes down. You don&apos;t know why. You read the headlines. You ask a friend.
              You&apos;re still confused.
            </Words>
          </p>
          <p>
            <Words>So Finlio reads only the news about the stocks you own. Nothing else.</Words>
          </p>
          <p>
            <Words>
              Then it tells you what changed, what&apos;s coming up, and what deserves your attention. In short, easy
              sentences, with a link to every source.
            </Words>
          </p>
          <p>
            <Words>
              Your money is more than your stocks, so Finlio holds the whole picture too. Your bank, your gold, your
              home, your loans. One honest number for what you&apos;re worth.
            </Words>
          </p>
          <p>
            <Words>It shows where your money goes each month, and answers your questions about it whenever you ask.</Words>
          </p>
          <p>
            <Words>It explains. It never tells you what to buy or sell. And everything stays on your device.</Words>
            <Icons items={[{ icon: Wallet, tint: "bg-success text-white" }]} />
          </p>
        </div>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section id="faqs" className="scroll-mt-16">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:gap-16 lg:py-32">
        <div className="land-reveal">
          <p className="text-[14px] font-semibold text-warning">FAQs</p>
          <h2 className="mt-3 text-[clamp(1.75rem,5.5vw,2.75rem)] leading-[1.1] font-medium tracking-[-0.04em] text-balance text-ink">
            Frequently asked questions
          </h2>
        </div>
        <div className="land-reveal min-w-0 divide-y divide-line border-y border-line">
          {FAQ.map((f, i) => (
            <details key={f.q} open={i === 0} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[16px] font-medium text-ink sm:text-[17px] [&::-webkit-details-marker]:hidden">
                {f.q}
                <Plus className="size-4 shrink-0 text-warning transition-transform duration-300 group-open:rotate-45" />
              </summary>
              <p className="mt-3 max-w-xl pr-8 text-[15px] leading-relaxed text-body">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function Closing() {
  return (
    <section className="bg-cream">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 sm:py-24 md:grid-cols-2 lg:gap-16 lg:py-28">
        <div className="land-reveal">
          <p className="text-[14px] font-semibold text-success">Get started</p>
          <h2 className="mt-3 text-[clamp(1.75rem,5.5vw,2.75rem)] leading-[1.1] font-medium tracking-[-0.04em] text-balance text-ink">
            Stop guessing.
            <br />
            Start knowing.
          </h2>
          <p className="mt-5 max-w-md text-[16px] leading-[1.55] font-medium text-pretty text-body sm:text-[17px]">
            Add the stocks you own and get your first brief in a minute. Free, private, and in simple words.
          </p>
          <Link
            href="/dashboard"
            className="group mt-6 inline-flex min-h-11 items-center gap-2 text-[17px] font-medium text-info transition-opacity hover:opacity-80"
          >
            Open Finlio
            <ArrowRight className="size-[18px] transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        <BriefCompare />
      </div>
    </section>
  );
}

// The same news, twice: the headline, and what Finlio makes of it.
function BriefCompare() {
  return (
    <div className="land-reveal mx-auto w-full max-w-md rounded-3xl bg-card p-6 ring-1 ring-line sm:p-7">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[13px] font-medium text-muted-foreground">Today&apos;s brief · 7:30 am</p>
        <span className="rounded-full bg-cream px-2.5 py-1 text-[11px] font-semibold tracking-[0.05em] text-muted-foreground uppercase ring-1 ring-line">
          Example
        </span>
      </div>
      <div className="mt-5 rounded-2xl bg-cream p-4 ring-1 ring-line">
        <p className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.05em] text-muted-foreground uppercase">
          <Newspaper className="size-3.5" />
          What you read elsewhere
        </p>
        <p className="mt-2 text-[14px] leading-normal text-body">
          &ldquo;Q2 net profit up 8.3% YoY, beats street estimates on robust BFSI demand; margins expand 60 bps.&rdquo;
        </p>
      </div>
      <div className="flex justify-center py-1.5">
        <span className="flex size-7 items-center justify-center rounded-full bg-card ring-1 ring-line">
          <ArrowDown className="size-3.5 text-muted-foreground" />
        </span>
      </div>
      <div className="rounded-2xl bg-success-soft/60 p-4 ring-1 ring-success/25">
        <div className="flex items-center justify-between gap-2">
          <p className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.05em] text-success uppercase">
            <span className="size-1.5 rounded-full bg-success" />
            What Finlio tells you
          </p>
          <span className="nums rounded-full bg-success/10 px-2 py-0.5 text-[12px] font-semibold text-success">
            +1.8%
          </span>
        </div>
        <p className="mt-2 text-[15px] leading-normal font-medium text-ink">
          Your largest stock earned more than expected last quarter, mostly from banking clients. That&apos;s why it
          rose 1.8% today.
        </p>
      </div>
    </div>
  );
}

function Footer() {
  const product = [
    { label: "How it works", href: "#how" },
    { label: "FAQs", href: "#faqs" },
    { label: "Open Finlio", href: "/dashboard" },
  ];
  const more = [
    { label: "Terms", href: "/terms" },
    { label: "GitHub", href: REPO },
    { label: "Devpost", href: "https://learn-ai-basics.devpost.com" },
  ];
  return (
    <footer className="bg-cream px-4 pb-4 sm:px-6 sm:pb-6">
      <div className="mx-auto max-w-6xl rounded-3xl bg-card p-6 ring-1 ring-line sm:p-10">
        <div className="grid gap-10 sm:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Link href="/" className="flex items-center gap-1.5">
              <Mark className="size-7" />
              <span className="text-[17px] font-semibold tracking-tight text-ink">Finlio</span>
            </Link>
            <p className="mt-4 max-w-xs text-[15px] leading-relaxed text-body">
              Know why your money moved, in plain English.
            </p>
            <p className="mt-4 flex items-center gap-2 text-[14px] font-medium text-ink">
              <span className="size-2 rounded-full bg-success" />
              Free and open source
            </p>
          </div>
          <FooterLinks title="Product" links={product} />
          <FooterLinks title="More" links={more} />
        </div>
        <p className="mt-10 border-t border-line pt-6 text-[13px] text-muted-foreground">
          © 2026 Finlio. Information and education, not investment advice.
        </p>
      </div>
    </footer>
  );
}

function FooterLinks({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <p className="text-[12px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">{title}</p>
      <ul className="mt-4 flex flex-col gap-3">
        {links.map((l) => (
          <li key={l.label}>
            {l.href.startsWith("http") ? (
              <a href={l.href} target="_blank" rel="noreferrer" className="text-[15px] text-body hover:text-ink">
                {l.label}
              </a>
            ) : (
              <Link href={l.href} className="text-[15px] text-body hover:text-ink">
                {l.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
