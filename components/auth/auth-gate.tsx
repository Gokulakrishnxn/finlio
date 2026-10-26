"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useDemoMode } from "@/lib/demo-data";
import { useStore } from "@/lib/store";

// The proxy already sends people without a sign-in cookie to /sign-in. This
// checks the cookie is still valid, then sends new people to set-up first.
export function AuthGate({ children }: { children: React.ReactNode }) {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const { ready, profile } = useStore();
  const pathname = usePathname();
  const router = useRouter();
  const demo = useDemoMode();
  // Demo mode skips the sign-in check so a recording starts in the app.
  const publicPage = pathname === "/terms" || demo;

  useEffect(() => {
    // Read straight from the page: on the first render after loading,
    // useDemoMode still reports the server's answer (off).
    if (publicPage || document.documentElement.hasAttribute("data-demo")) return;
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then(async (s: { signedIn: boolean }) => {
        // An expired or unreadable cookie: clear it so the proxy stops sending
        // the person back here, then sign in again.
        if (!s.signedIn) {
          await fetch("/api/auth/signout", { method: "POST" }).catch(() => undefined);
          router.replace(`/sign-in?next=${encodeURIComponent(pathname)}`);
        }
        setSignedIn(s.signedIn);
      })
      .catch(() => setSignedIn(true)); // offline: the browser data still opens
  }, [publicPage, pathname, router]);

  const needsSetup = ready && !profile?.onboardedAt;
  useEffect(() => {
    if (pathname !== "/terms" && (signedIn || demo) && needsSetup) router.replace("/setup");
  }, [pathname, signedIn, demo, needsSetup, router]);

  if (pathname !== "/terms" && ((!signedIn && !demo) || !ready || needsSetup)) {
    return (
      <div className="flex min-h-svh items-center justify-center gap-2 bg-card text-[14px] text-muted-foreground" role="status">
        <Loader2 className="size-4 animate-spin" />
        Opening Finlio…
      </div>
    );
  }
  return children;
}
