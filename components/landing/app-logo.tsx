"use client";

import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import { useLogos } from "@/components/brand-logo";
import { cn } from "@/lib/utils";

// An app's logo from public/logos (carried over from finlio.app), or a generic
// icon when "Show company logos" is off, e.g. while recording the demo video.
export function AppLogo({
  file,
  label,
  icon: Icon,
  tint,
  className,
}: {
  file: string;
  label: string;
  icon: LucideIcon;
  tint: string;
  className?: string;
}) {
  const on = useLogos();
  if (!on) {
    return (
      <span className={cn("flex items-center justify-center rounded-[23%]", tint, className)}>
        <Icon className="size-[50%]" strokeWidth={1.75} />
      </span>
    );
  }
  return (
    <Image
      src={`/logos/${file}.png`}
      alt={label}
      title={label}
      width={96}
      height={96}
      className={cn("rounded-[23%] outline-1 -outline-offset-1 outline-black/10", className)}
    />
  );
}
