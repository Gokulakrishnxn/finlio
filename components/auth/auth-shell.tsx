import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowLeft, Newspaper } from "lucide-react";

// Sign-in and sign-up: the card on the left, a glimpse of the brief on the right.
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh bg-card text-ink">
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-4 px-5 py-6 sm:px-10 sm:py-8">
          <Link href="/" aria-label="Finlio home" className="flex items-center gap-1.5 rounded-lg">
            <Image src="/finlio-mark.png" alt="" width={64} height={64} priority className="size-8 mix-blend-multiply" />
            <span className="text-xl font-semibold tracking-tight">Finlio</span>
          </Link>
          <Link href="/" className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-[13px] text-body hover:bg-sand">
            <ArrowLeft className="size-3.5" strokeWidth={1.75} aria-hidden />
            Home
          </Link>
        </header>
        <main className="flex flex-1 items-center justify-center px-5 py-8 sm:px-10">
          <div className="w-full max-w-[400px]">{children}</div>
        </main>
        <footer className="flex flex-wrap items-center justify-between gap-3 px-5 py-6 text-[12px] text-muted-foreground sm:px-10">
          <p>Finlio explains. It doesn&apos;t advise.</p>
          <Link href="/terms" className="hover:text-ink">
            Terms &amp; privacy
          </Link>
        </footer>
      </div>

      <aside className="hidden w-[46%] max-w-[680px] p-3 lg:block">
        <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-[32px] bg-sand p-12">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-[radial-gradient(circle,var(--info-soft),transparent_70%)]"
          />
          <div className="relative">
            <p className="text-[12px] font-semibold tracking-[0.16em] text-info uppercase">Finlio Daily</p>
            <h2 className="mt-3 max-w-md text-[44px] leading-[1.05] font-medium tracking-[-0.04em] text-balance">
              Know why your money moved.
            </h2>
            <p className="mt-4 max-w-sm text-[16px] leading-relaxed text-body">
              Every morning, the news about what you own, explained in plain words.
            </p>
          </div>

          <div className="relative mt-10 max-w-md rounded-3xl bg-card p-6 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.25)] ring-1 ring-line">
            <p className="text-[13px] font-medium text-muted-foreground">Today&apos;s brief · 7:30 am</p>
            <div className="mt-4 rounded-2xl bg-cream p-4 ring-1 ring-line">
              <p className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.05em] text-muted-foreground uppercase">
                <Newspaper className="size-3.5" aria-hidden />
                The headline
              </p>
              <p className="mt-2 text-[14px] leading-normal text-body">
                &ldquo;Q2 net profit up 8.3% YoY, beats street estimates on robust BFSI demand.&rdquo;
              </p>
            </div>
            <div className="flex justify-center py-1.5">
              <span className="flex size-7 items-center justify-center rounded-full bg-card ring-1 ring-line">
                <ArrowDown className="size-3.5 text-muted-foreground" aria-hidden />
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
              <p className="mt-2 text-[15px] leading-normal font-medium">
                Your largest stock earned more than expected last quarter. That&apos;s why it rose 1.8% today.
              </p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
