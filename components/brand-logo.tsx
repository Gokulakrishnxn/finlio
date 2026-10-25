"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { LOGOS_EVENT, logosOn } from "@/lib/ui-prefs";

// Tracks the "Show company logos" preference.
export function useLogos() {
  const [on, setOn] = useState(true);
  useEffect(() => {
    const read = () => setOn(logosOn());
    read();
    window.addEventListener(LOGOS_EVENT, read);
    return () => window.removeEventListener(LOGOS_EVENT, read);
  }, []);
  return on;
}

// A company's logo on a white tile, or the fallback badge when there's no good
// logo, logos are turned off, or the image fails to load.
export function BrandLogo({
  domain,
  fallback,
  className,
}: {
  domain?: string;
  fallback: React.ReactNode;
  className?: string;
}) {
  const on = useLogos();
  const [failed, setFailed] = useState<string | null>(null);
  if (!domain || !on || failed === domain) return <>{fallback}</>;
  return (
    <span
      className={cn(
        "flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-line",
        className,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/api/logo?d=${encodeURIComponent(domain)}`}
        alt=""
        loading="lazy"
        onError={() => setFailed(domain)}
        className="size-[70%] object-contain"
      />
    </span>
  );
}

export function IconBadge({
  icon: Icon,
  tint,
  className,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  tint: string;
  className?: string;
}) {
  return (
    <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", tint, className)}>
      <Icon className="size-[18px]" strokeWidth={1.75} />
    </span>
  );
}
