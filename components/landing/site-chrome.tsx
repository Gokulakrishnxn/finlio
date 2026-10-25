"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Menu, Volume2, X } from "lucide-react";
import { CookiePreferencesButton } from "@/components/landing/cookie-notice";
import { cn } from "@/lib/utils";

export function LandingBrand() {
  return (
    <Link href="/" aria-label="Finlio home" className="inline-flex items-center gap-1 rounded-lg">
      <Image src="/finlio-mark.png" alt="" width={40} height={40} className="size-8 mix-blend-multiply" priority />
      <span className="text-[18px] font-semibold tracking-tight">Finlio</span>
    </Link>
  );
}

export function LandingHeader() {
  const [floating, setFloating] = useState(false);
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setFloating(window.scrollY > 48);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onPointer = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, []);

  return (
    <header ref={headerRef} className="fixed inset-x-0 top-0 z-40 px-3 pt-3 sm:px-6">
      <div className={cn(
        "relative mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 rounded-full border border-transparent px-3 transition-[background-color,box-shadow,border-color] duration-300 sm:h-16 sm:px-5",
        (floating || open) && "border-line bg-card/95 shadow-[0_8px_30px_-18px_rgba(0,0,0,0.3)] backdrop-blur-xl",
      )}>
        <LandingBrand />
        <nav aria-label="Main navigation" className="hidden items-center gap-7 text-[14px] font-medium text-body md:flex">
          <Link href="/#how" className="py-2 hover:text-ink">How it works</Link>
          <Link href="/#faqs" className="py-2 hover:text-ink">FAQs</Link>
        </nav>
        <div className="flex items-center gap-3 sm:gap-5">
          <Link href="/sign-in" className="py-2 text-[13px] font-medium hover:underline sm:text-[14px]">Sign in</Link>
          <Link href="/sign-up" className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-4 text-[13px] font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-85 sm:h-10 sm:text-[14px]">
            Get started <ArrowRight className="hidden size-3.5 sm:block" strokeWidth={1.75} />
          </Link>
          <button
            type="button"
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            aria-controls="landing-navigation"
            onClick={() => setOpen(!open)}
            className="flex size-8 items-center justify-center rounded-full hover:bg-sand md:hidden"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
        {open && (
          <nav id="landing-navigation" aria-label="Mobile navigation" className="absolute inset-x-0 top-[calc(100%+8px)] flex flex-col gap-1 rounded-2xl border border-line bg-card p-3 shadow-lg md:hidden">
            <Link href="/#how" onClick={() => setOpen(false)} className="rounded-xl px-4 py-3 text-[14px] hover:bg-sand">How it works</Link>
            <Link href="/#faqs" onClick={() => setOpen(false)} className="rounded-xl px-4 py-3 text-[14px] hover:bg-sand">Frequently asked questions</Link>
            <Link href="/cookies" onClick={() => setOpen(false)} className="rounded-xl px-4 py-3 text-[14px] hover:bg-sand">Cookies & local storage</Link>
          </nav>
        )}
      </div>
    </header>
  );
}

export function PronounceButton() {
  const player = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const audio = new Audio("/audio/finlio-pronunciation.m4a");
    audio.onended = () => setPlaying(false);
    player.current = audio;
    return () => audio.pause();
  }, []);

  async function play() {
    const audio = player.current;
    if (!audio) return;
    audio.currentTime = 0;
    setError(false);
    try {
      await audio.play();
      setPlaying(true);
    } catch {
      setError(true);
      setPlaying(false);
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button onClick={play} type="button" aria-label="Hear how to say Finlio" className="inline-flex items-center gap-1.5 rounded-lg py-1 text-[13px] text-muted-foreground hover:text-ink">
        /fin·lee·oh/ <Volume2 className={cn("size-3.5", playing && "text-info")} strokeWidth={1.75} />
      </button>
      {error && <span role="status" className="text-[12px] text-muted-foreground">Say “fin-lee-oh”.</span>}
    </span>
  );
}

export function LandingFooter() {
  return (
    <footer className="bg-cream px-4 pt-4 pb-10 sm:px-6 sm:pb-14">
      <div className="mx-auto max-w-6xl rounded-3xl border border-line bg-card p-6 sm:p-9">
        <div className="grid grid-cols-2 gap-x-6 gap-y-9 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="col-span-2 flex flex-col items-start md:col-span-1">
            <LandingBrand />
            <PronounceButton />
            <p className="mt-3 max-w-[24ch] text-[14px] leading-relaxed text-body">Your money should be easier to understand.</p>
            <p className="mt-4 flex items-center gap-2 text-[13px] font-medium"><span className="size-2 rounded-full bg-gain" />Free and open source</p>
          </div>
          <nav aria-label="Product links">
            <p className="eyebrow">Product</p>
            <ul className="mt-3 space-y-3 text-[14px] text-body">
              <li><Link href="/#how" className="hover:underline">How it works</Link></li>
              <li><Link href="/#faqs" className="hover:underline">FAQs</Link></li>
              <li><Link href="/sign-up" className="hover:underline">Get started</Link></li>
              <li><Link href="/sign-in" className="hover:underline">Sign in</Link></li>
            </ul>
          </nav>
          <nav aria-label="Privacy and more">
            <p className="eyebrow">Privacy & more</p>
            <ul className="mt-3 space-y-3 text-[14px] text-body">
              <li><Link href="/terms" className="hover:underline">Terms & privacy</Link></li>
              <li><Link href="/cookies" className="hover:underline">Cookies & storage</Link></li>
              <li><CookiePreferencesButton className="text-left hover:underline" /></li>
              <li><a href="https://github.com/Gokulakrishnxn/finlio" target="_blank" rel="noreferrer" className="hover:underline">Source code ↗</a></li>
            </ul>
          </nav>
        </div>
        <p className="mt-9 border-t border-line pt-5 text-[12px] leading-relaxed text-muted-foreground">© 2026 Finlio. Information and education, not investment advice. Company names and logos belong to their owners; no affiliation is implied.</p>
      </div>
    </footer>
  );
}
