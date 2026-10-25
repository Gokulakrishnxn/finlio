"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, CircleAlert, Loader2, ShieldCheck } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { GoogleG } from "@/components/auth/google-g";
import { sound } from "@/lib/sound";

const ERRORS: Record<string, string> = {
  denied: "Google sign-in was cancelled. Try again whenever you're ready.",
  failed: "Google sign-in didn't work. Please try again.",
  "not-configured": "Google sign-in isn't set up on this copy of Finlio.",
};

// Only same-site paths, so a link can't bounce the sign-in to another website.
function safeNext(next: string | null) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
}

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const signup = mode === "sign-up";
  const params = useSearchParams();
  const router = useRouter();
  const next = safeNext(params.get("next"));
  const error = ERRORS[params.get("error") ?? ""];
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((s: { configured: boolean }) => setConfigured(s.configured))
      .catch(() => setConfigured(true));
  }, []);

  // Only when this copy has no Google keys, e.g. a fresh clone of the repo.
  async function openLocally() {
    setLeaving(true);
    const res = await fetch("/api/auth/local", { method: "POST" }).catch(() => null);
    if (res?.ok) {
      sound("success");
      router.replace(next);
    } else {
      setLeaving(false);
    }
  }

  return (
    <AuthShell>
      <div className="flex flex-col">
        <h1 className="text-[32px] leading-[1.1] font-medium tracking-[-0.035em] sm:text-[36px]">
          {signup ? "Create your account" : "Welcome back"}
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-body">
          {signup
            ? "Start with your Google account. It takes a few seconds."
            : "Sign in to see what changed with your money today."}
        </p>

        {error && (
          <p role="alert" className="mt-6 flex items-start gap-2 rounded-xl bg-danger-soft px-4 py-3 text-[13px] text-loss">
            <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
            {error}
          </p>
        )}

        {configured === false ? (
          <div className="mt-8 rounded-2xl border border-line bg-cream p-5">
            <p className="text-[14px] font-medium">Google sign-in isn&apos;t set up on this copy</p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-body">
              Add <code className="nums text-[12px]">GOOGLE_CLIENT_ID</code>,{" "}
              <code className="nums text-[12px]">GOOGLE_CLIENT_SECRET</code> and{" "}
              <code className="nums text-[12px]">AUTH_SECRET</code> to enable it. Until then you can open Finlio on this
              device only.
            </p>
            <button
              onClick={openLocally}
              disabled={leaving}
              className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary text-[14px] font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
            >
              {leaving ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
              Open Finlio on this device
            </button>
          </div>
        ) : (
          <a
            href={`/api/auth/google?next=${encodeURIComponent(next)}`}
            onClick={() => setLeaving(true)}
            aria-disabled={configured === null || leaving}
            className="mt-8 inline-flex h-12 w-full items-center justify-center gap-3 rounded-full bg-card text-[15px] font-medium text-ink shadow-[0_1px_2px_rgba(0,0,0,0.06)] ring-1 ring-line transition-colors hover:bg-sand aria-disabled:pointer-events-none aria-disabled:opacity-60"
          >
            {leaving ? <Loader2 className="size-[18px] animate-spin" /> : <GoogleG />}
            {signup ? "Sign up with Google" : "Continue with Google"}
          </a>
        )}

        <div className="mt-6 flex gap-3 rounded-2xl border border-line p-4">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
          <p className="text-[13px] leading-relaxed text-body">
            Google shares only your name, email and photo. Your money data stays in this browser, with no Finlio
            database. Gmail is asked for separately, only if you connect Expenses.
          </p>
        </div>

        {signup && (
          <p className="mt-5 text-[12px] leading-relaxed text-muted-foreground">
            By continuing, you agree to Finlio&apos;s{" "}
            <Link href="/terms" className="text-ink underline decoration-line underline-offset-4 hover:decoration-ink">
              Terms &amp; privacy
            </Link>
            . Finlio explains your money; it never tells you what to buy or sell.
          </p>
        )}

        <p className="mt-8 border-t border-line pt-6 text-center text-[14px] text-muted-foreground">
          {signup ? "Already have an account? " : "New to Finlio? "}
          <Link
            href={signup ? "/sign-in" : "/sign-up"}
            className="font-medium text-ink underline decoration-line underline-offset-4 hover:decoration-ink"
          >
            {signup ? "Sign in" : "Create an account"}
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
