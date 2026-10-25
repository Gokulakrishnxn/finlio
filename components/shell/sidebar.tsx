"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  Landmark,
  LayoutDashboard,
  Lock,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { SoundToggle } from "@/components/sound-toggle";
import { sound } from "@/lib/sound";
import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string; icon: LucideIcon };

const SECTIONS: { title: string; items: NavItem[] }[] = [
  { title: "Overview", items: [{ href: "/", label: "Dashboard", icon: LayoutDashboard }] },
  {
    title: "Money",
    items: [
      { href: "/holdings", label: "Holdings", icon: Briefcase },
      { href: "/expenses", label: "Expenses", icon: Wallet },
      { href: "/assets", label: "Assets & loans", icon: Landmark },
    ],
  },
  { title: "Understand", items: [{ href: "/insights", label: "Insights", icon: Sparkles }] },
  { title: "You", items: [{ href: "/privacy", label: "Privacy", icon: Lock }] },
];

const ALL = SECTIONS.flatMap((s) => s.items);

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-1.5">
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
  );
}

const COLLAPSE_KEY = "finlio:sidebar";

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  // Remember the choice per browser.
  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCollapsed(window.localStorage.getItem(COLLAPSE_KEY) === "1");
    } catch {
      // Storage blocked: start expanded.
    }
  }, []);

  function toggle() {
    const next = !collapsed;
    setCollapsed(next);
    sound(next ? "close" : "open");
    try {
      window.localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
    } catch {
      // Storage blocked: the choice lasts until reload.
    }
  }

  return (
    <aside
      className={cn(
        "sticky top-2 hidden h-[calc(100vh-1rem)] shrink-0 flex-col rounded-3xl border border-line bg-white transition-[width] duration-300 md:flex",
        collapsed ? "w-[76px]" : "w-[248px]",
      )}
    >
      <div className={cn("flex items-center pt-6 pb-5", collapsed ? "flex-col gap-3 px-2" : "justify-between px-5")}>
        {collapsed ? (
          <Link href="/" aria-label="Finlio">
            <Image src="/finlio-mark.png" alt="" width={1024} height={1024} className="size-8 mix-blend-multiply" />
          </Link>
        ) : (
          <Brand />
        )}
        <button
          onClick={toggle}
          aria-label={collapsed ? "Open sidebar" : "Close sidebar"}
          title={collapsed ? "Open sidebar" : "Close sidebar"}
          className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-sand hover:text-ink"
        >
          {collapsed ? <PanelLeftOpen className="size-[18px]" /> : <PanelLeftClose className="size-[18px]" />}
        </button>
      </div>

      <nav className={cn("flex flex-1 flex-col overflow-y-auto", collapsed ? "gap-3 px-3" : "gap-6 px-3")}>
        {SECTIONS.map((section) => (
          <div key={section.title}>
            {collapsed ? (
              <div className="mx-auto mb-2 h-px w-6 bg-line" />
            ) : (
              <p className="eyebrow px-3 pb-2">{section.title}</p>
            )}
            <ul className="flex flex-col gap-0.5">
              {section.items.map(({ href, label, icon: Icon }) => {
                const active = isActive(pathname, href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      title={collapsed ? label : undefined}
                      aria-label={collapsed ? label : undefined}
                      onClick={() => !active && sound("navigate")}
                      className={cn(
                        "relative flex items-center gap-3 rounded-xl py-2 text-[14px] text-body transition-colors hover:bg-sand",
                        collapsed ? "justify-center px-0" : "px-3",
                        active && "bg-[#eef8f1] font-medium text-[#1f7a3a] hover:bg-[#eef8f1]",
                      )}
                    >
                      {active && !collapsed && (
                        <span className="absolute top-2 bottom-2 -left-3 w-[3px] rounded-r-full bg-gain" />
                      )}
                      <Icon className="size-[18px] shrink-0" strokeWidth={1.75} />
                      {!collapsed && label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {collapsed ? (
        <div className="flex justify-center pb-5" title="Private by design: your money data stays in this browser">
          <Lock className="size-4 text-muted-foreground" />
        </div>
      ) : (
        <div className="m-3 rounded-2xl bg-sand p-4">
          <div className="flex items-center gap-2 text-[13px] font-medium text-ink">
            <Lock className="size-3.5" strokeWidth={2} />
            Private by design
          </div>
          <p className="mt-1 text-[12px] leading-snug text-muted-foreground">
            No Finlio account. Your money data stays in this browser.
          </p>
          <div className="mt-2 -ml-1">
            <SoundToggle />
          </div>
        </div>
      )}
    </aside>
  );
}

// Small screens: logo on top, every section as an icon link.
export function MobileNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-line bg-white/90 px-4 py-3 backdrop-blur md:hidden">
      <Brand />
      <nav className="flex gap-0.5">
        {ALL.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            aria-label={label}
            className={cn(
              "flex size-9 items-center justify-center rounded-xl text-body",
              isActive(pathname, href) && "bg-[#eef8f1] text-[#1f7a3a]",
            )}
          >
            <Icon className="size-[18px]" strokeWidth={1.75} />
          </Link>
        ))}
      </nav>
    </header>
  );
}
