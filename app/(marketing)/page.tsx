import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  ChevronRight,
  Newspaper,
  Plus,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { AppRow, HeroDecor, HeroDecorMobile } from "@/components/landing/hero-decor";
import { RotatingWord } from "@/components/landing/rotating-word";
import { LandingFooter, LandingHeader } from "@/components/landing/site-chrome";
import { cn } from "@/lib/utils";

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
    a: "You sign in with Google, but your financial records are saved in this browser, with no Finlio database. Prices and news use stock identifiers; AI explanations use totals and your questions. If you connect Gmail, bank-alert previews are processed to extract expenses. You can review the full list in Terms & privacy.",
  },
  {
    q: "Do I have to link my bank or broker?",
    a: "No. Add stocks by name or import a CSV, and add accounts by hand. Connecting Gmail to read bank and card alerts is optional and read-only.",
  },
  {
    q: "How do I get started?",
    a: "Choose Get started and sign up with your Google account. Then add your name and country, and start with sample data, a Finlio backup or an empty dashboard.",
  },
  {
    q: "Is Finlio free?",
    a: "Yes. Finlio is free and open source under the MIT licence.",
  },
];

export default function Landing() {
  return (
    <>
      <LandingHeader />
      <main id="main-content">
        <Hero />
        <Story />
        <Faq />
        <Closing />
      </main>
      <LandingFooter />
    </>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <HeroDecor />
      <div className="relative z-10 mx-auto max-w-3xl px-4 pt-32 pb-20 text-center sm:px-6 sm:pt-40 sm:pb-28 lg:pb-32">
        <Link
          href="/sign-up"
          className="group land-rise mb-7 inline-flex items-center gap-2 rounded-full bg-card py-1.5 pr-3 pl-2.5 text-[13px] font-medium text-body ring-1 ring-line transition-colors hover:text-ink"
        >
          <span className="relative flex size-2">
            <span className="absolute inset-0 animate-ping rounded-full bg-success opacity-60" />
            <span className="relative size-2 rounded-full bg-success" />
          </span>
          Finlio Daily · Your money, explained
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
          One clear view of your stocks, savings and spending. See what changed, why it happened,
          and where you stand. All in plain words.
        </p>
        <div
          className="land-rise mt-9 flex flex-wrap items-center justify-center gap-3"
          style={{ animationDelay: "300ms" }}
        >
          <Link
            href="/sign-up"
            className="group inline-flex h-12 items-center gap-2 rounded-full bg-ink px-6 text-[15px] font-medium text-cream transition-opacity hover:opacity-90"
          >
            Get started
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
          Free to explore · Made for India and the United States
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
              <AppRow row="stocks" />
            </p>
            <p>
              <Words>Your funds and savings sit in another.</Words>
              <AppRow row="funds" />
            </p>
            <p>
              <Words>And the news is somewhere else.</Words>
              <AppRow row="news" />
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
            <Words>It explains. It never tells you what to buy or sell. Your financial records are saved in this browser, and you control what you connect.</Words>
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
            Start with a clean dashboard or bring your Finlio backup. Add what you own, see where you stand, and make sense of your money.
          </p>
          <Link
            href="/sign-up"
            className="group mt-6 inline-flex min-h-11 items-center gap-2 text-[17px] font-medium text-info transition-opacity hover:opacity-80"
          >
            Get started
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

