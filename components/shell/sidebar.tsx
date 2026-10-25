"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, Lock, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Today", icon: Sun },
  { href: "/holdings", label: "Holdings", icon: Briefcase },
  { href: "/privacy", label: "Privacy", icon: Lock },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen w-[280px] shrink-0 flex-col px-5 py-8">
      <Link href="/" className="flex items-center gap-1.5 px-3">
        <Image
          src="/finlio-mark.png"
          alt=""
          width={1024}
          height={1024}
          className="size-8 mix-blend-multiply"
          priority
        />
        <span className="text-xl font-semibold tracking-tight text-ink">Finlio</span>
      </Link>

      <nav className="mt-10 flex flex-col gap-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] text-body transition-colors hover:bg-line/60",
                active && "bg-line/80 font-medium text-ink",
              )}
            >
              <Icon className="size-[18px]" strokeWidth={1.75} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex items-start gap-2.5 border-t border-line px-3 pt-5 text-[13px] leading-snug text-muted-foreground">
        <Lock className="mt-0.5 size-3.5 shrink-0" strokeWidth={2} />
        Your data stays in this browser.
      </div>
    </aside>
  );
}
