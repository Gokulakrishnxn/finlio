"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useStore } from "@/lib/store";

// The proxy already sends people without a sign-in cookie to /sign-in. This
// checks the cookie is still valid, then sends new people to set-up first.
export function AuthGate({ children }: { children: React.ReactNode }) {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const { ready, profile } = useStore();
  const pathname = usePathname();
  const router = useRouter();
  const publicPage = pathname === "/terms";

  useEffect(() => {
    if (publicPage) return;
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
    if (!publicPage && signedIn && needsSetup) router.replace("/setup");
  }, [publicPage, signedIn, needsSetup, router]);

  if (!publicPage && (!signedIn || !ready || needsSetup)) {
    return (
      <div className="flex min-h-svh items-center justify-center gap-2 bg-card text-[14px] text-muted-foreground" role="status">
        <Loader2 className="size-4 animate-spin" />
        Opening Finlio…
      </div>
    );
  }
  return children;
}
