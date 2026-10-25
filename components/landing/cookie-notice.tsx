"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { ArrowUpRight, Cookie, HardDrive, LockKeyhole, X } from "lucide-react";
import {
  acknowledgeCookieNotice,
  COOKIE_NOTICE_OPEN,
  hasAcknowledgedCookieNotice,
  serverCookieNoticeSnapshot,
  subscribeCookieNotice,
} from "@/lib/cookie-notice";
import { cn } from "@/lib/utils";

const focus = "outline-none focus-visible:ring-2 focus-visible:ring-[#3775cc] focus-visible:ring-offset-2";

export function CookiePreferencesButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      className={cn("rounded-sm text-left", focus, className)}
      onClick={() => window.dispatchEvent(new Event(COOKIE_NOTICE_OPEN))}
    >
      Cookie preferences
    </button>
  );
}

export function CookieNotice() {
  const acknowledged = useSyncExternalStore(
    subscribeCookieNotice,
    hasAcknowledgedCookieNotice,
    serverCookieNoticeSnapshot,
  );
  const [appeared, setAppeared] = useState(false);
  const [forcedOpen, setForcedOpen] = useState(false);
  const [details, setDetails] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();
  const detailsId = useId();
  const open = forcedOpen || (appeared && !acknowledged);

  useEffect(() => {
    const timer = window.setTimeout(() => setAppeared(true), 700);
    const onOpen = () => {
      openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setDetails(true);
      setForcedOpen(true);
      // The card may already be open when its footer link is selected again.
      cardRef.current?.focus();
    };
    window.addEventListener(COOKIE_NOTICE_OPEN, onOpen);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(COOKIE_NOTICE_OPEN, onOpen);
    };
  }, []);

  useEffect(() => {
    if (forcedOpen) cardRef.current?.focus();
  }, [forcedOpen]);

  function dismiss() {
    acknowledgeCookieNotice();
    setForcedOpen(false);
    setDetails(false);
    if (openerRef.current?.isConnected) openerRef.current.focus();
    openerRef.current = null;
  }

  if (!open) return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-[60] sm:right-6 sm:bottom-6 sm:left-auto sm:w-[410px]" style={{ paddingBottom: "env(safe-area-inset-bottom)", colorScheme: "light" }}>
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="false"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.stopPropagation();
            dismiss();
          }
        }}
        className="max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-3xl border border-[#e9e7e2] bg-white p-5 text-[#343433] shadow-[0_16px_60px_-20px_rgba(0,0,0,0.22)] outline-none focus-visible:ring-2 focus-visible:ring-[#3775cc] sm:p-6"
      >
        <div className="flex items-center gap-2.5 pr-7">
          <Cookie className="size-5 shrink-0 text-[#9a6818]" strokeWidth={1.75} aria-hidden />
          <h2 id={titleId} className="text-[16px] font-semibold tracking-tight">Cookies & local storage</h2>
        </div>
        <button
          type="button"
          aria-label="Dismiss cookie notice"
          onClick={dismiss}
          className={cn("absolute top-4 right-4 rounded-full p-2 text-[#716f6b] transition-colors hover:bg-[#f6f4ef] hover:text-[#343433]", focus)}
        >
          <X className="size-4" strokeWidth={1.75} />
        </button>
        <p id={descriptionId} className="mt-3 text-[14px] leading-[1.6] text-[#5d5b56]">
          Finlio saves your money data and preferences in this browser. There are no advertising or analytics trackers. Google sign-in uses a secure session cookie.
        </p>

        {details && (
          <div id={detailsId} className="mt-4 space-y-4 rounded-2xl bg-[#f6f4ef] p-4 text-[13px] leading-relaxed">
            <StorageDetail icon={HardDrive} title="On your device">
              Holdings, balances, entries and preferences stay in browser storage until you clear them. This notice remembers that you have seen it.
            </StorageDetail>
            <StorageDetail icon={LockKeyhole} title="Google sign-in">
              A secure sign-in check lasts 10 minutes. The encrypted Google session cookie lasts up to 30 days and cannot be read by page scripts.
            </StorageDetail>
            <Link href="/cookies" className={cn("inline-flex items-center gap-1 rounded-sm font-medium text-[#285e9e] underline underline-offset-3", focus)}>
              Read the storage details <ArrowUpRight className="size-3.5" aria-hidden />
            </Link>
          </div>
        )}

        <div className="mt-5 grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={dismiss}
            className={cn("min-h-11 rounded-full bg-[#272727] px-4 text-[14px] font-medium text-white transition-colors hover:bg-[#414141] active:scale-[0.98]", focus)}
          >
            Got it
          </button>
          <button
            type="button"
            aria-expanded={details}
            aria-controls={detailsId}
            onClick={() => setDetails((value) => !value)}
            className={cn("min-h-11 rounded-full border border-[#d8d5ce] bg-white px-4 text-[14px] font-medium text-[#343433] transition-colors hover:bg-[#f6f4ef] active:scale-[0.98]", focus)}
          >
            {details ? "Less detail" : "View details"}
          </button>
        </div>
      </div>
    </div>
  );
}

function StorageDetail({ icon: Icon, title, children }: {
  icon: typeof HardDrive;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 size-4 shrink-0 text-[#716f6b]" strokeWidth={1.75} aria-hidden />
      <div>
        <h3 className="font-semibold text-[#343433]">{title}</h3>
        <p className="mt-0.5 text-[#68655f]">{children}</p>
      </div>
    </div>
  );
}
