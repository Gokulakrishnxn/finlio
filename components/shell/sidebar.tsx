"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  Landmark,
  LayoutDashboard,
  Lock,
  PanelLeftClose,
  MessageCircle,
  PanelLeftOpen,
  Settings2,
  UserRound,
  ChartNoAxesCombined,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { useChatUI } from "@/components/chat/chat-context";
import { useSettings } from "@/components/settings/settings-dialog";
import { SoundToggle } from "@/components/sound-toggle";
import { sound } from "@/lib/sound";
import { useStore } from "@/lib/store";
import { COLLAPSE_KEY, SIDEBAR_EVENT } from "@/lib/ui-prefs";
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
  { title: "Understand", items: [{ href: "/analytics", label: "Analytics", icon: ChartNoAxesCombined }] },
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
        className="size-8 mix-blend-multiply dark:mix-blend-screen dark:invert"
        priority
      />
      <span className="text-xl font-semibold tracking-tight text-ink">Finlio</span>
    </Link>
  );
}



export function Sidebar() {
  const pathname = usePathname();
  const { profile } = useStore();
  const [collapsed, setCollapsed] = useState(false);

  // Remember the choice per browser; Settings can change it too.
  useEffect(() => {
    const read = () => {
      try {
        setCollapsed(window.localStorage.getItem(COLLAPSE_KEY) === "1");
      } catch {
        // Storage blocked: start expanded.
      }
    };
    read();
    window.addEventListener(SIDEBAR_EVENT, read);
    return () => window.removeEventListener(SIDEBAR_EVENT, read);
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
        "sticky top-2 hidden h-[calc(100vh-1rem)] shrink-0 flex-col rounded-3xl border border-line bg-card transition-[width] duration-300 md:flex",
        collapsed ? "w-[76px]" : "w-[248px]",
      )}
    >
      <div className={cn("flex items-center pt-6 pb-5", collapsed ? "flex-col gap-3 px-2" : "justify-between px-5")}>
        {collapsed ? (
          <Link href="/" aria-label="Finlio">
            <Image src="/finlio-mark.png" alt="" width={1024} height={1024} className="size-8 mix-blend-multiply dark:mix-blend-screen dark:invert" />
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

      <nav data-tour="nav" className={cn("flex flex-1 flex-col overflow-y-auto", collapsed ? "gap-3 px-3" : "gap-6 px-3")}>
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
                        active && "bg-success-soft font-medium text-success hover:bg-success-soft dark:bg-muted dark:text-ink dark:hover:bg-muted",
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

      <ProfileChip name={profile?.name} city={profile?.city} collapsed={collapsed} />
    </aside>
  );
}

function Avatar({ name, className }: { name?: string; className?: string }) {
  return (
    <span
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_30%,#7ee29a,#34c759_55%,#1f7a3a)] text-[13px] font-semibold text-[#102b18]",
        className,
      )}
    >
      {(name?.trim()[0] ?? "F").toUpperCase()}
    </span>
  );
}

// Who's using Finlio. Opens a small menu card above it, like ChatGPT's account menu.
function ProfileChip({ name, city, collapsed }: { name?: string; city?: string; collapsed: boolean }) {
  const [menu, setMenu] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { openSettings } = useSettings();
  const { setOpen: setChatOpen } = useChatUI();

  useEffect(() => {
    if (!menu) return;
    const onDown = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setMenu(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [menu]);

  const item = "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-[14px] text-body hover:bg-sand hover:text-ink";
  const pick = (fn: () => void) => () => {
    setMenu(false);
    fn();
  };

  return (
    <div ref={ref} className={cn("relative m-3", collapsed && "flex justify-center")}>
      {menu && (
        <div
          role="menu"
          className="absolute bottom-full left-0 z-50 mb-2 w-[248px] rounded-2xl border border-line bg-card p-1.5 shadow-[0_12px_40px_-12px_rgba(18,18,18,0.25)] animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2"
        >
          <div className="flex items-center gap-3 px-2.5 py-2.5">
            <Avatar name={name} className="size-9" />
            <div className="min-w-0">
              <p className="truncate text-[14px] font-semibold text-ink">{name?.trim() || "Finlio user"}</p>
              <p className="truncate text-[12px] text-muted-foreground">{city?.trim() || "Data stays in this browser"}</p>
            </div>
          </div>
          <div className="my-1 h-px bg-line" />
          <button role="menuitem" className={item} onClick={pick(() => openSettings("profile"))}>
            <UserRound className="size-4" strokeWidth={1.75} />
            Profile
          </button>
          <button role="menuitem" className={item} onClick={pick(() => openSettings("general"))}>
            <Settings2 className="size-4" strokeWidth={1.75} />
            Settings
          </button>
          <button role="menuitem" className={item} onClick={pick(() => setChatOpen(true))}>
            <MessageCircle className="size-4" strokeWidth={1.75} />
            <span className="flex-1">Finlio chat</span>
            <kbd className="text-[11px] text-muted-foreground">⌘L</kbd>
          </button>
          <Link role="menuitem" href="/privacy" className={item} onClick={() => setMenu(false)}>
            <Lock className="size-4" strokeWidth={1.75} />
            Privacy
          </Link>
          <div className="my-1 h-px bg-line" />
          <div className="flex items-center justify-between px-2.5 py-1.5">
            <span className="text-[12px] text-muted-foreground">Interface sounds</span>
            <SoundToggle />
          </div>
        </div>
      )}
      <button
        onClick={() => setMenu((m) => !m)}
        aria-haspopup="menu"
        data-tour="profile"
        aria-expanded={menu}
        title={collapsed ? "Profile and settings" : undefined}
        className={cn(
          "flex w-full items-center gap-3 rounded-xl text-left transition-colors hover:bg-sand",
          collapsed ? "w-auto p-1" : "px-2 py-2",
          menu && "bg-sand",
        )}
      >
        <Avatar name={name} />
        {!collapsed && (
          <span className="min-w-0">
            <span className="block truncate text-[13px] font-medium text-ink">{name?.trim() || "Add your name"}</span>
            <span className="block text-[11px] text-muted-foreground">Profile & settings</span>
          </span>
        )}
      </button>
    </div>
  );
}

// Small screens: logo on top, every section as an icon link.
export function MobileNav() {
  const pathname = usePathname();
  const { profile } = useStore();
  const { openSettings } = useSettings();

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-card/95 px-4 pt-3 pb-2 backdrop-blur md:hidden">
      <div className="flex items-center justify-between">
        <Brand />
        <button
          onClick={() => openSettings("general")}
          aria-label="Profile and settings"
          data-tour="profile"
          className="rounded-full"
        >
          <Avatar name={profile?.name} className="size-8" />
        </button>
      </div>
      <nav data-tour="nav" aria-label="Main navigation" className="mt-3 flex justify-between gap-1">
        {ALL.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            aria-label={label}
            className={cn(
              "flex h-9 flex-1 items-center justify-center rounded-xl text-body transition-colors hover:bg-muted",
              isActive(pathname, href) && "bg-success-soft text-success dark:bg-muted dark:text-ink",
            )}
          >
            <Icon className="size-[18px]" strokeWidth={1.75} />
          </Link>
        ))}
      </nav>
    </header>
  );
}
